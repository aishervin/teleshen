import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Search, 
  MoreVertical, 
  BadgeCheck, 
  BellOff, 
  Bell, 
  Trash2, 
  Info,
  FolderSync
} from 'lucide-react';
import { Chat } from '../../types/telegram';

interface ChatHeaderProps {
  chat: Chat;
  onBackMobile: () => void;
  onOpenInfo: () => void;
  onStartCall: () => void;
  onToggleSearch: () => void;
  onToggleMute: () => void;
  onClearHistory?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onBackMobile,
  onOpenInfo,
  onStartCall,
  onToggleSearch,
  onToggleMute,
  onClearHistory,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getSubtitle = () => {
    if (chat.typingUser) return `${chat.typingUser} is typing...`;
    if (chat.type === 'channel') return `${(chat.memberCount || 1200).toLocaleString()} subscribers`;
    if (chat.type === 'group') return `${chat.memberCount || 3} members`;
    if (chat.type === 'bot') return 'bot';
    if (chat.type === 'saved') return 'cloud storage';
    return chat.isOnline ? 'online' : (chat.lastSeen || 'last seen recently');
  };

  return (
    <div className="h-14 px-3 sm:px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20 shrink-0 select-none shadow-xs">
      {/* Left: Mobile Back & Chat Details */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Back Button */}
        <button
          onClick={onBackMobile}
          className="md:hidden w-9 h-9 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-300"
          aria-label="Back to chat list"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div 
          onClick={onOpenInfo}
          className="relative cursor-pointer group shrink-0"
        >
          <img 
            src={chat.avatar} 
            alt={chat.title}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-sky-500 transition-all"
          />
          {chat.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          )}
        </div>

        {/* Title and Subtitle */}
        <div 
          onClick={onOpenInfo}
          className="cursor-pointer min-w-0 flex flex-col justify-center"
        >
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-semibold text-slate-100 text-sm truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {chat.title}
            </span>
            {chat.isVerified && (
              <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0 inline fill-sky-500/20" />
            )}
            {chat.isMuted && (
              <BellOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
          </div>
          <div className="text-xs text-slate-400 truncate mt-0.5">
            {getSubtitle()}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 text-slate-300">
        <button
          onClick={onToggleSearch}
          className="w-9 h-9 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors"
          title="Search in chat"
        >
          <Search className="w-4 h-4" />
        </button>

        {chat.type === 'user' && (
          <button
            onClick={onStartCall}
            className="w-9 h-9 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors text-sky-400"
            title="Voice call"
          >
            <Phone className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenInfo}
          className="hidden sm:flex w-9 h-9 rounded-full hover:bg-slate-800 items-center justify-center transition-colors"
          title="Chat info"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-9 h-9 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div 
              className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-30"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={() => {
                  onToggleMute();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-xs flex items-center gap-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                {chat.isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                <span>{chat.isMuted ? 'Unmute Chat' : 'Mute Notifications'}</span>
              </button>

              <button
                onClick={() => {
                  onOpenInfo();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-xs flex items-center gap-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>View Profile & Media</span>
              </button>

              {onClearHistory && (
                <button
                  onClick={() => {
                    onClearHistory();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-xs flex items-center gap-2.5 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
