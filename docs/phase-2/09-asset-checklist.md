# Asset checklist

Every real asset the site needs before it's fully launch-ready. Current
state noted for each — "Honest placeholder" means the site already
renders correctly without it; nothing is broken by its absence.

| Asset | Path / usage | Current state |
|---|---|---|
| Logo SVG | `components/Logo.tsx` (already vector, code-drawn — no separate file needed) | Done |
| Favicon | `public/favicon.svg` | Done |
| OG image | Auto-generated, `app/opengraph-image.tsx` | Done (code-generated, no manual asset needed) |
| Hero video | `public/videos/hero.mp4` (path referenced but currently forced off in `app/page.tsx`) | **Missing** — honest placeholder shown |
| Hero poster | `public/images/hero-poster.jpg` | Exists but is a French château — wrong market; not used. Needs a hospitality-appropriate replacement |
| Immediate Proof — before | Passed as `beforeSrc` prop, not yet wired | **Missing** — honest placeholder shown |
| Immediate Proof — after (video + poster) | Passed as `afterSrc`/`afterPoster` props, not yet wired | **Missing** — honest placeholder shown |
| Demo 01 — Bedroom (video + poster) | `public/videos/demos/bedroom.mp4`, `public/images/demos/bedroom-poster.jpg` | **Missing** — honest placeholder shown |
| Demo 02 — Exterior (video + poster) | `public/videos/demos/exterior.mp4`, `public/images/demos/exterior-poster.jpg` | **Missing** — honest placeholder shown |
| Demo 03 — Pool (video + poster) | `public/videos/demos/pool.mp4`, `public/images/demos/pool-poster.jpg` | **Missing** — honest placeholder shown |
| Demo 04 — Restaurant (video + poster) | `public/videos/demos/restaurant.mp4`, `public/images/demos/restaurant-poster.jpg` | **Missing** — honest placeholder shown |
| Instagram avatar | Social kit, not yet designed as a file | See Social Starter Kit doc — spec only, not published |
| Instagram post 01–03 | Social kit | See Social Starter Kit doc — spec only, not published |
| Founder photo | `public/images/founder.jpg` (used only by the currently-unused `About` component) | Placeholder path, component not in the live homepage |

## Priority order for filling these in

Matches brief §49: the four portfolio demos first (they're what actually
proves quality), then the Hero video/poster, then Immediate Proof, then
the social kit imagery — everything else is either already done or
doesn't block launch.
