import React from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Database,
  Sparkles,
  Shield,
  ShieldAlert,
  LogIn,
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenSettings,
  falkorConnected,
  user,
  onSignIn,
}) {
  const isGuest = !user || user.isGuest || user.id === 'guest' || user.id === 'guest-analyst';
  const handleSelect = (id) => {
    onSelectSession(id);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onToggle();
    }
  };

  const handleNew = () => {
    onNewChat();
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onToggle();
    }
  };

  const handleSettings = () => {
    onOpenSettings();
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-gemini-card border-r border-gemini-border transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 max-w-[85vw] translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0 md:w-16'
        }`}
      >
        {/* Top Header: Hamburger & New Chat Button */}
        <div className="p-3 flex items-center justify-between border-b border-gemini-border/60">
          {isOpen ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-gemini-gradientStart to-gemini-gradientEnd flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm text-white tracking-tight">NexTrace</span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={onToggle}
                className="p-2 rounded-xl hover:bg-gemini-surface text-gemini-muted hover:text-white transition"
                title="Expand sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            </div>
          )}

          {isOpen && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gemini-surface text-gemini-muted hover:text-white transition"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* "+ New chat" Button (Gemini Style) */}
        <div className="p-3">
          <button
            onClick={handleNew}
            className={`w-full flex items-center rounded-full bg-gemini-surface hover:bg-gemini-surfaceHover border border-gemini-border hover:border-gemini-accent/40 text-gemini-text hover:text-white transition shadow-sm group ${
              isOpen ? 'px-4 py-2.5 space-x-3' : 'justify-center p-2.5'
            }`}
            title="Start a new chat"
          >
            <Plus className="w-4 h-4 text-gemini-accent group-hover:rotate-90 transition-transform duration-200" />
            {isOpen && <span className="text-xs font-medium">New chat</span>}
          </button>
        </div>

        {/* Recent Chats Section */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-none">
          {isOpen && (
            <div className="px-2 pt-2 pb-1.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-gemini-muted">
                {isGuest ? 'Session Mode' : 'Recent Chats'}
              </span>
            </div>
          )}

          {isGuest ? (
            isOpen ? (
              <div className="px-2 py-3 animate-fade-in">
                <div className="p-3 rounded-xl bg-gemini-surface/60 border border-gemini-border text-center space-y-2.5">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Guest Mode</p>
                    <p className="text-[11px] text-gemini-muted mt-0.5 leading-relaxed">
                      Chats are temporary and not saved to history. Sign in to save and sync conversations.
                    </p>
                  </div>
                  <button
                    onClick={onSignIn}
                    className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium transition shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In to Save</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-3" title="Guest Mode: Chats are not stored in history">
                <ShieldAlert className="w-4 h-4 text-amber-400/70" />
              </div>
            )
          ) : sessions.length === 0 ? (
            isOpen && (
              <div className="px-3 py-6 text-center text-xs text-gemini-muted">
                No previous chats yet.<br />
                Start a new conversation!
              </div>
            )
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s.id)}
                  className={`group relative flex items-center rounded-xl cursor-pointer transition ${
                    isOpen ? 'px-3 py-2 space-x-2.5' : 'justify-center p-2.5'
                  } ${
                    isActive
                      ? 'bg-gemini-surface text-white border border-gemini-border shadow-sm'
                      : 'text-gemini-muted hover:bg-gemini-surface/60 hover:text-gemini-text'
                  }`}
                  title={s.title || 'Conversation'}
                >
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-gemini-accent' : 'text-gemini-muted'}`} />

                  {isOpen && (
                    <span className="flex-1 text-xs truncate font-medium">
                      {s.title || 'Untitled Chat'}
                    </span>
                  )}

                  {isOpen && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-gemini-muted hover:text-red-400 transition"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Database Status & Settings */}
        <div className="p-3 border-t border-gemini-border/60 bg-gemini-card/80 space-y-2">
          {/* FalkorDB Live Status */}
          <div
            className={`flex items-center rounded-lg px-2.5 py-1.5 ${
              isOpen ? 'space-x-2' : 'justify-center'
            } ${falkorConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'}`}
            title={falkorConnected ? 'Connected to live FalkorDB instance' : 'Operating on in-memory graph mirror'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                falkorConnected ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'
              }`}
            />
            {isOpen && (
              <span className="text-[11px] font-medium truncate">
                {falkorConnected ? 'FalkorDB Connected' : 'Graph Engine Ready'}
              </span>
            )}
          </div>

          {/* Settings Trigger */}
          <button
            onClick={handleSettings}
            className={`w-full flex items-center rounded-lg text-gemini-muted hover:text-white hover:bg-gemini-surface transition ${
              isOpen ? 'px-2.5 py-1.5 space-x-2 text-xs' : 'justify-center p-2'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
            {isOpen && <span>Settings</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
