import React from 'react';
import { 
  X, 
  Bookmark, 
  Settings, 
  Moon, 
  Sun, 
  Users, 
  LogOut, 
  Crown,
  Camera
} from 'lucide-react';
import { CurrentUser, ThemeType } from '../../types/telegram';

interface ChatDrawerProps {
  isOpen: boolean;
  currentUser: CurrentUser;
  theme: ThemeType;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenUserDirectory: () => void;
  onOpenAuthModal: () => void;
  onSelectSavedMessages: () => void;
  onSelectSupport: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenAdminPanel?: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  currentUser,
  theme,
  onClose,
  onOpenSettings,
  onOpenUserDirectory,
  onSelectSavedMessages,
  onToggleTheme,
  onLogout,
  onOpenAdminPanel,
}) => {
  if (!isOpen) return null;

  const isOwner = currentUser.isOwner || currentUser.role === 'owner' || currentUser.handle === '@shervin';

  return (
    <div className="fixed inset-0 z-50 flex select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 sm:w-80 bg-slate-900 border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Profile Card Header */}
        <div className="p-4 bg-gradient-to-br from-sky-950/70 via-slate-900 to-slate-900 border-b border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div 
              className="relative cursor-pointer group" 
              onClick={() => { onOpenSettings(); onClose(); }}
              title="برای تغییر عکس کلیک کنید"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-sky-400/50 group-hover:ring-sky-400 transition-all" 
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="font-bold text-white text-base flex items-center gap-1.5">
            <span>{currentUser.name}</span>
            {isOwner && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Owner</span>
              </span>
            )}
          </div>
          <div className="text-xs text-sky-400 font-mono mt-0.5">
            {currentUser.handle}
          </div>
          {currentUser.bio && (
            <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              {currentUser.bio}
            </div>
          )}
        </div>

        {/* Drawer Menu Items */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-slate-800/40 text-xs">
          <div className="px-2 space-y-1">
            {/* Owner Management Panel */}
            {isOwner && (
              <button
                onClick={() => {
                  onOpenAdminPanel?.();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors font-medium mb-1 text-right"
              >
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="flex-1 font-semibold">پنل مدیریت اعضا (Owner)</span>
              </button>
            )}

            {/* Active Users Directory */}
            <button
              onClick={() => {
                onOpenUserDirectory();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors text-right"
            >
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <span>کاربران آنلاین و دایرکت</span>
            </button>

            {/* Saved Messages */}
            <button
              onClick={() => {
                onSelectSavedMessages();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors text-right"
            >
              <Bookmark className="w-4 h-4 text-sky-400 shrink-0" />
              <span>پیام‌های ذخیره‌شده (Saved Messages)</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors text-right"
            >
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              <span>تنظیمات پروفایل و پوسته</span>
            </button>
          </div>

          {/* Preferences */}
          <div className="px-2 pt-2 space-y-1">
            {/* Night / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors text-right"
            >
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                )}
                <span>حالت شب / روز</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 uppercase">{theme}</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-right"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>خروج از حساب</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 text-center">
          <div className="text-[11px] font-bold text-slate-400 tracking-wider">TELESHΞN™</div>
          <div className="text-[10px] text-slate-600 font-mono">v5.0 · Cloud Edge Messenger</div>
        </div>
      </div>
    </div>
  );
};
