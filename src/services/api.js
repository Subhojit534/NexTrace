/**
 * NexTrace API Service
 * Handles communication with backend serverless API on Vercel or local host.
 * Automatically injects FalkorDB confidential connection info and LLM API keys from localStorage.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function getStoredSettings() {
  try {
    const raw = localStorage.getItem('nextrace_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse settings:', e);
  }
  return {
    groqApiKey: '',
    geminiApiKey: '',
    openaiApiKey: '',
    falkordbHost: '',
    falkordbPort: 6379,
    falkordbUsername: '',
    falkordbPassword: '',
    falkordbSsl: false,
    selectedModel: 'llama-3.3-70b-versatile',
  };
}

export function saveStoredSettings(settings) {
  try {
    localStorage.setItem('nextrace_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem('nextrace_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      sessionStorage.setItem('nextrace_session_id', sid);
    }
    return sid;
  } catch (e) {
    return 'default_session';
  }
}

function buildHeaders() {
  const settings = getStoredSettings();
  const headers = {
    'Content-Type': 'application/json',
    'X-Session-ID': getOrCreateSessionId(),
  };

  if (settings.groqApiKey) headers['X-Groq-API-Key'] = settings.groqApiKey;
  if (settings.geminiApiKey) headers['X-Gemini-API-Key'] = settings.geminiApiKey;
  if (settings.openaiApiKey) headers['X-OpenAI-API-Key'] = settings.openaiApiKey;
  if (settings.falkordbHost) headers['X-FalkorDB-Host'] = settings.falkordbHost;
  if (settings.falkordbPort) headers['X-FalkorDB-Port'] = String(settings.falkordbPort);
  if (settings.falkordbUsername) headers['X-FalkorDB-Username'] = settings.falkordbUsername;
  if (settings.falkordbPassword) headers['X-FalkorDB-Password'] = settings.falkordbPassword;
  if (settings.falkordbSsl) headers['X-FalkorDB-SSL'] = 'true';

  return headers;
}

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/api/health`, {
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchModels() {
  const res = await fetch(`${BASE_URL}/api/models`, {
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error(`Fetch models failed: ${res.statusText}`);
  return res.json();
}

export async function fetchPresets() {
  const res = await fetch(`${BASE_URL}/api/presets`, {
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error(`Fetch presets failed: ${res.statusText}`);
  return res.json();
}

export async function fetchPresetDetail(presetId) {
  const res = await fetch(`${BASE_URL}/api/presets/${presetId}`, {
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error(`Fetch preset detail failed: ${res.statusText}`);
  return res.json();
}

export async function testConnection(config) {
  const res = await fetch(`${BASE_URL}/api/test-connection`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(`Connection test failed: ${res.statusText}`);
  return res.json();
}

export async function seedGraph({ presetId, nodes, relationships, rawGraph, force = true }) {
  const settings = getStoredSettings();
  const payload = {
    preset_id: presetId,
    nodes,
    relationships,
    raw_graph: rawGraph,
    force,
    falkordb: {
      host: settings.falkordbHost || undefined,
      port: settings.falkordbPort ? Number(settings.falkordbPort) : 6379,
      username: settings.falkordbUsername || undefined,
      password: settings.falkordbPassword || undefined,
      ssl: Boolean(settings.falkordbSsl),
    },
  };

  const res = await fetch(`${BASE_URL}/api/seed`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Seeding graph failed: ${res.statusText}`);
  return res.json();
}

export async function sendChatMessage({
  message,
  history = [],
  presetId,
  nodes,
  relationships,
  rawGraph,
  targetService,
  cveId,
  model,
}) {
  const settings = getStoredSettings();
  const payload = {
    message,
    history,
    preset_id: presetId,
    nodes,
    relationships,
    raw_graph: rawGraph,
    target_service: targetService,
    cve_id: cveId,
    model: model || settings.selectedModel || 'llama-3.3-70b-versatile',
    groq_api_key: settings.groqApiKey || undefined,
    gemini_api_key: settings.geminiApiKey || undefined,
    openai_api_key: settings.openaiApiKey || undefined,
    falkordb: {
      host: settings.falkordbHost || undefined,
      port: settings.falkordbPort ? Number(settings.falkordbPort) : 6379,
      username: settings.falkordbUsername || undefined,
      password: settings.falkordbPassword || undefined,
      ssl: Boolean(settings.falkordbSsl),
    },
  };

  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Chat error (${res.status}): ${errText}`);
  }
  return res.json();
}

export async function runInvestigation({
  alertText,
  targetService,
  cveId,
  maxHops = 4,
  presetId,
  nodes,
  relationships,
  rawGraph,
  model,
}) {
  const settings = getStoredSettings();
  const payload = {
    alert_text: alertText,
    target_service: targetService,
    cve_id: cveId,
    max_hops: maxHops,
    preset_id: presetId,
    nodes,
    relationships,
    raw_graph: rawGraph,
    model: model || settings.selectedModel || 'llama-3.3-70b-versatile',
    groq_api_key: settings.groqApiKey || undefined,
    gemini_api_key: settings.geminiApiKey || undefined,
    openai_api_key: settings.openaiApiKey || undefined,
    falkordb: {
      host: settings.falkordbHost || undefined,
      port: settings.falkordbPort ? Number(settings.falkordbPort) : 6379,
      username: settings.falkordbUsername || undefined,
      password: settings.falkordbPassword || undefined,
      ssl: Boolean(settings.falkordbSsl),
    },
  };

  const res = await fetch(`${BASE_URL}/api/investigate`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Investigation error (${res.status}): ${errText}`);
  }
  return res.json();
}
