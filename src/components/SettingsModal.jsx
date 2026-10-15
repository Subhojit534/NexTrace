import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getStoredSettings, saveStoredSettings, testConnection } from '../services/api';

export default function SettingsModal({ isOpen, onClose, onSettingsSaved }) {
  const [settings, setSettings] = useState(getStoredSettings());
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gemini-surface border border-gemini-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gemini-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gemini-card border border-gemini-border text-gemini-accent">
              <Database className="w-5 h-5 text-gemini-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">FalkorDB Database Settings</h2>
              <p className="text-xs text-gemini-muted">Configure confidential FalkorDB cluster & database credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gemini-muted hover:text-white hover:bg-gemini-surfaceHover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: FalkorDB Configuration */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {savedBanner && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>Database settings saved successfully!</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gemini-text mb-1">
                  FalkorDB Host
                </label>
                <input
                  type="text"
                  placeholder="localhost or r-xxx.cloud"
                  value={settings.falkordbHost || ''}
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
                  value={settings.falkordbPort || ''}
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
                value={settings.falkordbUsername || ''}
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
                  value={settings.falkordbPassword || ''}
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
                checked={Boolean(settings.falkordbSsl)}
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
                  className={`mt-2 p-3 rounded-xl text-xs flex items-start space-x-2 animate-fade-in ${
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
