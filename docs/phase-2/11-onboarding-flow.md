# Onboarding flow

Covers what happens after someone converts, and how the website connects
to the existing Estalia Ops CRM (built in the previous phase) — per the
brief, a manual link is an acceptable MVP; this is not a second,
independent commercial system.

## Path A — Contact form submission (all tiers pre-Test-checkout, and all
of Content/Pro)

1. Visitor fills the homepage contact form → submits to Formspree
   (`siteConfig.contactEndpoint`, already wired in `components/ContactForm.tsx`).
2. Formspree emails the founder directly with every field (name, company,
   email, phone, sector, property URL, message) — no code change needed
   for this to work, it's already live.
3. **Manual step (owner action):** the founder copies that enquiry into
   the Estalia Ops CRM as a new lead, sector = Hospitality, source =
   Website. This is the one manual link the brief allows for MVP —
   automating it (e.g. a Formspree → CRM webhook) is a good next step
   once volume justifies it, not a launch blocker.
4. Founder replies personally within 48 working hours (matches the site's
   own promise — `contactForm.responseTime` copy).
5. If the enquiry is for Content or Pro: a short call/exchange to confirm
   fit, align on creative direction and start date, then the CRM's
   existing onboarding sequence (from the Ops build) takes over —
   collecting source assets, confirming the monthly cadence, first
   delivery date.

## Path B — Estalia Test direct purchase (once Stripe Payment Link is
live — see Payment Flow doc)

1. Visitor pays via the Stripe Payment Link.
2. Stripe sends the founder a payment notification/receipt.
3. **Manual step (owner action):** founder adds the buyer to Estalia Ops
   CRM as a new Test client, and separately emails/messages them to
   request their source photos/video (name, email captured by Stripe
   checkout is enough to start this — Stripe's own checkout form asks
   for at least an email).
4. Once assets are received, production follows the existing Ops SOP:
   1 cinematic Hero + 2 short variants, 1 revision round, ~1 week
   turnaround (matches FAQ copy: "About a week for Estalia Test").
5. Delivery + a natural upsell moment into Content or Pro once the
   client has seen the quality first-hand — this is the commercial
   purpose of Test being priced as a low-risk entry point.

## Why manual, for now

Building a real webhook (Formspree → Ops CRM, or Stripe → Ops CRM)
is legitimate future work, but at zero-to-five-clients volume it would
cost more engineering time than it saves — a founder manually copying
2–3 leads a week into a CRM they already check daily is not a bottleneck.
Automate this once volume (not vanity) demands it.
