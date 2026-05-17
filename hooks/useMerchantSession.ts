import { useCallback, useEffect, useState } from 'react';

import {
  getMerchantContext,
  type MerchantContext,
} from '../lib/merchant';
import { supabase } from '../lib/supabase';

export type MerchantPhase = 'loading' | 'auth' | 'setup' | 'ready';

type UseMerchantSession = {
  phase: MerchantPhase;
  context: MerchantContext | null;
  reload: () => Promise<void>;
};

// Drives the merchant screen's three states: not signed in (auth) → signed in
// but no store (setup) → ready to post.
export function useMerchantSession(): UseMerchantSession {
  const [phase, setPhase] = useState<MerchantPhase>('loading');
  const [context, setContext] = useState<MerchantContext | null>(null);

  const reload = useCallback(async () => {
    try {
      const ctx = await getMerchantContext();
      if (!ctx) {
        setContext(null);
        setPhase('auth');
      } else {
        setContext(ctx);
        setPhase(ctx.store ? 'ready' : 'setup');
      }
    } catch {
      setContext(null);
      setPhase('auth');
    }
  }, []);

  useEffect(() => {
    void reload();
    // Re-evaluate when auth changes (OTP verified, signed out, etc.).
    const { data } = supabase.auth.onAuthStateChange(() => {
      void reload();
    });
    return () => data.subscription.unsubscribe();
  }, [reload]);

  return { phase, context, reload };
}
