# Portfolio plan

Four launch demos (brief's minimum), matching `data/projects.ts`
`hospitalityDemos`. Each is a **concept study** — a fictional, wholly
Estalia-owned establishment, never presented as a real client — so the
portfolio can go live before Estalia has a single real customer, without
touching anyone else's copyrighted photography (see the copyright rule
carried over from earlier phases).

| Demo | Source shot (fictional) | Result treatment | Tag |
|---|---|---|---|
| 01 — Bedroom | Boutique hotel bedroom, static wide shot, natural light | Slow cinematic room reveal — one continuous push, warm colour grade | Cinematic Hero |
| 02 — Exterior | Hotel façade, straight-on architectural photo | Slow architectural movement — subtle drift/parallax across the façade | Architectural Movement |
| 03 — Pool & Resort | Pool deck, midday or golden-hour still | Aspirational social reel — short cuts, movement-led, vertical-native | Social Reel |
| 04 — Restaurant | Table setting / dining room, static | Editorial dining content — close, tactile, slower pace than the pool reel | Editorial Dining |

A fifth and sixth (Spa/Wellness, Wedding/Venue) are in the brief as
optional extensions once the first four are live and credits allow —
not required for launch.

## Why four, and why these four

They cover the four rooms/spaces a boutique hotel GM actually has photos
of and actually needs content for (a room, the building, the pool, the
restaurant) — matching the ICP's real asset library, not a generic
showreel. Order in the grid alternates left/right (`align` field) purely
for visual rhythm.

## Production sequence (once Higgsfield credits are available)

1. Generate the four fictional source stills first (see Generation
   Prompts doc) — these become the "before" side of the Immediate Proof
   section too, so they need to look like genuine, ownable photography,
   not an obvious AI render.
2. Generate the four video transformations from those stills.
3. Drop files into `/public/videos/demos/*.mp4` and
   `/public/images/demos/*-poster.jpg` using the exact filenames already
   referenced in `data/projects.ts`. **For the portfolio grid only**, the
   honest placeholder disappears automatically the moment a real file
   exists at that path (see `lib/media.ts`'s `mediaExists`) — no code
   change needed there.
4. The **Hero** and **Immediate Proof** sections work differently: their
   media flags (`hasHeroVideo`/`hasHeroPoster` and
   `hasBefore`/`hasAfter`/`hasAfterPoster`) are hardcoded booleans in
   `app/page.tsx`, deliberately not auto-detected, because those two
   spots are the most visible on the page and deserve a deliberate
   choice of exactly which asset to feature rather than "whatever file
   happens to exist first." Once real assets are ready, flip those flags
   to `true` and add the matching `src` paths by hand.
5. Re-run the Playwright QA pass (`scratchpad` script referenced in the
   final report) once real media is in — placeholders and real video have
   different aspect/loading behaviour worth re-checking.

## What "excellent" means here (brief §49 priority #1)

Preserve real architecture: walls, windows, doors, furniture, materials,
proportions and lighting must match the source photo exactly. No invented
furniture, no morphing geometry, no warped windows, no CGI look, no
unrealistic people. Camera motion stays slow, single-direction, editorial
— never a whip pan, never excessive parallax. This is what keeps a demo
credible next to a real £300–£500/night property rather than reading as
an AI showcase.
