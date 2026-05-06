# Dual-Tag Implementation Spec — AU + US Amazon Associates

**Owner:** `gs-affiliates` (spec) + `gs-deploy` (rollout)
**Status:** Spec only. Code NOT written. Apply step 1 before any code work.
**Companion docs:**
- `docs/amazon-au-application-pack.md` — full application pack for Amazon AU
- `docs/affiliate-signup-checklist.md` — multi-network checklist
- Memory: `reference_amazon_au_us_strategy.md`

---

## Why we need it (cite the evidence)

Site lives at `https://www.gadgetstyle.com.au` (AU-targeted) but every
`affiliateUrl` in `data.ts` points to `amazon.com` with the US tag
`gadgetstyle01-20`. Two compounding leaks:

1. **AU visitors who click an `amazon.com` link** are either
   FX-discounted on US-rate commission, or auto-redirected by Amazon to
   `amazon.com.au` — which **strips our tag entirely** (zero commission).
2. **14 of 25 recent T&T-source drafts** returned *"Cannot ship to your
   selected delivery location"* when accessed from AU geo (Chrome MCP
   pricing pipeline run, 2026-05-05). Those 14 are unshippable to AU
   today — visitor bounces, zero revenue. Source: memory note
   `reference_amazon_au_us_strategy.md`.

The fix is **dual-tag with geo-detect** (Path 1 in the strategy memo):
keep the US tag for non-AU traffic, add an AU tag for AU traffic, route
each visitor to the right Amazon storefront at click time.

---

## A. Executive summary

**What this enables.** AU visitors get sent to `amazon.com.au` with an
AU tag (`<AU_TAG_PLACEHOLDER>`). Everyone else continues to
`amazon.com` with the existing `gadgetstyle01-20`. No catalog changes
required for products that exist on both stores; products with an
`asinAu` field get routed to the AU listing, products without fall back
to the US listing (best we can do until the AU listing is verified).

**Why it matters.** Closes the AU-traffic revenue leak and unlocks the
14 currently-unshippable drafts (assuming they exist on amazon.com.au).

**Commercial impact (conservative).** See forecast in section 6.

**Sequencing.** Step 1 is the user's tomorrow-morning task. Steps 2–5
are build-time work that should NOT start until Amazon AU approval lands
(no point building a tag-switcher with no AU tag to switch to).

---

## Step 1 — Apply for Amazon AU Associates

**This is the user task. Do not write code until approval lands.**

**URL:** https://affiliate-program.amazon.com.au/

**Why first:** without the AU tag the rest of the spec has nothing to
plug in. Approval timeline is **1–3 business days** based on Amazon's
public guidance (verify on the application page when applying). Site is
already live, has 219 products, has the required affiliate disclosure
in the footer, has a Privacy Policy and About/Contact pages — this
clears the standard pre-flight check.

### Fields to fill (verbatim values)

| Field | Value |
|-------|-------|
| Account information — Payee name | Constantinos Tsekouras |
| Account information — Address line 1 | Level 2, 450 St Kilda Road |
| Account information — Address line 2 | (leave blank) |
| Suburb / City | Melbourne |
| State | VIC |
| Postcode | 3004 |
| Country | Australia |
| Phone | +61 414651195 |
| Business name | Gadget Style Australia |
| ABN | 75185709936 |
| Website list (one URL per line) | `https://www.gadgetstyle.com.au` |
| Preferred Associates Store ID | `gadgetstyle-22` (Amazon may auto-suffix `-22`; if taken try `gadgetstyleau-22`) |
| Niche / what your site is about | Consumer Electronics / Gadget Reviews — curated editorial site covering smart home, audio, computing, mobile, photography, gaming, emerging tech. Inspired by the Gadget Flow / Uncrate format. |
| Traffic sources | SEO, editorial curation, Pinterest, Instagram |
| Monthly unique visitors | <1,000 (newly launched, growing) |
| How will you drive traffic to Amazon | Editorial product reviews and category roundups; each product page has detailed specs and a direct buy link to Amazon |
| Primary product categories | Consumer Electronics; Computers; Home Audio; Cameras; Wearables |
| Promotional methods | Direct linking from product pages; SEO-optimized category hubs; social posts (Pinterest, Instagram) linking back to site articles |
| Amazon Payee Tax Information | Australian tax resident — non-US person — W-8BEN equivalent. ABN provides AU TFN equivalent for AU-side reporting. |
| Payment method | EFT to AU bank account (collect details when prompted; do NOT enter in this doc) |

### After submitting

1. Confirmation email arrives within 5 minutes from `associates@amazon.com.au`.
2. Active 180-day clock starts: must drive **3 qualifying sales** to keep the account.
3. Approval email lands with the assigned tag (probably `gadgetstyle-22`).
4. Save the tag to `.env.local` per Step 2.

---

## Step 2 — Build `scripts/lib/affiliate-link.ts` (spec only — DO NOT create yet)

**File path:** `scripts/lib/affiliate-link.ts`
**Companion:** `client/src/lib/affiliate-link.ts` (client-side mirror, see below)
**Trigger to build:** Amazon AU approval email received and AU tag saved to env.

### 2.1 Function signature

```ts
// scripts/lib/affiliate-link.ts (server-side / build-time)

export type Geo = 'AU' | 'OTHER';

export interface AmazonLinkInput {
  asin: string;           // US ASIN (always present)
  asinAu?: string;        // AU ASIN if known; falls back to asin
  geo: Geo;
}

export const AMAZON_US_TAG = process.env.AMAZON_US_TAG ?? 'gadgetstyle01-20';
export const AMAZON_AU_TAG = process.env.AMAZON_AU_TAG ?? '<AU_TAG_PLACEHOLDER>';

/**
 * Build the geo-correct Amazon affiliate URL.
 *
 * AU geo + asinAu present → amazon.com.au with AU tag and AU ASIN.
 * AU geo + no asinAu      → amazon.com.au with AU tag and US ASIN
 *                            (best-effort; many ASINs are shared across stores).
 * OTHER geo               → amazon.com with US tag and US ASIN.
 */
export function buildAmazonLink({ asin, asinAu, geo }: AmazonLinkInput): string {
  if (geo === 'AU') {
    const auAsin = asinAu ?? asin;
    return `https://www.amazon.com.au/dp/${auAsin}?tag=${AMAZON_AU_TAG}`;
  }
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_US_TAG}`;
}

/**
 * Parse hostname → tag from any existing affiliateUrl, used by the
 * validator to accept either tag. Idempotent.
 */
export function detectTagFromUrl(url: string): { tag: string; store: 'US' | 'AU' | null } {
  // ...regex parse host + tag query param
}
```

### 2.2 Geo-detection strategy

Two detection layers, server-first with client fallback:

**Layer A — Vercel edge header (preferred, cookie-free):**

```ts
// In a Vercel-hosted React component or middleware, read:
//   request.headers.get('x-vercel-ip-country')   // ISO-2 country code
// Vercel injects this on every request at the edge. AU = Australia.

export function geoFromVercelHeader(headers: Headers): Geo {
  const country = headers.get('x-vercel-ip-country')?.toUpperCase();
  return country === 'AU' ? 'AU' : 'OTHER';
}
```

**Layer B — client-side fallback (browsers, no edge header):**

```ts
// client/src/lib/affiliate-link.ts (mirror of the server module)
//
// Used when the page is statically rendered and we need to rewrite
// links at hydrate time. Two signals, OR'd:
//   1. navigator.language / navigator.languages includes 'en-AU' or 'AU'
//   2. Intl.DateTimeFormat().resolvedOptions().timeZone starts with 'Australia/'
// Either matching → AU. Both negative → OTHER.

export function geoFromBrowser(): Geo {
  if (typeof navigator === 'undefined') return 'OTHER';
  const langs = (navigator.languages ?? [navigator.language]).join(',').toLowerCase();
  if (langs.includes('en-au') || langs.includes(',au,') || langs.endsWith(',au')) return 'AU';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    if (tz.startsWith('Australia/')) return 'AU';
  } catch { /* ignore */ }
  return 'OTHER';
}
```

**Decision:** Layer A is canonical for SSR/edge. Since Gadget Style is a
static SPA (Vite + Vercel), we don't have request-time SSR — so Layer B
is the **runtime detector** for live users. Layer A is still useful for
any server-side preview or future SSR migration.

### 2.3 Wiring into the `affiliateUrl` field

Two patterns to choose from. **Recommend pattern P2** (runtime rewrite)
because it preserves the static-site model and doesn't require
regenerating data.ts on every deploy.

**P1 — Build-time (rejected):** `scripts/build-affiliate-urls.ts`
re-derives `affiliateUrl` for each product. Problem: the URL in data.ts
is now per-region, breaks the single-source-of-truth model, and would
require generating two builds (AU + ROW). Skip.

**P2 — Runtime client-side rewrite (recommended):**

1. `data.ts` keeps the existing US-tag URL unchanged (validator accepts
   either US or AU tag — see Step 3). Optional new field `asinAu`.
2. Add `client/src/lib/affiliate-link.ts` with `buildAmazonLink` +
   `geoFromBrowser`.
3. In the `Product` page component (`client/src/pages/Product.tsx` or
   wherever the Amazon CTA renders), import the helper and rewrite the
   button's `href` at render time:

   ```tsx
   import { buildAmazonLink, geoFromBrowser } from '@/lib/affiliate-link';

   const geo = geoFromBrowser();
   const href = product.destination === 'amazon'
     ? buildAmazonLink({ asin: product.asin, asinAu: product.asinAu, geo })
     : product.externalUrl;
   ```

4. **SEO consideration:** the static HTML still contains the US-tag
   URL (good for crawlers since amazon.com is the primary index). Geo
   rewrite happens after hydration. No impact on Lighthouse / SEO.

5. **`<a rel>`:** keep `rel="nofollow sponsored noopener"` per
   Associates ToS regardless of geo.

### 2.4 Where else affiliate URLs are emitted

Audit these surfaces before deploy — each must use the new helper or
otherwise be safe:

- Product detail page CTA — covered in §2.3
- Product card (`client/src/components/ProductCard.tsx`) — same pattern
- Search results, category hubs, "trending" / "featured" sections — same pattern
- `client/public/sitemap.xml` — does NOT contain affiliate URLs, no change
- `docs/social/pinterest.csv` and `docs/social/instagram.md` — generated
  by `scripts/generate-social.ts`. Leave as **US-tag-only** for now;
  Pinterest/IG audiences are global, AU click-throughs from social are a
  smaller share and the geo-rewrite happens server-side once they hit
  the site. Optional enhancement: add an `?gs_origin=social` UTM and
  rewrite to AU on the product page if origin AU.

---

## Step 3 — Validator update

**File:** `scripts/validate-data.ts`
**Change:** accept either US tag or AU tag in `affiliateUrl`.

Today:

```
Affiliate tag — every URL must carry tag=gadgetstyle01-20.
Any other tag (including thegadgetflow-20, gadgetstyle-20) is a bug.
```

After Step 1 lands the AU tag, update the rule to:

```ts
const ALLOWED_TAGS = new Set([
  process.env.AMAZON_US_TAG ?? 'gadgetstyle01-20',
  process.env.AMAZON_AU_TAG ?? '<AU_TAG_PLACEHOLDER>',
]);

// In the per-product validator:
const tag = new URL(product.affiliateUrl).searchParams.get('tag');
if (!tag || !ALLOWED_TAGS.has(tag)) {
  errors.push(`product ${product.id}: affiliateUrl tag '${tag}' is not in the allowed set`);
}
```

Also extend the URL-host check: currently `amazon.com` is the only
allowed host for `affiliateUrl`. Add `amazon.com.au` to the allowed set.

If `asinAu` is added as a new optional field, validate:

- `^B0[A-Z0-9]{8}$` format same as `asin`
- If present, must differ from `asin` only when truly different listings
  (warning only — many ASINs match across stores)

`pnpm fix:urls` (`scripts/fix-affiliate-urls.ts`) is unaffected — it
still canonicalizes the US-tag URL because data.ts is the
"primary/index" URL, with AU resolved at runtime.

---

## Step 4 — Data-migration plan (`asinAu` field)

**Goal:** populate `asinAu` for products that exist on amazon.com.au with
a different ASIN. Do NOT touch products where the AU listing uses the
same ASIN — `buildAmazonLink` falls back gracefully.

### Phase 1 (priority, ~1 hour) — the 14 unshippable T&T drafts

Per `reference_amazon_au_us_strategy.md`, these draft IDs hit the
"Cannot ship to AU" wall on amazon.com:

```
#273, #274, #276, #277, #278, #279, #280, #281, #284, #286, #287, #290, #294, #297
```

**Manual workflow per product** (no automation — Amazon blocks server
fetches per `feedback_working_practices.md` rule 4):

1. Open the product's title in `data.ts`.
2. Search amazon.com.au from a logged-in AU browser session for the
   exact product name + brand + key spec.
3. **Match found:** copy the ASIN from the URL. Compare to existing
   `asin`:
   - Same → no change needed; `buildAmazonLink` already works.
   - Different → add `asinAu: 'B0XXXXXXXX'` to the product entry.
4. **No match (product not sold on amazon.com.au):** add
   `noAuStock: true` to the product. The Product component should
   suppress the Amazon CTA for AU users and show "Not available on
   Amazon AU" + a fallback (brand site link if known).
5. After edits: `pnpm check:data && pnpm fix:counts`. Promote drafts
   that now have valid AU listings out of `isDraft: true`.

### Phase 2 (sweep, weekend project) — 219 live products

Same workflow but bulk. Order by AOV descending (high-AOV first — TVs,
audio, cameras, drones). Track in
`docs/au-asin-mapping-progress.md` (build as you go).

Stop criteria: by product 50 you should hit a "same ASIN both stores"
hit-rate around 60-80%. If it's lower, prioritize differently —
dual-listing brands first (Samsung, Sony, JBL, Bose).

### Phase 3 (catalog growth) — `gf:sync` and `tnt:sync`

Update both ingestion scripts to optionally probe amazon.com.au for the
AU ASIN at scrape time. Low priority — catalog growth is currently
limited by manual review, not scrape throughput.

---

## Step 5 — Testing the geo-routing in production

### 5.1 Dev-time unit tests

```ts
// scripts/lib/affiliate-link.test.ts
import { describe, it, expect } from 'vitest';
import { buildAmazonLink } from './affiliate-link';

describe('buildAmazonLink', () => {
  it('AU geo + asinAu → amazon.com.au with AU ASIN + AU tag', () => {
    const url = buildAmazonLink({ asin: 'B0AAAAAAAA', asinAu: 'B0BBBBBBBB', geo: 'AU' });
    expect(url).toContain('amazon.com.au/dp/B0BBBBBBBB');
    expect(url).toContain('tag=');
  });
  it('AU geo without asinAu → amazon.com.au with US ASIN + AU tag', () => { /* ... */ });
  it('OTHER geo → amazon.com with US ASIN + US tag', () => { /* ... */ });
});
```

### 5.2 Pre-deploy local verification

1. `pnpm dev`
2. Open product page, inspect the Amazon CTA `href`.
3. Open dev tools → Sensors → Locale: `en-AU` → reload.
4. CTA should now point at `amazon.com.au?tag=<AU_TAG>`.
5. Reset locale to `en-US` → CTA reverts.

### 5.3 Production VPN test (after deploy)

| Check | How | Pass criteria |
|-------|-----|---------------|
| AU traffic → AU storefront | Connect VPN to AU exit (Sydney/Melbourne); load 5 product pages | Every Amazon CTA `href` contains `amazon.com.au` and `tag=<AU_TAG>` |
| US traffic → US storefront | VPN to US exit; same 5 pages | CTAs contain `amazon.com` and `tag=gadgetstyle01-20` |
| UK / RoW → US storefront | VPN to UK exit | Defaults to US tag (we don't have a UK program) |
| Broken-tag regression | View source → grep for `tag=thegadgetflow-20` or `tag=gadgetstyle-20` (no dash) | 0 hits — validator should already block these but worth a re-check |
| Sitemap unchanged | Diff `client/public/sitemap.xml` pre/post deploy | No diff (no affiliate URLs in sitemap) |

### 5.4 Tracking verification (24-hour wait)

After deploy, click your own AU-routed link from an AU IP, complete a
small purchase on amazon.com.au, and confirm the click + sale land in
the Amazon AU Associates dashboard within 24h with the correct tag.
This is the only way to confirm end-to-end attribution.

---

## 6. Commission-uplift forecast

**Inputs (conservative; flagged as assumption):**
- 500 monthly visitors
- 70% AU / 30% other (matches the .com.au domain + AU SEO targeting)
- Click-through rate to Amazon CTA: 20% of pageviews
- Conversion rate on click: 3% (Amazon Associates typical low end)
- Average commission per qualifying sale: 3% of an average $200 AOV = $6

### Status quo (US tag only)

- 500 visitors × 70% AU = 350 AU visitors
- AU visitor click-throughs to amazon.com: 350 × 20% = 70 clicks
- Of those, ~50% get auto-redirected to amazon.com.au by Amazon and
  **lose the tag** = 35 untracked clicks → 0 commission
- Of the 35 that stay on amazon.com, ~40% bounce because product is
  unshippable to AU (the 14/25 evidence) = 14 lost clicks → 0
- Effective AU clicks earning commission: ~21
- AU commissions/month: 21 × 3% × $6 = **~$3.78/mo from AU**
- Plus 30% non-AU: 150 visitors × 20% × 3% × $6 = **~$5.40/mo**
- **Total: ~$9.18/mo**

### With dual-tag

- 350 AU visitors × 20% = 70 AU clicks, all routed to amazon.com.au
  with AU tag
- Bounces from "Cannot ship to AU" drop to ~5% (only products with no
  AU listing; most have one)
- Effective AU clicks earning commission: ~67
- AU commissions/month: 67 × 3% × $6 = **~$12.06/mo from AU**
- Non-AU unchanged: ~$5.40/mo
- **Total: ~$17.46/mo**

### Delta

**+$8.28/month per 500 visitors (+~90%).** Scales linearly with
traffic. At 5,000 visitors/month: **~$83/mo extra**. At 50,000:
**~$830/mo extra**.

**Caveats / verification points:**

- Real CTRs depend on copy, image quality, position of CTA. 20% is
  optimistic for organic traffic, low-end for high-intent traffic.
- 3% Amazon conversion is the **lower bound**. Premium/high-intent
  product pages can hit 5–8%.
- The $200 AOV is an estimate. Actual AOV depends on product mix —
  the user's "high-AOV preference" (`feedback_working_practices.md`
  rule 10) pushes this number up.
- Dollar numbers are illustrative. **The strategic value is closing
  the qualifying-sale gap on the 180-day clock**, not the raw $/mo at
  pre-traffic stage.

---

## C. Assumptions and verification points

| Assumption | How to verify |
|------------|---------------|
| Vercel injects `x-vercel-ip-country` on every request | Check a deployed function's request headers in the Vercel dashboard |
| `Intl.DateTimeFormat().resolvedOptions().timeZone` returns AU values for AU users on common browsers (Chrome/Safari/Firefox/Edge) | Browser test panel; usually reliable |
| Amazon AU approval timeline of 1–3 days | Check Amazon AU Associates application page wording; confirm with own application |
| Amazon AU commission rates match `gs-affiliates` agent's quoted rates | Pull current rates from https://affiliate-program.amazon.com.au/help/operating/policies after approval |
| 14 unshippable drafts have AU equivalents on amazon.com.au | Per-product manual lookup (Phase 1 of Step 4) |
| US-tag URLs in static HTML do not negatively impact AU SEO | Crawler test post-deploy with Bing/Google Search Console (geo-targeting unaffected because canonical domain is `.com.au`) |

---

## D. Next actions (priority order)

1. **User executes Step 1** (Amazon AU application, ~10 min). The
   bigger time cost is the wait, not the form.
2. **While waiting (1–3 days):** plan Step 4 Phase 1 — list the 14
   draft IDs in a side note, ready to populate `asinAu` once the AU tag
   lands.
3. **Approval lands:** add `AMAZON_AU_TAG=<assigned>` to `.env.local`
   and to Vercel project env. Implement Steps 2 and 3 in a single PR
   (~30 min code).
4. **Deploy and run Step 5.3** (VPN test) the same day.
5. **Step 4 Phase 1 in parallel** — populate `asinAu` for 14 drafts.
6. **First qualifying AU sale logged → 180-day clock survives.**
7. **Phase 2 sweep** queued for the following weekend.
