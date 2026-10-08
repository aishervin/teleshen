import React, { useState } from 'react';
import { X, Search, MessageSquare, ShieldCheck, UserPlus } from 'lucide-react';
import { UserDTO } from '../../services/apiClient';

interface UserDirectoryModalProps {
  isOpen: boolean;
  users: UserDTO[];
  currentUserId: string;
  onClose: () => void;
  onStartDirectChat: (targetUsername: string) => void;
}

export const UserDirectoryModal: React.FC<UserDirectoryModalProps> = ({
  isOpen,
  users,
  currentUserId,
  onClose,
  onStartDirectChat,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  // Filter out self and filter by search
  const filtered = users
    .filter(u => u.id !== currentUserId)
    .filter(u => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
      );
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl z-10 max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-sky-400" />
            <span className="font-semibold text-white text-sm">Active Users on TELESHΞN™</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or @username..."
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
          />
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 space-y-1">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-850 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                      {user.name}
                    </span>
                    {user.username === 'shervini' && (
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400 inline shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-sky-300 font-mono">
                    @{user.username}
                  </div>
                  {user.bio && (
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      {user.bio}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  onStartDirectChat(user.username);
                  onClose();
                }}
                className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No users found matching &quot;{search}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
