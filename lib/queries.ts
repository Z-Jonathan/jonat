import type { Database } from '../types/database';
import { ensureAnonSession, supabase } from './supabase';

type Tables = Database['public']['Tables'];
type Functions = Database['public']['Functions'];

export type DealRow = Tables['deals']['Row'];
export type StoreRow = Tables['stores']['Row'];

/** A deal + its store + distance, as returned by nearby_deals(). */
export type NearbyDeal = Functions['nearby_deals']['Returns'][number];
/** Same wide shape for a single deal (distance_meters is null here). */
export type DealDetail = Functions['deal_details']['Returns'][number];
/** Same wide shape from a text search (distance_meters is null here). */
export type SearchedDeal = Functions['search_deals']['Returns'][number];

/** Store fields safe to embed in list cards (excludes opaque geography). */
export type SavedStore = Pick<
  StoreRow,
  'id' | 'name' | 'address' | 'phone' | 'hours' | 'logo_url'
>;

export type SavedDeal = {
  saved_at: string;
  deal: (DealRow & { store: SavedStore | null }) | null;
};

export type NearbyDealsParams = {
  lat: number;
  lng: number;
  radiusMeters: number;
  /** Empty/omitted => all categories. */
  categories?: string[];
};

export async function getNearbyDeals({
  lat,
  lng,
  radiusMeters,
  categories,
}: NearbyDealsParams): Promise<NearbyDeal[]> {
  const { data, error } = await supabase.rpc('nearby_deals', {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radiusMeters,
    categories: categories && categories.length > 0 ? categories : null,
  });
  if (error) throw error;
  return data ?? [];
}

export async function searchDeals(term: string): Promise<SearchedDeal[]> {
  const trimmed = term.trim();
  if (trimmed.length === 0) return [];
  const { data, error } = await supabase.rpc('search_deals', {
    term: trimmed,
  });
  if (error) throw error;
  return data ?? [];
}

export async function getDealById(id: string): Promise<DealDetail | null> {
  const { data, error } = await supabase.rpc('deal_details', { deal_id: id });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function saveDeal(dealId: string): Promise<void> {
  const user = await ensureAnonSession();
  const { error } = await supabase
    .from('deal_saves')
    // Idempotent: re-saving an already-saved deal is a no-op, not an error.
    .upsert(
      { user_id: user.id, deal_id: dealId },
      { onConflict: 'user_id,deal_id', ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function unsaveDeal(dealId: string): Promise<void> {
  const user = await ensureAnonSession();
  const { error } = await supabase
    .from('deal_saves')
    .delete()
    .eq('user_id', user.id)
    .eq('deal_id', dealId);
  if (error) throw error;
}

export async function isDealSaved(dealId: string): Promise<boolean> {
  const user = await ensureAnonSession();
  const { count, error } = await supabase
    .from('deal_saves')
    .select('deal_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('deal_id', dealId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function getSavedDeals(): Promise<SavedDeal[]> {
  const user = await ensureAnonSession();
  const { data, error } = await supabase
    .from('deal_saves')
    .select(
      'saved_at, deal:deals(*, store:stores(id, name, address, phone, hours, logo_url))',
    )
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })
    // Embedded-resource inference is brittle without generated Relationships;
    // assert the shape we know PostgREST returns for this query.
    .returns<SavedDeal[]>();
  if (error) throw error;
  return data ?? [];
}
