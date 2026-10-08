/**
 * TELESHΞN™ Cloudflare Worker Edge API
 * Handles authentication, D1 queries, and R2 uploads
 */

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<{ results: T[] }>;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface R2Bucket {
  put(key: string, value: unknown): Promise<unknown>;
  get(key: string): Promise<unknown>;
}

export interface Env {
  DB: D1Database;
  BUCKET?: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Get All Users
    if (url.pathname === '/api/users' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT id, username, name, avatar, bio FROM users').all();
      return Response.json({ users: results }, { headers: corsHeaders });
    }

    // 2. Auth Login / Register
    if (url.pathname === '/api/auth/login' && method === 'POST') {
      const body = await request.json() as { username: string; name?: string; avatar?: string; bio?: string };
      const username = body.username.trim().toLowerCase().replace(/^@/, '');
      
      let user = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

      if (!user) {
        const id = `user_${Date.now()}`;
        const name = body.name || username;
        const avatar = body.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
        const bio = body.bio || 'TELESHΞN™ Member';
        
        await env.DB.prepare(
          'INSERT INTO users (id, username, name, avatar, bio) VALUES (?, ?, ?, ?, ?)'
        ).bind(id, username, name, avatar, bio).run();

        user = { id, username, name, avatar, bio };
      }

      return Response.json({ user }, { headers: corsHeaders });
    }

    // 3. Get Messages for Chat
    if (url.pathname.startsWith('/api/chats/') && url.pathname.endsWith('/messages') && method === 'GET') {
      const parts = url.pathname.split('/');
      const chatId = parts[3];
      const { results } = await env.DB.prepare(
        'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC'
      ).bind(chatId).all();
      return Response.json({ messages: results }, { headers: corsHeaders });
    }

    // 4. Send Message
    if (url.pathname.startsWith('/api/chats/') && url.pathname.endsWith('/messages') && method === 'POST') {
      const parts = url.pathname.split('/');
      const chatId = parts[3];
      const body = await request.json() as {
        senderId: string;
        content: string;
        type?: string;
        mediaUrl?: string;
        mediaName?: string;
        mediaSize?: string;
        duration?: number;
      };

      const sender = await env.DB.prepare('SELECT name, avatar FROM users WHERE id = ?').bind(body.senderId).first() as { name: string; avatar: string } | null;
      const id = `msg_${Date.now()}`;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await env.DB.prepare(`
        INSERT INTO messages (id, chat_id, sender_id, sender_name, sender_avatar, content, type, media_url, media_name, media_size, duration, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        chatId,
        body.senderId,
        sender?.name || 'User',
        sender?.avatar || null,
        body.content,
        body.type || 'text',
        body.mediaUrl || null,
        body.mediaName || null,
        body.mediaSize || null,
        body.duration || null,
        timestamp
      ).run();

      return Response.json({
        message: {
          id,
          chatId,
          senderId: body.senderId,
          senderName: sender?.name || 'User',
          senderAvatar: sender?.avatar,
          content: body.content,
          type: body.type || 'text',
          timestamp,
        }
      }, { headers: corsHeaders });
    }

    return new Response('TELESHΞN™ Cloudflare Edge API', { headers: corsHeaders });
  }
};
