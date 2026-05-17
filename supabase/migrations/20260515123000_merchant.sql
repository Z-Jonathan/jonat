-- =============================================================================
-- Dibs — Step 8: merchant onboarding + deal-image storage
--
-- - setup_merchant_store(): one call that upserts the merchant row (keyed to
--   auth.uid()) and creates/updates their single store, building the PostGIS
--   point from lat/lng. Used by first-time store setup.
-- - storage bucket `deal-images` (public) + RLS so any signed-in user can
--   upload and anyone can read (consumer feed needs the image URLs).
--
-- Additive migration — run after the init migration.
-- =============================================================================

-- 1. Merchant + store upsert -------------------------------------------------
create or replace function public.setup_merchant_store(
  p_merchant_name text,
  p_email         text,
  p_store_name    text,
  p_address       text,
  p_lat           double precision,
  p_lng           double precision,
  p_phone         text  default null,
  p_hours         jsonb default null,
  p_logo_url      text  default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid      uuid := (select auth.uid());
  v_store_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Merchant row is keyed to the auth user (see Step 2 schema notes).
  insert into public.merchants (id, name, email)
  values (v_uid, p_merchant_name, p_email)
  on conflict (id) do update
    set name = excluded.name, email = excluded.email;

  select id into v_store_id
  from public.stores
  where merchant_id = v_uid
  limit 1;

  if v_store_id is null then
    insert into public.stores
      (merchant_id, name, address, location, phone, hours, logo_url)
    values (
      v_uid, p_store_name, p_address,
      extensions.st_setsrid(
        extensions.st_makepoint(p_lng, p_lat), 4326
      )::extensions.geography,
      p_phone, p_hours, p_logo_url
    )
    returning id into v_store_id;
  else
    update public.stores
      set name     = p_store_name,
          address  = p_address,
          location = extensions.st_setsrid(
            extensions.st_makepoint(p_lng, p_lat), 4326
          )::extensions.geography,
          phone    = p_phone,
          hours    = p_hours,
          logo_url = coalesce(p_logo_url, logo_url)
    where id = v_store_id;
  end if;

  return v_store_id;
end;
$$;

grant execute on function public.setup_merchant_store(
  text, text, text, text, double precision, double precision, text, jsonb, text
) to authenticated;

-- 2. Deal image storage ------------------------------------------------------
-- Public bucket so consumer clients can render image_url without auth.
insert into storage.buckets (id, name, public)
values ('deal-images', 'deal-images', true)
on conflict (id) do nothing;

-- Anyone may read objects in this bucket (public images).
create policy "deal-images public read"
  on storage.objects for select
  using (bucket_id = 'deal-images');

-- Any signed-in user (merchant) may upload to this bucket.
create policy "deal-images authenticated upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'deal-images');
