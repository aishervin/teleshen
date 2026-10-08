import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/telegram';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  isGroup?: boolean;
  searchFilter?: string;
  onReply: (message: Message) => void;
  onPin: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isGroup = false,
  searchFilter = '',
  onReply,
  onPin,
  onDelete,
  onReaction,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const filteredMessages = searchFilter
    ? messages.filter(m => m.content.toLowerCase().includes(searchFilter.toLowerCase()))
    : messages;

  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-4 tg-wallpaper flex flex-col justify-start">
      {/* Date badge */}
      <div className="flex justify-center mb-4 select-none">
        <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 text-[11px] font-medium px-3 py-1 rounded-full shadow-xs border border-slate-800">
          Today
        </span>
      </div>

      {/* Messages */}
      {filteredMessages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          isGroup={isGroup}
          onReply={onReply}
          onPin={onPin}
          onDelete={onDelete}
          onReaction={onReaction}
        />
      ))}

      {filteredMessages.length === 0 && searchFilter && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
          <p>No messages match &quot;{searchFilter}&quot;</p>
        </div>
      )}

      <div ref={bottomRef} className="h-2" />
    </div>
  );
};
