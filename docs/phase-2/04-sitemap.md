# Sitemap

Per the brief: primarily one premium landing page, not a 20-page site.

```
/                       Homepage (the sales page — see wireframe doc)
                          #work        (portfolio anchor)
                          #how-it-works
                          #pricing
                          #faq
                          #contact

/mentions-legales       Legal notice + Terms of service (English)
/confidentialite        Privacy policy (English)

/real-estate            Existing vertical landing page (kept, not part of hospitality launch)
/wedding-venues         Existing vertical landing page (kept, not part of hospitality launch)
/business               Existing vertical landing page (kept, not part of hospitality launch)
/hospitality            Existing vertical landing page — NOT linked from nav or homepage
                         at launch; the homepage IS the hospitality pitch. Kept in the
                         repo for a possible future paid-traffic landing page, out of
                         primary navigation so the launch reads as hospitality-first,
                         not "one of four verticals."

/opengraph-image        Generated share image (next/og)
/twitter-image          Generated share image (next/og)
/sitemap.xml            Auto-generated
/robots.txt             Auto-generated
```

## Explicitly not built (brief §40)

Blog, academy, client portal/dashboard, CMS, 20 case studies, chatbot,
login, mobile app, multilingual routing (FR exists as a client-side
toggle for the founder, not separate indexed URLs), affiliate program.

## Nav vs. footer

- **Header nav** (brief-capped at 5 + CTA): Work · How it works · Pricing
  · FAQ · Contact, plus a language toggle and a "Start" CTA.
- **Footer**: logo + signature line, the three other verticals (kept
  visible only on the homepage, since they're a real, if secondary, part
  of the business), the same in-page nav anchors, contact email +
  Instagram/LinkedIn, copyright + Legal notice + Privacy policy.

## A note on `/real-estate`, `/wedding-venues`, `/business`, `/hospitality`

These four vertical pages predate this phase and are not part of the
hospitality launch brief — they're left in place because deleting working
pages wasn't asked for and they cost nothing while unlinked from primary
navigation. `/hospitality` in particular now significantly overlaps with
the homepage; once real hospitality demo assets exist, consider either
retiring `/hospitality` or repurposing it as a dedicated paid-traffic
landing page variant of the homepage.
