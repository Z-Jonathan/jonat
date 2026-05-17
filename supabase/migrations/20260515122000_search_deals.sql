-- =============================================================================
-- Dibs — Step 7 addendum: search_deals(term)
--
-- Powers the Search tab: case-insensitive substring match on deal title OR
-- store name (ILIKE — MVP, no full-text yet). Returns the same wide row shape
-- as nearby_deals()/deal_details() so the existing DealCard renders it as-is.
-- Active + currently-running + unexpired only (search is discovery), ordered
-- perishable-first. Additive migration — run after the init migration.
-- =============================================================================

create or replace function public.search_deals(term text)
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
    null::double precision as distance_meters
  from public.deals d
  join public.stores s on s.id = d.store_id
  where d.status = 'active'
    and d.starts_at <= now()
    and d.expires_at > now()
    and (
      d.title ilike ('%' || term || '%')
      or s.name ilike ('%' || term || '%')
    )
  order by d.expires_at asc;
$$;

grant execute on function public.search_deals(text) to anon, authenticated;
