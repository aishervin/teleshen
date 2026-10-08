import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Smile, 
  Mic, 
  Send, 
  X, 
  FileCode, 
  Image as ImageIcon, 
  FileText,
  Square,
  Bot
} from 'lucide-react';
import { Message } from '../../types/telegram';

interface MessageComposerProps {
  chatId: string;
  isBot?: boolean;
  replyMessage: Message | null;
  onCancelReply: () => void;
  onSendMessage: (text: string, type?: Message['type'], extra?: Partial<Message>) => void;
  onSendVoice: (duration: number, waveform: number[]) => void;
  onToggleStickerPicker: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  chatId,
  isBot = false,
  replyMessage,
  onCancelReply,
  onSendMessage,
  onSendVoice,
  onToggleStickerPicker,
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showCommandHints, setShowCommandHints] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto focus input on chat change
  useEffect(() => {
    inputRef.current?.focus();
  }, [chatId]);

  // Voice recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [isRecording]);

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
      setShowCommandHints(false);
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    setShowCommandHints(isBot && val.startsWith('/'));

    // Auto-grow
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(120, e.target.scrollHeight)}px`;
  };

  const handleStartRecord = () => {
    setIsRecording(true);
  };

  const handleFinishRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      const duration = Math.max(3, recordingSeconds);
      // Generate synthetic waveform
      const waveform = Array.from({ length: 20 }, () => Math.floor(Math.random() * 70) + 20);
      onSendVoice(duration, waveform);
    }
  };

  const handleCancelRecord = () => {
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const insertCommand = (cmd: string) => {
    setText(cmd + ' ');
    setShowCommandHints(false);
    inputRef.current?.focus();
  };

  const handleAttachCode = () => {
    setShowAttachMenu(false);
    const codeSample = `// Script snippet\nfunction main() {\n  console.log("TELESHΞN™ Ready");\n}`;
    onSendMessage('Snippet', 'code', {
      mediaUrl: codeSample,
      mediaName: 'snippet.ts',
      codeLang: 'typescript',
    });
  };

  const handleAttachDocument = () => {
    setShowAttachMenu(false);
    onSendMessage('Document', 'document', {
      mediaName: 'Document.pdf',
      mediaSize: '1.2 MB',
    });
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-2 sm:p-3 relative z-10 shrink-0">
      {/* Bot command hints popup */}
      {showCommandHints && (
        <div className="absolute bottom-full mb-2 left-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-2 w-72 z-30">
          <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 flex items-center gap-1.5 border-b border-slate-800">
            <Bot className="w-3.5 h-3.5 text-sky-400" />
            <span>Assistant Commands</span>
          </div>
          <div className="mt-1 space-y-0.5">
            {[
              { cmd: '/start', desc: 'شروع گفتگو با دستیار' },
              { cmd: '/help', desc: 'راهنما و دستورات' },
              { cmd: '/support', desc: 'پشتیبانی مستقیم (@shervini)' },
            ].map(item => (
              <button
                key={item.cmd}
                onClick={() => insertCommand(item.cmd)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors"
              >
                <span className="font-mono text-sky-400 font-semibold">{item.cmd}</span>
                <span className="text-[11px] text-slate-400 truncate ml-2">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reply Quote Bar */}
      {replyMessage && (
        <div className="flex items-center justify-between bg-slate-800/80 rounded-xl px-3 py-1.5 mb-2 border-l-3 border-sky-500">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-semibold text-sky-400">
              Replying to {replyMessage.senderName}
            </div>
            <div className="text-xs text-slate-300 truncate">
              {replyMessage.content}
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="w-6 h-6 rounded-full hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Composer Controls */}
      <div className="flex items-end gap-1.5 sm:gap-2">
        {/* Attachment menu button */}
        <div className="relative">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            disabled={isRecording}
            className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5 -rotate-45" />
          </button>

          {/* Attachment flyout */}
          {showAttachMenu && (
            <div 
              className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-30 flex flex-col gap-1"
              onMouseLeave={() => setShowAttachMenu(false)}
            >
              <button 
                onClick={handleAttachCode}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Code Snippet</span>
              </button>
              <button 
                onClick={handleAttachDocument}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Document File</span>
              </button>
              <button 
                onClick={() => {
                  setShowAttachMenu(false);
                  onSendMessage('Shared an engineering schematic diagram', 'photo', {
                    mediaUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
                  });
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>Photo / Diagram</span>
              </button>
            </div>
          )}
        </div>

        {/* Input box / Voice Recording bar */}
        {isRecording ? (
          <div className="flex-1 h-10 bg-red-950/40 border border-red-500/30 rounded-2xl px-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Recording Voice Note:</span>
              <span className="font-mono font-bold text-white">
                0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelRecord}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleFinishRecord}
                className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-400"
                title="Stop and send"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 focus-within:border-sky-500/80 px-3 py-2 flex items-center gap-2 transition-colors">
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={isBot ? "Write a message or /command..." : "Write a message..."}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 resize-none outline-none max-h-28 overflow-y-auto"
            />

            {/* Sticker / Emoji trigger */}
            <button
              onClick={onToggleStickerPicker}
              className="text-slate-400 hover:text-amber-400 transition-colors shrink-0"
              title="Stickers & Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Action Button: Send or Voice Record */}
        {text.trim() ? (
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        ) : (
          <button
            onClick={isRecording ? handleFinishRecord : handleStartRecord}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-400 text-white animate-bounce'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isRecording ? "Finish recording" : "Record voice note"}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
