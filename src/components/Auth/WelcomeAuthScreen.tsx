import React, { useState } from 'react';
import { 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Users,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { signInWithGoogle } from '../../services/firebase';

interface WelcomeAuthScreenProps {
  onGoogleSuccess: (user: {
    username: string;
    name: string;
    avatar: string;
    bio: string;
    email?: string;
    role?: 'owner' | 'admin' | 'member';
    isOwner?: boolean;
  }) => Promise<void>;
  onQuickLogin: (username: string, name: string) => Promise<void>;
}

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({ 
  onGoogleSuccess,
  onQuickLogin,
}) => {
  const [quickUsername, setQuickUsername] = useState('');
  const [quickName, setQuickName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real Google Sign-In with Official Google OAuth Popup
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      
      await onGoogleSuccess({
        username: googleUser.username,
        name: googleUser.displayName || googleUser.username,
        avatar: googleUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${googleUser.username}`,
        bio: googleUser.isOwner 
          ? '👑 Founder & Lead Operator @ TELESHΞN™' 
          : (googleUser.email ? `کاربر تایید شده گوگل (${googleUser.email})` : 'کاربر تایید شده گوگل'),
        email: googleUser.email || undefined,
        role: googleUser.role,
        isOwner: googleUser.isOwner,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ورود با گوگل انجام نشد.';
      if (msg.includes('popup-closed-by-user')) {
        setError('پنجره ورود گوگل توسط کاربر بسته شد.');
      } else {
        setError(`ورود با گوگل: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = quickUsername.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUser || cleanUser.length < 3) {
      setError('نام کاربری باید حداقل ۳ حرف باشد.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onQuickLogin(cleanUser, quickName.trim() || cleanUser);
    } catch {
      setError('خطا در ورود. لطفاً مجدداً بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-center p-4 py-8 select-none relative overflow-y-auto">
      {/* Background Ambient Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 border border-sky-300/30 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-sky-500/20 mb-3">
            ☬
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TELESHΞN™</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            پیام‌رسان ابری لبه؛ احراز هویت سریع و امن با حساب گوگل
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs text-right flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Primary Action: Real Google Sign-In */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 active:scale-[0.99] rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-slate-900 shadow-xl transition-all"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>{loading ? 'در حال باز کردن گوگل...' : 'ورود مستقیم با حساب گوگل'}</span>
          </button>

          <p className="text-[11px] text-slate-500 text-center">
            پس از ورود، می‌توانید نام نمایشی، آیدی (@) و عکس خود را به دلخواه ویرایش کنید.
          </p>
        </div>

        {/* Secondary: Custom / Test Username */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          {!showCustomInput ? (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
              >
                ورود با نام کاربری دلخواه (بدون گوگل)
              </button>
            </div>
          ) : (
            <form onSubmit={handleQuickSubmit} className="space-y-3 animate-in fade-in">
              <div>
                <label className="block text-slate-300 mb-1 font-medium text-right text-xs">
                  نام کاربری (@username)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-mono text-xs">@</span>
                  <input
                    type="text"
                    value={quickUsername}
                    onChange={(e) => setQuickUsername(e.target.value)}
                    placeholder="username"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white outline-none focus:border-sky-500 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium text-right text-xs">
                  نام نمایشی (اختیاری)
                </label>
                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="نام نمایشی شما"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 text-xs text-right"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>ورود به برنامه</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Feature Badges */}
        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>امنیت گوگل</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>چت زنده لبه</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>مدیریت کامل اعضا</span>
          </div>
        </div>
      </div>
    </div>
  );
};
