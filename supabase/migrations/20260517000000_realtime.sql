-- =============================================================================
-- Dibs — Step 9: enable Realtime on deals
--
-- Adds public.deals to the supabase_realtime publication so clients can
-- subscribe to INSERTs. Realtime honors RLS, so anon subscribers only receive
-- rows they can SELECT — i.e. active deals (see Step 2 "deals public read
-- active" policy). Idempotent. Additive migration.
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'deals'
  ) then
    alter publication supabase_realtime add table public.deals;
  end if;
end $$;
