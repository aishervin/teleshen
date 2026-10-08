import React, { useState } from 'react';
import { X, Users, Megaphone, Check } from 'lucide-react';
import { ChatType } from '../../types/telegram';
import { UserDTO } from '../../services/apiClient';

interface NewChatModalProps {
  isOpen: boolean;
  availableUsers?: UserDTO[];
  currentUserId?: string;
  onClose: () => void;
  onCreateChat: (title: string, type: ChatType, memberIds: string[], bio?: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  availableUsers = [],
  currentUserId = '',
  onClose,
  onCreateChat,
}) => {
  const [type, setType] = useState<ChatType>('group');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const otherUsers = availableUsers.filter(u => u.id !== currentUserId);

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter(u => u !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateChat(title.trim(), type, selectedUserIds, bio.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl z-10 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="font-semibold text-slate-100 text-sm">
            {type === 'channel' ? 'ایجاد کانال جدید' : 'ایجاد گروه جدید'}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 text-xs overflow-y-auto">
          {/* Type Selector */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium text-right">نوع گفتگو</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('group')}
                className={`p-3 rounded-2xl border text-right flex flex-col gap-1 transition-all ${
                  type === 'group'
                    ? 'border-sky-400 bg-sky-500/10 text-sky-300 font-semibold'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 shrink-0 text-sky-400" />
                  <span className="font-bold">گروه (Group)</span>
                </div>
                <span className="text-[10px] text-slate-400">گفتگوی همگانی (همه پیام می‌فرستند)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('channel')}
                className={`p-3 rounded-2xl border text-right flex flex-col gap-1 transition-all ${
                  type === 'channel'
                    ? 'border-sky-400 bg-sky-500/10 text-sky-300 font-semibold'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="font-bold">کانال (Channel)</span>
                </div>
                <span className="text-[10px] text-slate-400">یک‌طرفه (فقط مدیر می‌تواند پست بگذارد)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium text-right">
              {type === 'channel' ? 'نام کانال' : 'نام گروه'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'channel' ? 'مثال: اخبار و اطلاعیه‌ها' : 'مثال: گفتگوی همکاران'}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 text-xs text-right"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium text-right">توضیحات (اختیاری)</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="درباره این گفتگو..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 text-xs text-right"
            />
          </div>

          {/* Members list if creating group */}
          {type === 'group' && otherUsers.length > 0 && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium text-right">انتخاب اعضای اولیه</label>
              <div className="max-h-36 overflow-y-auto divide-y divide-slate-800/40 border border-slate-800 rounded-xl p-1 bg-slate-800/40">
                {otherUsers.map((u) => {
                  const isChecked = selectedUserIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleSelectUser(u.id)}
                      className="p-1.5 flex items-center justify-between hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                        <div className="text-right">
                          <div className="text-white text-xs font-medium">{u.name}</div>
                          <div className="text-sky-400 text-[10px] font-mono">@{u.username}</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-600'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-colors mt-2"
          >
            {type === 'channel' ? 'ایجاد کانال' : 'ایجاد گروه'}
          </button>
        </form>
      </div>
    </div>
  );
};
