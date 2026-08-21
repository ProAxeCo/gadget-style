# Brand visual system — Gadget Style

This is how brand pages and brand cards stay consistent and on-quality as we add more brands. If you're about to add a new brand, read this first, then run `pnpm brands:audit` and ship only when it passes.

## The principle

**Brand surfaces use CURATED lifestyle photography with the brand's own wordmark rendered in native color on top.**

Two failed iterations taught us the boundaries: derived product photos (first-catalog-image backdrops) look like marketplace search results, and flat brand-color tiles look clinical. The shipped design uses a hand-picked Pexels lifestyle photo per brand (thematically matched to what the brand makes), shown CLEAR — no full-card tint — with the official wordmark placed directly on the photo. Legibility comes from a soft white radial bloom behind the logo, not from a pill or an invert filter.

## The asset kit per brand

Required:
- **Logo (SVG)** — `client/public/images/brands/<slug>.svg`. Vector. Square or wide rectangular aspect. Transparent background.
- **Accent color (hex)** — `accentColor: "#RRGGBB"` in `client/src/lib/brands.ts`. Six-digit hex only (the auditor blocks shorthand and named colors).
- **Tagline (≥ 8 chars)** — short hero sub-line.
- **Description (≥ 60 chars, target 100+)** — 1–3 sentences shown beneath the hero.

Optional:
- **`heroImageUrl`** — the Pexels lifestyle photo, sourced via `pnpm brands:imagery` into `client/public/images/brands/heroes/<slug>.jpg` (1600×900). Practically required — every current brand has one; without it the surfaces fall back to a color-gradient tile.
- **`website`** — official site URL. When set, a "Visit official site" CTA renders.

## Visual rules (already wired in code)

The components in `BrandsIndexPage.tsx` and `BrandPage.tsx` enforce these automatically — you don't need to touch them per brand.

| Surface | Treatment |
|---|---|
| `/brands` card | Square image area (matches ProductCard) with the hero photo CLEAR + soft radial darkening behind the centered logo only. Info (name + product count) sits BELOW the image, mirroring ProductCard so brand cards line up pixel-identical with product cards. |
| `/brand/:slug` hero | Full-bleed hero photo shown CLEAR; only a soft bottom gradient (10/20/55% black) for headline legibility. No mix-blend tints. |
| Logo rendering | NATIVE brand color everywhere — **never `brightness-0 invert`** (it strips Samsung blue / Razer green / Anker cyan). White radial spotlight bloom behind for legibility. No white pill, no circle. |
| Logo size | ~55% of card height on /brands cards; up to 360px wide on the /brand hero. |
| H1 underline | Brand-name span gets an accent underline — white when the accent is dark (luminance ≤ 0.6), gold `#FFCC00` otherwise. This luminance check is the ONLY remaining use of the accent-tone logic. |

## Accent color guidance

Use the brand's primary identity color (the one on their press kit / logo). Stay away from pure black (`#000000`) — bump to `#0e0e0f` so the radial highlight has somewhere to go. Belkin blue, Anker cyan, Razer green, Amazon orange all work. Apple, Sony, Asus, DJI use deep dark accents — the H1-underline tone flip keeps the hero headline readable.

## Adding a new brand — checklist

1. Drop the logo SVG into `client/public/images/brands/<slug>.svg`.
2. Add the entry to `brands` in `client/src/lib/brands.ts`:
   ```ts
   {
     slug: "newbrand",
     name: "NewBrand",
     tagline: "Products we love from NewBrand",
     description: "1–3 sentences on what this brand stands for. Stay above 60 chars.",
     logoUrl: "/images/brands/newbrand.svg",
     website: "https://www.newbrand.com",
     accentColor: "#RRGGBB",
   }
   ```
3. Tag products with `brand: "newbrand"` in `data.ts` (or run `pnpm tsx scripts/backfill-brands.ts`).
4. **Run `pnpm brands:audit`.** Fix anything red. Anything yellow is a soft warning.
5. **Run `pnpm check`** — typecheck + data validation must be green.
6. **Run `pnpm dev`** and visit `/brands` and `/brand/newbrand` to eyeball.
7. Commit + push. Vercel auto-deploys.

## When to override with `heroImageUrl`

Default to **no** override. Only add a hero image when one of these legitimately copyright-clear sources is available:

- The brand has supplied us with their official lifestyle/marketing photography (press kit, partner program asset, partnership pack).
- We've sourced from a properly licensed royalty-free library and credited per the licence (Pexels, Wikimedia Commons under matching CC, paid stock with proof of licence).
- We've taken the photo ourselves.

**Hard rule — copyright:** Never scrape brand banners or hero imagery from Gadget Flow, competitor affiliate sites, or any third-party publisher. They paid for / licensed those assets and we have no rights to redistribute them. Don't even download "to use as reference" — keep them out of the repo entirely.

Never use a product listing photo (white-background Amazon shot) as `heroImageUrl`. The auditor doesn't block this but it looks cheap.

## Brands with no products yet

A brand can ship in `brands.ts` before its products are sourced. The `/brand/<slug>` page renders an "In the pipeline" state — branded with the accent color, explaining the shortlist is being curated, with a CTA back to `/brands` and an outbound link to the brand's official site. This is fine for short stretches (Belkin currently). Source real products via Amazon AU once Associates is approved, or via `pnpm gf:sync` (which preserves attribution via `gadgetFlowUrl`), or via direct-brand affiliate networks.

## Auditor: `pnpm brands:audit`

Checks every brand for:
- Logo file exists in `client/public`
- Logo is SVG
- Accent color is valid 6-digit hex
- Tagline + description meet length minimums
- `heroImageUrl` (if set) actually resolves

Writes `docs/brand-asset-audit.json` and exits non-zero on errors.

## Why this exists

The first pass of brand pages used the first product photo as both card backdrop and hero backdrop. It looked amateur — the page rhythm was dictated by whichever Amazon listing happened to land in `getProductsByBrandSlug()[0]`. Visual quality must not depend on data ordering. A brand-color tile system means a brand looks polished from the moment its logo + accent color land in the file, even before any product is tagged into it.
