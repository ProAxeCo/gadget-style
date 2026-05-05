# Drafts price-scrape report

Run: 2026-05-05T05:04:21.258Z

**Total: 0/29 prices found** (29 failures)

Method: client-side curl with browser User-Agent, parsing JSON-LD → og:price → product:price → a-offscreen → priceblock → apex.

## Successes

_None._

## Failures

| id | title | reason |
|---:|---|---|
| 271 | CREATIVE ART MATERIALS Caran D'ache Ballpoint Pen Metal Flu… | client-rendered (no price in HTML) |
| 272 | Field Notes: Expedition 3-Pack Waterproof Notebook with Dot… | client-rendered (no price in HTML) |
| 273 | Le Creuset PG90433A-002 Stoneware Mug, Set of 4, 14-Ounce, … | client-rendered (no price in HTML) |
| 274 | Le Creuset Enameled Cast Iron Signature Round Dutch Oven, 5… | client-rendered (no price in HTML) |
| 275 | OXWALLEN Packs Stretchy Bands | client-rendered (no price in HTML) |
| 276 | Recycled Firefighter Sergeant Slim Wallet for Men & Women –… | client-rendered (no price in HTML) |
| 277 | Eagle Creek | client-rendered (no price in HTML) |
| 278 | S.O.L. Survive Outdoors Longer Fire Lite Fuel Free Recharge… | client-rendered (no price in HTML) |
| 279 | Arborwear Men's Double Thick Pullover Sweatshirt | client-rendered (no price in HTML) |
| 280 | Pelican 1150 Camera Case | client-rendered (no price in HTML) |
| 281 | Pelican Products Inc #1151 Replacement Foam 3 Piece Set for… | client-rendered (no price in HTML) |
| 282 | Aulumu A16 for iPhone 16 Pro Magnetic Thermal Case \| Update… | client-rendered (no price in HTML) |
| 283 | WC PadZ - The Ultimate Upgraded Earpads by Wicked Cushions … | client-rendered (no price in HTML) |
| 284 | TG Plasma Lighter Windproof Waterproof USB Rechargeable Fla… | client-rendered (no price in HTML) |
| 285 | SPIGEN Ultra Hybrid Zero One (MagFit) Case Designed for App… | client-rendered (no price in HTML) |
| 286 | Arlo (VMC3040-100NAS) Q – Wired, 1080p HD Security Camera \|… | client-rendered (no price in HTML) |
| 287 | NETGEAR Nighthawk Smart Wi-Fi Router, R6700 - AC1750 Wirele… | client-rendered (no price in HTML) |
| 288 | Refurbished Roku Premiere+ Streaming Player | 404 / delisted (or rate-limited) |
| 289 | uni-ball Jetstream Retractable Ball Point Pens,0.7mm, Black… | client-rendered (no price in HTML) |
| 290 | Twelve South HiRise 2 for iPhone/iPad, Black \| Adjustable C… | client-rendered (no price in HTML) |
| 291 | Jackery Bolt 6000 mAh Battery | 404 / delisted (or rate-limited) |
| 292 | LG C7 65-inch OLED TV | 404 / delisted (or rate-limited) |
| 293 | LG C7 55-inch OLED TV | 404 / delisted (or rate-limited) |
| 294 | Technivorm Moccamaster 69211 Cup One, One-Cup Coffee Maker … | client-rendered (no price in HTML) |
| 295 | Bulova Men's Classic Sutton 4-Hand Automatic Watch, 24-Hour… | client-rendered (no price in HTML) |
| 297 | Best Choice Products Folding Zero Gravity Outdoor Recliner … | client-rendered (no price in HTML) |
| 298 | novium Hoverpen Interstellar Edition - Futuristic Luxury Pe… | client-rendered (no price in HTML) |
| 299 | All-Clad 59917 Stainless Steel Measuring Cups Cookware Set,… | client-rendered (no price in HTML) |
| 300 | Tetris Waffle Maker - Create Deliciously Fun and Geeky Tetr… | client-rendered (no price in HTML) |

## Likely delisted (Amazon returned 404)

These ASINs returned an Amazon "Page Not Found" page. Could be genuinely delisted, refurbished-edition gone, or a rate-limit fluke. Visit each manually — if confirmed delisted, replace ASIN with the current edition or remove the product.

- #288 Refurbished Roku Premiere+ Streaming Player
- #291 Jackery Bolt 6000 mAh Battery
- #292 LG C7 65-inch OLED TV
- #293 LG C7 55-inch OLED TV

## Skipped (placeholder ASINs — recommend removal)

- #127 GoPro MISSION 1 PRO Series Cinema Cameras (asin=B000000000)
- #132 Huawei Pura X Max Foldable Phone (asin=B000000000)
- #153 Amazon Ember Artline 55″ QLED Fire TV (asin=B000000000)

## Recommended next steps

**Auto-scrape returned 0 prices.** As CLAUDE.md warned, amazon.com renders prices client-side as of April 2026 — even with a real browser User-Agent, the served HTML contains the product title, images, and bullets but **no price element at all**. The price is fetched and inserted via JavaScript at runtime. A small subset (4 ASINs in this run) additionally tripped Amazon's CAPTCHA defense.

This means HTML scraping is a dead end for prices. Realistic paths forward, in order of effort:

**A. Manual pricing (fastest right now).** Open each Amazon URL in a real browser and fill in `scripts/draft-prices.json`. With 29 products and ~30 seconds per lookup, this is ~15 minutes of work. URLs are in `docs/drafts-review.md` or constructible as `https://www.amazon.com/dp/<ASIN>?tag=gadgetstyle01-20`.

**B. Headless-browser scraper (1-2 hours of dev).** Add Playwright or Puppeteer to scripts/. Render each `/dp/<ASIN>` page, wait for the `.a-price` selector, extract `.a-offscreen`. This is what every other affiliate site does post-2024. Reusable for all future drafts. Tradeoff: ~5s per page, browser binary in dev deps.

**C. PA-API (best long-term, blocked today).** As soon as Associates account hits 3 qualifying sales, apply for Product Advertising API. It returns prices, images, titles, and availability via signed REST. The `amazon-discover` script scaffolding is already wired for this swap.

Recommended: do **A** now to unblock these 29 drafts, then build **B** as the durable solution before the next sync run.

Then:
- Manually fill `scripts/draft-prices.json` with `{ "271": 19.99, ... }` shape.
- `pnpm tsx scripts/promote-drafts-bulk.ts` to promote.
- Remove placeholder-ASIN drafts: `pnpm tsx scripts/remove-products.ts 127 132 153 && pnpm fix:counts`.
- `pnpm check` to verify clean state.
