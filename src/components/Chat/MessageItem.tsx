import React, { useState } from 'react';
import { 
  Check, 
  CheckCheck, 
  CornerUpLeft, 
  Pin, 
  Trash2, 
  Copy, 
  Smile, 
  FileText,
  Download
} from 'lucide-react';
import { Message } from '../../types/telegram';
import { VoicePlayer } from './VoicePlayer';

interface MessageItemProps {
  message: Message;
  isGroup?: boolean;
  onReply: (message: Message) => void;
  onPin: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

const COMMON_REACTIONS = ['👍', '❤️', '🔥', '🎉', '👏', '🚀'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isGroup = false,
  onReply,
  onPin,
  onDelete,
  onReaction,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (message.type === 'service') {
    return (
      <div className="flex justify-center my-3 select-none">
        <div className="bg-slate-800/80 backdrop-blur-sm text-slate-300 text-xs px-3 py-1 rounded-full shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  const isOutgoing = message.isOutgoing;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Sticker rendering
  if (message.type === 'sticker' && message.mediaUrl) {
    return (
      <div 
        className={`flex my-2 group relative ${isOutgoing ? 'justify-end' : 'justify-start'}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => {
          setShowActions(false);
          setShowReactionPicker(false);
        }}
      >
        <div className="relative max-w-[200px]">
          <img 
            src={message.mediaUrl} 
            alt={message.mediaName || 'Sticker'}
            referrerPolicy="no-referrer"
            className="w-40 h-40 object-contain hover:scale-105 transition-transform drop-shadow-md cursor-pointer"
          />
          <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex my-1.5 group relative ${isOutgoing ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactionPicker(false);
      }}
    >
      {/* Avatar for Incoming Messages in Groups */}
      {!isOutgoing && isGroup && message.senderAvatar && (
        <img 
          src={message.senderAvatar} 
          alt={message.senderName}
          referrerPolicy="no-referrer"
          className="w-8 h-8 rounded-full object-cover mr-2 self-end mb-1 border border-slate-700 shrink-0" 
        />
      )}

      {/* Bubble Container */}
      <div 
        className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-3.5 py-2 shadow-sm text-sm transition-all duration-150 ${
          isOutgoing
            ? 'bg-sky-600 text-white rounded-br-xs'
            : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/50'
        }`}
      >
        {/* Sender Name in Groups */}
        {!isOutgoing && isGroup && (
          <div className="text-xs font-semibold text-sky-400 mb-1 cursor-pointer hover:underline">
            {message.senderName}
          </div>
        )}

        {/* Forwarded Header */}
        {message.forwardedFrom && (
          <div className="text-[11px] text-sky-300/90 italic mb-1 flex items-center gap-1">
            <span>Forwarded from</span>
            <span className="font-semibold">{message.forwardedFrom}</span>
          </div>
        )}

        {/* Reply Quote Block */}
        {message.replyTo && (
          <div 
            className={`border-l-2 pl-2 py-0.5 mb-1.5 rounded-r text-xs cursor-pointer ${
              isOutgoing
                ? 'border-white/80 bg-white/10 text-white/90'
                : 'border-sky-500 bg-sky-950/40 text-slate-300'
            }`}
          >
            <div className="font-semibold text-[11px] text-sky-300">
              {message.replyTo.senderName}
            </div>
            <div className="truncate text-[11px] opacity-80">
              {message.replyTo.text}
            </div>
          </div>
        )}

        {/* Message Content by Type */}
        {message.type === 'voice' ? (
          <VoicePlayer 
            duration={message.duration} 
            waveform={message.waveform}
            isOutgoing={isOutgoing}
          />
        ) : message.type === 'code' ? (
          <div className="my-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>{message.mediaName || 'snippet.ts'}</span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-slate-950/80 p-2.5 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-700/60 leading-relaxed">
              <code>{message.mediaUrl || message.content}</code>
            </pre>
          </div>
        ) : message.type === 'document' ? (
          <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-700/50 my-1">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate text-slate-200">
                {message.mediaName || 'document.pdf'}
              </div>
              <div className="text-[10px] text-slate-400">
                {message.mediaSize || '2.4 MB'}
              </div>
            </div>
            <button className="w-8 h-8 rounded-full hover:bg-slate-700/50 flex items-center justify-center text-slate-300 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="leading-relaxed whitespace-pre-wrap break-words text-[13.5px]">
            {message.content}
          </div>
        )}

        {/* Timestamp & Status Indicator */}
        <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 select-none ${
          isOutgoing ? 'text-sky-100/80' : 'text-slate-400'
        }`}>
          <span>{message.timestamp}</span>
          {isOutgoing && (
            <span>
              {message.status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-sky-200 inline" />
              ) : message.status === 'delivered' ? (
                <CheckCheck className="w-3.5 h-3.5 text-sky-200/60 inline" />
              ) : (
                <Check className="w-3.5 h-3.5 text-sky-200/60 inline" />
              )}
            </span>
          )}
        </div>

        {/* Reaction Chips */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-white/10">
            {message.reactions.map((reaction, i) => (
              <button
                key={i}
                onClick={() => onReaction(message.id, reaction.emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-transform active:scale-90 border ${
                  reaction.hasReacted
                    ? 'bg-sky-500/30 border-sky-400 text-sky-200'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>{reaction.emoji}</span>
                <span className="text-[11px] font-mono">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Hover Quick Action Toolbar */}
        {showActions && (
          <div 
            className={`absolute top-0 -translate-y-1/2 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md px-1.5 py-1 rounded-full border border-slate-700 shadow-xl z-20 transition-all ${
              isOutgoing ? 'right-4' : 'left-4'
            }`}
          >
            {/* React Picker Button */}
            <div className="relative">
              <button 
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="w-7 h-7 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                title="React"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
              {showReactionPicker && (
                <div className="absolute bottom-full mb-1 left-0 flex items-center gap-1 bg-slate-900 border border-slate-700 p-1 rounded-full shadow-2xl z-30">
                  {COMMON_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReaction(message.id, emoji);
                        setShowReactionPicker(false);
                      }}
                      className="w-7 h-7 hover:scale-125 transition-transform flex items-center justify-center text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => onReply(message)}
              className="w-7 h-7 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              title="Reply"
            >
              <CornerUpLeft className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={() => onPin(message)}
              className="w-7 h-7 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              title="Pin"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={handleCopy}
              className="w-7 h-7 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              title="Copy text"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={() => onDelete(message.id)}
              className="w-7 h-7 rounded-full hover:bg-red-500/20 text-slate-300 hover:text-red-400 flex items-center justify-center transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
