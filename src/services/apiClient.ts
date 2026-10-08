import { MessageType } from '../types/telegram';

export interface UserDTO {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
  email?: string;
  role?: 'owner' | 'admin' | 'member';
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

const STORAGE_USERS_KEY = 'teleshen_registered_directory_v5';

class ApiClient {
  private eventSource: EventSource | null = null;

  private getLocalUsers(): Record<string, { user: UserDTO; password?: string }> {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private saveLocalUser(user: UserDTO, password?: string) {
    try {
      const users = this.getLocalUsers();
      users[user.username.toLowerCase()] = { user, password };
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }

  private getLocalUser(username: string): UserDTO | null {
    const users = this.getLocalUsers();
    const item = users[username.toLowerCase()];
    return item ? item.user : null;
  }

  async login(username: string, password?: string): Promise<UserDTO> {
    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
    
    // 1. Try backend API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.saveLocalUser(data.user, password);
          return data.user;
        }
      } else {
        const err = await res.json().catch(() => null);
        if (err?.error && !err.error.includes('Cannot') && !err.error.includes('404')) {
          throw new Error(err.error);
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && !e.message.includes('fetch') && !e.message.includes('404')) {
        throw e;
      }
    }

    // 2. Fallback to local storage on edge static pages
    const existing = this.getLocalUser(cleanUser);
    if (existing) {
      existing.isOnline = true;
      existing.lastSeen = 'online';
      this.saveLocalUser(existing, password);
      return existing;
    }

    throw new Error('کاربری با این مشخصات یافت نشد. لطفاً در تب ثبت‌نام، حساب کاربری جدید ایجاد کنید.');
  }

  async register(username: string, password: string, name: string, avatar: string, bio?: string): Promise<UserDTO> {
    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');

    // 1. Try backend API
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password, name, avatar, bio }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.saveLocalUser(data.user, password);
          return data.user;
        }
      } else {
        const err = await res.json().catch(() => null);
        if (err?.error && !err.error.includes('Cannot') && !err.error.includes('404')) {
          throw new Error(err.error);
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && !e.message.includes('fetch') && !e.message.includes('404')) {
        throw e;
      }
    }

    // 2. Fallback to local persistent storage for static edge
    const localUser: UserDTO = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUser,
      name: name.trim() || cleanUser,
      avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUser}`,
      bio: bio?.trim() || 'TELESHΞN™ Member',
      isOnline: true,
      lastSeen: 'online',
    };

    this.saveLocalUser(localUser, password);
    return localUser;
  }

  async getAllUsers(): Promise<UserDTO[]> {
    let remoteUsers: UserDTO[] = [];
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        remoteUsers = data.users || [];
      }
    } catch {
      // ignore
    }

    const localMap = this.getLocalUsers();
    const localUsers = Object.values(localMap).map(i => i.user);

    const combined = [...remoteUsers];
    for (const u of localUsers) {
      if (!combined.some(c => c.username.toLowerCase() === u.username.toLowerCase())) {
        combined.push(u);
      }
    }
    return combined;
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
