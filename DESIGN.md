---
name: Dibs
description: A neighborhood-coded mobile design system on a late-night surface.
colors:
  last-call-red: "#ef4444"
  twilight-amber: "#f59e0b"
  after-hours-navy: "#0f172a"
  menuboard-cream: "#f7eedd"
typography:
  display:
    fontSize: "96px"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  sharp: "4px"
  soft: "8px"
  generous: "12px"
  card: "16px"
  pill: "9999px"
spacing:
  tight: "8px"
  base: "16px"
  generous: "28px"
  hero: "56px"
components:
  button-primary:
    backgroundColor: "#ffffff"
    textColor: "{colors.after-hours-navy}"
    rounded: "{rounded.sharp}"
    height: "56px"
    typography: "{typography.title}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "#ffffff"
    rounded: "{rounded.sharp}"
    height: "56px"
    typography: "{typography.title}"
  button-pill:
    backgroundColor: "#ffffff"
    textColor: "{colors.after-hours-navy}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
    typography: "{typography.title}"
  input-form:
    backgroundColor: "#1e293b"
    textColor: "#ffffff"
    rounded: "{rounded.soft}"
    padding: "16px"
    typography: "{typography.body}"
  input-search:
    backgroundColor: "#1e293b"
    textColor: "#ffffff"
    rounded: "{rounded.generous}"
    padding: "12px 16px"
    typography: "{typography.body}"
  card-feed:
    backgroundColor: "#ffffff"
    rounded: "{rounded.card}"
    padding: "16px"
  chip-selected:
    backgroundColor: "#ffffff"
    textColor: "{colors.after-hours-navy}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  chip-unselected:
    backgroundColor: "transparent"
    textColor: "#cbd5e1"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
---

# Design System: Dibs

## 1. Overview

**Creative North Star: "The Late-Night Menuboard"**

Picture the storefront window of a wine bar at 7:14pm on a quiet weekday: deep navy sky, warm light spilling out, hand-set chalk on dark slate listing the night's specials. That's the visual surface Dibs lives on. The dark canvas (`after-hours-navy`) is the storefront glass. The cream display ink (`menuboard-cream`) is the chalk. The urgency palette (`last-call-red`, `twilight-amber`) is the live, lit-from-inside signal that something is happening now. Everything else gets out of the way.

The system is dual-surface by design. Nav-level screens (feed, search, saved, auth) sit on the dark menuboard. Content-detail screens (deal detail) flip to a light bone-paper surface, the way you'd pull a card off the board to read its fine print. This isn't a theme toggle. It's a deliberate two-room layout: the bar floor is dark and atmospheric; the booth where you read the menu is bright.

What this system explicitly rejects: the Groupon coupon-clutter aesthetic (crossed-out prices, ENDS IN 2:14:32 red banners, alarm-coded scarcity); the Yelp / Foursquare identical-card-grid template (icon + heading + 4.3 stars, repeated endlessly); generic dark-mode SaaS landings (slate + teal + feature grid); TikTok-style high-motion consumer-feed overlays (neon gradients, autoplay video, scroll-jacking). Restraint is the discipline; restraint **without intent** would still land in the saturated 2026 consumer-marketplace lane, so the type does the distinctive work.

**Key Characteristics:**

- Two-surface system (dark menuboard + light booth), one urgency palette, one brand-voice color.
- Display type carries the brand; the system is typography-first, image-second.
- Urgency colors are reserved for live time-pressure states. They are not the brand voice.
- Flat by default. No shadows. Depth comes from surface contrast and tonal layering.
- Mobile-native: thumb-zone CTAs, 44pt touch targets, motion limited to state feedback.

## 2. Colors: The Menuboard Palette

The custom palette is four tokens carrying explicit roles. The slate scale (Tailwind built-in) is the working neutral; it's the wood-grain everything sits on.

### Primary

- **Menuboard Cream** (`menuboard-cream`, #f7eedd, `oklch(95% 0.025 80)`). The brand voice color. Used only for display type on brand surfaces (landing hero, future marketing copy). The cream warmth distinguishes brand voice from utility white; it reads as "ink on paper" rather than "screen text". Never used inside the product as a state or chrome color.

### Secondary (Urgency Palette, product-internal only)

- **Last-Call Red** (`last-call-red`, #ef4444, `oklch(63% 0.22 25)`). Fires when a deal expires in less than two hours. Appears as countdown chip background (with white text) and as time-left text on the deal detail. Loud by design.
- **Twilight Amber** (`twilight-amber`, #f59e0b, `oklch(75% 0.18 70)`). Fires when a deal expires today (under 24h). Same countdown-chip + time-left applications. Quieter than red, still attention-shaped.

### Neutral

- **After-Hours Navy** (`after-hours-navy`, #0f172a, slate-900). The dark surface canvas. Used for the app shell on every nav-level screen (feed, search, saved, auth, landing) and the tab bar background. The single most-used color in the system.

The slate scale carries the rest of the working tonal range. Roles to remember:

- **Closed-Sign Slate** (slate-900, #0f172a). Primary text on light surfaces. Primary CTA fill on light surfaces (deal-detail "Get Directions").
- **Storefront Slate** (slate-800, #1e293b). Input field background on dark surfaces.
- **Streetlamp Slate** (slate-700, #334155). Outlined-button border on dark surfaces. Mid-tone body text on light surfaces.
- **Off-Duty Slate** (slate-500/600, #64748b / #475569). Placeholder text, tertiary copy, secondary copy on light surfaces.
- **Sidewalk Slate** (slate-400, #94a3b8). Secondary body on dark surfaces, section labels.
- **Curb Slate** (slate-300, #cbd5e1). Unselected-chip text, dimmed states.
- **Bone Paper** (slate-100, #f1f5f9). Light-surface divider, image placeholder fill, button-pill backgrounds.

### Named Rules

**The Urgency-is-Not-Voice Rule.** `last-call-red` and `twilight-amber` carry product state, not brand identity. They appear on countdown chips and time-left labels inside the app. They never appear on landing pages, marketing copy, or any screen whose job is to establish what Dibs *is*. Promoting them to brand accent collapses Dibs into the Groupon lane.

**The Two-Room Rule.** Dark surfaces and light surfaces are explicit, not theme-toggles. Nav-level screens (where the user is moving through the app) sit on `after-hours-navy`. Content-detail screens (where the user is reading a single deal carefully) flip to white with slate-900 type. Don't half-room: no dark with light cards, no light with dark sidebars.

## 3. Typography

**Display / Body Font:** Platform system sans (San Francisco on iOS, Roboto on Android). No custom font loaded. The system's distinctiveness comes from scale and weight contrast within a single family, not from font selection.

**Character:** The pairing reads casual and confident. The system runs on extreme weight contrast (300 vs 900 inside one heading), not on serif/sans drama. A friend's voice typeset at poster scale.

### Hierarchy

- **Display** (`font-black`, 96px, line-height 1, tracking-tight). Landing hero punchline only. Currently set as a two-line lockup with a `font-light` 24px qualifier line stacked above the 96px black punchline word. The size ratio is 4×, the weight gap is 600. Never used elsewhere.
- **Headline** (`font-extrabold`, 30px / text-3xl, line-height 1.2, tracking-tight). Auth screen titles ("Welcome back", "Create account"). The most-recognizable heading shape across the app.
- **Title** (`font-extrabold`, 24px / text-2xl). Tab screen headers ("Dibs", "Search", "Saved") and deal-detail title. A tier below the auth heading.
- **Body** (`font-normal`, 16px / text-base, leading-6). Default running text. Capped at one line of marketing copy on landing; runs longer inside deal detail.
- **Body-Small** (`font-normal`, 14px / text-sm). Hints, errors, microcopy.
- **Label / Kicker** (`font-bold uppercase tracking-wide`, 12px / text-xs). Section labels inside deal detail ("Details", "Fine print", "Where"). Reserved for short headers above sub-blocks of content.

### Named Rules

**The One-Family Rule.** The system runs entirely on the platform sans. Don't load custom fonts, don't introduce a serif companion, don't reach for monospace as "developer-coded" texture. Hierarchy comes from weight (300, 400, 700, 800, 900) and size, not from family.

**The Display Lockup Rule.** When the landing display shape is used, it must be a two-element lockup: a quiet qualifier (`font-light`, ≤ text-2xl) above a heavy punchline (`font-black`, ≥ text-7xl). Both lines in `menuboard-cream`. Never set a one-line display heading at this scale; the prosody of qualifier-then-punchline is the entire move.

## 4. Elevation

The system is **flat by default**. No `box-shadow` exists anywhere in the codebase. Depth and grouping come from:

- **Surface contrast** between the dark canvas and the light deal-detail surface.
- **Tonal layering** on the dark canvas: `storefront-slate` inputs sit one step lighter than `after-hours-navy` background, marking them as interactive without a stroke.
- **Hairline dividers** (1px `border-slate-100` on light surfaces) marking the bottom-action-bar region on the deal detail.

### Named Rules

**The No-Shadow Rule.** Shadows are forbidden across the system. If something needs to feel raised, lighten its surface relative to the background or add a hairline border. Drop shadows on rounded rectangles is one of the named AI-slop tells; restraint here is brand-positive.

**The Hairline-Not-Tinted-Surface Rule.** When separating regions inside one surface (an action bar from the content above it), use a 1px slate-100 (light) or slate-800 (dark) border. Don't tint the lower region a different shade; the tonal step reads as a missing component, not a separator.

## 5. Components

### Buttons

The button vocabulary is three shapes, role-coded:

- **Primary (committed action).** Filled white on dark surface, filled `closed-sign-slate` on light. `rounded` (4px corners). `h-14` (56px). `font-semibold text-base` label. Active state: `scale-[0.98] opacity-90`. Used for: Sign up, Log in, Continue, Create account, Get Directions. The committed sharp corner reads as conviction.
- **Secondary (outlined).** Transparent fill, `border-streetlamp-slate` (slate-700 on dark, slate-300 on light), white text on dark. Same `rounded` and `h-14` as primary. Active state: `opacity-60`. Used for the second of two stacked CTAs.
- **Pill (light action).** `rounded-full`, `bg-white` on dark or `bg-bone-paper` on light, `px-5 py-2`. Used for inline ad-hoc actions: "Try again", "Use GPS", "Search", "Share", Save toggle. Reads as a lighter touch than a primary CTA.

### Chips

Multi-select filter chips on the home feed.

- **Selected.** `bg-white text-closed-sign-slate`, `border-white`, `rounded-full`, `px-3 py-1.5`, `font-medium text-sm`.
- **Unselected.** `bg-transparent text-curb-slate` (slate-300), `border-streetlamp-slate` (slate-600), same shape. The state difference is fill, not border weight.

### Cards (feed)

- **Shape.** `rounded-2xl` (16px). White on the dark canvas; the card is the bright surface holding one deal.
- **Composition.** Two columns: 48px circular store-logo or initial-letter on the left, content stack on the right.
- **Internal padding.** `p-4` (16px).
- **State accent.** Currently expressed as a colored left-stripe (`border-l-4` urgency-coded). **This is a side-stripe-border violation of the shared design laws and should be refactored;** see Do's and Don'ts. Until refactored, the working surface treats it as legacy.

### Inputs

Two radii by context:

- **Form input.** `bg-storefront-slate` (slate-800), `text-white`, `rounded-lg` (8px), `px-4 py-4`. Used in auth screens. Error state adds a `border border-last-call-red`.
- **Search / merchant input.** Same fill and text, `rounded-xl` (12px), `px-4 py-3`. Slightly softer corners for a less form-shaped, more search-shaped feel.

### Navigation

- **Tab bar.** `after-hours-navy` background, `slate-800` top border, Ionicons. Active tint white (#ffffff), inactive tint slate-500 (#64748b). Three tabs: Home, Search, Saved.
- **Back / header chrome.** Either `‹ Back` text-link (slate-400, top-left of auth screens) or a 36px round chip (`h-9 w-9 rounded-full bg-slate-100` on light, `bg-slate-800` on dark). The chip lives at the top-left of deal detail and merchant flow; the text-link lives at the top-left of auth.

### Countdown Chip (Signature Component)

The pill that carries time-left state on every deal surface.

- `rounded-full`, `px-2.5 py-1`, `font-semibold text-xs`.
- Fill / text by urgency: `last-call-red` + white when expiring in <2h; `twilight-amber` + white when expiring same-day; `bone-paper` + slate-700 when normal; `slate-200` + slate-600 when expired.
- The chip is the canonical use of the urgency palette. Anywhere else the urgency palette appears, double-check it isn't decorative.

## 6. Do's and Don'ts

### Do:

- **Do** use `menuboard-cream` (#f7eedd) only for display type on brand surfaces (landing hero, future marketing copy). Never as a chrome or state color.
- **Do** keep urgency colors (`last-call-red`, `twilight-amber`) on countdown chips and time-left labels inside the product. The Urgency-is-Not-Voice Rule.
- **Do** commit to the two-surface system: dark on nav-level, light on detail. No half-rooms.
- **Do** set the landing display as a two-element lockup (quiet qualifier + heavy punchline). The prosody is the move.
- **Do** use `rounded` (4px) for primary committed CTAs, `rounded-full` for light pill actions, `rounded-lg`/`rounded-xl` for inputs, `rounded-2xl` for content cards. Each radius means something; don't mix them by accident.
- **Do** keep buttons at `h-14` (56px) and touch targets ≥ 44pt. Add `hitSlop` on small text links.
- **Do** stay flat. No `box-shadow`. Depth through surface contrast and hairline borders.
- **Do** match active-state feedback to role: filled CTAs get `scale-[0.98] opacity-90`; secondary / text-link actions get `opacity-60`.

### Don't:

- **Don't** promote the urgency palette to brand accent. `text-soon` on the landing's hero word, an amber kicker, a red "limited time" headline — all violate PRODUCT.md Principle 3 and collapse Dibs into the Groupon lane.
- **Don't** ship Groupon, LivingSocial, RetailMeNot coupon-clutter aesthetic: crossed-out prices, "ENDS IN 2:14:32" red banner countdowns, alarm-coded scarcity. The countdown chip is the ENTIRE acceptable presence of countdowns.
- **Don't** build identical-card grids of icon + heading + 4.3-star rating (the Yelp / Foursquare / TripAdvisor template). The deal feed uses one card pattern intentionally; don't multiply card variants of the same shape.
- **Don't** drift into generic dark-mode SaaS landings: slate background + teal/purple accent + feature-grid below the fold. Wrong register.
- **Don't** layer high-motion overlays, neon-on-dark gradients, autoplay video, or scroll-jacking. The TikTok consumer-feed lane is misaligned with "real deals from real shops".
- **Don't** use `border-left` or `border-right` greater than 1px as a colored stripe on cards, list items, or alerts. The shared design laws ban this absolutely. **Note:** `components/DealCard.tsx:42` currently violates this with `border-l-4` urgency-coded; refactor to a full hairline border + a leading countdown chip carrying the urgency color instead.
- **Don't** use gradient text (`background-clip: text` with a gradient). Solid colors only; emphasis through weight and size.
- **Don't** use glassmorphism (backdrop-blurred translucent cards) as decoration. Rare and purposeful or nothing.
- **Don't** introduce a second font family by reflex. The platform sans is the system.
- **Don't** use em dashes anywhere in UX copy, comments, or commit messages. Use commas, colons, semicolons, periods, or parentheses.
- **Don't** add `box-shadow` to anything. The No-Shadow Rule. If something needs to feel raised, lighten its surface or add a hairline border.
