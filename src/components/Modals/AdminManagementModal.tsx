import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Trash2, 
  UserPlus, 
  ShieldAlert, 
  ShieldCheck, 
  MessageSquare, 
  Search,
  Radio,
  Send
} from 'lucide-react';
import { CurrentUser } from '../../types/telegram';
import { UserDTO } from '../../services/apiClient';

interface AdminManagementModalProps {
  isOpen: boolean;
  currentUser: CurrentUser;
  users: UserDTO[];
  onClose: () => void;
  onDeleteUser: (userId: string) => void;
  onAddUser: (username: string, name: string) => void;
  onBroadcastMessage: (text: string) => void;
  onDirectChat: (username: string) => void;
}

export const AdminManagementModal: React.FC<AdminManagementModalProps> = ({
  isOpen,
  currentUser,
  users,
  onClose,
  onDeleteUser,
  onAddUser,
  onBroadcastMessage,
  onDirectChat,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'add' | 'broadcast'>('members');
  const [search, setSearch] = useState('');
  
  // Add member form
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Broadcast form
  const [broadcastText, setBroadcastText] = useState('');

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    onAddUser(newUsername.trim().replace(/^@/, ''), newName.trim() || newUsername.trim());
    setNewUsername('');
    setNewName('');
    setSuccessMsg('کاربر با موفقیت به سیستم اضافه شد.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    onBroadcastMessage(broadcastText.trim());
    setBroadcastText('');
    setSuccessMsg('پیام همگانی از طرف مالک با موفقیت ارسال شد.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base flex items-center gap-2">
                <span>پنل مدیریت مالک (TELESHΞN™ Owner)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono">
                  {currentUser.handle}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                کنترل کامل روی اعضا، دسترسی‌ها و مدیریت سامانه
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 text-xs px-4">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'members'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>لیست اعضا ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'add'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>افزودن عضو جدید</span>
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'broadcast'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>پیام همگانی (Broadcast)</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs text-right animate-in fade-in">
            {successMsg}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو بر اساس نام، یوزرنیم یا ایمیل..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pr-9 pl-3 py-2 text-xs text-white outline-none focus:border-amber-400 text-right"
                />
              </div>

              {/* Members List */}
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    کاربری با این مشخصات یافت نشد.
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelf = user.username === 'shervin' || user.id === currentUser.id;
                    return (
                      <div key={user.id} className="p-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                          />
                          <div className="text-right">
                            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.username === 'shervin' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                  Owner
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              @{user.username} {user.email ? `• ${user.email}` : ''}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => {
                                  onDirectChat(user.username);
                                  onClose();
                                }}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                                title="ارسال پیام مستقیم"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`آیا از حذف دسترسی و حساب @${user.username} اطمینان دارید؟`)) {
                                    onDeleteUser(user.id);
                                  }
                                }}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                title="حذف و مسدودسازی کاربر"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ADD MEMBER */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddSubmit} className="space-y-4 max-w-md mx-auto py-2 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium text-right">
                  نام کاربری (@username)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-mono text-xs">@</span>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="new_user"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-white outline-none focus:border-amber-400 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium text-right">
                  نام نمایشی
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="نام یا عنوان کاربر"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-400 text-xs text-right"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>افزودن عضو جدید به سیستم</span>
              </button>
            </form>
          )}

          {/* TAB 3: BROADCAST */}
          {activeTab === 'broadcast' && (
            <form onSubmit={handleBroadcastSubmit} className="space-y-4 max-w-md mx-auto py-2 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs text-right leading-relaxed">
                📢 پیام شما به صورت اطلاعیه رسمی مالک به تمام چت‌های کاربران فعال ارسال خواهد شد.
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium text-right">
                  متن پیام اطلاعیه
                </label>
                <textarea
                  rows={4}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="متن پیام خود را برای کلیه اعضا بنویسید..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-400 text-xs text-right resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-xs"
              >
                <Send className="w-4 h-4" />
                <span>ارسال پیام همگانی به اعضا</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
