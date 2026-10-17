import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SettingsModal from './components/SettingsModal';
import RemediationModal from './components/RemediationModal';
import {
  checkHealth,
  fetchModels,
  fetchPresets,
  fetchPresetDetail,
  seedGraph,
  sendChatMessage,
  getStoredSettings,
} from './services/api';
import { getCurrentUser, supabase, signInWithGoogle, isSupabaseConfigured } from './services/supabase';
import {
  loadSessions,
  saveSessions,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession,
  deriveChatTitle,
  syncCloudSessions,
  saveSessionToCloud,
  deleteSessionFromCloud,
} from './services/chatStorage';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [presets, setPresets] = useState([]);
  const [activePreset, setActivePreset] = useState('fintech_enterprise');
  const [activePresetData, setActivePresetData] = useState(null);
  const [models, setModels] = useState({});
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [falkorConnected, setFalkorConnected] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Chat Sessions & History State (Google Gemini style)
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionIdState] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  // User Auth State
  const [user, setUser] = useState(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRemediationOpen, setIsRemediationOpen] = useState(false);
  const [activeRemediationBundle, setActiveRemediationBundle] = useState({});

  // 1. Initialize User & Auth Listener
  useEffect(() => {
    const initAuth = async () => {
      const u = await getCurrentUser();
      setUser(u);

      if (supabase) {
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser({
              id: 'guest',
              email: 'guest@demo.local',
              user_metadata: { full_name: 'Guest Analyst' },
              isGuest: true,
            });
          }
        });
      }
    };
    initAuth();
  }, []);

  const handleSignIn = async () => {
    if (isSupabaseConfigured) {
      await signInWithGoogle();
    } else {
      alert('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env for live Google OAuth.');
    }
  };

  // 2. Initialize Sessions Scoped Per Google Account & Sync from Cloud
  useEffect(() => {
    const initUserSessions = async () => {
      const isGuestUser = !user || user.isGuest || user.id === 'guest' || user.id === 'guest-analyst';
      if (isGuestUser) {
        // Ephemeral in-memory guest session: never load or write to localStorage
        const fresh = createNewSession('Guest Session');
        setSessions([fresh]);
        setActiveSessionIdState(fresh.id);
        setMessages([]);
        setUploadedFile(null);
        return;
      }

      const uid = user.id;
      let userSessions = loadSessions(uid);

      // If signed in with Google via Supabase, sync from cloud across devices
      const cloudSessions = await syncCloudSessions(user.id);
      if (cloudSessions && cloudSessions.length > 0) {
        userSessions = cloudSessions;
      }

      if (userSessions.length > 0) {
        setSessions(userSessions);
        const savedActiveId = getActiveSessionId(uid);
        const current = userSessions.find((s) => s.id === savedActiveId) || userSessions[0];
        setActiveSessionIdState(current.id);
        setActiveSessionId(current.id, uid);
        setMessages(current.messages || []);
        setUploadedFile(current.uploadedFile || null);
        if (current.presetId) setActivePreset(current.presetId);
      } else {
        const initial = createNewSession('New Chat');
        setSessions([initial]);
        setActiveSessionIdState(initial.id);
        setActiveSessionId(initial.id, uid);
        saveSessions([initial], uid);
        setMessages([]);
        setUploadedFile(null);
      }
    };

    initUserSessions();
  }, [user?.id]);

  // 3. Initialize Health & Graph Presets
  useEffect(() => {
    const initApp = async () => {
      // Load Settings
      const settings = getStoredSettings();
      if (settings.selectedModel) {
        setSelectedModel(settings.selectedModel);
      }

      // Health & FalkorDB Status
      try {
        const health = await checkHealth();
        setFalkorConnected(Boolean(health.falkordb_connected));
        if (health.active_preset) {
          setActivePreset(health.active_preset);
        }
      } catch (err) {
        console.warn('API health check error:', err);
      }

      // Models
      try {
        const m = await fetchModels();
        setModels(m);
      } catch (err) {
        console.warn('Fetch models error:', err);
      }

      // Presets
      try {
        const pRes = await fetchPresets();
        if (pRes.presets) {
          setPresets(pRes.presets);
          const initialPreset = pRes.presets.find((p) => p.id === 'fintech_enterprise') || pRes.presets[0];
          if (initialPreset) {
            setActivePresetData(initialPreset);
          }
        }
      } catch (err) {
        console.warn('Fetch presets error:', err);
      }
    };

    initApp();
  }, []);

  // Helper to persist current session updates to sessions state, localStorage & Supabase Cloud
  const persistSessionUpdate = (newMessages, newFile = undefined, customTitle = null) => {
    const isGuestUser = !user || user.isGuest || user.id === 'guest' || user.id === 'guest-analyst';
    const uid = user?.id || 'guest';
    setSessions((prev) => {
      let targetSession = null;
      const updated = prev.map((s) => {
        if (s.id === activeSessionId) {
          let title = s.title;
          if (customTitle) {
            title = customTitle;
          } else if ((s.title === 'New Chat' || s.title === 'Guest Session' || !s.title) && newMessages.length > 0) {
            const firstUserMsg = newMessages.find((m) => m.role === 'user');
            if (firstUserMsg) {
              title = deriveChatTitle(firstUserMsg.content);
            }
          }
          targetSession = {
            ...s,
            title,
            messages: newMessages,
            uploadedFile: newFile !== undefined ? newFile : s.uploadedFile,
            presetId: activePreset,
            updatedAt: Date.now(),
          };
          return targetSession;
        }
        return s;
      });

      if (!isGuestUser) {
        saveSessions(updated, uid);
        if (targetSession) {
          saveSessionToCloud(targetSession, user.id);
        }
      }
      return updated;
    });
  };

  // Handle Switch Session
  const handleSelectSession = (sessionId) => {
    const isGuestUser = !user || user.isGuest || user.id === 'guest' || user.id === 'guest-analyst';
    const uid = user?.id || 'guest';
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;
    setActiveSessionIdState(sessionId);
    if (!isGuestUser) {
      setActiveSessionId(sessionId, uid);
    }
    setMessages(target.messages || []);
    setUploadedFile(target.uploadedFile || null);
    if (target.presetId) setActivePreset(target.presetId);
  };

  // Handle "+ New chat" Button
  const handleNewChat = () => {
    const isGuestUser = !user || user.isGuest || user.id === 'guest' || user.id === 'guest-analyst';
    if (isGuestUser) {
      // In guest mode, chats are ephemeral: reset active session without saving to history
      const fresh = createNewSession('Guest Session');
      setSessions([fresh]);
      setActiveSessionIdState(fresh.id);
      setMessages([]);
      setUploadedFile(null);
      return;
    }

    const uid = user.id;
    const fresh = createNewSession('New Chat');
    const updated = [fresh, ...sessions];
    setSessions(updated);
    setActiveSessionIdState(fresh.id);
    setActiveSessionId(fresh.id, uid);
    saveSessions(updated, uid);
    saveSessionToCloud(fresh, user.id);
    setMessages([]);
    setUploadedFile(null);
  };

  // Handle Delete Session
  const handleDeleteSession = (sessionId) => {
    const isGuestUser = !user || user.isGuest || user.id === 'guest' || user.id === 'guest-analyst';
    if (isGuestUser) {
      const fresh = createNewSession('Guest Session');
      setSessions([fresh]);
      setActiveSessionIdState(fresh.id);
      setMessages([]);
      setUploadedFile(null);
      return;
    }

    const uid = user.id;
    const remaining = sessions.filter((s) => s.id !== sessionId);
    deleteSessionFromCloud(sessionId, user.id);

    if (remaining.length === 0) {
      const brandNew = createNewSession('New Chat');
      setSessions([brandNew]);
      setActiveSessionIdState(brandNew.id);
      setActiveSessionId(brandNew.id, uid);
      saveSessions([brandNew], uid);
      saveSessionToCloud(brandNew, user.id);
      setMessages([]);
      setUploadedFile(null);
    } else {
      setSessions(remaining);
      saveSessions(remaining, uid);
      if (activeSessionId === sessionId) {
        const next = remaining[0];
        setActiveSessionIdState(next.id);
        setActiveSessionId(next.id, uid);
        setMessages(next.messages || []);
        setUploadedFile(next.uploadedFile || null);
        if (next.presetId) setActivePreset(next.presetId);
      }
    }
  };

  // Handle Preset Selection
  const handleSelectPreset = async (presetId) => {
    setActivePreset(presetId);
    setUploadedFile(null);
    setIsLoading(true);
    try {
      const res = await seedGraph({ presetId, force: true });
      const detail = await fetchPresetDetail(presetId);
      setActivePresetData(detail);

      const sysMsg = {
        role: 'assistant',
        content: `### Switched Architecture to **${detail.name || presetId}**\n\nLoaded **${res.nodes_count} nodes** and **${res.relationships_count} relationships** into FalkorDB.\n\nYou can now run zero-day attack simulations, inspect public gateways, or trace attack paths to crown jewel stores.`,
        model_used: selectedModel,
      };

      setMessages((prev) => {
        const next = [...prev, sysMsg];
        persistSessionUpdate(next, null);
        return next;
      });
    } catch (err) {
      alert(`Failed to load preset: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Custom JSON Graph Upload
  const handleUploadJson = async (fileName, rawJson) => {
    setIsLoading(true);
    try {
      const res = await seedGraph({ rawGraph: rawJson, force: true });
      const nodesCount = res.nodes_count || rawJson.nodes?.length || 0;
      const relsCount = res.relationships_count || rawJson.relationships?.length || rawJson.edges?.length || 0;

      const fileData = {
        name: fileName,
        rawJson,
        nodes: nodesCount,
        rels: relsCount,
      };

      setUploadedFile(fileData);
      setActivePreset('custom');
      setActivePresetData({
        id: 'custom',
        name: `Custom Graph: ${fileName}`,
        description: `Imported user graph with ${nodesCount} nodes and ${relsCount} edges.`,
        node_count: nodesCount,
        relationship_count: relsCount,
      });

      const importMsg = {
        role: 'assistant',
        content: `### Imported Custom Architecture: \`${fileName}\`\n\n- **Validated Nodes:** \`${nodesCount}\`\n- **Validated Relationships:** \`${relsCount}\`\n- **Database Engine:** ${res.falkordb_connected ? 'FalkorDB Live Cluster' : 'In-Memory Graph Engine'}\n\nArchitecture loaded into the graph engine. You can now simulate zero-day exploits, trace shortest attack paths to confidential data stores, or ask any security question.`,
        model_used: selectedModel,
      };

      setMessages((prev) => {
        const next = [...prev, importMsg];
        persistSessionUpdate(next, fileData, `Architecture: ${fileName}`);
        return next;
      });
    } catch (err) {
      alert(`Failed to ingest custom JSON: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedFile(null);
    handleSelectPreset('fintech_enterprise');
  };

  // Handle Sending Chat Message
  const handleSendMessage = async (text) => {
    const userMsg = {
      role: 'user',
      content: text,
      attachedFile: uploadedFile ? uploadedFile.name : null,
    };

    const nextMessagesWithUser = [...messages, userMsg];
    setMessages(nextMessagesWithUser);
    persistSessionUpdate(nextMessagesWithUser);
    setIsLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content || m.reply || '',
      }));

      const res = await sendChatMessage({
        message: text,
        history: chatHistory,
        presetId: activePreset,
        rawGraph: uploadedFile ? uploadedFile.rawJson : undefined,
        nodes: uploadedFile ? uploadedFile.rawJson?.nodes : undefined,
        relationships: uploadedFile ? (uploadedFile.rawJson?.relationships || uploadedFile.rawJson?.edges) : undefined,
        model: selectedModel,
      });

      const agentMsg = {
        role: 'assistant',
        content: res.reply,
        is_investigation: res.is_investigation,
        incident_id: res.incident_id,
        kill_chain: res.kill_chain,
        attack_path: res.attack_path,
        path_arrow: res.path_arrow,
        blast_radius: res.blast_radius,
        mutations_applied: res.mutations_applied,
        severance_verified: res.severance_verified,
        attack_paths_remaining: res.attack_paths_remaining,
        cypher_logs: res.cypher_logs,
        remediation_bundle: res.remediation_bundle,
        suggested_followups: res.suggested_followups,
        model_used: res.model_used || selectedModel,
      };

      setMessages((prev) => {
        const nextWithAgent = [...prev, agentMsg];
        persistSessionUpdate(nextWithAgent);
        return nextWithAgent;
      });
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `### Error Processing Investigation\n\n${err.message}\n\nPlease verify that the backend API is running and that your FalkorDB credentials are configured properly in Settings.`,
      };
      setMessages((prev) => {
        const nextWithError = [...prev, errorMsg];
        persistSessionUpdate(nextWithError);
        return nextWithError;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gemini-bg flex font-sans text-gemini-text selection:bg-gemini-accent selection:text-gemini-bg overflow-x-hidden">
      {/* Gemini Chat History Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        falkorConnected={falkorConnected}
        user={user}
        onSignIn={handleSignIn}
      />

      {/* Main Workspace Feed */}
      <div
        className={`flex-1 flex flex-col min-h-screen w-full min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          user={user}
          setUser={setUser}
        />

        {/* Main Chat Feed & Floating Input Bar */}
        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          activePreset={activePreset}
          activePresetData={activePresetData}
          onUploadJson={handleUploadJson}
          uploadedFile={uploadedFile}
          onRemoveUploadedFile={handleRemoveUploadedFile}
          onOpenRemediation={(bundle) => {
            setActiveRemediationBundle(bundle);
            setIsRemediationOpen(true);
          }}
        />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={(newSettings) => {
          if (newSettings.selectedModel) setSelectedModel(newSettings.selectedModel);
        }}
        user={user}
        onSignIn={handleSignIn}
      />

      <RemediationModal
        isOpen={isRemediationOpen}
        onClose={() => setIsRemediationOpen(false)}
        bundle={activeRemediationBundle}
      />
    </div>
  );
}
