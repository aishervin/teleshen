import React, { useState } from 'react';
import { User, Check, Sparkles, ArrowRight, X } from 'lucide-react';
import { CurrentUser } from '../../types/telegram';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: CurrentUser | null;
  onClose: () => void;
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

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLogin,
}) => {
  const [username, setUsername] = useState(currentUser?.handle?.replace(/^@/, '') || '');
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || AVATAR_PRESETS[0]);
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [customAvatar, setCustomAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please choose a username');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
      const selectedAvatar = customAvatar.trim() || avatar;
      await onLogin(
        cleanUsername,
        name.trim() || cleanUsername,
        selectedAvatar,
        bio.trim() || 'TELESHΞN™ Member'
      );
      onClose();
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelectShervini = () => {
    setUsername('shervini');
    setName('SHΞЯVIN™ Support');
    setAvatar(AVATAR_PRESETS[0]);
    setBio('Official Support & Creator @ TELESHΞN™');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">TELESHΞN™</span>
          </div>
          {currentUser && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Choose a unique username to chat with any user on this network in real time.
        </p>

        {/* Quick option for @shervini */}
        <div className="mb-4 p-2.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={AVATAR_PRESETS[0]} alt="shervini" className="w-8 h-8 rounded-full object-cover" />
            <div className="text-xs">
              <div className="font-semibold text-white">Log in as @shervini</div>
              <div className="text-slate-400 text-[10px]">Official Creator Account</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickSelectShervini}
            className="px-2.5 py-1 text-[11px] bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 font-medium rounded-lg transition-colors"
          >
            Use
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Username (@)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 font-mono">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-white outline-none focus:border-sky-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Reza or Sarah"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </div>

          {/* Avatar picker */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-medium">Profile Photo</label>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {AVATAR_PRESETS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAvatar(url);
                    setCustomAvatar('');
                  }}
                  className={`relative shrink-0 rounded-full ring-2 transition-all ${
                    avatar === url && !customAvatar ? 'ring-sky-400 scale-105' : 'ring-transparent hover:ring-slate-700'
                  }`}
                >
                  <img src={url} alt={`preset-${i}`} className="w-10 h-10 rounded-full object-cover" />
                  {avatar === url && !customAvatar && (
                    <div className="absolute inset-0 bg-sky-500/30 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Bio (Optional)</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short status or bio"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </div>

          {error && (
            <div className="text-red-400 text-[11px] font-medium">{error}</div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <span>{loading ? 'Connecting...' : 'Enter TELESHΞN™'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
