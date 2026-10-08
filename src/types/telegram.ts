export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type MessageType = 
  | 'text' 
  | 'photo' 
  | 'voice' 
  | 'video_note' 
  | 'document' 
  | 'sticker' 
  | 'code' 
  | 'service';

export interface MessageReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export interface ReplyReference {
  id: string;
  senderName: string;
  text: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  isOutgoing: boolean;
  type: MessageType;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  duration?: number; // for audio/voice in seconds
  waveform?: number[]; // audio bars [1..100]
  codeLang?: string;
  replyTo?: ReplyReference;
  forwardedFrom?: string;
  reactions?: MessageReaction[];
  isPinned?: boolean;
}

export type ChatType = 'user' | 'group' | 'channel' | 'bot' | 'saved';

export type FolderCategory = 'all' | 'channels' | 'groups' | 'bots' | 'personal' | 'work';

export interface Chat {
  id: string;
  title: string;
  avatar: string;
  username?: string;
  type: ChatType;
  isVerified?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  memberCount?: number;
  isMuted?: boolean;
  unreadCount: number;
  categories: FolderCategory[];
  isPinned?: boolean;
  pinnedMessage?: Message;
  typingUser?: string;
  draft?: string;
  bio?: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  handle: string;
  phone: string;
  bio: string;
  avatar: string;
  isPremium: boolean;
}

export type ThemeType = 'default' | 'midnight' | 'emerald' | 'cyber' | 'light';

export interface Sticker {
  id: string;
  emoji: string;
  url: string;
  packName: string;
}

export interface CallState {
  isActive: boolean;
  chat: Chat | null;
  status: 'calling' | 'connected' | 'ended';
  duration: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
}
