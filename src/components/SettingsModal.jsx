import React, { useState, useEffect } from 'react';
import { X, Key, Database, Shield, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getStoredSettings, saveStoredSettings, testConnection } from '../services/api';

export default function SettingsModal({ isOpen, onClose, onSettingsSaved }) {
  const [settings, setSettings] = useState(getStoredSettings());
  const [activeTab, setActiveTab] = useState('llm'); // 'llm' | 'falkordb'
  const [showPassword, setShowPassword] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [connResult, setConnResult] = useState(null);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getStoredSettings());
      setConnResult(null);
      setSavedBanner(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredSettings(settings);
    setSavedBanner(true);
    if (onSettingsSaved) onSettingsSaved(settings);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 800);
  };

  const handleTestFalkorDB = async () => {
    setTestingConn(true);
    setConnResult(null);
    try {
      const res = await testConnection({
        host: settings.falkordbHost || 'localhost',
        port: Number(settings.falkordbPort) || 6379,
        username: settings.falkordbUsername || undefined,
        password: settings.falkordbPassword || undefined,
        ssl: Boolean(settings.falkordbSsl),
      });
      setConnResult(res);
    } catch (err) {
      setConnResult({
        connected: false,
        message: err.message || 'Failed to connect to FalkorDB',
      });
    } finally {
      setTestingConn(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gemini-surface border border-gemini-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gemini-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gemini-card border border-gemini-border text-gemini-accent">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">System Settings</h2>
              <p className="text-xs text-gemini-muted">Configure dynamic API keys & confidential FalkorDB cluster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gemini-muted hover:text-white hover:bg-gemini-surfaceHover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gemini-border px-6">
          <button
            onClick={() => setActiveTab('llm')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'llm'
                ? 'border-gemini-accent text-gemini-accent font-semibold'
                : 'border-transparent text-gemini-muted hover:text-gemini-text'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>LLM API Keys</span>
          </button>
          <button
            onClick={() => setActiveTab('falkordb')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'falkordb'
                ? 'border-gemini-accent text-gemini-accent font-semibold'
                : 'border-transparent text-gemini-muted hover:text-gemini-text'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>FalkorDB Connection</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {savedBanner && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>Settings saved locally in your browser!</span>
            </div>
          )}

          {activeTab === 'llm' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gemini-text mb-1">
                  Active Reasoning Model
                </label>
                <select
                  value={settings.selectedModel || 'llama-3.3-70b-versatile'}
                  onChange={(e) => setSettings({ ...settings, selectedModel: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white focus:outline-none focus:border-gemini-accent"
                >
                  <option value="llama-3.3-70b-versatile">LLaMA 3.3 70B Versatile (Groq)</option>
                  <option value="openai/gpt-oss-120b">GPT-OSS 120B (Groq)</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                </select>
                <p className="text-[11px] text-gemini-muted mt-1">
                  Select which foundational LLM coordinates the multi-hop Cypher attack investigations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gemini-text mb-1">
                  Groq API Key
                </label>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={settings.groqApiKey}
                  onChange={(e) => setSettings({ ...settings, groqApiKey: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent"
                />
                <p className="text-[11px] text-gemini-muted mt-1">
                  Used for ultra-fast LLaMA 3.3 70B & GPT-OSS 120B autonomous agent tool calls.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gemini-text mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent"
                />
                <p className="text-[11px] text-gemini-muted mt-1">
                  For Gemini 1.5 Pro / Flash multi-hop threat analysis and synthesis.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gemini-text mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={settings.openaiApiKey}
                  onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent"
                />
                <p className="text-[11px] text-gemini-muted mt-1">
                  Enables GPT-4o / GPT-4o-mini reasoning fallback.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gemini-card border border-gemini-border/50 text-[11px] text-gemini-muted">
                Note: All keys are stored client-side in your browser's <code className="text-gemini-accent">localStorage</code> and transmitted securely over HTTPS headers directly to the API server.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gemini-text mb-1">
                    FalkorDB Host
                  </label>
                  <input
                    type="text"
                    placeholder="localhost or r-xxx.cloud"
                    value={settings.falkordbHost}
                    onChange={(e) => setSettings({ ...settings, falkordbHost: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gemini-text mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    placeholder="6379"
                    value={settings.falkordbPort}
                    onChange={(e) => setSettings({ ...settings, falkordbPort: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gemini-text mb-1">
                  Username (Optional)
                </label>
                <input
                  type="text"
                  placeholder="default"
                  value={settings.falkordbUsername}
                  onChange={(e) => setSettings({ ...settings, falkordbUsername: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gemini-text mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Database secret..."
                    value={settings.falkordbPassword}
                    onChange={(e) => setSettings({ ...settings, falkordbPassword: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-gemini-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="sslCheck"
                  checked={settings.falkordbSsl}
                  onChange={(e) => setSettings({ ...settings, falkordbSsl: e.target.checked })}
                  className="rounded border-gemini-border bg-gemini-card text-gemini-accent focus:ring-0"
                />
                <label htmlFor="sslCheck" className="text-xs text-gemini-text select-none">
                  Enable SSL / TLS Encryption
                </label>
              </div>

              {/* Test Connection Button & Result */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestFalkorDB}
                  disabled={testingConn}
                  className="w-full py-2 px-3 rounded-lg bg-gemini-card hover:bg-gemini-surfaceHover border border-gemini-border text-xs font-medium text-gemini-text transition flex items-center justify-center space-x-2"
                >
                  {testingConn ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gemini-accent" />
                      <span>Testing FalkorDB Connectivity...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                      <span>Test Live FalkorDB Connection</span>
                    </>
                  )}
                </button>

                {connResult && (
                  <div
                    className={`mt-2 p-3 rounded-xl text-xs flex items-start space-x-2 ${
                      connResult.connected
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {connResult.connected ? (
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{connResult.message}</p>
                      {connResult.latency_ms && (
                        <p className="text-[10px] opacity-80 mt-0.5">Latency: {connResult.latency_ms} ms</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gemini-border bg-gemini-card/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-gemini-muted hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
