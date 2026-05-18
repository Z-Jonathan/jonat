import type { Json } from '../types/database';
import { supabase } from './supabase';

export type AnalyticsEvent =
  | 'deal_viewed'
  | 'directions_tapped'
  | 'deal_saved'
  | 'merchant_posted';

// Fire-and-forget. Analytics must NEVER block or break a user flow, so this
// never throws and is not awaited by callers.
export function track(
  event: AnalyticsEvent,
  props?: Record<string, unknown>,
): void {
  void supabase
    .from('analytics_events')
    // Callers pass JSON-serializable props by contract; cast at the DB edge.
    .insert({ event, props: (props ?? null) as Json })
    .then(({ error }) => {
      if (error && __DEV__) {
        // Surface only in development; silent in production.
        console.warn('[analytics] failed:', error.message);
      }
    });
}
