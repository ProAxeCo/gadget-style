# Gadget Style — working notes

This file codifies the rules of the repo. If you (human or AI) are about to add
products, change data, or deploy, read this first. Every rule here exists
because it was already broken once.

## Project in one paragraph

Gadget Style is a static Amazon Associates affiliate site — styled after Gadget
Flow / Uncrate. All product, category, and blog data lives in a single file:
`client/src/lib/data.ts`. There is no database and no API. The Express server
in `server/index.ts` only serves the built SPA in production; Vite serves it in
dev. Amazon Associates tag: **`gadgetstyle01-20`**. Reference site for design
and product curation: https://thegadgetflow.com/.

## Stack

- React 19, Vite 7, TypeScript 5.6, Tailwind 4, shadcn/ui, wouter (routing),
  Express (static file server only). pnpm for packages.
- `client/` — SPA source (pages, components, contexts, lib/data.ts).
- `server/` — 30-line static file server. Do not add API routes here without a
  very good reason; the site is intentionally static.
- `shared/` — tiny cross-cutting constants.
- `scripts/` — data maintenance tooling (validator, image mirror, URL fixer).

## The invariant set (enforced by `pnpm check:data`)

`scripts/validate-data.ts` is the source of truth. It errors on:

- **ASIN format** — must match `/^B0[A-Z0-9]{8}$/` (10 chars).
- **Affiliate URL consistency** — the ASIN embedded in `affiliateUrl`'s path
  must equal the `asin` field. Non-compliant URLs are automatically fixed by
  `scripts/fix-affiliate-urls.ts`, which rebuilds the URL as
  `https://www.amazon.com/dp/<ASIN>?tag=gadgetstyle01-20`.
- **Affiliate tag** — every URL must carry `tag=gadgetstyle01-20`. Any other
  tag (including `thegadgetflow-20`, `gadgetstyle-20`) is a bug.
- **Image host** — images must be either site-local paths (`/images/...`) or
  on a durable host in `DURABLE_IMAGE_HOSTS` inside the validator.
  `files.manuscdn.com` is hard-error (ephemeral, will 404). Any unknown host
  is a warning — review and either move to the durable list or mirror.
- **Uniqueness** — `id`, `slug`, category-slug are all unique. Duplicate
  `asin` is a warning because it usually means two entries point to the same
  Amazon product (or someone faked an ASIN).
- **Category productCount** must equal the actual count of products with that
  `categorySlug`. If you add a product, update the count — or the build fails.
- **Slug format** — `/^[a-z0-9-]+$/`. No colons, en-dashes, plus signs,
  percent signs, or dots. Derive from title by lowercasing and replacing
  anything else with a hyphen, then collapsing.
- **Price, rating, review counts, booleans** — basic type and range checks.
- **Blog posts** — unique slugs, valid image hosts.

Warnings do not fail the build. Errors do.

### Commands

- `pnpm dev` — Vite dev server on http://localhost:3000 (or whatever's free).
  Hot reload.
- `pnpm check` — typecheck + data validation. This is the CI gate.
- `pnpm check:data` — data validation only.
- `pnpm build` — production build to `dist/public`. **Runs `pnpm check` first
  and fails the whole build if it errors.** Vercel builds via this command, so
  a broken data state literally cannot reach production.
- `pnpm start` — serve the production build.
- `pnpm fix:urls` — canonicalize all affiliate URLs from each product's
  `asin` field. Idempotent. (`scripts/fix-affiliate-urls.ts`)
- `pnpm fix:counts` — auto-update category `productCount` to match the actual
  count of live products in each category. Self-healing; safe to run any time.
  (`scripts/fix-category-counts.ts`)
- `pnpm mirror:images` — download every external image referenced in data.ts
  to `client/public/images/mirrored/` and rewrite URLs. Idempotent.
  (`scripts/mirror-images.ts --apply`)
- `pnpm tsx scripts/mirror-component-images.ts` — same as above but for
  hardcoded URLs in component/page files (logos, backgrounds, hero assets).
- `pnpm sitemap` — regenerate `client/public/sitemap.xml` from data.ts.
  Runs automatically during `pnpm build`.
- `pnpm scrape:gf --url <gf-product-url>` — scrape a Gadget Flow product
  page: extract title, description, images, Amazon ASIN (resolves amzn.to
  shortlinks), or external buy URL (detected via `utm_source=GadgetFlow`).
  Output is written to `docs/gf-scrape-<timestamp>.json`.
- `pnpm scrape:gf --discover [--limit N]` — crawl GF's homepage, blog, and
  category pages for fresh product URLs not yet in our catalog, then scrape
  each. Default limit 20.
- `pnpm ingest:gf --file <scrape.json>` — promote scraped results into data.ts
  as drafts (`isDraft: true`). Dedupes against existing products by
  gadgetFlowUrl, slug, and ASIN. Then run `pnpm mirror:images` to localize
  the new images.
- `pnpm ingest:gf --url <gf-url>` — one-shot: scrape + ingest a single URL.
- `pnpm tsx scripts/patch-external-urls.ts` — re-scrape drafts whose
  externalUrl still falls back to the GF article page, replacing them with
  the real brand-direct URL (e.g. samsung.com, dyson.com).
- `pnpm tsx scripts/remove-products.ts <id> [id ...]` — delete products by id
  from data.ts. Followed by `pnpm fix:counts` to refresh category counts.
- `pnpm report:placeholders` — write `docs/placeholder-products.md` listing
  every product with a fabricated ASIN, zero price, or duplicate ASIN.
- `pnpm tsx scripts/flag-drafts.ts` — mark every product currently matching
  the placeholder criteria as `isDraft: true`. One-off; only run when
  you've added a batch of candidates from non-Amazon sources.
- `pnpm tsx scripts/generate-social.ts [--ids=1,2,3]` — produce
  `docs/social/pinterest.csv` and `docs/social/instagram.md` for every
  product (or a subset by id).

### The unbreakable chain

Three independent gates ensure broken data never reaches production:

1. **Build gate (primary):** `pnpm build` depends on `pnpm check`. Vercel's
   configured build command is `pnpm build`, so failing data = failed deploy.
2. **CI (secondary):** `.github/workflows/ci.yml` runs `pnpm check && pnpm build`
   on every push to `main` and every PR. Catches regressions even if someone
   bypasses the build locally.
3. **Local pre-commit (tertiary):** `.husky/pre-commit` runs `pnpm check:data`.
   Not auto-installed; enable once per clone with
   `git config core.hooksPath .husky` (or install husky). Optional because the
   first two gates are authoritative.

## Drafts

Products that aren't ready for public consumption — pre-launch items with no
real Amazon listing, unverified ASINs, missing prices — get `isDraft: true` in
data.ts. Effects:

- **Hidden from the live site:** all helpers in `client/src/lib/data.ts`
  (getProductBySlug, getProductsByCategory, getFeaturedProducts,
  getTrendingProducts, getNewProducts, searchProducts) filter drafts out.
- **Exempt from strict validation:** drafts don't need a valid 10-char ASIN,
  a non-zero price, or a matching `/dp/<ASIN>` URL. They still need a slug,
  title, description, category, and at least one image.
- **Don't inflate category counts:** category `productCount` reflects live
  products only.
- **Stay in source:** drafts are fully present in `data.ts` and can be
  promoted to live by deleting the `isDraft: true,` line. No data loss.

To find all current drafts: search data.ts for `isDraft: true`. Alternatively,
`pnpm report:placeholders` regenerates the triage report.

## How to add products (two paths)

### Path A — single Amazon product (manual)

1. **Find the Amazon listing.** Copy the ASIN from the URL — the 10-char code
   after `/dp/`. If the product isn't on Amazon, use **Path B** below instead.
2. **Copy one of the nearby products** in `data.ts` as a template. Use the
   next unused `id`.
3. **Fill in the fields:**
   - `title` — full manufacturer title.
   - `slug` — lowercase, hyphens only, no punctuation.
   - `description` — 40+ chars; 200+ is better. Write for readers, not SEO.
   - `price` — current Amazon price, plain number. Never `0`.
   - `category` + `categorySlug` — must match an existing category in the
     `categories[]` array. If adding a new category, add the entry first and
     set its `productCount` correctly.
   - `image` + `images[]` — start with 1–4 URLs. Can be the Amazon CDN
     (`m.media-amazon.com`) or the manufacturer's own CDN. Then **run the
     image mirror** so they land in `client/public/images/mirrored/`.
   - `asin` — the 10-char ASIN.
   - `affiliateUrl` — you can leave this and run `fix-affiliate-urls.ts`, or
     write `https://www.amazon.com/dp/<ASIN>?tag=gadgetstyle01-20` directly.
   - `rating`, `reviewCount` — from the Amazon listing.
   - `tags` — 2–5 short tags.
   - `dateAdded` — today, `YYYY-MM-DD`.
   - `isFeatured`, `isTrending` — usually `false`; set to `true` sparingly.
   - `specs` — 4–8 key-value pairs. Sourced from manufacturer.
4. **Update the category's `productCount`** if the new product is a category
   you already have.
5. **Run `pnpm check`**. Fix every error. Do not commit until it passes.
6. **Visually verify** in `pnpm dev` on both the homepage and the product page
   (`/product/<slug>`). Check that images load and the Amazon CTA clicks
   through to the right listing.

### Path B — bulk ingestion from Gadget Flow

GF is the reference site and a steady source of curated gadgets. **The
entire pipeline is one command:**

```
pnpm gf:sync                # ingest up to 20 fresh products from GF
pnpm gf:sync --limit 30     # up to 30
pnpm gf:sync --dry-run      # preview without touching data.ts
pnpm gf:sync --url U1,U2    # scrape specific URLs instead of discovering
```

Under the hood, `gf:sync`:
1. **Discovers** — parallel-fetches 30 GF pages (10 categories × 3 pages deep)
2. **Dedupes** against the existing catalog (by gadgetFlowUrl, slug, ASIN)
3. **Scrapes** new URLs in parallel (default concurrency 8)
   - Extracts title, description, image, price, category, tags
   - Resolves `amzn.to` shortlinks to canonical `/dp/<ASIN>`
   - For non-Amazon products, captures brand-direct URL via the
     `utm_source=GadgetFlow` tracking param
4. **Ingests** each new result as `isDraft: true` in data.ts
5. **Mirrors images** — all new GF images localized to `client/public/images/mirrored/`
6. **Fixes category counts** (no-op for drafts but safety net)
7. **Validates** — runs `pnpm check:data`. Non-zero exit if it fails.
8. **Structured report** — writes `docs/gf-sync-<timestamp>.json` with
   everything that happened: discovery numbers, per-URL scrape status,
   ingest skips with reasons, validation summary.

Typical run time for 20 products: **~20 seconds end-to-end**.

After `gf:sync`, review each draft (search `isDraft: true` in data.ts):
fill in specs, adjust category if the auto-guess was wrong, verify the buy
URL works, delete the `isDraft: true,` line to promote. Then
`pnpm fix:counts && pnpm check` and you're done.

### Path C — bulk ingestion from Tools and Toys

[toolsandtoys.net](https://toolsandtoys.net/) is a second curated-gear source
with heavy Amazon-affiliate-direct links (`/dp/<ASIN>?tag=toolsandtoys-20`
format). Each of their "Gear Guide" roundup articles bundles 10–20 products
with inline images — excellent discovery signal. Unlike Uncrate/HiConsumption
(both went client-side-rendered in 2025/26), Tools and Toys still serves
server-rendered HTML that's fully scrapable.

```
pnpm tnt:sync                    # discover + ingest up to 40 new products
pnpm tnt:sync --limit 20         # cap new products
pnpm tnt:sync --articles-limit 30 # cap articles to scrape
pnpm tnt:sync --augment-amazon   # also fetch Amazon for canonical title + hi-res images
pnpm tnt:sync --dry-run          # preview without touching data.ts
```

Under the hood:
1. **Discovers** — crawls homepage + /guides/ pagination + /reviews/ for ~140
   article URLs
2. **Scrapes** each article in parallel, extracting `<ASIN, title, image>`
   triples (pairs each product to its most recent preceding article image)
3. **Quality filter** — rejects titles < 12 chars, all-lowercase, single
   bracketed nicknames, missing brand markers
4. **Augments (optional)** — `--augment-amazon` fetches each ASIN's Amazon
   product page for the canonical title + hi-res images + feature bullets.
   As of April 2026, Amazon serves titles + images + bullets server-side but
   renders price client-side — so augmentation enriches everything EXCEPT
   price.
5. **Ingests** as `isDraft: true` with `price: 0`. Drafts require a manual
   price pass before promotion (`promote-drafts.ts` enforces price > 0).
6. **Mirrors images** + **validates** data.ts + writes structured report to
   `docs/tnt-sync-<timestamp>.json`

### Amazon Direct Sourcing (BLOCKED for now)

`scripts/amazon-discover.ts` scaffolds the pipeline for direct Amazon
best-sellers / movers-and-shakers scraping. As of April 2026 **Amazon renders
prices client-side** on both listing pages and product pages — so the quality
filter (which requires price) can't run off HTML scraping. The scaffolding
remains wired into `pnpm amazon:discover` and plugs straight into PA-API once
you qualify (Associates in good standing with 3+ qualifying sales in 180
days). No rework needed at that point — just swap the data source.

### Destination: Amazon vs external

Every product has a `destination` field (defaulting to `"amazon"`). Amazon
products use `affiliateUrl` (canonical `/dp/<ASIN>?tag=gadgetstyle01-20`).
External products set `destination: "external"` and provide `externalUrl`
(brand site, Kickstarter, etc.) — no affiliate revenue yet, but the product
is still discoverable in the catalog. Direct-brand affiliate programs
(Impact, ShareASale, CJ, Awin, Rakuten) are a post-deploy priority — see
`docs/placeholder-products.md` or the memory notes for the strategy.

## Placeholder products

Manus's legacy catalog contained products with fabricated ASINs (pattern:
sequential `B0D...` codes reused across unrelated products), zero prices, and
duplicate ASINs. 22 of these were auto-flagged via `scripts/flag-drafts.ts`
and are now `isDraft: true` — hidden from the live site, exempt from strict
validation. See `docs/placeholder-products.md` for the list.

For each draft, triage by editing data.ts:

1. **Verify** against the real Amazon listing: fix the ASIN, set the real
   price, delete the `isDraft: true,` line, then `pnpm fix:urls`.
2. **Remove** the product entirely.
3. **Keep as draft** if you want it in the source but not yet public (e.g.
   pre-launch product you want to publish the day it goes live).

The validator will auto-fail promotion of a draft that doesn't meet strict
rules, so you can't accidentally publish bad data.

## Deployment

**Target:** Vercel, connected to the `ProAxeCo/gadget-style` GitHub repo.
Every push to `main` triggers a production deploy. Custom domain:
**www.gadgetstyle.com.au**.

Build config (in `vercel.json`): build command `pnpm build`, output directory
`dist/public`, install command `pnpm install`. Node 20+.

DNS: at your registrar, add a CNAME for `www` pointing to
`cname.vercel-dns.com`, plus an A record for the apex (`gadgetstyle.com.au`) per
Vercel's instructions in the Domains UI.

## Things that were cut (and why)

- `vite-plugin-manus-runtime`, `vitePluginManusDebugCollector`,
  `client/public/__manus__/debug-collector.js`, `.manuspre.computer` and
  related `allowedHosts`, `ManusDialog.tsx` — Manus dev-time instrumentation,
  not needed for a self-hosted site.
- `@builder.io/vite-plugin-jsx-loc` — Builder.io dev-only tool.
- Umami analytics `<script>` in `index.html` — referenced env vars that don't
  exist; add back a proper analytics solution (Vercel Analytics / Plausible)
  if/when you want one.
- **Not cut yet, but flagged:** `client/src/components/Map.tsx` references
  `VITE_FRONTEND_FORGE_API_KEY`. If Maps isn't actually used on the site
  (grep says it's imported nowhere except its own file), delete it. If it is
  used, replace with a user-owned Google Maps key.

## Lessons from the Manus handover (so they don't happen again)

The Manus commit log shows the same classes of bug being "fixed" many times:

1. **ASIN / affiliate URL drift** — the ASIN field and the ASIN in the URL
   got out of sync during edits. Solved: `asin` is authoritative, URL is
   derived by `fix-affiliate-urls.ts`. The validator now blocks mismatches.
2. **Ephemeral image hosts** — `files.manuscdn.com` images would silently
   disappear. Solved: mirror-images.ts downloads everything locally, and the
   validator blocks any ephemeral host.
3. **Stale category counts / header comments** — hand-maintained counts went
   stale. Solved: the validator computes real counts and fails the build if
   they don't match.
4. **Slugs with invalid characters** — punctuation in titles leaked into
   URL slugs. Solved: slug format validator.
5. **Duplicate images across products** — the validator warns when the same
   URL is referenced by more than one product.
6. **Placeholder/fake ASINs** — don't. See above.

Adding a new validator rule is always cheaper than finding and fixing the
same bug class twice.
