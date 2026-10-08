import React from 'react';
import { 
  Menu, 
  Search, 
  BadgeCheck, 
  Pin, 
  BellOff, 
  CheckCheck, 
  Check, 
  Mic, 
  Plus, 
  Bot, 
  X,
  Loader2
} from 'lucide-react';
import { Chat, FolderCategory, Message } from '../../types/telegram';
import { ConnectionState } from '../../services/telegramStore';

interface LeftSidebarProps {
  connectionState: ConnectionState;
  chats: Chat[];
  activeChatId: string;
  activeFolder: FolderCategory;
  searchQuery: string;
  messages: Record<string, Message[]>;
  onSelectChat: (chatId: string) => void;
  onSelectFolder: (folder: FolderCategory) => void;
  onSearchChange: (query: string) => void;
  onOpenDrawer: () => void;
  onOpenNewChat: () => void;
}

const FOLDERS: { id: FolderCategory; label: string }[] = [
  { id: 'all', label: 'همه' },
  { id: 'personal', label: 'دایرکت' },
  { id: 'groups', label: 'گروه‌ها' },
  { id: 'channels', label: 'کانال‌ها' },
  { id: 'bots', label: 'ربات‌ها' },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  connectionState,
  chats,
  activeChatId,
  activeFolder,
  searchQuery,
  messages,
  onSelectChat,
  onSelectFolder,
  onSearchChange,
  onOpenDrawer,
  onOpenNewChat,
}) => {
  // Filter by folder
  let filtered = chats.filter(c => {
    if (activeFolder === 'all') return true;
    if (activeFolder === 'channels') return c.type === 'channel' || (c.categories && c.categories.includes('channels'));
    if (activeFolder === 'groups') return c.type === 'group' || (c.categories && c.categories.includes('groups'));
    if (activeFolder === 'personal') return c.type === 'user' || c.type === 'saved' || (c.categories && c.categories.includes('personal'));
    if (activeFolder === 'bots') return c.type === 'bot' || (c.categories && c.categories.includes('bots'));
    return c.categories && c.categories.includes(activeFolder);
  });

  // Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c => 
      c.title.toLowerCase().includes(q) || 
      (c.username && c.username.toLowerCase().includes(q))
    );
  }

  // Sort pinned first
  filtered.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const getLastMessage = (chatId: string): Message | undefined => {
    const list = messages[chatId];
    return list && list.length > 0 ? list[list.length - 1] : undefined;
  };

  return (
    <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 select-none">
      {/* Top Header: Brand label with Connecting / Updating state transition */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawer}
            className="w-9 h-9 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Authentic Telegram connection / brand title */}
          <div className="flex items-center gap-2">
            {connectionState === 'connecting' ? (
              <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : connectionState === 'updating' ? (
              <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              <span className="font-bold text-base text-slate-100 tracking-tight select-none">
                TELESHΞN™
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="px-3 pb-2">
        <div className="relative bg-slate-800/80 rounded-xl flex items-center px-3 py-1.5 focus-within:ring-1 focus-within:ring-sky-500 transition-all border border-slate-700/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 pl-2 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="flex items-center gap-1 px-3 py-1 border-b border-slate-800/80 text-xs">
        {FOLDERS.map((folder) => {
          const isActive = activeFolder === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {folder.label}
            </button>
          );
        })}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {filtered.map((chat) => {
          const isSelected = chat.id === activeChatId;
          const lastMsg = getLastMessage(chat.id);

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors relative ${
                isSelected
                  ? 'bg-sky-500/15 border-l-3 border-sky-400'
                  : 'hover:bg-slate-800/60'
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={chat.avatar}
                  alt={chat.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-800"
                />
                {chat.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                )}
                {chat.type === 'bot' && (
                  <span className="absolute -bottom-1 -right-1 bg-slate-800 p-0.5 rounded-full border border-slate-700 text-sky-400">
                    <Bot className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Chat Text Details */}
              <div className="flex-1 min-w-0">
                {/* Title & Timestamp Row */}
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className={`text-sm truncate font-medium ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {chat.title}
                    </span>
                    {chat.isVerified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-sky-400 shrink-0 fill-sky-500/20" />
                    )}
                    {chat.isMuted && (
                      <BellOff className="w-3 h-3 text-slate-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 ml-1 font-mono">
                    {lastMsg ? lastMsg.timestamp : ''}
                  </span>
                </div>

                {/* Snippet & Badges Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-400 truncate flex-1 pr-2">
                    {lastMsg?.isOutgoing && (
                      <span className="shrink-0">
                        {lastMsg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </span>
                    )}

                    {lastMsg?.type === 'voice' && (
                      <span className="flex items-center gap-1 text-sky-400">
                        <Mic className="w-3 h-3 shrink-0" />
                        <span className="text-[11px]">Voice note</span>
                      </span>
                    )}

                    {lastMsg?.type !== 'voice' && (
                      <span className="truncate">
                        {lastMsg ? lastMsg.content : 'No messages'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {chat.isPinned && (
                      <Pin className="w-3 h-3 text-slate-500" />
                    )}
                    {chat.unreadCount > 0 && (
                      <span className="bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No chats found
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="p-3 border-t border-slate-800 flex justify-end bg-slate-900/90">
        <button
          onClick={onOpenNewChat}
          className="w-11 h-11 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
          title="New Chat"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
