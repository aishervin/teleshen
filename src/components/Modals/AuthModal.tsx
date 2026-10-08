import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { CurrentUser } from '../../types/telegram';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: CurrentUser | null;
  onClose: () => void;
  onLogin: (username: string, name: string, avatar: string, bio: string) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLogin,
}) => {
  const [username, setUsername] = useState(currentUser?.handle?.replace(/^@/, '') || '');
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('نام کاربری باید حداقل ۳ کاراکتر باشد.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const finalAvatar = avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`;
      await onLogin(
        cleanUsername,
        name.trim() || cleanUsername,
        finalAvatar,
        bio.trim() || 'TELESHΞN™ Member'
      );
      onClose();
    } catch {
      setError('خطا در ورود به حساب. لطفاً مجدداً امتحان کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="font-semibold text-white text-sm">تغییر یا ورود به حساب کاربری</div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-right">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-2">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group w-18 h-18 rounded-full cursor-pointer ring-2 ring-sky-500/40 hover:ring-sky-500 transition-all overflow-hidden bg-slate-800"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[9px]">عکس پروفایل</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]">
                <Upload className="w-4 h-4" />
              </div>
            </div>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-medium"
            >
              انتخاب عکس از گالری / دستگاه
            </button>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium text-right">نام کاربری (@username)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 font-mono text-xs">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white outline-none focus:border-sky-500 font-mono text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium text-right">نام نمایشی</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام نمایشی شما"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 text-xs text-right"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium text-right">بیوگرافی</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="توضیح کوتاه..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 text-xs text-right"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-colors text-xs mt-2"
          >
            {loading ? 'در حال اعمال...' : 'تایید و ذخیره'}
          </button>
        </form>
      </div>
    </div>
  );
};
