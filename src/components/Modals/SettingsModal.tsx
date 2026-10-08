import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Palette, 
  Check, 
  Save,
  Bell,
  Camera,
  Upload,
  Sparkles
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
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle uploading custom photo from device
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrlAvatar = () => {
    if (avatarUrlInput.trim()) {
      setAvatar(avatarUrlInput.trim());
      setAvatarUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
    onUpdateProfile({ 
      name: name.trim() || currentUser.name, 
      handle: cleanHandle, 
      bio: bio.trim(),
      avatar 
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 select-none">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="font-semibold text-slate-100 text-base">
            تنظیمات حساب کاربری
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-800 px-4 text-xs font-medium bg-slate-900/60">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-sky-400 text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>پروفایل و آواتار</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'appearance'
                ? 'border-sky-400 text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>پوسته و تم</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-sky-400 text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>اعلان‌ها</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-200">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Editor Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img 
                    src={avatar} 
                    alt={name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-sky-500 shadow-lg group-hover:opacity-80 transition-opacity" 
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>تغییر عکس</span>
                  </div>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageFileChange} 
                    className="hidden" 
                  />
                </div>

                <div className="flex-1 text-center sm:text-right space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>آپلود عکس از دستگاه</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                    >
                      آدرس اینترنتی (URL)
                    </button>
                  </div>

                  {showUrlInput && (
                    <div className="flex gap-2 pt-1 animate-in fade-in">
                      <input
                        type="url"
                        value={avatarUrlInput}
                        onChange={(e) => setAvatarUrlInput(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-white text-xs outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyUrlAvatar}
                        className="px-2.5 py-1 bg-sky-500 text-slate-950 font-semibold rounded-xl text-xs"
                      >
                        ثبت
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400">
                    تصویر انتخابی بلافاصله به عنوان عکس پروفایل شما در تمامی چت‌ها نمایش داده خواهد شد.
                  </p>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium text-right">نام نمایشی (Display Name)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 text-xs text-right"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium text-right">نام کاربری (@username)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-mono text-xs">@</span>
                  <input
                    type="text"
                    value={handle.replace(/^@/, '')}
                    onChange={(e) => setHandle(`@${e.target.value.replace(/[^a-zA-Z0-9_]/g, '')}`)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white outline-none focus:border-sky-500 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium text-right">بیوگرافی (Bio)</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="درباره خود بنویسید..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-sky-500 text-xs text-right resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  {currentUser.email ? `ورود با: ${currentUser.email}` : ''}
                </span>

                <button
                  type="submit"
                  className="py-2.5 px-5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-sky-500/20"
                >
                  {isSaved ? <Check className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
                  <span>{isSaved ? 'ذخیره شد' : 'ذخیره تغییرات'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <label className="block text-slate-400 mb-1 font-medium text-right">انتخاب پوسته برنامه (Theme)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((themeItem) => (
                  <button
                    key={themeItem.id}
                    onClick={() => onSetTheme(themeItem.id)}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      currentTheme === themeItem.id
                        ? 'border-sky-400 bg-sky-500/10'
                        : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-4 h-4 rounded-full ring-2 ring-white/20" 
                        style={{ backgroundColor: themeItem.accent }} 
                      />
                      <span className="font-semibold text-white text-xs">{themeItem.name}</span>
                    </div>
                    {currentTheme === themeItem.id && <Check className="w-4 h-4 text-sky-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl">
                <div className="text-right">
                  <div className="font-semibold text-white">اعلان پیام‌های جدید</div>
                  <div className="text-[11px] text-slate-400">نمایش اعلان در هنگام دریافت پیام جدید</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl">
                <div className="text-right">
                  <div className="font-semibold text-white">صدای پیام</div>
                  <div className="text-[11px] text-slate-400">پخش افکت صوتی هنگام ارسال و دریافت پیام</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
