# Analytics plan

The brief asks for simple event measurement, not a full analytics stack.
**Not yet implemented in code** — this is the plan to wire up, sized to
take under an hour once the owner picks a tool.

## Recommended tool

**Vercel Analytics** (or Plausible as a privacy-first alternative) —
both are a single script tag / package install, no cookie banner needed
for the anonymous-aggregate approach described in the privacy policy
(`app/confidentialite/page.tsx` already states no tracking cookies are
used — keep that true by not reaching for GA4's default cookie-based
tracking).

## Events to track

| Event | Fires when | Why it matters |
|---|---|---|
| `homepage_visit` | Page load on `/` | Baseline traffic |
| `portfolio_interaction` | A demo card is opened/clicked in the `#work` section | Confirms the portfolio is actually being looked at, not just scrolled past |
| `pricing_view` | `#pricing` section enters the viewport | Confirms visitors reach the price before leaving |
| `cta_click` | Any "Start with Estalia" / "Start" / "See how it works" click, tagged with which one | The core conversion signal — which CTA and where |
| `contact_submit` | Contact form success state | Real lead count |
| `test_purchase` | Stripe Payment Link redirect/webhook (once wired — see Payment Flow doc) | Real revenue-generating conversion |

## Implementation notes

- Fire events client-side from the existing components — most of the
  hook points already exist as component boundaries (`Offers.tsx`'s CTA
  buttons, `ContactForm.tsx`'s `status === "success"` branch,
  `SelectedFilms.tsx`'s card open). This is a small, additive change,
  not a refactor.
- `portfolio_interaction` and `pricing_view` are best done with the same
  `IntersectionObserver` pattern already used in `StickyCta.tsx` — no
  new dependency needed.
- Keep the event list to these six. Resist the urge to add more once the
  tool is wired in — more events than the brief asked for is exactly the
  kind of over-building §40 warns against.
