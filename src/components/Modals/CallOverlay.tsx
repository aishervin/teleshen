import React from 'react';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  ShieldCheck 
} from 'lucide-react';
import { CallState } from '../../types/telegram';

interface CallOverlayProps {
  callState: CallState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
}

export const CallOverlay: React.FC<CallOverlayProps> = ({
  callState,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
}) => {
  if (!callState.isActive || !callState.chat) return null;

  const chat = callState.chat;
  const mins = Math.floor(callState.duration / 60);
  const secs = callState.duration % 60;
  const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-300">
      {/* Top Bar with End-to-End Encryption Key */}
      <div className="w-full max-w-md flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-1.5 text-sky-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>End-to-End Encrypted</span>
        </div>

        {/* Telegram Emoji Encryption Verification Key */}
        <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 text-sm tracking-widest shadow-inner">
          <span>🥑</span>
          <span>🪐</span>
          <span>⚡</span>
          <span>💎</span>
        </div>
      </div>

      {/* Center Avatar & Pulsing Calling Effect */}
      <div className="flex flex-col items-center my-auto">
        <div className="relative mb-6">
          {/* Animated pulsing wave rings */}
          <div className="absolute -inset-4 rounded-full bg-sky-500/20 animate-ping opacity-75" />
          <div className="absolute -inset-8 rounded-full bg-sky-500/10 animate-pulse" />

          <img 
            src={chat.avatar} 
            alt={chat.title}
            referrerPolicy="no-referrer"
            className="w-32 h-32 rounded-full object-cover ring-4 ring-sky-400 shadow-2xl relative z-10" 
          />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">{chat.title}</h2>
        <div className="text-sm font-mono text-sky-400">
          {callState.status === 'calling' ? (
            <span className="animate-pulse">Calling...</span>
          ) : (
            <span>Connected · {timeFormatted}</span>
          )}
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="w-full max-w-sm flex items-center justify-center gap-6 pb-6">
        {/* Mute button */}
        <button
          onClick={onToggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            callState.isMuted
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title="Mute microphone"
        >
          {callState.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Video button */}
        <button
          onClick={onToggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            callState.isVideoEnabled
              ? 'bg-sky-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title="Toggle video"
        >
          {callState.isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        {/* Speaker button */}
        <button
          onClick={onToggleSpeaker}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            callState.isSpeakerOn
              ? 'bg-slate-800 text-sky-400'
              : 'bg-slate-850 text-slate-500'
          }`}
          title="Speakerphone"
        >
          {callState.isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        {/* End Call button */}
        <button
          onClick={onEndCall}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
          title="End Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
