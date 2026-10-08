import React, { useState } from 'react';
import { 
  X, 
  User, 
  Palette, 
  Check, 
  Save,
  Bell
} from 'lucide-react';
import { CurrentUser, ThemeType } from '../../types/telegram';

interface SettingsModalProps {
  isOpen: boolean;
  currentUser: CurrentUser;
  currentTheme: ThemeType;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<CurrentUser>) => void;
  onSetTheme: (theme: ThemeType) => void;
}

const THEMES: { id: ThemeType; name: string; accent: string }[] = [
  { id: 'default', name: 'Telegram Dark', accent: '#2aabee' },
  { id: 'midnight', name: 'Midnight OLED', accent: '#38bdf8' },
  { id: 'emerald', name: 'Emerald Green', accent: '#10b981' },
  { id: 'cyber', name: 'Cyber Violet', accent: '#a855f7' },
  { id: 'light', name: 'Clean Light', accent: '#2481cc' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  currentUser,
  currentTheme,
  onClose,
  onUpdateProfile,
  onSetTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications'>('profile');
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [bio, setBio] = useState(currentUser.bio);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, handle, bio });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 select-none">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="font-semibold text-slate-100 text-base">
            Settings
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-800 px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'appearance'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Appearance</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-200">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-sky-500" 
                />
                <div>
                  <div className="font-semibold text-sm text-white">{currentUser.name}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{currentUser.phone}</div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Username</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-emerald-400 text-xs font-medium">
                  {isSaved && 'Changes saved'}
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-white mb-2">Theme</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {THEMES.map((t) => {
                    const isSelected = currentTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => onSetTheme(t.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-sky-400 bg-slate-800 shadow-md ring-1 ring-sky-400'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: t.accent }}
                          />
                          <span className="font-medium text-xs text-slate-200">
                            {t.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-slate-800">
                <div>
                  <div className="font-medium text-white">Direct Message Notifications</div>
                  <div className="text-slate-400 text-[11px]">Play sound and alert for incoming messages</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-slate-800">
                <div>
                  <div className="font-medium text-white">In-App Sound Effects</div>
                  <div className="text-slate-400 text-[11px]">Audio chime when messages are sent or received</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
