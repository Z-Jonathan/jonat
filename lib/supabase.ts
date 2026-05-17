// react-native-url-polyfill must load before supabase-js so its internal
// URL parsing works on React Native (Hermes has no global URL).
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type User } from '@supabase/supabase-js';

import type { Database } from '../types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and set ' +
      'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist the session (incl. the anonymous one) across app launches.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // No URL-based auth callbacks in a native app.
    detectSessionInUrl: false,
  },
});

// Consumers have no login. We mint a Supabase *anonymous* user on first need
// so deal_saves (RLS-scoped to auth.uid()) works per-device. Requires
// "Allow anonymous sign-ins" enabled in Supabase Auth settings.
let anonSessionPromise: Promise<User> | null = null;

export function ensureAnonSession(): Promise<User> {
  // Collapse concurrent callers (e.g. screen mount + a save tap) into one
  // sign-in round trip.
  if (anonSessionPromise) return anonSessionPromise;

  anonSessionPromise = (async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) return sessionData.session.user;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      anonSessionPromise = null; // allow a retry on the next call
      throw error ?? new Error('Anonymous sign-in returned no user.');
    }
    return data.user;
  })();

  return anonSessionPromise;
}
