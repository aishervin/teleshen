import { Chat, CurrentUser, Message, Sticker } from '../types/telegram';

export const CURRENT_USER: CurrentUser = {
  id: 'user_shervin',
  name: 'TELESHΞN™ owner',
  handle: '@shervin',
  bio: '👑 Founder & Lead Operator @ TELESHΞN™',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isPremium: true,
  email: 'shervin00325@gmail.com',
  role: 'owner',
  isOwner: true,
};

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'teleshen-announcements',
    title: 'TELESHΞN™ Official',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    username: 'teleshen_news',
    type: 'channel',
    creatorId: 'user_shervin',
    adminIds: ['user_shervin'],
    isVerified: true,
    unreadCount: 1,
    categories: ['all', 'channels'],
    isPinned: true,
    bio: '📢 کانال رسمی اخبار، رویدادها و آپدیت‌های TELESHΞN™ (فقط مدیران امکان ارسال دارند)',
  },
  {
    id: 'teleshen-community',
    title: 'TELESHΞN™ Community',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    username: 'teleshen_group',
    type: 'group',
    creatorId: 'user_shervin',
    memberCount: 42,
    unreadCount: 0,
    categories: ['all', 'groups'],
    bio: '👥 گروه گفتگوی عمومی و تبادل نظر کاربران TELESHΞN™',
  },
  {
    id: 'shen-zero-assistant',
    title: '®️SHΞN™ᴢᴇʀᴏ',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    username: 'shen_zero_bot',
    type: 'bot',
    isVerified: true,
    isOnline: true,
    unreadCount: 0,
    categories: ['all', 'bots'],
    bio: 'دستیار هوشمند رسمی TELESHΞN™',
  },
  {
    id: 'saved-messages',
    title: 'Saved Messages',
    avatar: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=150&auto=format&fit=crop&q=80',
    type: 'saved',
    unreadCount: 0,
    categories: ['all', 'personal'],
    bio: 'پیام‌های ذخیره‌شده و فضای ابری شما',
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  'shen-zero-assistant': [
    {
      id: 'msg_sz_1',
      chatId: 'shen-zero-assistant',
      senderId: 'shen_zero_bot',
      senderName: '®️SHΞN™ᴢᴇʀᴏ',
      content: 'سلام شروین عزیز! من دستیار اختصاصی شما ®️SHΞN™ᴢᴇʀᴏ هستم.\n\nآماده پاسخگویی، انجام درخواست‌ها و مدیریت کارهای شما در محیط TELESHΞN™ می‌باشم. هر سوال یا دستوری دارید بفرمایید.',
      timestamp: '09:00',
      status: 'read',
      isOutgoing: false,
      type: 'text',
      reactions: [
        { emoji: '🔥', count: 1, hasReacted: true },
      ],
    },
  ],

  'shervini-support': [
    {
      id: 'msg_sh_1',
      chatId: 'shervini-support',
      senderId: 'shervini',
      senderName: 'SHΞЯVIN™ Support',
      content: 'درود! به بخش پشتیبانی رسمی TELESHΞN™ خوش آمدید. پیام شما مستقیماً توسط @shervini بررسی می‌شود.',
      timestamp: '10:15',
      status: 'read',
      isOutgoing: false,
      type: 'text',
    },
  ],

  'saved-messages': [
    {
      id: 'msg_sv_1',
      chatId: 'saved-messages',
      senderId: 'user_shervin',
      senderName: 'SHΞЯVIN™',
      content: 'یادداشت‌های شخصی و کدهای ذخیره شده در فضای ابری TELESHΞN™',
      timestamp: 'Yesterday',
      status: 'read',
      isOutgoing: true,
      type: 'text',
    },
  ],
};

export const STICKERS: Sticker[] = [
  { id: 'st_1', emoji: '🚀', packName: 'TELESHΞN™ Pack', url: 'https://images.unsplash.com/photo-1517976487502-5f65f3bc8571?w=120&auto=format&fit=crop&q=80' },
  { id: 'st_2', emoji: '🔥', packName: 'TELESHΞN™ Pack', url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=120&auto=format&fit=crop&q=80' },
  { id: 'st_3', emoji: '💻', packName: 'TELESHΞN™ Pack', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&auto=format&fit=crop&q=80' },
  { id: 'st_4', emoji: '⚡', packName: 'TELESHΞN™ Pack', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=120&auto=format&fit=crop&q=80' },
  { id: 'st_5', emoji: '✨', packName: 'TELESHΞN™ Pack', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120&auto=format&fit=crop&q=80' },
  { id: 'st_6', emoji: '🎉', packName: 'TELESHΞN™ Pack', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=120&auto=format&fit=crop&q=80' },
];
