import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const guestUser = {
  id: 'guest-analyst',
  email: 'security.lead@demo.cloud',
  user_metadata: {
    full_name: 'SecOps Analyst (Guest)',
    avatar_url: null,
  },
  isGuest: true,
};

export async function signInWithGoogle() {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase credentials not configured in environment. Operating in Guest Demo mode.');
    return { error: { message: 'Supabase credentials not set in .env. Running in Guest Demo mode.' } };
  }
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
}

export async function signOutUser() {
  if (supabase) {
    return supabase.auth.signOut();
  }
  return { error: null };
}

export async function getCurrentUser() {
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
  }
  return guestUser;
}
