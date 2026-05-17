-- =============================================================================
-- Dibs — Step 3 addendum: deal_details(deal_id)
--
-- getDealById (Step 3) feeds the deal detail screen (Step 6), which needs the
-- store's lat/lng for "Get Directions". stores.location is geography (opaque
-- to PostgREST), so we expose a function that returns the same wide row shape
-- as nearby_deals() — with coordinates extracted — for a single deal.
--
-- Additive migration: it does NOT modify 20260515120000_init_schema.sql.
-- Run it after the init migration.
-- =============================================================================

create or replace function public.deal_details(deal_id uuid)
returns table (
  id              uuid,
  store_id        uuid,
  title           text,
  description     text,
  category        public.deal_category,
  discount_type   public.discount_kind,
  discount_value  numeric,
  starts_at       timestamptz,
  expires_at      timestamptz,
  terms           text,
  image_url       text,
  status          public.deal_status,
  created_at      timestamptz,
  store_name      text,
  store_address   text,
  store_phone     text,
  store_logo_url  text,
  store_hours     jsonb,
  store_lat       double precision,
  store_lng       double precision,
  distance_meters double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    d.id, d.store_id, d.title, d.description, d.category, d.discount_type,
    d.discount_value, d.starts_at, d.expires_at, d.terms, d.image_url,
    d.status, d.created_at,
    s.name     as store_name,
    s.address  as store_address,
    s.phone    as store_phone,
    s.logo_url as store_logo_url,
    s.hours    as store_hours,
    extensions.st_y(s.location::extensions.geometry) as store_lat,
    extensions.st_x(s.location::extensions.geometry) as store_lng,
    -- No user location in this context; distance is computed in nearby_deals().
    null::double precision as distance_meters
  from public.deals d
  join public.stores s on s.id = d.store_id
  where d.id = deal_id;
$$;

grant execute on function public.deal_details(uuid) to anon, authenticated;
