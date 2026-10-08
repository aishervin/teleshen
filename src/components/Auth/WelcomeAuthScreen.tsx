import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Check, Sparkles, MessageCircle, Users, Zap } from 'lucide-react';

interface WelcomeAuthScreenProps {
  onLogin: (username: string, name: string, avatar: string, bio: string) => Promise<void>;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
];

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[1]);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('لطفاً یک نام کاربری (یوزرنیم) وارد کنید.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (cleanUsername.length < 3) {
      setError('یوزرنیم باید حداقل ۳ حرف باشد.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onLogin(
        cleanUsername,
        name.trim() || cleanUsername,
        avatar,
        bio.trim() || 'TELESHΞN™ Member'
      );
    } catch {
      setError('خطا در ورود به سامانه. مجدداً تلاش فرمایید.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickShervini = () => {
    setUsername('shervini');
    setName('SHΞЯVIN™');
    setAvatar(AVATAR_PRESETS[0]);
    setBio('Creator & Admin @ TELESHΞN™');
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-4 select-none relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Telegram Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 text-3xl font-bold shadow-lg mb-3">
            ☬
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TELESHΞN™</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            پیام‌رسان ابری لبه؛ برای ورود یوزرنیم و مشخصات خود را مشخص کنید
          </p>
        </div>

        {/* Quick Admin Shortcut */}
        <div className="mb-5 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={AVATAR_PRESETS[0]} alt="shervini" className="w-9 h-9 rounded-full object-cover ring-1 ring-sky-400" />
            <div className="text-xs text-right">
              <div className="font-semibold text-white flex items-center gap-1">
                <span>ورود به عنوان @shervini</span>
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-slate-400 text-[10px]">اکانت مدیر و سازنده</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickShervini}
            className="px-3 py-1.5 text-xs bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-semibold rounded-xl transition-colors"
          >
            انتخاب
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium text-right">
              نام کاربری اختصاصی (یوزرنیم)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 font-mono text-sm">@</span>
              <input
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-white outline-none focus:border-sky-500 font-mono text-sm tracking-wide"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 text-right">
              دیگران می‌توانند با این آیدی شما را پیدا کرده و پیام دهند.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium text-right">
              نام نمایشی (Display Name)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: علی، سارا یا رضا"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-sky-500 text-xs"
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-medium text-right">
              انتخاب تصویر پروفایل
            </label>
            <div className="flex items-center justify-between gap-2 py-1">
              {AVATAR_PRESETS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`relative rounded-full ring-2 transition-all ${
                    avatar === url ? 'ring-sky-400 scale-110 shadow-md' : 'ring-transparent hover:ring-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`avatar-${i}`} className="w-10 h-10 rounded-full object-cover" />
                  {avatar === url && (
                    <div className="absolute inset-0 bg-sky-500/30 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium text-right">
              بیوگرافی یا وضعیت (اختیاری)
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="یک جمله کوتاه درباره خود بنویسید"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 text-xs text-right"
            />
          </div>

          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-right">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all text-sm"
            >
              <span>{loading ? 'در حال ورود...' : 'ورود و شروع پیام‌رسانی'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Feature Badges Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>چت زنده لبه</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>گروه و کانال</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="w-4 h-4 text-sky-400" />
            <span>ویس و استیکر</span>
          </div>
        </div>
      </div>
    </div>
  );
};
