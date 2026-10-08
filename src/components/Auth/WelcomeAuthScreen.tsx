import React, { useState, useRef } from 'react';
import { 
  Camera, 
  ArrowRight, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Upload, 
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface WelcomeAuthScreenProps {
  onLogin: (username: string, password?: string) => Promise<void>;
  onRegister: (username: string, password: string, name: string, avatar: string, bio: string) => Promise<void>;
}

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({ 
  onLogin, 
  onRegister 
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');

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
        // Resize and optimize image to 256x256 to ensure ultra-fast edge storage
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw circular-optimized cropped square
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
      // Default avatar if user didn't upload custom picture
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
      const msg = err instanceof Error ? err.message : 'خطا در ثبت‌نام. لطفاً مجدداً بررسی فرمایید.';
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

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-4 select-none relative overflow-y-auto">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Card Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 my-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 border border-sky-300/30 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-sky-500/20 mb-3">
            ☬
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TELESHΞN™</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            پیام‌رسان ابری لبه؛ ورود و ایجاد حساب کاربری امن
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-2xl mb-6 border border-slate-700/60">
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
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs text-right flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
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
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-sky-400/60 p-0.5 overflow-hidden bg-slate-800 flex items-center justify-center relative shadow-inner">
                  {customAvatar ? (
                    <img 
                      src={customAvatar} 
                      alt="Avatar Preview" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-sky-300 transition-colors">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px]">عکس</span>
                    </div>
                  )}

                  {/* Camera overlay badge */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center text-white">
                    <Upload className="w-5 h-5" />
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-md">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-white outline-none focus:border-sky-500 font-mono text-sm tracking-wide"
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-sky-500 text-xs text-right"
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-sky-500 text-xs text-right"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all text-sm"
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
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all text-sm"
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
