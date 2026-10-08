import React, { useState } from 'react';
import { X, Smile, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Sticker } from '../../types/telegram';
import { STICKERS } from '../../data/mockData';

interface StickerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: Sticker) => void;
  onSelectEmoji: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥹', '😊',
  '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛',
  '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒',
  '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺',
  '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶',
  '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🫢',
  '🤫', '🤥', '😶', '😐', '😑', '😬', '🫠', '🙄', '😯', '😦',
  '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲',
  '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '🔥', '✨', '⚡', '💥', '🚀', '🎉', '🎊', '🏆', '💎', '👑'
];

export const StickerPickerModal: React.FC<StickerPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
  onSelectEmoji,
}) => {
  const [tab, setTab] = useState<'stickers' | 'emoji'>('stickers');

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 right-4 sm:right-6 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-30 flex flex-col h-80 overflow-hidden select-none animate-in zoom-in-95 duration-150">
      {/* Header & Tabs */}
      <div className="p-2 border-b border-slate-800 flex items-center justify-between bg-slate-850">
        <div className="flex gap-1">
          <button
            onClick={() => setTab('stickers')}
            className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              tab === 'stickers'
                ? 'bg-sky-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stickers</span>
          </button>
          <button
            onClick={() => setTab('emoji')}
            className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              tab === 'emoji'
                ? 'bg-sky-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Emoji</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'stickers' && (
          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-2 px-1">
              TELESHΞN™ Tech Pack
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STICKERS.map((st) => (
                <button
                  key={st.id}
                  onClick={() => onSelectSticker(st)}
                  className="p-2 hover:bg-slate-800 rounded-2xl flex flex-col items-center justify-center transition-transform hover:scale-110 active:scale-95 group"
                >
                  <img
                    src={st.url}
                    alt={st.emoji}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover rounded-xl shadow-xs"
                  />
                  <span className="text-xs mt-1 text-slate-400 group-hover:text-white">{st.emoji}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'emoji' && (
          <div className="grid grid-cols-8 gap-1.5 text-xl">
            {EMOJI_CATEGORIES.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => onSelectEmoji(emoji)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
