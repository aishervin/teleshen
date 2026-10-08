-- TELESHΞN™ Cloudflare D1 Database Schema
-- Run with: wrangler d1 execute teleshen-db --file=./src/worker/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  avatar TEXT,
  type TEXT NOT NULL, -- 'user', 'group', 'channel', 'bot'
  created_by TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_members (
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  media_url TEXT,
  media_name TEXT,
  media_size TEXT,
  duration INTEGER,
  waveform TEXT,
  reply_to TEXT,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Support and Assistant
INSERT OR IGNORE INTO users (id, username, name, avatar, bio) 
VALUES 
  ('user_shervini', 'shervini', 'SHΞЯVIN™ Support', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Official Support & Creator @ TELESHΞN™'),
  ('bot_shen_zero', 'shen_zero_bot', '®️SHΞN™ᴢᴇʀᴏ', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80', 'Official AI Assistant for TELESHΞN™');
