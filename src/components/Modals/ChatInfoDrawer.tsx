import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  BellOff, 
  Image as ImageIcon, 
  FileText, 
  Mic, 
  Link as LinkIcon, 
  Users, 
  BadgeCheck, 
  Share2, 
  Trash2,
  Phone
} from 'lucide-react';
import { Chat, Message } from '../../types/telegram';

interface ChatInfoDrawerProps {
  isOpen: boolean;
  chat: Chat;
  messages: Message[];
  onClose: () => void;
  onToggleMute: () => void;
  onStartCall: () => void;
}

export const ChatInfoDrawer: React.FC<ChatInfoDrawerProps> = ({
  isOpen,
  chat,
  messages,
  onClose,
  onToggleMute,
  onStartCall,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'media' | 'files' | 'voice'>('media');

  if (!isOpen) return null;

  // Filter shared media from message history
  const mediaMessages = messages.filter(m => m.type === 'photo' || m.type === 'sticker');
  const fileMessages = messages.filter(m => m.type === 'document' || m.type === 'code');
  const voiceMessages = messages.filter(m => m.type === 'voice');

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-40 flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="font-semibold text-slate-100 text-sm">
          {chat.type === 'channel' ? 'Channel Info' : chat.type === 'group' ? 'Group Info' : 'User Info'}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {/* Profile Card */}
        <div className="p-5 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <img 
              src={chat.avatar} 
              alt={chat.title}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover ring-2 ring-slate-700 shadow-lg" 
            />
            {chat.isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            )}
          </div>

          <div className="flex items-center gap-1.5 justify-center">
            <h3 className="font-bold text-white text-base truncate max-w-xs">{chat.title}</h3>
            {chat.isVerified && <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0 inline fill-sky-500/20" />}
          </div>

          <div className="text-xs text-sky-400 font-mono mt-0.5">
            {chat.username ? `@${chat.username}` : ''}
          </div>

          <div className="text-xs text-slate-400 mt-1">
            {chat.type === 'channel' 
              ? `${(chat.memberCount || 1200).toLocaleString()} subscribers`
              : chat.type === 'group'
              ? `${chat.memberCount || 10} members`
              : chat.isOnline ? 'online' : 'last seen recently'}
          </div>

          {/* Quick Call Action for 1-on-1 */}
          {chat.type === 'user' && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={onStartCall}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
            </div>
          )}
        </div>

        {/* Bio / Description */}
        {chat.bio && (
          <div className="p-4 text-xs">
            <div className="text-slate-400 mb-1 font-medium">About / Description</div>
            <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">{chat.bio}</div>
          </div>
        )}

        {/* Notifications Setting */}
        <div className="p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-slate-200">
            {chat.isMuted ? <BellOff className="w-4 h-4 text-slate-500" /> : <Bell className="w-4 h-4 text-sky-400" />}
            <span>Notifications</span>
          </div>
          <button
            onClick={onToggleMute}
            className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
              chat.isMuted
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30'
            }`}
          >
            {chat.isMuted ? 'Muted' : 'Enabled'}
          </button>
        </div>

        {/* Shared Media Tabs */}
        <div className="p-4">
          <div className="text-xs font-medium text-slate-400 mb-3">Shared Content</div>
          <div className="flex border-b border-slate-800 text-xs mb-3">
            <button
              onClick={() => setActiveMediaTab('media')}
              className={`pb-2 px-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
                activeMediaTab === 'media'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Media ({mediaMessages.length})</span>
            </button>
            <button
              onClick={() => setActiveMediaTab('files')}
              className={`pb-2 px-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
                activeMediaTab === 'files'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Files ({fileMessages.length})</span>
            </button>
            <button
              onClick={() => setActiveMediaTab('voice')}
              className={`pb-2 px-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
                activeMediaTab === 'voice'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice ({voiceMessages.length})</span>
            </button>
          </div>

          {/* Media Content Preview */}
          {activeMediaTab === 'media' && (
            <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
              {mediaMessages.map((m) => (
                <img
                  key={m.id}
                  src={m.mediaUrl}
                  alt="shared media"
                  referrerPolicy="no-referrer"
                  className="w-full h-20 object-cover rounded-lg border border-slate-800"
                />
              ))}
              {mediaMessages.length === 0 && (
                <div className="col-span-3 text-center py-6 text-slate-500 text-xs">
                  No photos shared yet
                </div>
              )}
            </div>
          )}

          {activeMediaTab === 'files' && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {fileMessages.map((m) => (
                <div key={m.id} className="p-2 bg-slate-800/50 rounded-xl text-xs flex items-center gap-2 border border-slate-800">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="truncate flex-1">
                    <div className="text-slate-200 truncate">{m.mediaName || 'file'}</div>
                    <div className="text-[10px] text-slate-400">{m.mediaSize || 'Code Snippet'}</div>
                  </div>
                </div>
              ))}
              {fileMessages.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No files shared yet
                </div>
              )}
            </div>
          )}

          {activeMediaTab === 'voice' && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {voiceMessages.map((m) => (
                <div key={m.id} className="p-2 bg-slate-800/50 rounded-xl text-xs flex items-center justify-between border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-sky-400" />
                    <span className="text-slate-300">Voice Note ({m.duration}s)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                </div>
              ))}
              {voiceMessages.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No voice messages
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
