# Amazon Price+Image Scraping Pipeline via Chrome MCP

## Why this exists

As of April 2026, Amazon renders product prices entirely client-side. Static
HTML scraping (the approach used by `scripts/scrape-draft-prices.ts`) returns
zero prices — every product page now requires a JS runtime to materialize the
`#corePriceDisplay_desktop_feature_div` block.

The Amazon Product Advertising API (PA-API) is gated on having three
qualifying sales in 180 days, which the site does not yet have, so we cannot
use the official channel.

**Chrome MCP** (`mcp__Claude_in_Chrome__*`) is a headless-Chrome-equivalent
DOM-aware tooling layer that runs an actual browser. It renders JS, evaluates
selectors, and is the only zero-cost path to current Amazon prices and
hi-res images while we wait for PA-API access.

## When to use this

- You have a batch of draft products in `data.ts` that need real Amazon
  prices before they can be promoted to live.
- You have hi-res image URLs to refresh that are buried inside Amazon's
  `data-a-dynamic-image` JSON map.
- You want to spot-check a single ASIN without spinning up a heavier
  scraper.

## When NOT to use this

- For more than ~50 ASINs in a single run. Amazon will eventually trigger
  CAPTCHA on a fresh tab; the safe ceiling per session is small. Batch the
  work across multiple sessions.
- For automated unattended runs. This is a Claude-agent workflow; the
  decision to retry, skip, or abort lives with the agent.
- For PA-API-gated data (offer listings, in-stock variant counts, search).

## Workflow

The pipeline cannot be invoked from a `tsx` script — MCP tools are only
available from inside an agent session. The workflow below is what the agent
runs.

### 1. Establish a tab

```
mcp__Claude_in_Chrome__tabs_context_mcp({ createIfEmpty: true })
mcp__Claude_in_Chrome__tabs_create_mcp()  // get a fresh tab ID
```

Use a SINGLE tab for the whole batch — reusing the tab is faster and less
suspicious than opening a new one per ASIN.

### 2. For each ASIN

```
navigate(`https://www.amazon.com/dp/<ASIN>`, tabId)
// wait 6 seconds for client-side render
javascript_tool(`
  const price =
    document.querySelector('#corePriceDisplay_desktop_feature_div .a-price .a-offscreen')?.textContent
    || document.querySelector('span.priceToPay span.a-offscreen')?.textContent
    || document.querySelector('.a-price .a-offscreen')?.textContent;
  const title = document.querySelector('#productTitle')?.textContent?.trim();
  const dynImg = document.querySelector('#landingImage')?.dataset?.aDynamicImage;
  const imgSrc = document.querySelector('#landingImage')?.src;
  const availability = document.querySelector('#availability span')?.textContent?.trim();
  const rating = document.querySelector('[data-hook="rating-out-of-text"]')?.textContent;
  const reviewCount = document.querySelector('#acrCustomerReviewText')?.textContent;
  JSON.stringify({ price, title, dynImg, imgSrc, availability, rating, reviewCount });
`, tabId)
// sleep 3 seconds before the next product
```

### 3. Parsing the result

- `price` arrives as `$19.99` — strip `$` and `,`, parseFloat to a number.
- `dynImg` is a JSON object string like
  `{"https://m.media-amazon.com/images/I/X.jpg":[1500,1500],...}`. Parse it,
  pick the URL whose value-array has the largest first dimension. That's the
  hi-res image.
- `availability` of `"Currently unavailable."` or `"In Stock"` tells you
  whether the listing is still live.
- A 404 / "Page Not Found" / dog page indicates the ASIN is delisted.

### 4. Failure modes to handle

| Symptom | Action |
|---|---|
| Empty price selectors, but title and image present | Likely a Kindle/digital-only or out-of-stock; flag as needs-review |
| Title contains "Sorry, we just need to make sure you're not a robot" | CAPTCHA. Stop the batch; report progress; resume in a fresh session later. |
| Title contains "Page Not Found" / `landingImage` absent | ASIN is delisted. Recommend removing the product from data.ts. |
| `availability` says "Currently unavailable" but title/image work | Capture title+image for refresh, leave price as 0, flag for re-scrape later. |
| Two consecutive retries return no data | Skip; do not burn budget. |

### 5. Output artifacts

- `scripts/draft-prices.auto.json` — `{ "<id>": <number>, ... }`. The user
  merges into `scripts/draft-prices.json` after spot-checking, then runs
  `pnpm tsx scripts/promote-drafts-bulk.ts`.
- `docs/draft-image-refresh.json` — `{ "<id>": "<new-image-url>", ... }`.
  Picked up by gs-catalog as an image-refresh task.
- `docs/drafts-price-scrape-v2-report.md` — human-readable report with the
  per-product table, failure list, and next-step guidance.

### 6. Pacing

- 3 seconds between products is the lower bound. Going faster has empirically
  produced CAPTCHA on 5+ rapid loads.
- A run of ~25 products takes about 5 minutes wall clock.
- Per product cost: ~10 seconds of model+browser time, $0 in API spend.

## Memory link

This is the canonical Amazon-price-extraction process going forward — see
`reference_amazon_pricing_pipeline.md`. Until PA-API access is granted, this
is the playbook.
