/**
 * Amazon scraping library — best-sellers, movers & shakers, and product detail.
 * Pure logic; CLIs (`amazon-discover.ts`) import from here.
 *
 * Design notes:
 *   - Amazon serves 200s to desktop-UA requests from cold IPs (verified 2026-04).
 *     If we ever start getting CAPTCHAs, the fallback is PA-API (requires
 *     qualifying sales) or a third-party like RainforestAPI.
 *   - Best-seller and movers pages are the cheapest sources of gadget-relevant
 *     ASINs. Each page lists ~30–50 products with structured `data-asin` tags.
 *   - Individual product pages are ~1.5MB each. Scrape in parallel but polite
 *     (concurrency 3, 1500ms jitter between spawns).
 */

export const ASIN_STRICT_RE = /^B0[A-Z0-9]{8}$/;

// Desktop Chrome UA + sec-ch-ua headers. Matches a real browser closely enough
// that Amazon doesn't flag us. Updated quarterly to track Chrome releases.
const CHROME_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Ch-Ua":
    '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

// ---- Source pages ----

export interface DiscoverySource {
  url: string;
  label: string;
  ourCategory: string; // one of our 6 category slugs
}

/**
 * Best-seller pages by gadget-relevant subcategory. Each url is a public
 * Amazon listing page. Our category mapping lets us pre-assign the draft's
 * `categorySlug` without further guessing.
 */
export const BESTSELLER_SOURCES: DiscoverySource[] = [
  {
    url: "https://www.amazon.com/gp/bestsellers/electronics",
    label: "Electronics (Best Sellers)",
    ourCategory: "electronics",
  },
  {
    url: "https://www.amazon.com/gp/movers-and-shakers/electronics",
    label: "Electronics (Movers & Shakers)",
    ourCategory: "electronics",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Headphones/zgbs/electronics/172541",
    label: "Headphones (Best Sellers)",
    ourCategory: "audio",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Portable-Bluetooth-Speakers/zgbs/electronics/7073956011",
    label: "Bluetooth Speakers (Best Sellers)",
    ourCategory: "audio",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Wearable-Technology/zgbs/electronics/2230656011",
    label: "Wearable Tech (Best Sellers)",
    ourCategory: "wearables",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Camera-Photo/zgbs/photo",
    label: "Camera & Photo (Best Sellers)",
    ourCategory: "electronics",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Home-Improvement-Smart-Home/zgbs/hi/6563140011",
    label: "Smart Home (Best Sellers)",
    ourCategory: "smart-home",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Computers-Accessories/zgbs/pc",
    label: "Computers & Accessories (Best Sellers)",
    ourCategory: "electronics",
  },
];

// ---- HTTP ----

async function fetchHtml(url: string, timeoutMs = 20000): Promise<string> {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: CHROME_HEADERS,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const text = await res.text();
  if (
    text.includes("api-services-support@amazon") ||
    text.toLowerCase().includes("enter the characters you see below") ||
    text.toLowerCase().includes("robot check")
  ) {
    throw new Error(`CAPTCHA/bot-block detected on ${url}`);
  }
  return text;
}

// ---- Listing-page tile extraction ----
//
// Amazon's best-seller / movers pages render product tiles SERVER-SIDE with
// everything we need: ASIN, title, price, rating, review count, thumbnail.
// The individual product pages render PRICE client-side via JavaScript, so
// they're useless for pricing. We scrape the listing and treat it as the
// authoritative source for price/rating/reviews, then augment with the
// product page for hi-res images and feature bullets (those ARE server-side
// in the colorImages JSON blob).

export interface ListingTile {
  asin: string;
  rank: number; // 1-based position on the listing page
  title: string | null;
  price: number | null;
  rating: number | null;
  reviewCount: number | null;
  thumbnailUrl: string | null; // largest from data-a-dynamic-image
  sourceUrl: string;
  sourceLabel: string;
  ourCategory: string;
}

/**
 * Parse one product tile out of a best-seller / movers listing page.
 * Tiles are delimited by `<div id="p13n-asin-index-N">` boundaries.
 */
function parseTile(
  tileHtml: string,
  rank: number,
  source: DiscoverySource,
): ListingTile | null {
  const asin = tileHtml.match(/data-asin="(B0[A-Z0-9]{8})"/)?.[1];
  if (!asin) return null;

  const titleRaw =
    tileHtml.match(/_cDEzb_p13n-sc-css-line-clamp-\d+_\w+">([^<]+)</)?.[1] ??
    tileHtml.match(/class="_cDEzb[^"]*line-clamp[^"]*">([^<]+)</)?.[1] ??
    null;
  const title = titleRaw ? decodeEntities(titleRaw.trim()) : null;

  // Price — grab the first "$N.NN" that's inside an a-color-price span.
  let price: number | null = null;
  const priceMatch =
    tileHtml.match(/<span class="a-color-price[^"]*"[^>]*>[\s\S]*?\$([\d,]+\.\d{2})/)?.[1] ??
    tileHtml.match(/\$([\d,]+\.\d{2})/)?.[1] ??
    null;
  if (priceMatch) price = parseFloat(priceMatch.replace(/,/g, ""));

  // Rating + review count come from the star widget's aria-label, in one string:
  //   "4.4 out of 5 stars, 274,388 ratings"
  const aria = tileHtml.match(/aria-label="([^"]*out of 5 stars[^"]*)"/)?.[1];
  let rating: number | null = null;
  let reviewCount: number | null = null;
  if (aria) {
    const r = aria.match(/(\d\.\d)\s*out of 5 stars/);
    if (r) rating = parseFloat(r[1]);
    const rv = aria.match(/([\d,]+)\s*ratings?/);
    if (rv) reviewCount = parseInt(rv[1].replace(/,/g, ""), 10);
  }

  // Thumbnail URL — data-a-dynamic-image is a JSON map of url → [w,h].
  // Pick the one with the largest width.
  let thumbnailUrl: string | null = null;
  const dyn = tileHtml.match(/data-a-dynamic-image="([^"]+)"/)?.[1];
  if (dyn) {
    const decoded = decodeEntities(dyn);
    const entries = [...decoded.matchAll(/"(https?:\/\/[^"]+)":\s*\[(\d+),(\d+)\]/g)];
    if (entries.length > 0) {
      entries.sort(
        (a, b) => parseInt(b[2], 10) * parseInt(b[3], 10) - parseInt(a[2], 10) * parseInt(a[3], 10),
      );
      thumbnailUrl = entries[0][1];
    }
  }

  return {
    asin,
    rank,
    title,
    price,
    rating,
    reviewCount,
    thumbnailUrl,
    sourceUrl: source.url,
    sourceLabel: source.label,
    ourCategory: source.ourCategory,
  };
}

/**
 * Scrape one best-seller or movers-and-shakers page and return all product
 * tiles with full metadata.
 */
export async function scrapeListingPage(
  source: DiscoverySource,
): Promise<ListingTile[]> {
  const html = await fetchHtml(source.url);
  const chunks = html.split(/<div\s+id="p13n-asin-index-\d+"/).slice(1);
  const tiles: ListingTile[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const tile = parseTile(chunks[i], i + 1, source);
    if (tile) tiles.push(tile);
  }
  return tiles;
}

// ---- Product detail extraction ----

export interface ProductDetail {
  asin: string;
  url: string;
  // Title is reliable from the detail page too; kept as a sanity-check source.
  title: string | null;
  brand: string | null;
  // Note: price/rating/reviewCount on the detail page are CLIENT-SIDE rendered
  // as of April 2026. Treat them as "nice to have" — the listing page is the
  // authoritative source for these.
  images: string[]; // hi-res; reliable
  description: string | null; // first ~1200 chars of feature bullets
  bullets: string[];
  category: string | null; // breadcrumb leaf; reliable
  isPrime: boolean;
  error?: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => {
      try {
        return String.fromCodePoint(parseInt(n, 10));
      } catch {
        return "";
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      try {
        return String.fromCodePoint(parseInt(h, 16));
      } catch {
        return "";
      }
    });
}

function extractTitle(html: string): string | null {
  const m = html.match(/<span[^>]+id="productTitle"[^>]*>([^<]+)</);
  return m ? decodeEntities(m[1].trim()) : null;
}

function extractBrand(html: string): string | null {
  // Primary: the byline on the detail page, e.g. `<a id="bylineInfo">Visit the Apple Store</a>`
  const byline = html.match(/<a[^>]+id="bylineInfo"[^>]*>([^<]+)</);
  if (byline) {
    const txt = decodeEntities(byline[1].trim());
    // Strip "Visit the " / "Brand: " prefixes
    return txt.replace(/^(Visit the|Brand:?)\s+/, "").replace(/\s+Store$/, "");
  }
  // Fallback: Product Information table row
  const table = html.match(/<tr>\s*<th[^>]*>\s*Brand\s*<\/th>\s*<td[^>]*>([^<]+)</i);
  if (table) return decodeEntities(table[1].trim());
  return null;
}

/**
 * Extract all hi-res images from the colorImages JSON block.
 * Amazon embeds a JS blob like:
 *   "colorImages": { "initial": [ { "hiRes": "https://...", "large": "..." } ] }
 * We regex the hiRes URLs out of it.
 */
function extractImages(html: string): string[] {
  const block = html.match(/"colorImages"\s*:\s*\{\s*"initial"\s*:\s*(\[[\s\S]*?\])\s*\}/);
  if (!block) {
    // Fallback: any hiRes URL on the page
    const all = [...html.matchAll(/"hiRes":"([^"]+)"/g)].map((m) => m[1]);
    return [...new Set(all)].filter((u) => u && !u.includes("null"));
  }
  const arr = block[1];
  const hiRes = [...arr.matchAll(/"hiRes":"([^"]+)"/g)].map((m) => m[1]);
  const large = [...arr.matchAll(/"large":"([^"]+)"/g)].map((m) => m[1]);
  // Prefer hiRes; fall back to large for any slot missing hiRes (nulled).
  const combined = hiRes.map((h, i) => (h && h !== "null" ? h : large[i] ?? "")).filter(Boolean);
  return [...new Set(combined)];
}

function extractBullets(html: string): string[] {
  const block = html.match(
    /id="feature-bullets"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i,
  );
  if (!block) return [];
  const items = [...block[1].matchAll(/<span[^>]*class="a-list-item"[^>]*>([\s\S]*?)<\/span>/gi)];
  return items
    .map((m) => decodeEntities(m[1].replace(/<[^>]+>/g, "").trim()))
    .filter((t) => t.length > 0 && t.length < 500); // drop weird/empty ones
}

function extractBreadcrumbLeaf(html: string): string | null {
  // Amazon's breadcrumb lives in `#wayfinding-breadcrumbs_feature_div`. The
  // last link is the leaf category. If missing, fall back to null.
  const block = html.match(
    /id="wayfinding-breadcrumbs_feature_div"[\s\S]*?(<ul[\s\S]*?<\/ul>)/i,
  );
  if (!block) return null;
  const links = [...block[1].matchAll(/<a[^>]*>\s*([^<]+?)\s*<\/a>/g)];
  if (links.length === 0) return null;
  return decodeEntities(links[links.length - 1][1].trim());
}

function detectPrime(html: string): boolean {
  // A/B patterns; any is sufficient.
  return (
    /class="[^"]*a-icon-prime[^"]*"/i.test(html) ||
    /aria-label="Amazon Prime"/i.test(html) ||
    /id="primeSupportWrapper"/i.test(html)
  );
}

export async function fetchProductDetail(asin: string): Promise<ProductDetail> {
  const url = `https://www.amazon.com/dp/${asin}`;
  try {
    const html = await fetchHtml(url, 25000);
    const bullets = extractBullets(html);
    const description = bullets.slice(0, 3).join(" ").slice(0, 1200) || null;
    return {
      asin,
      url,
      title: extractTitle(html),
      brand: extractBrand(html),
      images: extractImages(html),
      description,
      bullets,
      category: extractBreadcrumbLeaf(html),
      isPrime: detectPrime(html),
    };
  } catch (e) {
    return {
      asin,
      url,
      title: null,
      brand: null,
      images: [],
      description: null,
      bullets: [],
      category: null,
      isPrime: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// ---- Concurrency helper (mirrors gf.ts pattern) ----

export async function mapConcurrent<T, U>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<U>,
  onProgress?: (done: number, total: number) => void,
): Promise<U[]> {
  const results: U[] = new Array(items.length);
  let cursor = 0;
  let done = 0;
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
      done++;
      onProgress?.(done, items.length);
    }
  });
  await Promise.all(workers);
  return results;
}

// ---- Slug helper (consistent with gf.ts) ----

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ---- Category mapping ----

/**
 * Map Amazon's leaf breadcrumb to one of our 6 category slugs. This is a
 * best-effort pre-assignment that overrides the source's `ourCategory`
 * only when Amazon gives us something more specific.
 *
 * Our categories: electronics, audio, smart-home, wearables, outdoor-tech, everyday-carry
 */
export function mapAmazonCategory(
  breadcrumb: string | null,
  fallback: string,
): string {
  if (!breadcrumb) return fallback;
  const b = breadcrumb.toLowerCase();

  // Audio: headphones, earbuds, speakers, soundbars
  if (/headphone|earbud|earphone|speaker|soundbar|turntable|microphone|audio/.test(b))
    return "audio";

  // Wearables: watches, fitness trackers, glasses
  if (/watch|fitness|wearable|smart glass|band|ring tracker/.test(b))
    return "wearables";

  // Smart home: hubs, sensors, lighting, plugs, locks, doorbells, cameras, thermostats
  if (
    /smart home|smart plug|smart light|smart bulb|smart lock|doorbell|security camera|thermostat|sensor|hub|alexa|echo/.test(
      b,
    )
  )
    return "smart-home";

  // Outdoor-tech: outdoor, camping, sports, GPS, bike
  if (/outdoor|camping|hiking|bike|cycling|gps|solar|portable power|power station/.test(b))
    return "outdoor-tech";

  // Everyday-carry: wallets, bags, flashlights, multi-tools, chargers, cables, backpacks
  if (/wallet|bag|backpack|flashlight|tool|charger|charging|cable|adapter|power bank/.test(b))
    return "everyday-carry";

  // Default bucket: electronics covers cameras, laptops, gaming, general gadgetry
  return fallback;
}
