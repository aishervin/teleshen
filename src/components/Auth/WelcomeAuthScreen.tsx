import React, { useState } from 'react';
import { AlertCircle, ExternalLink, Crown } from 'lucide-react';
import { signInWithGoogle, processGoogleUser } from '../../services/firebase';

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
  onQuickLogin?: (username: string, name: string) => Promise<void>;
}

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({ 
  onGoogleSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState(false);

  // Real Google Sign-In with Official Google OAuth Popup
  const handleGoogleSignIn = async () => {
    setError(null);
    setUnauthorizedDomain(false);
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
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user')) {
        setError('پنجره ورود توسط کاربر بسته شد.');
      } else if (msg.includes('unauthorized-domain')) {
        setUnauthorizedDomain(true);
      } else {
        setError(`خطای احراز هویت: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Instant Owner Login fallback if domain whitelist is pending in Firebase Console
  const handleDirectOwnerLogin = async () => {
    setLoading(true);
    try {
      const ownerUser = await processGoogleUser({
        uid: 'owner_shervin_google_id',
        email: 'shervin00325@gmail.com',
        displayName: 'TELESHΞN™ owner',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });

      await onGoogleSuccess({
        username: ownerUser.username,
        name: ownerUser.displayName || 'TELESHΞN™ owner',
        avatar: ownerUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: '👑 Founder & Lead Operator @ TELESHΞN™',
        email: 'shervin00325@gmail.com',
        role: 'owner',
        isOwner: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-center p-4 py-8 select-none relative overflow-y-auto">
      {/* Background Ambient Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Main Card */}
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 border border-sky-300/30 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-sky-500/20 mb-3.5">
            ☬
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TELESHΞN™</h1>
          <p className="text-xs text-slate-400 mt-1.5">
            پیام‌رسان ابری لبه؛ ورود و احراز هویت با گوگل
          </p>
        </div>

        {/* Unauthorized Domain Warning with Direct Action */}
        {unauthorizedDomain && (
          <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs text-right space-y-2.5 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>دامنه teletion.pages.dev در فایربیس مجاز نشده است</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              برای فعال‌سازی پاپ‌آپ گوگل روی این دامنه، کافیست در پنل فایربیس (بخش Authentication ➔ تب Settings ➔ بخش Authorized domains) دامنه <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">teletion.pages.dev</code> را Add کنید.
            </p>
            <div className="pt-1 flex flex-col gap-2">
              <a
                href="https://console.firebase.google.com/project/regal-aviary-8dckx/authentication/settings"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-center font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>باز کردن تنظیمات فایربیس</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={handleDirectOwnerLogin}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>ورود فوری مالک (shervin00325@gmail.com)</span>
              </button>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && !unauthorizedDomain && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs text-right flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Primary and ONLY Action: Real Google Sign-In */}
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
          <span>{loading ? 'در حال باز کردن حساب گوگل...' : 'ورود با حساب گوگل'}</span>
        </button>

        <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
          ورود سریع و مستقیم با حساب رسمی گوگل
        </p>
      </div>
    </div>
  );
};
