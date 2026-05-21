# Product

## Register

product

## Users

Two audiences with very different jobs.

**Consumers (primary).** People in a neighborhood who want to find deals they didn't know existed: bakery markdowns, happy-hour pours, late-night kitchen runs, slow-Tuesday discounts. Mobile, on-the-go, often deciding in the next 30 minutes where to spend the next 30 minutes. Job to be done: *turn an ordinary outing into a small win; surface things nearby I'd never have found on my own.*

**Merchants (secondary).** Independent shop owners (bakeries, bars, kitchens, cafes) posting time-sensitive deals to move inventory before close or fill seats on a quiet shift. Often older and less mobile-native than the consumer audience. Job to be done: *post a deal in under a minute and see it land in the feed without thinking about it again.*

## Product Purpose

Connect locals to the time-sensitive deals their neighborhood already has. The win-state for a consumer is "I found something good I didn't know about." The win-state for a merchant is "I moved inventory I would have written off." Success looks like real foot traffic between real shops and real neighbors, not gamified taps on shock-red countdown banners.

## Brand Personality

Playful, casual, alive. Voice of a friend pointing things out, not a marketing department announcing them. Energetic without being juvenile. Confident enough to surprise the consumer with what's around the corner, warm enough never to alarm them. Time pressure is real and woven through the product, but it stays as wallpaper, never the megaphone.

## Anti-references

Lanes to actively avoid:

- **Groupon, LivingSocial, RetailMeNot.** Coupon-clutter aesthetic: crossed-out prices, "ENDS IN 2:14:32" red banner countdowns, alarm-coded scarcity, scammy-sale energy. Dibs is not a daily-deals coupon site, and the urgency palette must never imitate this lane.
- **Yelp, Foursquare, TripAdvisor category cards.** Identical rounded-card grids of icon + heading + 4.3★ rating, repeated endlessly. Kills the hand-picked, neighborhood-friend feel.
- **Generic dark-mode SaaS landings.** Slate background + teal/purple accent + feature-grid below the fold. Wrong register for a consumer-local product.
- **TikTok-style high-motion overlays.** Neon-on-dark gradients, full-bleed video heroes, aggressive scroll-jacking. Reads as teen entertainment, misaligned with "real deals from real shops."

## Design Principles

1. **Discovery over alarm.** A deal is a find, not a fading window. Time pressure exists in the system, but it never out-shouts the deal itself. No shock-red countdown banners; no Groupon timers; no "act now or miss it" as the first-impression. The dominant first feeling is *"huh, I didn't know about that"* — never *"hurry."*

2. **One friend, not a marketing department.** Copy speaks at human scale, second-person, casual but not slangy. ("Pints at five" over "Limited-time draft event!") Real shop names and real neighborhood detail carry more brand weight than any generic tagline.

3. **The urgency palette is a tool, not the voice.** `soon` amber and `urgent` red exist for live time-pressure states *inside the product* (a deal with 12 minutes left earns attention). They are not the brand accent. Don't promote them to the brand voice on landing/marketing surfaces; doing so collapses Dibs into the Groupon lane.

4. **Show the thing, not the metaphor.** Where imagery belongs (deal detail, merchant pages, feed cards eventually), it should be the actual food, the actual bar, the actual neighborhood block, never icon-and-headline marketing tiles or stock photography of generic "happy diners."

5. **Thumb-native, no theatrics.** Primary CTAs live in the bottom third of the screen. Touch targets hit 44pt minimum. Motion is restrained: state transitions and feedback only, no scroll-jacking, no autoplay video, no entrance choreography for its own sake.

## Accessibility & Inclusion

No formal WCAG target locked yet. Build to AA implicitly: 4.5:1 text contrast for body, 3:1 for large display, 44pt minimum touch targets, color is never the sole signal for urgency state (always paired with text or shape). Respect `prefers-reduced-motion` where motion exists. Revisit when a real user need or stakeholder requirement arrives.
