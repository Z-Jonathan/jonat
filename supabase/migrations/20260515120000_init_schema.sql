-- =============================================================================
-- Dibs — Step 2: schema, PostGIS, nearby_deals(), Row Level Security
--
-- This is a one-shot migration. Run it once in the Supabase SQL editor
-- (or via `supabase db push`). It is intentionally NOT idempotent for the
-- enum/type creates — Supabase migrations run exactly once.
-- =============================================================================

-- 1. Extensions ---------------------------------------------------------------
-- PostGIS gives us geography(Point) + the spatial index used by nearby_deals().
-- Installed into Supabase's pre-created `extensions` schema (their convention);
-- that schema is already on the API roles' search_path so unqualified ST_*
-- calls work from the client, while our SECURITY-hardened function below
-- fully-qualifies them.
create extension if not exists postgis with schema extensions;

-- 2. Enums --------------------------------------------------------------------
-- Enums (not free text / lookup tables) because these value sets are small,
-- stable, and product-defined. They give us DB-level validation and clean
-- generated TypeScript union types in Step 3.
create type public.deal_category as enum
  ('food', 'clothing', 'beauty', 'entertainment', 'electronics', 'other');

create type public.discount_kind as enum
  ('percent', 'bogo', 'fixed', 'freebie', 'other');

create type public.deal_status as enum
  ('active', 'expired', 'removed');

-- 3. Tables -------------------------------------------------------------------

-- A merchant IS a Supabase auth user (magic-link, Step 8). We key
-- merchants.id directly to auth.users.id rather than adding a separate
-- user_id FK, so every RLS write check is a simple `... = auth.uid()` with
-- no extra join. (Decision — slightly beyond the literal column list in the
-- plan, but required to make the "merchants manage only their own" rule work.)
create table public.merchants (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text        not null,
  email       text        not null,
  phone       text,
  verified    boolean     not null default false,
  created_at  timestamptz not null default now()
);

create table public.stores (
  id           uuid        primary key default gen_random_uuid(),
  merchant_id  uuid        not null references public.merchants (id) on delete cascade,
  name         text        not null,
  address      text        not null,
  -- geography(Point,4326): WGS84 lat/lng; geography (not geometry) so distance
  -- and radius are in real meters on the spheroid — no projection math.
  location     extensions.geography(Point, 4326) not null,
  phone        text,
  hours        jsonb,
  logo_url     text,
  created_at   timestamptz not null default now()
);

-- GIST index on the spatial column — this is what makes the ST_DWithin
-- radius filter in nearby_deals() index-assisted instead of a full scan.
create index stores_location_gist on public.stores using gist (location);
create index stores_merchant_id_idx on public.stores (merchant_id);

create table public.deals (
  id             uuid        primary key default gen_random_uuid(),
  store_id       uuid        not null references public.stores (id) on delete cascade,
  title          text        not null,
  description    text,
  category       public.deal_category not null default 'other',
  discount_type  public.discount_kind not null default 'other',
  -- nullable: BOGO / freebie deals have no numeric value.
  discount_value numeric,
  starts_at      timestamptz not null default now(),
  expires_at     timestamptz not null,
  terms          text,
  image_url      text,
  status         public.deal_status not null default 'active',
  created_at     timestamptz not null default now(),
  constraint deals_expires_after_start check (expires_at > starts_at)
);

create index deals_store_id_idx on public.deals (store_id);
-- Partial index on the feed hot path: active deals ordered by soonest expiry
-- (perishable-first). now() is not immutable so it can't be in the predicate;
-- filtering status here + range-scanning expires_at covers the query well.
create index deals_active_expiry_idx
  on public.deals (expires_at)
  where status = 'active';

-- Favorites. Composite PK (user_id, deal_id) prevents duplicate saves and is
-- the natural lookup key. user_id -> auth.users so anonymous-auth users
-- (our consumer identity model) get private, per-device saves.
create table public.deal_saves (
  user_id   uuid        not null references auth.users (id) on delete cascade,
  deal_id   uuid        not null references public.deals (id) on delete cascade,
  saved_at  timestamptz not null default now(),
  primary key (user_id, deal_id)
);

-- 4. nearby_deals() -----------------------------------------------------------
-- Returns ACTIVE, currently-running, unexpired deals within `radius_meters`
-- of (user_lat, user_lng), each row carrying its store context + computed
-- distance_meters, ordered expires_at ASC (perishable-first — the core UX).
--
-- `categories` is optional: NULL or empty array => all categories.
-- security invoker  -> caller's RLS applies (public read of active deals +
--                       public read of stores), so no privilege escalation.
-- set search_path='' -> hardening; every name below is fully schema-qualified.
create or replace function public.nearby_deals(
  user_lat       double precision,
  user_lng       double precision,
  radius_meters  double precision,
  categories     text[] default null
)
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
    extensions.st_distance(
      s.location,
      extensions.st_setsrid(
        extensions.st_makepoint(user_lng, user_lat), 4326
      )::extensions.geography
    ) as distance_meters
  from public.deals d
  join public.stores s on s.id = d.store_id
  where d.status = 'active'
    and d.starts_at <= now()
    and d.expires_at > now()
    and extensions.st_dwithin(
          s.location,
          extensions.st_setsrid(
            extensions.st_makepoint(user_lng, user_lat), 4326
          )::extensions.geography,
          radius_meters
        )
    and (
      categories is null
      or array_length(categories, 1) is null
      or d.category::text = any (categories)
    )
  order by d.expires_at asc;
$$;

grant execute on function public.nearby_deals(
  double precision, double precision, double precision, text[]
) to anon, authenticated;

-- 5. Row Level Security -------------------------------------------------------
alter table public.merchants  enable row level security;
alter table public.stores     enable row level security;
alter table public.deals      enable row level security;
alter table public.deal_saves enable row level security;

-- merchants: contains PII (email/phone) — NOT world readable. A merchant may
-- only see and manage their own row.
create policy "merchants read own"
  on public.merchants for select to authenticated
  using (id = (select auth.uid()));

create policy "merchants insert self"
  on public.merchants for insert to authenticated
  with check (id = (select auth.uid()));

create policy "merchants update own"
  on public.merchants for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- stores: world-readable — the consumer feed/detail need name, address,
-- location and hours, and these are not sensitive. Writes restricted to the
-- owning merchant (merchant.id = auth.uid()).
create policy "stores public read"
  on public.stores for select
  using (true);

create policy "stores owner insert"
  on public.stores for insert to authenticated
  with check (merchant_id = (select auth.uid()));

create policy "stores owner update"
  on public.stores for update to authenticated
  using (merchant_id = (select auth.uid()))
  with check (merchant_id = (select auth.uid()));

-- deals: anyone (anon included) may read ACTIVE deals — this powers the
-- public feed. The owning merchant may additionally read their own deals in
-- ANY status (to manage expired/removed ones) and insert/update them.
-- Removal is a soft-delete via status='removed' (an UPDATE), so no DELETE
-- policy is granted — matching the plan's "insert/update only".
create policy "deals public read active"
  on public.deals for select
  using (status = 'active');

create policy "deals owner read all"
  on public.deals for select to authenticated
  using (
    store_id in (
      select s.id from public.stores s
      where s.merchant_id = (select auth.uid())
    )
  );

create policy "deals owner insert"
  on public.deals for insert to authenticated
  with check (
    store_id in (
      select s.id from public.stores s
      where s.merchant_id = (select auth.uid())
    )
  );

create policy "deals owner update"
  on public.deals for update to authenticated
  using (
    store_id in (
      select s.id from public.stores s
      where s.merchant_id = (select auth.uid())
    )
  )
  with check (
    store_id in (
      select s.id from public.stores s
      where s.merchant_id = (select auth.uid())
    )
  );

-- deal_saves: strictly private to the owning user (covers anonymous-auth
-- users — they carry a real authenticated JWT with is_anonymous=true).
create policy "deal_saves select own"
  on public.deal_saves for select to authenticated
  using (user_id = (select auth.uid()));

create policy "deal_saves insert own"
  on public.deal_saves for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "deal_saves delete own"
  on public.deal_saves for delete to authenticated
  using (user_id = (select auth.uid()));
