import React from 'react';
import { 
  X, 
  Bookmark, 
  Settings, 
  Moon, 
  Sun, 
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { CurrentUser, ThemeType } from '../../types/telegram';

interface ChatDrawerProps {
  isOpen: boolean;
  currentUser: CurrentUser;
  theme: ThemeType;
  onClose: () => void;
  onOpenSettings: () => void;
  onSelectSavedMessages: () => void;
  onSelectSupport: () => void;
  onToggleTheme: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  currentUser,
  theme,
  onClose,
  onOpenSettings,
  onSelectSavedMessages,
  onSelectSupport,
  onToggleTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 sm:w-80 bg-slate-900 border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Profile Card Header */}
        <div className="p-4 bg-gradient-to-br from-sky-900/60 to-slate-900 border-b border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-sky-400/50" 
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="font-bold text-white text-base flex items-center gap-1.5">
            <span>{currentUser.name}</span>
            <ShieldCheck className="w-4 h-4 text-sky-400 inline" />
          </div>
          <div className="text-xs text-sky-300 font-mono mt-0.5">
            {currentUser.handle}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            {currentUser.phone}
          </div>
        </div>

        {/* Drawer Menu Items */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-slate-800/40 text-xs">
          <div className="px-2 space-y-0.5">
            <button
              onClick={() => {
                onSelectSavedMessages();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-sky-400" />
              <span>Saved Messages</span>
            </button>

            <button
              onClick={() => {
                onSelectSupport();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Support (@shervini)</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-400" />
                )}
                <span>Night Mode</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 capitalize">
                {theme}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 text-center text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300">TELESHΞN™</div>
        </div>
      </div>
    </div>
  );
};
