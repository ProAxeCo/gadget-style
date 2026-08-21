# Gadget Style

Curated tech-gadget affiliate site for the Australian market —
[www.gadgetstyle.com.au](https://www.gadgetstyle.com.au). Amazon Associates
monetization, editorial curation in the spirit of Gadget Flow / Uncrate.

## Stack in one line

React 19 + Vite 7 + TypeScript + Tailwind 4, all product data in a single
file (`client/src/lib/data.ts`, no database), Express static server, deployed
on Vercel from `main` with build-time prerendering of every route.

## Prerequisites

- Node 20+
- pnpm (`corepack enable` gives you the pinned version)

## Everyday commands

```bash
pnpm install       # also self-enables the pre-commit data validator
pnpm dev           # dev server on http://localhost:3000
pnpm check         # typecheck + data validation — the CI gate
pnpm build         # full production build (check → sitemap → vite → prerender)
```

## The one rule

**`client/src/lib/data.ts` is the single source of truth** for products,
categories, and blog posts. It is guarded by a validator (`pnpm check:data`)
that runs in the pre-commit hook, in CI, and inside every Vercel build —
broken data cannot reach production.

## Where to learn the rest

Read **[CLAUDE.md](CLAUDE.md)** — the full operating manual: data invariants,
ingestion pipelines (Gadget Flow / Tools and Toys), draft workflow, brand
asset tooling, deployment, and the design-system rules. It's written for both
humans and AI operators; everything in it exists because it was needed.

## Deploy

Push to `main` → GitHub CI validates → Vercel builds and deploys to
production. Docs-only commits skip the deploy.
