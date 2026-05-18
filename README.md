# Dibs

Real-time, perishable, hyperlocal deals from independent businesses. Consumers
see deals expiring soon nearby; merchants post a deal in under 15 seconds with
a free tool. Built with Expo (SDK 52), Supabase, NativeWind, Expo Router, and
TanStack Query.

---

## 1. Prerequisites

- Node 20+ (tested on 22)
- A Supabase project (free tier is fine)
- The **Expo Go** app on a physical device, or an Android/iOS emulator

## 2. Install

```bash
npm install
```

## 3. Environment variables

Copy the example and fill it in from **Supabase → Project Settings → API**:

```bash
cp .env.example .env
```

| Variable | Where to find it |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` key |

Both must keep the `EXPO_PUBLIC_` prefix (Expo inlines them into the bundle).

## 4. Supabase setup

### 4a. Run the migrations (in order)

The migrations are **not** auto-applied. Run each file in
`supabase/migrations/` **in filename order** in the Supabase **SQL Editor**
(paste + run), or with the Supabase CLI (`supabase db push`):

1. `20260515120000_init_schema.sql` — PostGIS, tables, enums, indexes, RLS, `nearby_deals()`
2. `20260515121000_deal_details.sql` — `deal_details()`
3. `20260515122000_search_deals.sql` — `search_deals()`
4. `20260515123000_merchant.sql` — `setup_merchant_store()` + `deal-images` storage bucket
5. `20260517000000_realtime.sql` — adds `deals` to the Realtime publication
6. `20260517010000_analytics.sql` — write-only `analytics_events`

> The migrations are **one-shot** (the enum/type creates are not idempotent).
> Run them on a clean project.

### 4b. Auth settings (Authentication → Providers / Settings)

- **Enable "Allow anonymous sign-ins"** — consumers get an anonymous user so
  saved deals work without a login.
- **Enable the Email provider** — merchants sign in with an email OTP code.
- The default Supabase email template already includes the `{{ .Token }}`
  code; if you've customized it, make sure the **6-digit token** is present
  (this app uses the code flow, not a magic link).

### 4c. Realtime

Make sure **Realtime** is enabled for the project (default on). Migration #5
adds `public.deals` to the publication; Realtime respects RLS, so anonymous
subscribers only receive `status = 'active'` deals.

### 4d. Storage

Migration #4 creates the public `deal-images` bucket and its policies — no
manual step needed. Confirm it exists under **Storage**.

### 4e. (Optional) Regenerate typed schema

`types/database.ts` is hand-authored to match the migrations. Once your
project exists you can regenerate it from the live schema:

```bash
# edit the project ref in the package.json "gen:types" script first
npm run gen:types
```

## 5. Run

```bash
npm run start
```

Scan the QR with Expo Go (iOS: Camera; Android: in-app scanner), or press
`a` / `i` for an emulator. On locked-down networks use `npx expo start --tunnel`.

## 6. Project structure

```
app/                 Expo Router routes
  (tabs)/            Home / Search / Saved
  deal/[id].tsx      Deal detail
  merchant/post.tsx  Merchant auth → store setup → post
components/           Reusable UI (cards, chips, skeletons, error boundary)
hooks/                useLocation, useNow, useRealtimeDeals, useMerchantSession…
lib/                  supabase client, queries, merchant, geo, time, analytics
supabase/migrations/  SQL (run manually — see §4a)
types/database.ts     Generated-shape DB types
```

## 7. Smoke test checklist

Run these manually on a device against a project with the migrations applied
and at least one merchant store + a few active deals:

**Consumer**
- [ ] First launch prompts for location; granting shows the nearby feed.
- [ ] Denying location shows the manual city-entry fallback; entering a city loads deals.
- [ ] Feed cards show store, title, distance, category, and a countdown.
- [ ] A deal expiring < 2h has a red accent/pill; < 24h amber.
- [ ] Changing the radius / category chips refilters the feed.
- [ ] Pull-to-refresh reloads the feed.
- [ ] A loading feed shows shimmer skeletons (not a spinner).
- [ ] Tapping a card opens detail with description, terms, address, hours, exact expiry.
- [ ] "Get Directions" opens Google Maps to the store.
- [ ] "Save" toggles instantly (optimistic) and persists; Share opens the share sheet.
- [ ] Search tab: typing ≥2 chars returns title/store matches.
- [ ] Saved tab: saved deals appear; an expired saved deal shows an "Expired" state (not hidden).

**Merchant** (Saved tab → "Merchant? Post a deal →")
- [ ] Email → receive code → verify signs you in.
- [ ] First time: store setup geocodes the address and saves.
- [ ] Returning: lands straight on the post form.
- [ ] Typing a title + tapping "Post deal" creates a live deal in well under 15s.
- [ ] Optional photo picks and uploads; the image shows on the consumer detail.

**Realtime**
- [ ] With the feed open on device A, post a nearby deal from device B (or another account) — it slides into the top of A's feed.
- [ ] Leave a short-expiry deal on screen until it expires — it fades out.

**Resilience**
- [ ] Unknown route (e.g. a stale deep link) shows the friendly "Page not found".
- [ ] Killing network mid-use shows friendly error states, not crashes.

## 8. Known limitations (MVP)

- One device can be either an anonymous consumer **or** a signed-in merchant at
  a time; a "save" while a merchant is signed in attaches to the merchant user.
- Deals don't get a DB `status='expired'` flip (no scheduled job); expiry is
  enforced by query-time filters and the client clock.
- `store.hours` is a single free-text string under `{ "text": ... }`.
- Analytics is a write-only Supabase table; inspect it via the SQL editor.

Out of scope for the MVP: push notifications, redemption/payments, ratings,
social, multi-city, moderation dashboard, web, dark-mode theming, i18n.
