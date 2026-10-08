import React from 'react';
import { Pin, X } from 'lucide-react';
import { Message } from '../../types/telegram';

interface PinnedBannerProps {
  pinnedMessage?: Message;
  onUnpin: () => void;
  onClick: () => void;
}

export const PinnedBanner: React.FC<PinnedBannerProps> = ({
  pinnedMessage,
  onUnpin,
  onClick,
}) => {
  if (!pinnedMessage) return null;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs z-10 transition-colors select-none shadow-xs">
      <div 
        onClick={onClick}
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
      >
        <div className="w-1.5 h-7 bg-sky-500 rounded-full group-hover:scale-y-110 transition-transform" />
        <Pin className="w-4 h-4 text-sky-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sky-400 text-[11px]">
            Pinned Message
          </div>
          <div className="text-slate-300 truncate text-[12px]">
            {pinnedMessage.content.slice(0, 80) || (pinnedMessage.type === 'voice' ? 'Voice Message' : 'Media')}
          </div>
        </div>
      </div>

      <button
        onClick={onUnpin}
        className="w-7 h-7 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors ml-2"
        title="Unpin message"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
