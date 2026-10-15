/**
 * NexTrace Chat History Storage Service (Google Gemini Style)
 * Persists multiple chat sessions in localStorage with auto-titling and timestamp tracking.
 */

const STORAGE_KEY = 'nextrace_chat_sessions';
const ACTIVE_SESSION_KEY = 'nextrace_active_session_id';

export function generateSessionId() {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load chat sessions from localStorage:', err);
    return [];
  }
}

export function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to save chat sessions to localStorage:', err);
  }
}

export function getActiveSessionId() {
  return localStorage.getItem(ACTIVE_SESSION_KEY) || null;
}

export function setActiveSessionId(id) {
  if (id) {
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
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
