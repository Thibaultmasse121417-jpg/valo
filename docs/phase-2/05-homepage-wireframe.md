# Homepage wireframe

Section-by-section, in shipped order (`app/page.tsx`). Each row states the
section's one job (brief §39's conversion framework) and its current
state.

| # | Section | Component | Answers | State |
|---|---|---|---|---|
| 1 | Hero | `Hero.tsx` | *What is this?* | Copy final. Visual: honest placeholder (no video/poster yet — the old château poster was dropped as wrong-market) |
| 2 | Immediate Proof (before/after) | `ImmediateProof.tsx` (new) | *Does it work?* | Copy final. Both sides honest placeholders until a real demo pair exists |
| 3 | Portfolio (4 hospitality demos) | `SelectedFilms.tsx` + `hospitalityDemos` (new data) | *Is the quality good?* | Structure + copy final, labelled "Concept Study." Media: honest placeholders |
| 4 | Problem | `Manifesto.tsx` | *Why does this matter to me?* | Copy final |
| 5 | How it works (3 steps) | `Approach.tsx` | *Is it complicated?* | Copy final |
| 6 | Value proposition | `ValueProps.tsx` (new) | *Why care* (concretely) | Copy final |
| 7 | Pricing (Test / Content / Pro) | `Offers.tsx` (rewritten) | *How much?* | Copy + prices final. Test tier wired for a Stripe Payment Link once created (falls back to Contact) |
| 8 | Trust | `Trust.tsx` | *Can I trust a studio with no visible track record?* | Copy already hospitality-appropriate, no change needed |
| 9 | FAQ (6 Qs) | `FAQ.tsx` (new) | *What worries me?* | Copy final |
| 10 | Contact | `ContactForm.tsx` | *What do I do now?* | Existing component, sector pre-filled to "Hotel" on the homepage |
| — | Sticky CTA | `StickyCta.tsx` | Persistent low-friction path to Contact | Hides over Pricing and Contact so it never covers a section's own CTA |

## Sections removed from the homepage this phase

- **UniverseChooser** — was the "pick your vertical" selector from the
  previous multi-vertical homepage. Removed because the brief requires
  hospitality to dominate the launch, not read as one of several
  interchangeable verticals.
- **About** — generic founder bio block; not part of the brief's required
  structure, and its data (a placeholder French-format phone number) was
  stale. Left in the repo, unused, rather than deleted outright.

## Above-the-fold on iPhone (the brief's real test)

Confirmed via Playwright at a 390×844 viewport: the full headline,
subheadline, both CTAs ("See how it works" / "View our work") are visible
without scrolling — see Mobile QA notes in the Launch Checklist.
