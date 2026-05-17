import type { Database } from '../types/database';
import { supabase } from './supabase';

export type MerchantStore = { id: string; name: string };
export type MerchantContext = {
  userId: string;
  email: string;
  store: MerchantStore | null;
};

type DiscountKind = Database['public']['Enums']['discount_kind'];
type DealCategory = Database['public']['Enums']['deal_category'];

// --- Auth (email OTP code; no deep-link plumbing) ---------------------------

export async function requestEmailOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function verifyEmailOtp(
  email: string,
  token: string,
): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: 'email',
  });
  if (error) throw error;
}

export async function signOutMerchant(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// A merchant is an auth user with a real email (anonymous consumers have
// none), so the presence of `email` distinguishes the two identities.
export async function getMerchantContext(): Promise<MerchantContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;

  const { data, error } = await supabase
    .from('stores')
    .select('id, name')
    .eq('merchant_id', user.id)
    .maybeSingle();
  if (error) throw error;

  return { userId: user.id, email: user.email, store: data ?? null };
}

// --- Store setup ------------------------------------------------------------

export async function setupMerchantStore(params: {
  merchantName: string;
  email: string;
  storeName: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string | null;
  hoursText?: string | null;
}): Promise<string> {
  const { data, error } = await supabase.rpc('setup_merchant_store', {
    p_merchant_name: params.merchantName,
    p_email: params.email,
    p_store_name: params.storeName,
    p_address: params.address,
    p_lat: params.lat,
    p_lng: params.lng,
    p_phone: params.phone ?? null,
    // store_hours is merchant-defined jsonb; keep the simple text the form
    // collects under a stable key the detail screen can render.
    p_hours: params.hoursText ? { text: params.hoursText } : null,
    p_logo_url: null,
  });
  if (error) throw error;
  return data;
}

// --- Deal posting -----------------------------------------------------------

export async function uploadDealImage(
  localUri: string,
  mimeType: string | null,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const contentType = mimeType ?? 'image/jpeg';
  const ext = contentType.split('/')[1] ?? 'jpg';
  const path = `${user.id}/${Date.now()}.${ext}`;

  // RN-friendly: read the local file into an ArrayBuffer for upload.
  const body = await fetch(localUri).then((r) => r.arrayBuffer());

  const { error } = await supabase.storage
    .from('deal-images')
    .upload(path, body, { contentType, upsert: false });
  if (error) throw error;

  return supabase.storage.from('deal-images').getPublicUrl(path).data
    .publicUrl;
}

export async function createDeal(input: {
  storeId: string;
  title: string;
  discountType: DiscountKind;
  category: DealCategory;
  expiresAt: string;
  imageUrl?: string | null;
}): Promise<string> {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      store_id: input.storeId,
      title: input.title.trim(),
      discount_type: input.discountType,
      category: input.category,
      expires_at: input.expiresAt,
      image_url: input.imageUrl ?? null,
      // starts_at / status / created_at use DB defaults → live immediately.
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}
