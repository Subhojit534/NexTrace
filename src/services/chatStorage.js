/**
 * NexTrace Chat History Storage Service (Google Gemini Style)
 * Supports:
 * 1. User-isolated local caching (different Google accounts NEVER share chats).
 * 2. Cross-device cloud sync via Supabase (syncs conversations seamlessly across Phone, Tablet, Laptop).
 */

import { supabase, isSupabaseConfigured } from './supabase';

export function getStorageKey(userId) {
  const safeId = userId || 'guest';
  return `nextrace_chat_sessions_${safeId}`;
}

export function getActiveSessionKey(userId) {
  const safeId = userId || 'guest';
  return `nextrace_active_session_id_${safeId}`;
}

export function generateSessionId() {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

export function loadSessions(userId) {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load chat sessions from localStorage:', err);
    return [];
  }
}

export function saveSessions(sessions, userId) {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to save chat sessions to localStorage:', err);
  }
}

export function getActiveSessionId(userId) {
  const key = getActiveSessionKey(userId);
  return localStorage.getItem(key) || null;
}

export function setActiveSessionId(id, userId) {
  const key = getActiveSessionKey(userId);
  if (id) {
    localStorage.setItem(key, id);
  } else {
    localStorage.removeItem(key);
  }
}

export function createNewSession(initialTitle = 'New Chat') {
  return {
    id: generateSessionId(),
    title: initialTitle,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    uploadedFile: null,
    presetId: 'fintech_enterprise',
  };
}

export function deriveChatTitle(firstMessage) {
  if (!firstMessage) return 'New Chat';
  const clean = firstMessage.trim().replace(/^###?\s+/, '').replace(/[\r\n]+/g, ' ');
  if (clean.length <= 32) return clean;
  return clean.substring(0, 30).trim() + '...';
}

/**
 * Cloud Sync: Fetch conversations from Supabase across Phone, Tablet, and Laptop
 */
export async function syncCloudSessions(userId) {
  if (!isSupabaseConfigured || !supabase || !userId || userId === 'guest') {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet, warn gracefully without crashing
      console.warn('Supabase cloud chat fetch note:', error.message);
      return null;
    }

    if (data && Array.isArray(data)) {
      const mapped = data.map((item) => ({
        id: item.id,
        title: item.title || 'Untitled Chat',
        createdAt: Number(item.created_at) || Date.now(),
        updatedAt: Number(item.updated_at) || Date.now(),
        messages: item.messages || [],
        uploadedFile: item.uploaded_file || null,
        presetId: item.preset_id || 'fintech_enterprise',
      }));

      // Cache locally for instant offline display
      saveSessions(mapped, userId);
      return mapped;
    }
  } catch (err) {
    console.warn('Cloud session fetch exception:', err);
  }

  return null;
}

/**
 * Cloud Sync: Save or update a session in Supabase for cross-device persistence
 */
export async function saveSessionToCloud(session, userId) {
  if (!isSupabaseConfigured || !supabase || !userId || userId === 'guest' || !session) {
    return;
  }

  try {
    const payload = {
      id: session.id,
      user_id: userId,
      title: session.title || 'Untitled Chat',
      messages: session.messages || [],
      uploaded_file: session.uploadedFile || null,
      preset_id: session.presetId || 'fintech_enterprise',
      updated_at: session.updatedAt || Date.now(),
      created_at: session.createdAt || Date.now(),
    };

    const { error } = await supabase.from('user_chats').upsert(payload);
    if (error) {
      console.warn('Supabase cloud save note:', error.message);
    }
  } catch (err) {
    console.warn('Cloud session save exception:', err);
  }
}

/**
 * Cloud Sync: Delete a session from Supabase
 */
export async function deleteSessionFromCloud(sessionId, userId) {
  if (!isSupabaseConfigured || !supabase || !userId || userId === 'guest' || !sessionId) {
    return;
  }

  try {
    const { error } = await supabase
      .from('user_chats')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase cloud delete note:', error.message);
    }
  } catch (err) {
    console.warn('Cloud session delete exception:', err);
  }
}
