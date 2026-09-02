# Final stack decision

**Decision: keep the existing custom stack — Next.js 14 (App Router) +
TypeScript + Tailwind CSS + Framer Motion, deployed on Vercel.** Not
Shopify, not Framer, not Webflow.

This isn't a default — it's evaluated against the brief's own criteria.

## Why not Shopify

Shopify is an e-commerce catalogue engine. Estalia sells a **service**
(a monthly content subscription and a one-time entry package), not a
catalogue of physical or digital products with variants and inventory.
Forcing a service business through Shopify's product/cart/checkout model
adds real friction (products-as-a-workaround, no natural place for a
qualification-first contact flow) for zero benefit — the brief explicitly
warns against defaulting to Shopify here, and this evaluation agrees with
that warning on the merits, not just the instruction.

## Why not Framer / Webflow

Both are strong, fast ways to ship a marketing site with no engineer.
Neither is the right call *here*, for one concrete reason: **the site
already exists, in this exact stack, built to this exact brief.**
Migrating a finished, QA'd, editorial-quality Next.js site into Framer or
Webflow would mean re-building every component (the honest media
placeholder system, the bilingual content layer, the scroll-reveal
system, the multi-vertical landing page template) from scratch, in a
tool with less control over exactly the kind of restrained, custom motion
this brand needs — for a site that is, as of this phase, feature-complete
and already meets the brief's mobile/performance/SEO bar.

Where Framer/Webflow *would* have won, on a blank slate: zero-engineer
editing for a non-technical founder, and faster time-to-first-page. Both
matter less here because (a) there is no blank slate — reversing three
weeks of build to save a few days makes no sense — and (b) the codebase's
own editing model (typed content files, one honest placeholder component,
one config file for contact details) is already close to "edit a value,
not a component" for the changes a non-technical founder will actually
need to make post-launch (swap a video, change a price, edit FAQ copy).

## Scorecard against the brief's stated criteria

| Criterion | Next.js (current) | Framer | Webflow | Shopify |
|---|---|---|---|---|
| Speed to launch | Already built | Would require a full rebuild | Would require a full rebuild | Would require a full rebuild + wrong model |
| Visual quality / control | Full control, custom motion | Good, some constraints | Good, some constraints | Poor fit for editorial content |
| Video handling | Custom lazy-load + honest placeholder system already built | Native support, less custom control | Native support, less custom control | Not a video-first tool |
| Responsiveness | Hand-tuned per breakpoint, QA'd on real iPhone viewport | Strong out of the box | Strong out of the box | Adequate |
| Ease of future editing (non-technical) | Content in typed files; would benefit from a light CMS later (see Launch Checklist) | Best-in-class visual editing | Best-in-class visual editing | Best-in-class for products, wrong domain |
| Payment integration | Stripe Payment Links (external, zero build) — see Payment Flow doc | Native commerce add-ons | Native commerce add-ons | Best-in-class, wrong domain |
| Cost | Vercel free/hobby tier realistic at this traffic | ~$15–40/mo | ~$18–40/mo | ~$29+/mo + transaction fees |
| Maintenance | Standard Next.js/Vercel, well-understood | Vendor lock-in to Framer's runtime | Vendor lock-in to Webflow's runtime | Vendor lock-in + wrong domain model |

## The one real trade-off, named honestly

The founder cannot visually drag-and-drop edit this site the way they
could in Framer or Webflow. That's a genuine cost. It's mitigated by:
keeping all editable copy in `data/content.ts` (one file, plain English
strings, no code logic to break), all contact/brand details in
`data/config.ts`, and documenting exactly which files to touch for the
most common edits (see Launch Checklist). If, post-launch, the founder
finds they need to make frequent structural changes without engineering
help, that's the point to revisit — not before.
