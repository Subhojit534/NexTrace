import React, { useState } from 'react';
import {
  Sparkles,
  Settings,
  LogIn,
  LogOut,
} from 'lucide-react';
import { signInWithGoogle, signOutUser, isSupabaseConfigured } from '../services/supabase';

export default function Navbar({
  onOpenSettings,
  user,
  setUser,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleGoogleAuth = async () => {
    if (user && !user.isGuest) {
      await signOutUser();
      setUser({
        id: 'guest',
        email: 'guest@demo.local',
        user_metadata: { full_name: 'Guest Analyst' },
        isGuest: true,
      });
    } else {
      if (isSupabaseConfigured) {
        await signInWithGoogle();
      } else {
        alert('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env for live Google OAuth. Running seamlessly in Guest Mode.');
      }
    }
  };

  return (
    <header className="h-16 border-b border-gemini-border bg-gemini-bg/95 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gemini-gradientStart to-gemini-gradientEnd flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-lg text-white tracking-tight">NexTrace</span>
            <span className="text-[10px] font-medium uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
              SecOps
            </span>
          </div>
          <p className="text-xs text-gemini-muted hidden sm:block">Autonomous Cloud Graph Investigator</p>
        </div>
      </div>

      {/* Right Controls: Settings & Profile */}
      <div className="flex items-center space-x-3">
        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-gemini-surface hover:bg-gemini-surfaceHover border border-gemini-border text-gemini-text transition"
          title="Settings (FalkorDB Database)"
        >
          <Settings className="w-4 h-4 text-gemini-muted hover:text-white" />
        </button>

        {/* User Auth Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full bg-gemini-surface hover:bg-gemini-surfaceHover border border-gemini-border transition"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
              {user?.user_metadata?.full_name?.charAt(0) || 'G'}
            </div>
            <span className="text-xs text-gemini-text font-medium max-w-[90px] truncate hidden sm:inline">
              {user?.user_metadata?.full_name?.split(' ')[0] || 'Guest'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gemini-surface border border-gemini-border shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-gemini-border mb-1">
                <p className="text-xs font-semibold text-white truncate">{user?.user_metadata?.full_name || 'Guest User'}</p>
                <p className="text-[11px] text-gemini-muted truncate">{user?.email || 'guest@demo.local'}</p>
                {user?.isGuest && (
                  <span className="inline-block mt-1 text-[10px] bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                    Guest Mode
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleGoogleAuth();
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center space-x-2 rounded-lg hover:bg-gemini-surfaceHover transition text-gemini-text"
              >
                {user && !user.isGuest ? (
                  <>
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Sign Out</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sign In with Google</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
