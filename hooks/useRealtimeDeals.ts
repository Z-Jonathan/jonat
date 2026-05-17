import { useEffect, useRef } from 'react';

import { haversineMeters, milesToMeters } from '../lib/geo';
import { useLocationStore } from '../lib/locationStore';
import { getDealById, type NearbyDeal } from '../lib/queries';
import { supabase } from '../lib/supabase';

type Params = {
  enabled: boolean;
  onNewDeal: (deal: NearbyDeal) => void;
};

// Subscribes to deal INSERTs. The Realtime payload only carries the `deals`
// row (no store join / no distance), so we re-fetch the wide row via
// deal_details and apply the same radius/category gates the feed uses, then
// hand a ready-to-render card to the screen.
export function useRealtimeDeals({ enabled, onNewDeal }: Params): void {
  const coords = useLocationStore((s) => s.coords);
  const radiusMiles = useLocationStore((s) => s.radiusMiles);
  const categories = useLocationStore((s) => s.categories);

  // Keep the latest filters/callback in a ref so we don't tear down and
  // re-open the channel every time the user nudges the radius.
  const latest = useRef({ coords, radiusMiles, categories, onNewDeal });
  latest.current = { coords, radiusMiles, categories, onNewDeal };

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('public:deals:inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deals' },
        async (payload) => {
          const row = payload.new as { id?: string; status?: string };
          if (!row.id || row.status !== 'active') return;

          try {
            const deal = await getDealById(row.id);
            if (!deal) return;

            const { coords, radiusMiles, categories, onNewDeal } =
              latest.current;
            if (!coords) return;

            // Must still be live.
            if (new Date(deal.expires_at).getTime() <= Date.now()) return;

            // Honor the active category filter (empty = all).
            if (
              categories.length > 0 &&
              !categories.includes(deal.category)
            ) {
              return;
            }

            // Within the user's radius?
            const distance = haversineMeters(
              coords.lat,
              coords.lng,
              deal.store_lat,
              deal.store_lng,
            );
            if (distance > milesToMeters(radiusMiles)) return;

            onNewDeal({ ...deal, distance_meters: distance });
          } catch {
            // A dropped realtime hint is non-fatal — the next refetch
            // (pull-to-refresh / staleness) reconciles the feed.
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled]);
}
