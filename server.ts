import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent store file path for local/server data
const DATA_FILE = path.join(__dirname, '.teleshen_store.json');

interface UserRecord {
  id: string;
  username: string; // e.g. shervini
  name: string;
  avatar: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

interface ChatRecord {
  id: string;
  title: string;
  avatar: string;
  type: 'user' | 'group' | 'channel' | 'bot' | 'saved';
  memberIds: string[];
  createdBy: string;
  isPinned?: boolean;
  pinnedMessageId?: string;
  unreadCount?: number;
  bio?: string;
}

interface MessageRecord {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'voice' | 'photo' | 'document' | 'code' | 'sticker' | 'service';
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  duration?: number;
  waveform?: number[];
  reactions?: { emoji: string; count: number; users: string[] }[];
  replyTo?: { id: string; senderName: string; text: string };
  isOutgoing?: boolean;
}

interface StoreState {
  users: Record<string, UserRecord>;
  chats: Record<string, ChatRecord>;
  messages: Record<string, MessageRecord[]>;
}

// Initial seed data with official support @shervini and resident assistant ®️SHΞN™ᴢᴇʀᴏ
function getInitialStore(): StoreState {
  return {
    users: {
      'user_shervini': {
        id: 'user_shervini',
        username: 'shervini',
        name: 'SHΞЯVIN™ Support',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'Official Support & Creator @ TELESHΞN™',
        isOnline: true,
        lastSeen: 'online',
        createdAt: new Date().toISOString(),
      },
      'bot_shen_zero': {
        id: 'bot_shen_zero',
        username: 'shen_zero_bot',
        name: '®️SHΞN™ᴢᴇʀᴏ',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        bio: 'Resident AI Assistant for TELESHΞN™',
        isOnline: true,
        lastSeen: 'online',
        createdAt: new Date().toISOString(),
      },
    },
    chats: {
      'chat_assistant': {
        id: 'chat_assistant',
        title: '®️SHΞN™ᴢᴇʀᴏ',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        type: 'bot',
        memberIds: ['bot_shen_zero'],
        createdBy: 'system',
        isPinned: true,
        bio: 'دستیار رسمی و هوشمند مستقر در سامانه TELESHΞN™',
      },
      'chat_support': {
        id: 'chat_support',
        title: 'SHΞЯVIN™ Support',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        type: 'user',
        memberIds: ['user_shervini'],
        createdBy: 'system',
        isPinned: true,
        bio: 'پشتیبانی رسمی TELESHΞN™ | ارتباط مستقیم با شروین (@shervini)',
      },
    },
    messages: {
      'chat_assistant': [
        {
          id: 'msg_welcome_sz',
          chatId: 'chat_assistant',
          senderId: 'bot_shen_zero',
          senderName: '®️SHΞN™ᴢᴇʀᴏ',
          senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          content: 'درود! من دستیار اختصاصی ®️SHΞN™ᴢᴇʀᴏ هستم. اکانت شما روی سامانه ابری TELESHΞN™ فعال است و می‌توانید با سایر کاربران به طور زنده چت کنید.',
          timestamp: '10:00',
          status: 'read',
          type: 'text',
          reactions: [{ emoji: '🔥', count: 1, users: ['bot_shen_zero'] }],
        },
      ],
      'chat_support': [
        {
          id: 'msg_welcome_supp',
          chatId: 'chat_support',
          senderId: 'user_shervini',
          senderName: 'SHΞЯVIN™ Support',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          content: 'سلام! به بخش پشتیبانی مستقیم TELESHΞN™ خوش آمدید. هر سوال یا پیشنهادی دارید در اینجا با @shervini در میان بگذارید.',
          timestamp: '10:05',
          status: 'read',
          type: 'text',
        },
      ],
    },
  };
}

let store: StoreState = getInitialStore();

// Load persistent data if exists
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    store = JSON.parse(raw);
  }
} catch {
  // Use memory fallback
}

function persistStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch {
    // ignore
  }
}

// Server-Sent Events subscribers for real-time live push
const sseClients = new Set<Response>();

function broadcastSSE(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// ================= API ROUTES =================

// Real-Time SSE Stream Endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 1. Register or Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, name, avatar, bio } = req.body;
  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
  
  // Find existing
  let user = Object.values(store.users).find(u => u.username.toLowerCase() === cleanUsername);

  if (!user) {
    // Create new user record
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    user = {
      id,
      username: cleanUsername,
      name: name?.trim() || cleanUsername,
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      bio: bio?.trim() || 'TELESHΞN™ User',
      isOnline: true,
      lastSeen: 'online',
      createdAt: new Date().toISOString(),
    };
    store.users[id] = user;
    persistStore();

    broadcastSSE('user_joined', user);
  } else {
    user.isOnline = true;
    user.lastSeen = 'online';
    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;
    if (bio) user.bio = bio.trim();
    persistStore();
  }

  res.json({ user });
});

// 2. Get All Users (Directory)
app.get('/api/users', (req: Request, res: Response) => {
  const usersList = Object.values(store.users).map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    avatar: u.avatar,
    bio: u.bio,
    isOnline: u.isOnline,
    lastSeen: u.lastSeen,
  }));
  res.json({ users: usersList });
});

// 3. Get Chats for a User
app.get('/api/chats', (req: Request, res: Response) => {
  const currentUserId = req.query.userId as string;
  if (!currentUserId) {
    res.json({ chats: Object.values(store.chats) });
    return;
  }

  // Find all chats where user is member or is a global/bot chat
  const chatsList = Object.values(store.chats).filter(c => {
    return c.type === 'bot' || c.memberIds.includes(currentUserId) || c.type === 'channel';
  });

  res.json({ chats: chatsList });
});

// 4. Create or Get 1-on-1 Direct Chat
app.post('/api/chats/direct', (req: Request, res: Response) => {
  const { currentUserId, targetUsername } = req.body;
  if (!currentUserId || !targetUsername) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }

  const cleanTarget = targetUsername.toLowerCase().replace(/^@/, '');
  const targetUser = Object.values(store.users).find(u => u.username.toLowerCase() === cleanTarget);

  if (!targetUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Look for existing direct chat between these two users
  let chat = Object.values(store.chats).find(c => 
    c.type === 'user' && 
    c.memberIds.includes(currentUserId) && 
    c.memberIds.includes(targetUser.id)
  );

  if (!chat) {
    const chatId = `chat_dir_${Date.now()}`;
    chat = {
      id: chatId,
      title: targetUser.name,
      avatar: targetUser.avatar,
      type: 'user',
      memberIds: [currentUserId, targetUser.id],
      createdBy: currentUserId,
      bio: targetUser.bio,
    };
    store.chats[chatId] = chat;
    store.messages[chatId] = [];
    persistStore();
    broadcastSSE('chat_created', chat);
  }

  res.json({ chat });
});

// 5. Create Group or Channel
app.post('/api/chats/group', (req: Request, res: Response) => {
  const { currentUserId, title, type, avatar, bio, memberIds } = req.body;
  if (!title || !currentUserId) {
    res.status(400).json({ error: 'Title and creator are required' });
    return;
  }

  const chatId = `chat_grp_${Date.now()}`;
  const allMembers = Array.from(new Set([currentUserId, ...(memberIds || [])]));

  const chat: ChatRecord = {
    id: chatId,
    title: title.trim(),
    avatar: avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    type: type === 'channel' ? 'channel' : 'group',
    memberIds: allMembers,
    createdBy: currentUserId,
    bio: bio?.trim(),
  };

  store.chats[chatId] = chat;
  store.messages[chatId] = [
    {
      id: `msg_init_${Date.now()}`,
      chatId,
      senderId: currentUserId,
      senderName: store.users[currentUserId]?.name || 'Creator',
      content: `${chat.title} created`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
      type: 'service',
    }
  ];

  persistStore();
  broadcastSSE('chat_created', chat);

  res.json({ chat });
});

// 6. Get Chat Messages
app.get('/api/chats/:id/messages', (req: Request, res: Response) => {
  const chatId = req.params.id;
  const messages = store.messages[chatId] || [];
  res.json({ messages });
});

// 7. Send Message
app.post('/api/chats/:id/messages', (req: Request, res: Response) => {
  const chatId = req.params.id;
  const { senderId, content, type = 'text', mediaUrl, mediaName, mediaSize, duration, waveform, replyTo } = req.body;

  if (!content && type === 'text') {
    res.status(400).json({ error: 'Content required' });
    return;
  }

  const sender = store.users[senderId];
  const newMsg: MessageRecord = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    chatId,
    senderId,
    senderName: sender?.name || 'User',
    senderAvatar: sender?.avatar,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'delivered',
    type,
    mediaUrl,
    mediaName,
    mediaSize,
    duration,
    waveform,
    replyTo,
    reactions: [],
  };

  if (!store.messages[chatId]) {
    store.messages[chatId] = [];
  }
  store.messages[chatId].push(newMsg);
  persistStore();

  broadcastSSE('new_message', newMsg);

  // If this chat is the AI Assistant (bot_shen_zero), automatically generate smart assistant response!
  if (chatId === 'chat_assistant') {
    setTimeout(() => {
      let botContent = 'پیام شما دریافت شد. من دستیار هوشمند ®️SHΞN™ᴢᴇʀᴏ هستم.';
      const lower = content.toLowerCase();

      if (lower.includes('سلام') || lower.includes('درود') || lower.includes('hi') || lower.includes('hello')) {
        botContent = `درود بر شما ${sender?.name || ''}! خوشحالم که در سامانه پیام‌رسان TELESHΞN™ در کنارتان هستم. چطور می‌توانم به شما کمک کنم؟`;
      } else if (lower.includes('شروین') || lower.includes('پشتیبانی') || lower.includes('support')) {
        botContent = 'برای ارتباط با پشتیبانی، کافیست به چت «SHΞЯVIN™ Support» (@shervini) پیام ارسال فرمایید.';
      } else if (lower.includes('کاربر') || lower.includes('چت') || lower.includes('گروه')) {
        botContent = 'شما می‌توانید از دکمه «+» در پایین سایدبار برای ساخت گروه و کانال جدید استفاده کنید، یا در کادر جستجو آیدی هر کاربری را سرچ نمایید.';
      }

      const botReply: MessageRecord = {
        id: `msg_sz_${Date.now()}`,
        chatId: 'chat_assistant',
        senderId: 'bot_shen_zero',
        senderName: '®️SHΞN™ᴢᴇʀᴏ',
        senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        content: botContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        type: 'text',
      };

      store.messages['chat_assistant'].push(botReply);
      persistStore();
      broadcastSSE('new_message', botReply);
    }, 800);
  }

  res.json({ message: newMsg });
});

// 8. Toggle Reaction
app.post('/api/chats/:id/reactions', (req: Request, res: Response) => {
  const chatId = req.params.id;
  const { messageId, userId, emoji } = req.body;

  const chatMsgs = store.messages[chatId] || [];
  const msg = chatMsgs.find(m => m.id === messageId);
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  msg.reactions = msg.reactions || [];
  const existing = msg.reactions.find(r => r.emoji === emoji);

  if (existing) {
    if (existing.users.includes(userId)) {
      existing.users = existing.users.filter(u => u !== userId);
      existing.count = existing.users.length;
    } else {
      existing.users.push(userId);
      existing.count = existing.users.length;
    }
  } else {
    msg.reactions.push({ emoji, count: 1, users: [userId] });
  }

  msg.reactions = msg.reactions.filter(r => r.count > 0);
  persistStore();

  broadcastSSE('reaction_updated', { chatId, messageId, reactions: msg.reactions });
  res.json({ reactions: msg.reactions });
});

// ================= VITE DEV / STATIC SERVING =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TELESHΞN™] Full-Stack Edge Messenger running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
