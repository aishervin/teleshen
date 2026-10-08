import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { soundEngine } from '../../services/audioSimulator';

interface VoicePlayerProps {
  duration?: number;
  waveform?: number[];
  isOutgoing?: boolean;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  duration = 15,
  waveform = [20, 35, 50, 75, 90, 60, 45, 80, 95, 70, 50, 65, 85, 40, 30, 60, 75, 50, 35, 45],
  isOutgoing = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const cancelPlaybackRef = useRef<(() => void) | null>(null);

  const togglePlay = () => {
    if (isPlaying) {
      if (cancelPlaybackRef.current) {
        cancelPlaybackRef.current();
        cancelPlaybackRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const effectiveDuration = duration / playbackSpeed;
      const cancelFn = soundEngine.playVoiceSnippet(
        effectiveDuration,
        (p) => setProgress(p),
        () => {
          setIsPlaying(false);
          setProgress(0);
        }
      );
      cancelPlaybackRef.current = cancelFn;
    }
  };

  useEffect(() => {
    return () => {
      if (cancelPlaybackRef.current) {
        cancelPlaybackRef.current();
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentSecs = isPlaying ? progress * duration : duration;

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (isPlaying && cancelPlaybackRef.current) {
      cancelPlaybackRef.current();
      setIsPlaying(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex items-center gap-3 py-1 select-none max-w-xs">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
        className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-sm ${
          isOutgoing
            ? 'bg-white text-sky-600 hover:bg-slate-100'
            : 'bg-sky-500 text-white hover:bg-sky-400'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform & Info */}
      <div className="flex-1 flex flex-col justify-center min-w-[150px]">
        {/* Waveform Bars */}
        <div 
          className="flex items-center gap-[2.5px] h-7 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newP = Math.max(0, Math.min(1, clickX / rect.width));
            setProgress(newP);
          }}
        >
          {waveform.map((heightPercent, idx) => {
            const barFraction = idx / waveform.length;
            const isPlayed = barFraction <= progress;
            return (
              <span
                key={idx}
                style={{ height: `${Math.max(15, heightPercent * 0.28)}px` }}
                className={`w-[3px] rounded-full transition-colors duration-100 ${
                  isPlayed
                    ? isOutgoing
                      ? 'bg-white'
                      : 'bg-sky-400'
                    : isOutgoing
                    ? 'bg-white/40'
                    : 'bg-slate-500/50'
                }`}
              />
            );
          })}
        </div>

        {/* Duration & Speed */}
        <div className="flex items-center justify-between text-[11px] mt-0.5">
          <span className={isOutgoing ? 'text-white/80' : 'text-slate-400 font-mono'}>
            {formatTime(currentSecs)}
          </span>
          <button
            onClick={cycleSpeed}
            className={`text-[10px] font-semibold px-1 rounded transition-colors ${
              isOutgoing
                ? 'text-white/80 hover:bg-white/10'
                : 'text-sky-400 hover:bg-sky-500/10'
            }`}
            title="Playback speed"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>
    </div>
  );
};
