import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Chat, 
  CurrentUser, 
  FolderCategory, 
  Message, 
  ThemeType, 
  CallState, 
  Sticker,
  ChatType
} from '../types/telegram';
import { CURRENT_USER, INITIAL_CHATS, INITIAL_MESSAGES } from '../data/mockData';
import { soundEngine } from './audioSimulator';
import { apiClient, UserDTO, ChatDTO, MessageDTO } from './apiClient';

const STORAGE_KEY_USER = 'teleshen_session_user_v5';
const STORAGE_KEY_THEME = 'teleshen_theme_v5';

export type ConnectionState = 'connecting' | 'updating' | 'connected';

export function useTelegramStore() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');

  // Currently logged-in user
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  // Directory of all users registered on the platform
  const [registeredUsers, setRegisteredUsers] = useState<UserDTO[]>([]);

  // Chats list
  const [chats, setChats] = useState<Chat[]>(() => INITIAL_CHATS);

  // Messages map by chatId
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => INITIAL_MESSAGES);

  const [activeChatId, setActiveChatId] = useState<string>('shen-zero-assistant');
  const [activeFolder, setActiveFolder] = useState<FolderCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME) as ThemeType;
    return saved || 'default';
  });

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDirectoryOpen, setIsUserDirectoryOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const [replyMessage, setReplyMessage] = useState<Message | null>(null);

  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    chat: null,
    status: 'calling',
    duration: 0,
    isMuted: false,
    isVideoEnabled: false,
    isSpeakerOn: true,
  });

  // 1. Initial Connection Sequence & Backend Boot
  useEffect(() => {
    let isMounted = true;

    async function initBackend() {
      try {
        // Sync registered users from backend
        const users = await apiClient.getAllUsers();
        if (isMounted && users.length > 0) {
          setRegisteredUsers(users);
        }

        // Sync or register current user with backend
        if (currentUser) {
          await apiClient.login(
            currentUser.handle.replace(/^@/, ''),
            currentUser.name,
            currentUser.avatar,
            currentUser.bio
          );
        }

        // Fetch backend chats
        if (currentUser) {
          const remoteChats = await apiClient.getChats(currentUser.id);
          if (isMounted && remoteChats.length > 0) {
            setChats(prev => {
              const merged = [...prev];
              for (const rc of remoteChats) {
                if (!merged.find(c => c.id === rc.id)) {
                  merged.push({
                    id: rc.id,
                    title: rc.title,
                    avatar: rc.avatar,
                    type: rc.type,
                    unreadCount: 0,
                    categories: ['all', rc.type === 'bot' ? 'bots' : 'personal'],
                    bio: rc.bio,
                    isPinned: rc.isPinned,
                  });
                }
              }
              return merged;
            });
          }
        }
      } catch {
        // Silent offline fallback
      } finally {
        if (isMounted) {
          setTimeout(() => setConnectionState('updating'), 800);
          setTimeout(() => setConnectionState('connected'), 1600);
        }
      }
    }

    initBackend();

    // Subscribe to Real-Time Server-Sent Events (SSE)
    const unsubscribe = apiClient.subscribeToEvents({
      onNewMessage: (msg: MessageDTO) => {
        setMessages(prev => {
          const list = prev[msg.chatId] || [];
          if (list.some(m => m.id === msg.id)) return prev;
          const formatted: Message = {
            ...msg,
            isOutgoing: msg.senderId === currentUser.id,
            reactions: (msg.reactions || []).map(r => ({
              emoji: r.emoji,
              count: r.count,
              hasReacted: Array.isArray(r.users) ? r.users.includes(currentUser.id) : false,
            })),
          };
          return {
            ...prev,
            [msg.chatId]: [...list, formatted],
          };
        });

        if (msg.senderId !== currentUser.id) {
          soundEngine.playReceive();
        }
      },
      onUserJoined: (newUser: UserDTO) => {
        setRegisteredUsers(prev => {
          if (prev.some(u => u.id === newUser.id)) return prev;
          return [...prev, newUser];
        });
      },
      onChatCreated: (newChat: ChatDTO) => {
        setChats(prev => {
          if (prev.some(c => c.id === newChat.id)) return prev;
          return [{
            id: newChat.id,
            title: newChat.title,
            avatar: newChat.avatar,
            type: newChat.type,
            unreadCount: 0,
            categories: ['all', newChat.type === 'bot' ? 'bots' : 'personal'],
            bio: newChat.bio,
          }, ...prev];
        });
      },
      onReactionUpdated: ({ chatId, messageId, reactions }) => {
        setMessages(prev => {
          const list = prev[chatId] || [];
          return {
            ...prev,
            [chatId]: list.map(m => m.id === messageId ? {
              ...m,
              reactions: reactions.map(r => ({
                emoji: r.emoji,
                count: r.count,
                hasReacted: r.users.includes(currentUser.id),
              }))
            } : m),
          };
        });
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser]);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Persist current session
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Call duration counter
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState.isActive && callState.status === 'connected') {
      timer = setInterval(() => {
        setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState.isActive, callState.status]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const activeMessages = (messages[activeChatId] || []);

  const selectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setReplyMessage(null);
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
  }, []);

  // Login handler
  const login = useCallback(async (username: string, name: string, avatar: string, bio: string) => {
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    const user = await apiClient.login(cleanUsername, name, avatar, bio);
    const updated: CurrentUser = {
      id: user.id,
      name: user.name,
      handle: `@${user.username}`,
      phone: '+98 912 345 6789',
      bio: user.bio || '',
      avatar: user.avatar,
      isPremium: true,
    };
    setCurrentUser(updated);

    // Refresh users directory
    const freshUsers = await apiClient.getAllUsers();
    setRegisteredUsers(freshUsers);
  }, []);

  // Start 1-on-1 Direct Chat with any registered user
  const startDirectChat = useCallback(async (targetUsername: string) => {
    const cleanTarget = targetUsername.trim().toLowerCase().replace(/^@/, '');
    
    // Check if target is support
    if (cleanTarget === 'shervini') {
      selectChat('shervini-support');
      return;
    }
    if (cleanTarget === 'shen_zero_bot') {
      selectChat('shen-zero-assistant');
      return;
    }

    try {
      const chat = await apiClient.createDirectChat(currentUser.id, cleanTarget);
      const newChatObj: Chat = {
        id: chat.id,
        title: chat.title,
        avatar: chat.avatar,
        type: 'user',
        username: cleanTarget,
        unreadCount: 0,
        categories: ['all', 'personal'],
        bio: chat.bio,
        isOnline: true,
      };

      setChats(prev => {
        if (prev.some(c => c.id === chat.id)) return prev;
        return [newChatObj, ...prev];
      });

      selectChat(chat.id);
    } catch {
      // Local fallback
      const localId = `chat_dir_${cleanTarget}`;
      const newChatObj: Chat = {
        id: localId,
        title: `@${cleanTarget}`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanTarget}`,
        type: 'user',
        username: cleanTarget,
        unreadCount: 0,
        categories: ['all', 'personal'],
        isOnline: true,
      };
      setChats(prev => [newChatObj, ...prev]);
      selectChat(localId);
    }
  }, [currentUser.id, selectChat]);

  // Create group or channel with members
  const createGroupChat = useCallback(async (title: string, type: ChatType, memberIds: string[], bio?: string) => {
    try {
      const chat = await apiClient.createGroupChat(
        currentUser.id,
        title,
        type === 'channel' ? 'channel' : 'group',
        memberIds,
        bio
      );

      const newChatObj: Chat = {
        id: chat.id,
        title: chat.title,
        avatar: chat.avatar,
        type: chat.type,
        unreadCount: 0,
        categories: ['all', type === 'channel' ? 'channels' : 'groups'],
        memberCount: (memberIds.length || 0) + 1,
        bio: chat.bio,
      };

      setChats(prev => [newChatObj, ...prev]);
      selectChat(chat.id);
    } catch {
      // Local fallback
      const id = `chat_grp_${Date.now()}`;
      const newChatObj: Chat = {
        id,
        title,
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
        type: type === 'channel' ? 'channel' : 'group',
        unreadCount: 0,
        categories: ['all', type === 'channel' ? 'channels' : 'groups'],
        memberCount: memberIds.length + 1,
        bio,
      };
      setChats(prev => [newChatObj, ...prev]);
      selectChat(id);
    }
  }, [currentUser.id, selectChat]);

  // Send Message
  const sendMessage = useCallback(async (content: string, type: Message['type'] = 'text', extra?: Partial<Message>) => {
    if (!content.trim() && type === 'text') return;

    const tempId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: Message = {
      id: tempId,
      chatId: activeChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      isOutgoing: true,
      type,
      replyTo: replyMessage ? {
        id: replyMessage.id,
        senderName: replyMessage.senderName,
        text: replyMessage.content.slice(0, 50),
      } : undefined,
      ...extra,
    };

    soundEngine.playSent();

    // Optimistic local update
    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    setReplyMessage(null);

    // Send to backend for live broadcast to other participants
    try {
      await apiClient.sendMessage(activeChatId, {
        senderId: currentUser.id,
        content,
        type,
        mediaUrl: extra?.mediaUrl,
        mediaName: extra?.mediaName,
        mediaSize: extra?.mediaSize,
        duration: extra?.duration,
        waveform: extra?.waveform,
        replyTo: newMsg.replyTo,
      });
    } catch {
      // Already rendered optimistically
    }

    // Assistant special response if active chat is shen-zero
    if (activeChatId === 'shen-zero-assistant') {
      setTimeout(() => {
        let assistantReply = `پیام شما دریافت شد: «${content}».\nمن ®️SHΞN™ᴢᴇʀᴏ هستم و در تمامی بخش‌های TELESHΞN™ در کنار شما خواهم بود.`;
        const lower = content.toLowerCase();

        if (lower.includes('سلام') || lower.includes('درود') || lower.includes('hi') || lower.includes('hello')) {
          assistantReply = `درود بر شما ${currentUser.name}! خوش آمدید به TELESHΞN™. آماده‌ام تا به سوالات شما پاسخ دهم یا شما را به سایر کاربران متصل کنم.`;
        } else if (lower.includes('پشتیبانی') || lower.includes('support') || lower.includes('شروین')) {
          assistantReply = 'برای مکاتبه با شروین، کافیست به چت «SHΞЯVIN™ Support» (@shervini) پیام بفرستید.';
        } else if (lower.includes('کاربر') || lower.includes('user') || lower.includes('لیست')) {
          assistantReply = 'از دکمه «کاربران فعال» در منوی کشویی سایدبار می‌توانید لیست همه کاربران ثبت‌نام شده را ببینید و با هر کسی چت مستقیم را شروع کنید.';
        }

        const botMsg: Message = {
          id: `msg_sz_${Date.now()}`,
          chatId: 'shen-zero-assistant',
          senderId: 'shen_zero_bot',
          senderName: '®️SHΞN™ᴢᴇʀᴏ',
          content: assistantReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          isOutgoing: false,
          type: 'text',
        };

        setMessages(prev => ({
          ...prev,
          'shen-zero-assistant': [...(prev['shen-zero-assistant'] || []), botMsg],
        }));
        soundEngine.playReceive();
      }, 900);
    }
  }, [activeChatId, currentUser, replyMessage]);

  const sendVoiceNote = useCallback((durationSeconds: number, waveform: number[]) => {
    sendMessage('Voice message', 'voice', {
      duration: durationSeconds,
      waveform: waveform.length ? waveform : [30, 45, 60, 80, 50, 70, 90, 65, 40, 85, 95, 60, 45, 75, 55, 30, 65, 45, 30, 50],
    });
  }, [sendMessage]);

  const sendSticker = useCallback((sticker: Sticker) => {
    sendMessage(sticker.emoji, 'sticker', {
      mediaUrl: sticker.url,
      mediaName: sticker.packName,
    });
    setIsStickerPickerOpen(false);
  }, [sendMessage]);

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => {
      const chatMsgs = prev[activeChatId] || [];
      const updated = chatMsgs.map(msg => {
        if (msg.id !== messageId) return msg;

        const currentReactions = msg.reactions || [];
        const existing = currentReactions.find(r => r.emoji === emoji);

        let nextReactions;
        if (existing) {
          if (existing.hasReacted) {
            nextReactions = currentReactions
              .map(r => r.emoji === emoji ? { ...r, count: r.count - 1, hasReacted: false } : r)
              .filter(r => r.count > 0);
          } else {
            nextReactions = currentReactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true } : r);
          }
        } else {
          nextReactions = [...currentReactions, { emoji, count: 1, hasReacted: true }];
        }

        return { ...msg, reactions: nextReactions };
      });

      return { ...prev, [activeChatId]: updated };
    });

    // Notify backend
    apiClient.toggleReaction(activeChatId, messageId, currentUser.id, emoji);
  }, [activeChatId, currentUser.id]);

  const pinMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const chatMsgs = prev[activeChatId] || [];
      return {
        ...prev,
        [activeChatId]: chatMsgs.map(m => ({ ...m, isPinned: m.id === message.id })),
      };
    });
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, pinnedMessage: message } : c));
  }, [activeChatId]);

  const unpinMessage = useCallback(() => {
    setMessages(prev => {
      const chatMsgs = prev[activeChatId] || [];
      return {
        ...prev,
        [activeChatId]: chatMsgs.map(m => ({ ...m, isPinned: false })),
      };
    });
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, pinnedMessage: undefined } : c));
  }, [activeChatId]);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => {
      const chatMsgs = prev[activeChatId] || [];
      return { ...prev, [activeChatId]: chatMsgs.filter(m => m.id !== messageId) };
    });
  }, [activeChatId]);

  const toggleMute = useCallback((chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isMuted: !c.isMuted } : c));
  }, []);

  const startCall = useCallback((chat: Chat) => {
    setCallState({
      isActive: true,
      chat,
      status: 'calling',
      duration: 0,
      isMuted: false,
      isVideoEnabled: false,
      isSpeakerOn: true,
    });

    setTimeout(() => {
      setCallState(prev => prev.isActive ? { ...prev, status: 'connected' } : prev);
    }, 2000);
  }, []);

  const endCall = useCallback(() => {
    setCallState(prev => ({ ...prev, status: 'ended' }));
    setTimeout(() => {
      setCallState({
        isActive: false,
        chat: null,
        status: 'calling',
        duration: 0,
        isMuted: false,
        isVideoEnabled: false,
        isSpeakerOn: true,
      });
    }, 400);
  }, []);

  const updateProfile = useCallback((updated: Partial<CurrentUser>) => {
    setCurrentUser(prev => ({ ...prev, ...updated }));
  }, []);

  return {
    connectionState,
    currentUser,
    registeredUsers,
    chats,
    activeChat,
    activeChatId,
    activeMessages,
    activeFolder,
    searchQuery,
    theme,
    isAuthModalOpen,
    isUserDirectoryOpen,
    isDrawerOpen,
    isSettingsOpen,
    isChatInfoOpen,
    isStickerPickerOpen,
    isNewChatModalOpen,
    replyMessage,
    callState,
    setSearchQuery,
    setActiveFolder,
    setTheme,
    setIsAuthModalOpen,
    setIsUserDirectoryOpen,
    setIsDrawerOpen,
    setIsSettingsOpen,
    setIsChatInfoOpen,
    setIsStickerPickerOpen,
    setIsNewChatModalOpen,
    setReplyMessage,
    setCallState,
    selectChat,
    login,
    startDirectChat,
    createGroupChat,
    sendMessage,
    sendVoiceNote,
    sendSticker,
    toggleReaction,
    pinMessage,
    unpinMessage,
    deleteMessage,
    toggleMute,
    startCall,
    endCall,
    updateProfile,
  };
}
