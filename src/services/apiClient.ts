import { MessageType } from '../types/telegram';

export interface UserDTO {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface ChatDTO {
  id: string;
  title: string;
  avatar: string;
  type: 'user' | 'group' | 'channel' | 'bot' | 'saved';
  memberIds: string[];
  createdBy: string;
  bio?: string;
  isPinned?: boolean;
}

export interface MessageDTO {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: MessageType;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  duration?: number;
  waveform?: number[];
  reactions?: { emoji: string; count: number; users: string[] }[];
  replyTo?: { id: string; senderName: string; text: string };
  isOutgoing?: boolean;
}

class ApiClient {
  private eventSource: EventSource | null = null;

  async login(username: string, name?: string, avatar?: string, bio?: string): Promise<UserDTO> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name, avatar, bio }),
    });
    if (!res.ok) throw new Error('Failed to log in');
    const data = await res.json();
    return data.user;
  }

  async getAllUsers(): Promise<UserDTO[]> {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return [];
      const data = await res.json();
      return data.users || [];
    } catch {
      return [];
    }
  }

  async getChats(userId: string): Promise<ChatDTO[]> {
    try {
      const res = await fetch(`/api/chats?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.chats || [];
    } catch {
      return [];
    }
  }

  async createDirectChat(currentUserId: string, targetUsername: string): Promise<ChatDTO> {
    const res = await fetch('/api/chats/direct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId, targetUsername }),
    });
    if (!res.ok) throw new Error('Failed to create direct chat');
    const data = await res.json();
    return data.chat;
  }

  async createGroupChat(currentUserId: string, title: string, type: 'group' | 'channel', memberIds?: string[], bio?: string): Promise<ChatDTO> {
    const res = await fetch('/api/chats/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId, title, type, memberIds, bio }),
    });
    if (!res.ok) throw new Error('Failed to create group');
    const data = await res.json();
    return data.chat;
  }

  async getMessages(chatId: string): Promise<MessageDTO[]> {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch {
      return [];
    }
  }

  async sendMessage(chatId: string, payload: Partial<MessageDTO>): Promise<MessageDTO> {
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to send message');
    const data = await res.json();
    return data.message;
  }

  async toggleReaction(chatId: string, messageId: string, userId: string, emoji: string) {
    const res = await fetch(`/api/chats/${chatId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, userId, emoji }),
    });
    if (!res.ok) return null;
    return await res.json();
  }

  // Subscribe to real-time events over SSE
  subscribeToEvents(callbacks: {
    onNewMessage?: (msg: MessageDTO) => void;
    onUserJoined?: (user: UserDTO) => void;
    onChatCreated?: (chat: ChatDTO) => void;
    onReactionUpdated?: (data: { chatId: string; messageId: string; reactions: { emoji: string; count: number; users: string[] }[] }) => void;
  }) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    try {
      const es = new EventSource('/api/events');
      this.eventSource = es;

      if (callbacks.onNewMessage) {
        es.addEventListener('new_message', (e) => {
          try {
            const msg = JSON.parse(e.data);
            callbacks.onNewMessage!(msg);
          } catch {
            // ignore
          }
        });
      }

      if (callbacks.onUserJoined) {
        es.addEventListener('user_joined', (e) => {
          try {
            const user = JSON.parse(e.data);
            callbacks.onUserJoined!(user);
          } catch {
            // ignore
          }
        });
      }

      if (callbacks.onChatCreated) {
        es.addEventListener('chat_created', (e) => {
          try {
            const chat = JSON.parse(e.data);
            callbacks.onChatCreated!(chat);
          } catch {
            // ignore
          }
        });
      }

      if (callbacks.onReactionUpdated) {
        es.addEventListener('reaction_updated', (e) => {
          try {
            const data = JSON.parse(e.data);
            callbacks.onReactionUpdated!(data);
          } catch {
            // ignore
          }
        });
      }

      return () => {
        es.close();
      };
    } catch {
      return () => {};
    }
  }
}

export const apiClient = new ApiClient();
