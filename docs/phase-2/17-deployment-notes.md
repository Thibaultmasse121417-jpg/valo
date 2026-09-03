# Deployment notes

## Temporary Vercel preview (this phase)

The Vercel project was created by the owner directly on vercel.com
("Import Git Repository" from `Thibaultmasse121417-jpg/valo`), not from
this session — `api.vercel.com` is blocked by this environment's network
egress policy, so deployment could not be triggered from here directly.

- **Vercel project name:** `estalia`
- **Plan:** Hobby (free)
- **Framework preset:** Next.js (auto-detected)
- **No custom domain attached** — the site is reachable only at its
  auto-generated `*.vercel.app` URL(s), per the owner's explicit
  instruction not to publish to a definitive domain or make any
  purchase.
- The repo's default branch (`main`) is whatever Vercel deployed as
  "Production" on first import — that is not this phase's work.
  This phase's build lives on `claude/estalia-studio-website-fnepcl`,
  reachable as a **Preview Deployment** once a commit lands on that
  branch after the GitHub integration was connected (Vercel deploys a
  preview per branch/commit automatically once the repo is linked).

## Note for a future real launch

Once a domain is bought (see `12-domain-research.md`) and the naming
question is resolved (`16-trademark-clearance-prep.md`), promoting this
same Vercel project to a custom domain is a Vercel dashboard action
(Settings → Domains) — no code or redeploy needed for that step itself.
