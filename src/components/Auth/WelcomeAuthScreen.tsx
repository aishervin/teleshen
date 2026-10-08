import React, { useState, useRef } from 'react';
import { 
  Camera, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Upload, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { signInWithGoogle } from '../../services/firebase';

interface WelcomeAuthScreenProps {
  onLogin: (username: string, password?: string) => Promise<void>;
  onRegister: (username: string, password: string, name: string, avatar: string, bio: string) => Promise<void>;
}

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({ 
  onLogin, 
  onRegister 
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');

  // Register Fields
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBio, setRegBio] = useState('');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  // Login Fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload from device gallery / camera
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('لطفاً یک فایل تصویری معتبر انتخاب کنید.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize and resize image to 256x256 for fast edge sync
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCustomAvatar(optimizedDataUrl);
          setError(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = regUsername.trim().toLowerCase().replace(/^@/, '');
    
    if (!cleanUser || cleanUser.length < 3) {
      setError('نام کاربری باید حداقل ۳ حرف انگلیسی باشد.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setError('رمز عبور باید حداقل ۴ نویسه باشد.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const finalAvatar = customAvatar || 
        `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUser}`;

      await onRegister(
        cleanUser,
        regPassword,
        regName.trim() || cleanUser,
        finalAvatar,
        regBio.trim() || 'TELESHΞN™ Member'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ثبت‌نام ناموفق بود.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = loginUsername.trim().toLowerCase().replace(/^@/, '');

    if (!cleanUser) {
      setError('نام کاربری الزامی است.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onLogin(cleanUser, loginPassword);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'نام کاربری یا رمز عبور نامعتبر است.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Real Google Sign-In with Official Google OAuth Popup
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      
      await onRegister(
        googleUser.username,
        `google_auth_${googleUser.uid}`,
        googleUser.displayName || googleUser.username,
        googleUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${googleUser.username}`,
        googleUser.email ? `کاربر تایید شده گوگل (${googleUser.email})` : 'کاربر تایید شده گوگل'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ورود با گوگل انجام نشد.';
      // Friendly message if user closed popup
      if (msg.includes('popup-closed-by-user')) {
        setError('پنجره ورود گوگل توسط کاربر بسته شد.');
      } else {
        setError(`ورود با گوگل ناموفق بود: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-start p-3 sm:p-6 py-6 sm:py-10 select-none relative overflow-y-auto">
      {/* Background Ambient Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Card Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 border border-sky-300/30 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-sky-500/20 mb-2.5">
            ☬
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">TELESHΞN™</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            پیام‌رسان ابری لبه؛ ورود و ایجاد حساب کاربری امن
          </p>
        </div>

        {/* Google Authentication Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700/80 active:scale-[0.99] border border-slate-700/80 rounded-2xl flex items-center justify-center gap-3 text-xs font-semibold text-white transition-all shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>ورود سریع با حساب گوگل (Continue with Google)</span>
          </button>

          <div className="flex items-center gap-3 my-3.5">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] text-slate-500">یا با نام کاربری</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-2xl mb-4 border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ثبت‌نام (Sign Up)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ورود (Sign In)
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-3.5 p-2.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs text-right flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            {/* Custom Avatar Upload Picker */}
            <div className="flex flex-col items-center">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-sky-400/60 p-0.5 overflow-hidden bg-slate-800 flex items-center justify-center relative shadow-inner">
                  {customAvatar ? (
                    <img 
                      src={customAvatar} 
                      alt="Avatar Preview" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-sky-300 transition-colors">
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
                      <span className="text-[10px]">عکس</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center text-white">
                    <Upload className="w-4 h-4" />
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-md">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-medium transition-colors"
                >
                  {customAvatar ? 'تغییر عکس پروفایل' : 'آپلود عکس از گالری / دوربین'}
                </button>
                {customAvatar && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomAvatar(null);
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300"
                    title="حذف عکس"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-slate-300 mb-1 font-medium text-right">
                نام کاربری یکتا (@username)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 font-mono text-sm">@</span>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="username"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white outline-none focus:border-sky-500 font-mono text-sm tracking-wide"
                  required
                />
              </div>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-slate-300 mb-1 font-medium text-right">
                نام نمایشی (Display Name)
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="نام شما (فارسی یا انگلیسی)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 text-xs text-right"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-slate-300 mb-1 font-medium text-right">
                رمز عبور (Password)
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="حداقل ۴ نویسه"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-white outline-none focus:border-sky-500 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-slate-300 mb-1 font-medium text-right">
                بیوگرافی یا وضعیت (اختیاری)
              </label>
              <input
                type="text"
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                placeholder="توضیح کوتاه درباره شما"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white outline-none focus:border-sky-500 text-xs text-right"
              />
            </div>

            <div className="pt-1.5 pb-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 bg-sky-500 hover:bg-sky-400 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all text-xs sm:text-sm"
              >
                <span>{loading ? 'در حال ایجاد حساب...' : 'ایجاد حساب کاربری و ورود'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium text-right">
                نام کاربری (@username)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 font-mono text-sm">@</span>
                <input
                  type="text"
                  autoFocus
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="username"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-white outline-none focus:border-sky-500 font-mono text-sm tracking-wide"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium text-right">
                رمز عبور (Password)
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="رمز عبور حساب کاربری"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-white outline-none focus:border-sky-500 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 bg-sky-500 hover:bg-sky-400 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all text-xs sm:text-sm"
              >
                <span>{loading ? 'در حال بررسی...' : 'ورود به حساب کاربری'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                }}
                className="text-xs text-sky-400 hover:underline"
              >
                حساب کاربری ندارید؟ اینجا کلیک کنید تا ثبت‌نام کنید
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
