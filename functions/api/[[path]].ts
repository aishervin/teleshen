// Cloudflare Pages Functions - Edge API Router for TELESHΞN™
// Runs natively on the Cloudflare Edge global network

interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

const DEFAULT_USERS: Record<string, User> = {
  'user_shervini': {
    id: 'user_shervini',
    username: 'shervini',
    name: 'SHΞЯVIN™',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Creator & Lead Engineer @ TELESHΞN™',
    isOnline: true,
    lastSeen: 'online',
    createdAt: new Date().toISOString(),
  },
  'bot_shen_zero': {
    id: 'bot_shen_zero',
    username: 'shen_zero_bot',
    name: '®️SHΞN™ᴢᴇʀᴏ',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    bio: 'دستیار رسمی و هوشمند مستقر در سامانه TELESHΞN™',
    isOnline: true,
    lastSeen: 'online',
    createdAt: new Date().toISOString(),
  },
};

interface EventContext {
  request: Request;
}

type PagesFunction = (context: EventContext) => Promise<Response>;

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 1. User Registration (Sign Up)
  if (path === '/api/auth/register' && method === 'POST') {
    try {
      const body = await request.json() as any;
      const { username, name, avatar, bio } = body;
      const cleanUsername = (username || '').trim().toLowerCase().replace(/^@/, '');

      if (!cleanUsername) {
        return new Response(JSON.stringify({ error: 'نام کاربری الزامی است.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const user: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        username: cleanUsername,
        name: (name || cleanUsername).trim(),
        avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
        bio: (bio || 'TELESHΞN™ Member').trim(),
        isOnline: true,
        lastSeen: 'online',
        createdAt: new Date().toISOString(),
      };

      return new Response(JSON.stringify({ user }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Bad Request' }), {
        status: 400,
        headers: corsHeaders,
      });
    }
  }

  // 2. User Authentication (Sign In)
  if (path === '/api/auth/login' && method === 'POST') {
    try {
      const body = await request.json() as any;
      const { username } = body;
      const cleanUsername = (username || '').trim().toLowerCase().replace(/^@/, '');

      const user: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        username: cleanUsername,
        name: cleanUsername === 'shervini' ? 'SHΞЯVIN™' : cleanUsername,
        avatar: cleanUsername === 'shervini' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
        bio: cleanUsername === 'shervini' ? 'Creator & Lead Engineer @ TELESHΞN™' : 'TELESHΞN™ Member',
        isOnline: true,
        lastSeen: 'online',
        createdAt: new Date().toISOString(),
      };

      return new Response(JSON.stringify({ user }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Bad Request' }), {
        status: 400,
        headers: corsHeaders,
      });
    }
  }

  // 3. User Directory
  if (path === '/api/users' && method === 'GET') {
    const users = Object.values(DEFAULT_USERS);
    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Fallback 404
  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: corsHeaders,
  });
};
