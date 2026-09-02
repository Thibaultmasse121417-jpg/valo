# Launch checklist

Per the brief's launch gate: prospecting to the first 25 hotels does not
start until every row below is checked.

| # | Item | Status |
|---|---|---|
| 1 | Domain works | ☐ Not started — see Domain research doc, needs owner decision + purchase |
| 2 | Professional email works | ☐ Not started — needs the domain first; `hello@` convention already set in code |
| 3 | Homepage works | ✅ Built, typed, builds clean, zero console errors on desktop + mobile |
| 4 | Mobile works | ✅ QA'd on a 390×844 (iPhone-class) viewport — hero, menu, portfolio, pricing, FAQ, contact all verified |
| 5 | At least 4 strong demos exist | ☐ Not started — blocked on image/video generation credits; prompts are ready (see Generation Prompts doc) |
| 6 | CTA works | ✅ Every CTA resolves to a real destination (`#contact`, `#work`, `#how-it-works`, or a future Stripe link) — nothing dead |
| 7 | Payment/contact flow works | ✅ Contact form is live and tested (Formspree). ☐ Stripe Payment Link for Test not yet created (owner action) |
| 8 | Onboarding works | 🟡 Documented (see Onboarding Flow doc); the "manual copy into Estalia Ops CRM" step is a real, if manual, process — works, but relies on the owner doing it consistently |
| 9 | Legal minimum exists | 🟡 Legal notice + Privacy policy exist in English, honest `[ ]` placeholders for company details — needs the owner's real company info, and neither has had a solicitor's review |
| 10 | Estalia Ops CRM works | ✅ Delivered in the prior phase; connected here only by a manual step (see Onboarding Flow doc) |

**Legend:** ✅ done · 🟡 works but needs owner follow-through · ☐ not
started, needs owner action outside this session's authorisation.

## What to touch, and where, for the most common post-launch edits

| Task | File |
|---|---|
| Change any homepage copy (EN or FR) | `data/content.ts` |
| Change a price or a tier's deliverables | `data/content.ts` → `offers.tiers` |
| Add the Stripe Payment Link once created | `data/config.ts` → `payment.testCheckoutUrl` |
| Change contact email / social links | `data/config.ts` |
| Add a real portfolio demo | drop the file at the exact path already referenced in `data/projects.ts` — the placeholder disappears automatically for the portfolio grid; Hero/Immediate Proof need a small manual flag change (see Portfolio Plan doc) |
| Add/replace a legal page's real company details | `app/mentions-legales/page.tsx`, `app/confidentialite/page.tsx` — replace each `[ bracketed ]` field |

## Before the first outbound email goes out

- [ ] Send yourself a real test enquiry through the live contact form
  end to end, confirm it lands in Formspree and gets copied into Ops CRM.
- [ ] If the Test Stripe link is live, run one real £290 test transaction
  yourself (refundable) to confirm the whole path works before a
  prospect ever sees it.
- [ ] Re-run the mobile QA pass once real portfolio video exists — video
  load/autoplay behaviour is worth re-checking with real file sizes.
