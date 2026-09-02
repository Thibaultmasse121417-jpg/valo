# Payment flow

## Decision

- **Estalia Test (£290, one-time):** direct checkout, via a **Stripe
  Payment Link**. Low price, low risk, one-time — no reason to make a
  first-time buyer go through a contact form before they can pay.
- **Estalia Content / Estalia Pro (recurring, £690–£1,290/month,
  3-month minimum):** **contact-first**, not direct checkout. A monthly
  subscription with a minimum commitment is a real decision for a hotel
  GM — it deserves a short exchange (confirm sector fit, align on
  creative direction, confirm start date) before a card is charged. This
  also avoids the classic B2B-SaaS mistake of surprise-billing someone
  who clicked a pricing card without meaning to commit.

This matches the brief's instruction to decide, not build a custom
checkout, and to use Stripe Payment Links where a direct checkout is
warranted.

## What's implemented now

`data/config.ts` carries `payment.testCheckoutUrl` (currently empty).
`components/Offers.tsx`: the Estalia Test tier's "Start with Estalia"
button opens `payment.testCheckoutUrl` in a new tab **only if it's set**;
otherwise it falls back to `#contact`, identically to Content and Pro.
Nothing is ever a dead link, and nothing changes behaviour until the
owner actually creates a Payment Link.

## What the owner needs to do (cannot be done from here — no Stripe
account access, and creating a live payment link is a real financial
action outside this session's authorisation)

1. Create a Stripe account (or use an existing one) with GBP as a
   supported currency.
2. Create a one-time Payment Link for "Estalia Test" at £290, with a
   product description matching the pricing copy ("1 cinematic Hero, 2
   short variants, 1 revision round").
3. Paste that Payment Link URL into `data/config.ts` →
   `payment.testCheckoutUrl`. The Test tier's CTA switches over
   automatically — no other code change needed.
4. Set Stripe's post-payment redirect/confirmation to point back to the
   site (or at minimum, to send an automatic receipt email) so a buyer
   isn't left wondering whether it worked.
5. Decide, before turning this on, who gets notified when a Test payment
   comes in and how — this needs to reach the same place a contact-form
   submission does (see Onboarding Flow doc) so no paid order is missed.

## Content/Pro: not wired to checkout, and shouldn't be

Their "Start with Estalia" buttons point to `#contact`, pre-filling the
sector field to "Hotel" on the homepage. Once someone submits, the
onboarding flow (next document) takes over.
