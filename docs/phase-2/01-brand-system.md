# Brand system

No brand rebuild was needed for this phase — the visual system already
built for Estalia (real estate/wedding launch) already satisfied the
Phase 2 brief's art direction almost exactly. This document records what
exists and what changed for the hospitality launch.

## Positioning

**Remote creative content studio.** Estalia turns the photos and video a
hotel already has into premium, social-native content — no new shoot, no
travel. Not a marketing agency, not an SEO/Ads agency, not a traveling
videographer, not a UGC agency.

Launch line (used as the footer signature and the working strapline):
**"Remote Creative Content Studio."**

## Logo

Wordmark: **ESTALIA** set in the editorial serif, with a small "STUDIO"
mark in tracked-out sans beside it. A monogram — a bordered square
containing a serif "E" — is used everywhere a full wordmark doesn't fit
(favicon, placeholder frames, social avatar). No pictorial symbol. See
`components/Logo.tsx`.

## Typography

Two families, both from Google Fonts, both variable-loaded via
`next/font` (no extra network request, no FOIT):

- **Bodoni Moda** (editorial serif) — headlines, section titles, prices.
  High-contrast, confident, closer to fashion/architecture press than the
  "romantic" serifs (Cormorant, Playfair) that read as generically
  AI/luxury by default.
- **Archivo** (grotesque sans) — body copy, nav, labels, form fields.
  More constructed and professional than Inter.

Scale stays large and confident at the top (4xl–6xl serif headlines),
small and quiet at the label level (11px uppercase, wide tracking).

## Colour

Six tokens, defined once in `tailwind.config.ts`:

| Token | Role |
|---|---|
| `noir` | Primary text / dark section backgrounds |
| `ivoire` | Primary background / light section text |
| `bronze` | Accent — badges, kickers, hover states, CTAs on dark |
| `noir/opacity variants` | Secondary text, borders |
| `ivoire/opacity variants` | Secondary text/borders on dark sections |

No blue, no gradient, no neon. The palette alternates whole sections
between `noir` and `ivoire` grounds rather than mixing many colours on one
surface — this is what keeps the site feeling editorial instead of
"dashboard."

## Texture & motion

- A very fine grain overlay (`.grain` utility) on dark sections avoids
  flat, sterile digital black.
- `TitleWipe`: headlines reveal left-to-right on scroll, once, like a film
  title card — never a bounce or a spin.
- `ScrollReveal`: a single quiet fade/rise, once per element.
- No parallax, no auto-playing background loops competing with real
  content, no cursor gimmicks.

## The honesty mechanic (`MediaPlaceholder`)

The single most important brand decision in the whole system: wherever a
real photo or video doesn't exist yet, the site shows an elegant,
on-brand placeholder (monogram, title, "Concept coming soon") instead of
a broken player or a stand-in image that could be mistaken for real work.
This is what lets the site launch honestly before any real client
portfolio exists, and it's why the current build has zero fake-looking
gaps despite having zero real demo footage yet.

## What changed for hospitality launch

Nothing in the visual system itself changed. What changed:

- Default language switched to English (was French) — see
  `lib/LanguageContext.tsx`.
- Footer signature line: "Cinematic Experiences" → "Remote Creative
  Content Studio" (the brief's own positioning line).
- Contact convention: `contact@` → `hello@`.
- Removed a placeholder French-format phone number from the footer — it
  read as unfinished/wrong-market for a UK launch, and a phone number
  isn't part of the brief's minimal footer spec anyway.

## The "would this sit next to a £300–£500/night hotel" test

Applied throughout: no stock-photo look, no dashboard chrome, no
gradient hero, no emoji, no rounded-everything SaaS card style. Pricing
is presented as an editorial choice (bordered panels, serif numerals),
not a three-tier SaaS pricing table.
