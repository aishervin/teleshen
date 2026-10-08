import React, { useState } from 'react';
import { X, Users, Radio, MessageSquare, Check } from 'lucide-react';
import { Chat, ChatType } from '../../types/telegram';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (chat: Partial<Chat>) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onCreateChat,
}) => {
  const [type, setType] = useState<ChatType>('group');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateChat({
      title: title.trim(),
      type,
      bio: bio.trim() || undefined,
      avatar: type === 'channel'
        ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="font-semibold text-slate-100 text-sm">Create New Conversation</div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type Selector */}
          <div>
            <label className="block text-slate-400 mb-2 font-medium">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('group')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-colors ${
                  type === 'group'
                    ? 'border-sky-400 bg-sky-500/10 text-sky-300 font-semibold'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>New Group</span>
              </button>

              <button
                type="button"
                onClick={() => setType('channel')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-colors ${
                  type === 'channel'
                    ? 'border-sky-400 bg-sky-500/10 text-sky-300 font-semibold'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-4 h-4 shrink-0" />
                <span>New Channel</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Title / Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shervin & Team or Tech Radar"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Description (Optional)</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What is this channel or group about?"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
