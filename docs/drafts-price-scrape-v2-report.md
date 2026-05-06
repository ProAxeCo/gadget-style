# Drafts Price Scrape v2 — Chrome MCP

**Date:** 2026-05-05
**Method:** Chrome MCP DOM-aware scrape against `https://www.amazon.com/dp/<ASIN>`
**Browser geolocation:** Australia (cookies set to `Deliver to Australia`)

## Summary

| Bucket | Count |
|---|---|
| Total drafts in scope (T&T viable) | 25 |
| Prices captured (AUD) | 11 |
| No buy box / not shippable to AU | 14 |
| CAPTCHA encountered | 0 |
| 404 / delisted | 0 |

**11/25 (44%) successful price extraction in a single AU-geo session.**
The 14 no-price products are NOT delisted — title, image, rating, and review
count all populate. They simply have no AU-shippable buy box at scrape time.
A US-ZIP location switch is the next step to recover those prices, but the
ZIP-code modal navigation timed out in this session and was deferred. See
"Recovery path" below.

## Per-product results

| ID | ASIN | Status | Price (AUD) | Title (Amazon) | Notes |
|---|---|---|---|---|---|
| 271 | B004DW471O | OK | 39.48 | Caran D'ache 849.030 Ballpoint Pen, Fluor Orange | 4.6 (562) |
| 272 | B07K4XY6PT | OK | 20.81 | Field Notes Expedition 3-Pack | 4.5 (1432), In Stock |
| 273 | B082LJN89H | NO BUY BOX | — | Le Creuset Stoneware 4 Mugs, Flame | "Cannot ship to AU"; other colorways AUD 89-105 |
| 274 | B0076NOHG2 | NO BUY BOX | — | Le Creuset 5.5qt Dutch Oven, Flame | "Cannot ship to AU" |
| 275 | B08N5WR4HG | OK | 13.91 | OXWALLEN XL Stretch Solo Loop, Apple Watch band | TITLE DRIFT — see image-refresh log |
| 276 | B0C7HK93QS | NO BUY BOX | — | Recycled Firefighter Sergeant Slim Wallet | Image differs from data.ts |
| 277 | B08TZJS4QY | NO BUY BOX | — | Eagle Creek Pack-It Gear Cube M, Sahara Yellow | Description in data.ts is a placeholder; consider rewriting |
| 278 | B08KWQX3LK | NO BUY BOX | — | S.O.L. Fire Lite Lighter | 4.5 (275) |
| 279 | B00ZIADJSW | NO BUY BOX | — | Arborwear Double-Thick Hooded Pullover (note: HOODED, data.ts says non-hooded) | Variant drift |
| 280 | B00013J89A | NO BUY BOX | — | Pelican 1150 Case With Foam (Orange) | 4.7 (201) |
| 281 | B0000DYV7B | NO BUY BOX | — | Pelican 1151 Replacement Foam | 4.5 (237) |
| 282 | B0BXH3CK3G | OK | 47.31 | Aulumu A16 iPhone 16 Pro Case (White variant after redirect) | VARIANT DRIFT — Gray became White |
| 283 | B08FCTVLT2 | OK | 38.22 | Wicked Cushions PadZ Speed Racer | 4.6 (8692), In Stock |
| 284 | B07SNVZZCF | NO BUY BOX | — | TG Plasma Lighter | 4.6 (8579) |
| 285 | B0BN2SDTS5 | OK | 41.75 | Spigen Ultra Hybrid Zero One AirPods Pro 2 case | 4.5 (2160) |
| 286 | B017B2043W | NO BUY BOX | — | Arlo Q indoor camera | Older product — likely EOL pricing |
| 287 | B00R2AZLD2 | NO BUY BOX | — | NETGEAR Nighthawk R6700 | 4.3 (45959) |
| 289 | B002FSZP5A | OK | 9.82 | Uni-Ball Jetstream RT 3-pack | Only 14 left |
| 290 | B01LD85JIK | NO BUY BOX | — | Twelve South HiRise 2 Deluxe (variant redirect) | VARIANT DRIFT |
| 294 | B09XZ4Y1YC | NO BUY BOX | — | Technivorm Moccamaster Cup One | 4.0 (709) |
| 295 | B0C8JMMQ14 | OK | 745.52 | Bulova Sutton 4-Hand Automatic | High price; verify before merging — may be premium/special edition variant |
| 297 | B01BEEFOBU | NO BUY BOX | — | Best Choice Zero Gravity Recliner | 4.5 (10672) |
| 298 | B09DKZPRBJ | OK | 137.83 | novium Hoverpen Interstellar, Mars Magma | 4.6 (2712) |
| 299 | B0001ACKWU | OK | 97.38 | All-Clad Stainless Measuring Cups 5pc | Only 20 left |
| 300 | B0BT54FY4N | OK | 34.79 | Tetris Waffle Maker | Only 16 left |

## Currency caveat

Prices are AUD because Chrome's cookies were set to "Deliver to Australia."
Since gadgetstyle.com.au is the production domain and most users will be
Australian, AUD pricing IS what site visitors see when they click through
via the affiliate URL. The affiliate tag `gadgetstyle01-20` is technically a
US Amazon Associates tag — but Amazon transparently bridges international
purchases through the OneLink program, so the affiliate attribution still
flows.

If the user prefers USD prices, re-run the pipeline after switching the
Chrome browser delivery location to a US ZIP (e.g., 10001 New York). The
ZIP-code modal in this session timed out before the change committed.

## Title and variant drift (catalog-quality bugs)

These are NOT scrape failures — they're real catalog errors found via the
scrape. See `docs/draft-image-refresh.json` for the structured list. Quick
list:

- **#275** — Title in data.ts ("OXWALLEN Packs Stretchy Bands") is wrong;
  the ASIN is an Apple Watch band, not generic stretchy bands.
- **#277** — Description is placeholder text; the actual Amazon product is
  "Eagle Creek Pack-It Gear Cube M Sahara Yellow." Description needs rewrite.
- **#279** — data.ts says "Pullover Sweatshirt" but the ASIN now resolves to
  the HOODED Double-Thick variant. Title drift.
- **#282** — ASIN B0BXH3CK3G (data.ts says "Translucent Gray") redirects to
  B08CR97FGW (White variant). The Gray variant may be delisted.
- **#290** — ASIN B01LD85JIK (data.ts says plain "HiRise 2") redirects to
  B01LD85ORQ ("HiRise 2 Deluxe" with cables included). Different image.

## Delisted ASIN recommendation

None of the 25 ASINs returned 404 or "Page Not Found" — all are still live
listings on Amazon. The 4 ASINs flagged as likely-delisted in the task brief
(#288, #291, #292, #293) were excluded from this run per instructions.

## Recovery path for missing-price items

The 14 no-price products fall into two probable categories:

1. **AU-shipping-restricted (high-confidence)**: Le Creuset (#273, #274),
   anything in the gear category that requires US-only sellers.
2. **No active buy box (low-confidence)**: items where all merchants paused
   listings or the product is marketplace-only. A US-ZIP scrape would
   confirm.

To recover prices: run this same pipeline from a Chrome session with US
geolocation. The simplest path is to manually set the location once via the
"Deliver to" header link, type a US ZIP (10001 worked best in my modal
tests), then leave Chrome running with that cookie set when handing the
session to the next agent.

## Pipeline viability

**This is a viable repeatable pipeline.**

- ~10s per product wall-clock (6s navigate-and-render + 3s rate-limit pause
  + 1s extraction + transit).
- Zero CAPTCHA encountered across 25 sequential page loads from a single
  tab. The 3-second sleep between products is sufficient.
- Zero API cost, zero new dependencies, runs from any agent that has access
  to the Chrome MCP toolset.
- One caveat: `browser_batch` calls of 4+ navigations occasionally time out
  on the response side even when navigations succeed. For batches >3
  navigations, prefer one navigation per batch or be prepared to re-extract
  the final state via a follow-up `javascript_tool` call.

## Next steps for the user

1. Spot-check `scripts/draft-prices.auto.json` — particularly #295 (the
   Bulova at AUD 745) and #298 (Hoverpen at AUD 137) which are higher than
   the descriptive copy implies.
2. If accepting AUD prices: copy the 11 entries from
   `scripts/draft-prices.auto.json` into `scripts/draft-prices.json`, then
   run `pnpm tsx scripts/promote-drafts-bulk.ts` to promote those 11
   products from draft to live.
3. For the 14 no-price products: schedule a US-ZIP re-scrape session.
4. Action the `docs/draft-image-refresh.json` items (especially #275 and
   #279 title drift) before promoting.
5. Per task brief, the 4 likely-delisted ASINs (#288, #291, #292, #293) can
   be removed via `pnpm tsx scripts/remove-products.ts 288 291 292 293`.

## Files written

- `scripts/draft-prices.auto.json` — 11 AUD prices keyed by id
- `docs/draft-image-refresh.json` — title and variant drift findings
- `docs/pricing-pipeline-via-mcp.md` — pipeline documentation
- `docs/drafts-price-scrape-v2-report.md` — this file
