-- =============================================================================
-- Dibs — Step 10: lightweight analytics
--
-- Write-only event log (no external analytics dependency). Clients insert
-- events; nobody can read them back via the API (no SELECT policy). user_id
-- is captured automatically from the JWT (anon or merchant). Additive.
-- =============================================================================

create table public.analytics_events (
  id         uuid        primary key default gen_random_uuid(),
  event      text        not null,
  props      jsonb,
  user_id    uuid        default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index analytics_events_event_idx on public.analytics_events (event);
create index analytics_events_created_idx on public.analytics_events (created_at);

alter table public.analytics_events enable row level security;

-- Anyone (anon consumer or signed-in merchant) may record an event...
create policy "analytics insert any"
  on public.analytics_events for insert to anon, authenticated
  with check (true);

-- ...but there is intentionally NO select policy: the table is write-only
-- from the client. Inspect events with the service role / SQL editor.
