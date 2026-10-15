import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
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
import { getCurrentUser, supabase } from './services/supabase';

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

  // User Auth State
  const [user, setUser] = useState(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRemediationOpen, setIsRemediationOpen] = useState(false);
  const [activeRemediationBundle, setActiveRemediationBundle] = useState({});

  // Initialize App Data
  useEffect(() => {
    const initApp = async () => {
      // 1. Load User
      const u = await getCurrentUser();
      setUser(u);

      if (supabase) {
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser(session.user);
          }
        });
      }

      // 2. Load Settings
      const settings = getStoredSettings();
      if (settings.selectedModel) {
        setSelectedModel(settings.selectedModel);
      }

      // 3. Health & FalkorDB Status
      try {
        const health = await checkHealth();
        setFalkorConnected(Boolean(health.falkordb_connected));
        if (health.active_preset) {
          setActivePreset(health.active_preset);
        }
      } catch (err) {
        console.warn('API health check error:', err);
      }

      // 4. Models
      try {
        const m = await fetchModels();
        setModels(m);
      } catch (err) {
        console.warn('Fetch models error:', err);
      }

      // 5. Presets
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

  // Handle Preset Selection
  const handleSelectPreset = async (presetId) => {
    setActivePreset(presetId);
    setUploadedFile(null);
    setIsLoading(true);
    try {
      const res = await seedGraph({ presetId, force: true });
      const detail = await fetchPresetDetail(presetId);
      setActivePresetData(detail);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `### Switched Architecture to **${detail.name || presetId}**\n\nLoaded **${res.nodes_count} nodes** and **${res.relationships_count} relationships** into FalkorDB.\n\nYou can now run zero-day attack simulations, inspect public gateways, or trace attack paths to crown jewel stores.`,
          model_used: selectedModel,
        },
      ]);
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

      // Derive context-aware prompt suggestions for this specific topology
      let parsedScenarios = [];
      if (rawJson.scenarios) {
        if (Array.isArray(rawJson.scenarios)) {
          parsedScenarios = rawJson.scenarios.map((s) => (typeof s === 'string' ? { title: s, text: s } : s));
        } else if (typeof rawJson.scenarios === 'object') {
          parsedScenarios = Object.entries(rawJson.scenarios).map(([title, s]) => ({ title, text: s.text || s }));
        }
      }

      if (parsedScenarios.length === 0) {
        // Automatically inspect nodes to synthesize intelligent prompt pills
        const nodeList = Array.isArray(rawJson.nodes) ? rawJson.nodes : [];
        const nodeNames = nodeList.map((n) => (typeof n === 'string' ? n : (n.name || n.id || n.properties?.name || 'Service'))).filter(Boolean);
        
        const ingressCandidate = nodeNames.find((n) => /ingress|gateway|proxy|router|frontend|edge|web|api/i.test(n)) || nodeNames[0] || 'Ingress';
        const crownCandidate = nodeNames.find((n) => /db|database|vault|store|secret|customer|payment|data/i.test(n)) || nodeNames[nodeNames.length - 1] || 'Crown Jewel DB';
        const coreCandidate = nodeNames.find((n) => n !== ingressCandidate && n !== crownCandidate) || nodeNames[1] || ingressCandidate;

        parsedScenarios = [
          { title: `Simulate RCE on ${ingressCandidate}`, text: `Simulate CVE-2024-3094 RCE on ${ingressCandidate} and trace reachability to crown jewels` },
          { title: `Identify blast radius of ${coreCandidate}`, text: `Identify multi-hop downstream blast radius from ${coreCandidate}` },
          { title: `Shortest path to ${crownCandidate}`, text: `Find shortest path from ${ingressCandidate} to ${crownCandidate} via Cypher` },
          { title: `Sever compromised edges from ${coreCandidate}`, text: `Sever compromised communication edges to contain breach` },
        ];
      }

      const fileData = {
        name: fileName,
        rawJson,
        nodes: nodesCount,
        rels: relsCount,
        scenarios: parsedScenarios,
      };

      setUploadedFile(fileData);
      setActivePreset('custom');
      setActivePresetData({
        id: 'custom',
        name: `Custom Graph: ${fileName}`,
        description: `Imported user graph with ${nodesCount} nodes and ${relsCount} edges.`,
        node_count: nodesCount,
        relationship_count: relsCount,
        scenarios: fileData.scenarios,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `### Imported Custom Architecture: \`${fileName}\`\n\n- **Validated Nodes:** \`${nodesCount}\`\n- **Validated Relationships:** \`${relsCount}\`\n- **Database Engine:** ${res.falkordb_connected ? 'FalkorDB Live Cluster' : 'In-Memory Graph Engine'}\n\nArchitecture loaded into the graph engine. You can now simulate zero-day exploits, trace shortest attack paths to confidential data stores, or ask any security question.`,
          model_used: selectedModel,
        },
      ]);
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

    setMessages((prev) => [...prev, userMsg]);
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

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `### Error Processing Investigation\n\n${err.message}\n\nPlease verify that the backend API is running and that your FalkorDB credentials / API keys are configured properly in Settings.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gemini-bg flex flex-col font-sans text-gemini-text selection:bg-gemini-accent selection:text-gemini-bg">
      {/* Top Navbar */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
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

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={(newSettings) => {
          if (newSettings.selectedModel) setSelectedModel(newSettings.selectedModel);
        }}
      />

      <RemediationModal
        isOpen={isRemediationOpen}
        onClose={() => setIsRemediationOpen(false)}
        bundle={activeRemediationBundle}
      />
    </div>
  );
}
