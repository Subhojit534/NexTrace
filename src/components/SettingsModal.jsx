import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle, AlertCircle, Eye, EyeOff, Loader2, Lock, LogIn } from 'lucide-react';
import { getStoredSettings, saveStoredSettings, testConnection } from '../services/api';

export default function SettingsModal({ isOpen, onClose, onSettingsSaved, user, onSignIn }) {
  const [settings, setSettings] = useState(getStoredSettings());
  const [showPassword, setShowPassword] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [connResult, setConnResult] = useState(null);
  const [savedBanner, setSavedBanner] = useState(false);

  const isGuest = !user || user.isGuest || user.id === 'guest' || user.id === 'guest-analyst';

  useEffect(() => {
    if (isOpen) {
      setSettings(getStoredSettings());
      setConnResult(null);
      setSavedBanner(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (isGuest) {
      if (onSignIn) onSignIn();
      return;
    }
    saveStoredSettings(settings);
    setSavedBanner(true);
    if (onSettingsSaved) onSettingsSaved(settings);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 800);
  };

  const handleTestFalkorDB = async () => {
    if (isGuest) {
      if (onSignIn) onSignIn();
      return;
    }
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2.5 sm:p-4 animate-fade-in">
      <div className="bg-gemini-surface border border-gemini-border rounded-2xl w-[95%] max-w-lg mx-auto shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gemini-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-gemini-card border border-gemini-border text-gemini-accent shrink-0">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-gemini-accent" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-white truncate">FalkorDB Database Settings</h2>
              <p className="text-[11px] sm:text-xs text-gemini-muted truncate">Configure confidential FalkorDB cluster credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gemini-muted hover:text-white hover:bg-gemini-surfaceHover transition shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: FalkorDB Configuration */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1">
          {savedBanner && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>Database settings saved successfully!</span>
            </div>
          )}

          {/* Guest Mode Restriction Notice */}
          {isGuest && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-blue-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5 animate-fade-in">
              <div className="flex items-start space-x-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-xs sm:text-sm">Sign In Required to Connect Custom FalkorDB</h4>
                  <p className="text-gemini-muted text-[11px] sm:text-xs mt-0.5 leading-relaxed">
                    In Guest Mode, NexTrace operates on our built-in high-performance graph engine. To connect your private enterprise FalkorDB cluster and save credentials, please sign in with your Google account first.
                  </p>
                </div>
              </div>
              <div className="pt-0.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (onSignIn) onSignIn();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-sm transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3.5 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-medium text-gemini-text mb-1">
                  FalkorDB Host
                </label>
                <input
                  type="text"
                  placeholder={isGuest ? "Sign in to configure custom host" : "localhost or r-xxx.cloud"}
                  value={isGuest ? '' : (settings.falkordbHost || '')}
                  disabled={isGuest}
                  onChange={(e) => setSettings({ ...settings, falkordbHost: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent ${isGuest ? 'opacity-50 cursor-not-allowed bg-gemini-card/40' : ''}`}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gemini-text mb-1">
                  Port
                </label>
                <input
                  type="number"
                  placeholder="6379"
                  value={isGuest ? '' : (settings.falkordbPort || '')}
                  disabled={isGuest}
                  onChange={(e) => setSettings({ ...settings, falkordbPort: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent ${isGuest ? 'opacity-50 cursor-not-allowed bg-gemini-card/40' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gemini-text mb-1">
                Username (Optional)
              </label>
              <input
                type="text"
                placeholder={isGuest ? "Sign in to enter username" : "default"}
                value={isGuest ? '' : (settings.falkordbUsername || '')}
                disabled={isGuest}
                onChange={(e) => setSettings({ ...settings, falkordbUsername: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent ${isGuest ? 'opacity-50 cursor-not-allowed bg-gemini-card/40' : ''}`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gemini-text mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isGuest ? "Sign in to enter password" : "Database secret..."}
                  value={isGuest ? '' : (settings.falkordbPassword || '')}
                  disabled={isGuest}
                  onChange={(e) => setSettings({ ...settings, falkordbPassword: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg bg-gemini-card border border-gemini-border text-white placeholder-gemini-muted focus:outline-none focus:border-gemini-accent pr-9 ${isGuest ? 'opacity-50 cursor-not-allowed bg-gemini-card/40' : ''}`}
                />
                <button
                  type="button"
                  disabled={isGuest}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-gemini-muted hover:text-white disabled:opacity-40"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="sslCheck"
                disabled={isGuest}
                checked={isGuest ? false : Boolean(settings.falkordbSsl)}
                onChange={(e) => setSettings({ ...settings, falkordbSsl: e.target.checked })}
                className={`rounded border-gemini-border bg-gemini-card text-gemini-accent focus:ring-0 ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <label htmlFor="sslCheck" className={`text-xs text-gemini-text select-none ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Enable SSL / TLS Encryption
              </label>
            </div>

            {/* Test Connection Button & Result */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestFalkorDB}
                disabled={testingConn || isGuest}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-medium transition flex items-center justify-center space-x-2 ${
                  isGuest
                    ? 'bg-gemini-card/40 border-gemini-border/50 text-gemini-muted opacity-60 cursor-not-allowed'
                    : 'bg-gemini-card hover:bg-gemini-surfaceHover border-gemini-border text-gemini-text'
                }`}
                title={isGuest ? 'Sign in with Google to test and connect custom databases' : 'Test live FalkorDB connection'}
              >
                {testingConn ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gemini-accent" />
                    <span>Testing FalkorDB Connectivity...</span>
                  </>
                ) : (
                  <>
                    {isGuest ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span>{isGuest ? 'Sign In to Test Live Connection' : 'Test Live FalkorDB Connection'}</span>
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
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gemini-border bg-gemini-card/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 rounded-lg text-xs font-medium text-gemini-muted hover:text-white transition"
          >
            {isGuest ? 'Close' : 'Cancel'}
          </button>
          {isGuest ? (
            <button
              onClick={() => {
                if (onSignIn) onSignIn();
              }}
              className="px-4 sm:px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition flex items-center space-x-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-4 sm:px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition"
            >
              Save Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
