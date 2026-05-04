/**
 * Gadget Flow scraping library — the pure, reusable logic.
 * CLIs (`scrape-gadgetflow.ts`, `gf-sync.ts`) import from here.
 *
 * No side effects on import; no top-level await; no process.exit.
 */

export const ASIN_RE = /\/(?:dp|gp\/product|exec\/obidos\/asin)\/([A-Z0-9]{10})/i;
export const ASIN_STRICT_RE = /^B0[A-Z0-9]{8}$/;

export interface ScrapeResult {
  gadgetFlowUrl: string;
  title: string | null;
  description: string | null;
  image: string | null;
  images: string[];
  videos: string[];
  amazonUrl: string | null;
  asin: string | null;
  hasAmazonLink: boolean;
  externalUrl: string | null;
  priceHint: string | null;
  categoryHint: string | null;
  tags: string[];
  error?: string;
}

const UA_SCRAPER =
  "Mozilla/5.0 (compatible; GadgetStyleScraper/1.0; +https://www.gadgetstyle.com.au)";
const UA_BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Pages that expose many product links. Each seed is crawled up to
// `DISCOVERY_DEPTH` pages deep to surface older products.
// The Amazon brand page gets extra-deep treatment (AMAZON_DEPTH) since we
// specifically want Amazon-monetizable products.
const DISCOVERY_BASE_SEEDS = [
  "https://thegadgetflow.com/",
  "https://thegadgetflow.com/blog/",
  "https://thegadgetflow.com/category/smart-home/",
  "https://thegadgetflow.com/category/audio/",
  "https://thegadgetflow.com/category/gaming/",
  "https://thegadgetflow.com/category/wearables/",
  "https://thegadgetflow.com/category/outdoor/",
  "https://thegadgetflow.com/category/home-office/",
  "https://thegadgetflow.com/category/transportation/",
];
const AMAZON_BRAND_SEED = "https://thegadgetflow.com/brand/amazon/";
const DISCOVERY_DEPTH = 3;
const AMAZON_DEPTH = 10; // the Amazon brand page has hundreds of pages

function discoverySeeds(): string[] {
  const out: string[] = [];
  // GF uses two pagination patterns: WordPress-style /page/N/ for blog/category,
  // and /pages/N (no trailing slash) for brand listings. We try both for safety.
  for (const base of DISCOVERY_BASE_SEEDS) {
    out.push(base);
    for (let p = 2; p <= DISCOVERY_DEPTH; p++) {
      out.push(`${base}page/${p}/`);
      out.push(`${base}pages/${p}`);
    }
  }
  // Amazon brand page — drill deep to surface ASIN-bearing products
  out.push(AMAZON_BRAND_SEED);
  for (let p = 2; p <= AMAZON_DEPTH; p++) {
    out.push(`${AMAZON_BRAND_SEED}pages/${p}`);
    out.push(`${AMAZON_BRAND_SEED}page/${p}/`);
  }
  return out;
}

// --- HTTP helpers ---

async function fetchHtml(url: string, timeoutMs = 15000): Promise<string> {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": UA_SCRAPER },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

/**
 * Follow redirects (HEAD then GET) to the final URL. Used for amzn.to
 * shortlinks AND gftrk.link (GF's own affiliate tracker) — both redirect
 * to the real merchant URL. Returns original on failure.
 */
async function resolveRedirects(url: string): Promise<string> {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": UA_BROWSER },
      });
      if (res.url) return res.url;
    } catch {
      /* try next */
    }
  }
  return url;
}

async function resolveAmazonUrl(url: string): Promise<string> {
  if (ASIN_RE.test(url)) return url;
  const resolved = await resolveRedirects(url);
  return resolved;
}

// --- parsers ---

function decodeEntities(s: string): string {
  return (
    s
      // Named entities (handle these first)
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, " ")
      // Decimal numeric entities: &#160; / &#038; / &#8217; etc.
      .replace(/&#(\d+);/g, (_, n) => {
        try {
          return String.fromCodePoint(parseInt(n, 10));
        } catch {
          return "";
        }
      })
      // Hex numeric entities: &#x27; / &#xA9; etc.
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
        try {
          return String.fromCodePoint(parseInt(h, 16));
        } catch {
          return "";
        }
      })
  );
}

function extractMetaContent(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta\\s+(?:[^>]*?\\bproperty=["']${property}["'][^>]*?\\bcontent=["']([^"']+)["']|[^>]*?\\bcontent=["']([^"']+)["'][^>]*?\\bproperty=["']${property}["'])[^>]*>`,
    "i",
  );
  const m = html.match(re);
  return m ? decodeEntities(m[1] ?? m[2]) : null;
}

function firstMatch(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? (m[1] ?? m[0]) : null;
}

function findAmazonLink(html: string): string | null {
  const candidates = new Set<string>();
  for (const m of html.matchAll(/href=["']([^"']+)["']/gi)) {
    const url = m[1];
    if (/amzn\.to|amazon\.com\/(?:dp|gp\/product|exec\/obidos\/asin)/i.test(url)) {
      candidates.add(url);
    }
  }
  // Prefer the longest (more likely to contain ASIN path)
  return [...candidates].sort((a, b) => b.length - a.length)[0] ?? null;
}

/**
 * Find the "Get it" buy-button URL (non-Amazon) on a GF product page.
 * Three signals, in order of reliability:
 *   1. utm_source=GadgetFlow query param — GF's usual affiliate stamp for brand-direct
 *   2. gftrk.link/* — GF's own shortlink service (used for some products)
 *   3. an anchor whose text contains "Get it"
 *
 * Result may be a short/tracker URL; caller should resolve redirects to get
 * the final merchant URL.
 */
function findExternalLink(html: string): string | null {
  const utm = html.match(/href=["']([^"']+utm_source=GadgetFlow[^"']*)["']/i);
  if (utm) return utm[1].replace(/&amp;/g, "&");

  const gftrk = html.match(/href=["'](https?:\/\/gftrk\.link\/[^"']+)["']/i);
  if (gftrk) return gftrk[1];

  const getIt = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>[^<]*Get it(?:\s+for)?/i);
  if (getIt && !/thegadgetflow\.com/i.test(getIt[1]) && /^https?:\/\//i.test(getIt[1])) {
    return getIt[1].replace(/&amp;/g, "&");
  }
  return null;
}

// --- public API ---

/**
 * Fetch the /specs/ subpage of a GF product and extract the table.
 * Returns an empty object on miss (page doesn't exist or no specs entered).
 */
export async function scrapeGfSpecs(productUrl: string): Promise<Record<string, string>> {
  const specsUrl = productUrl.replace(/\/$/, "") + "/specs/";
  let html: string;
  try {
    html = await fetchHtml(specsUrl);
  } catch {
    return {};
  }
  const specs: Record<string, string> = {};
  // GF format: <table class="table"><tbody><tr><th scope="row">Key</th><td>Value</td></tr>...</table>
  // Be permissive on tag attrs and whitespace.
  const rowRe = /<tr[^>]*>\s*<th[^>]*>([^<]+)<\/th>\s*<td[^>]*>([^<]+)<\/td>\s*<\/tr>/gi;
  for (const m of html.matchAll(rowRe)) {
    const key = decodeEntities(m[1]).trim();
    const value = decodeEntities(m[2]).trim();
    if (key && value) specs[key] = value;
  }
  return specs;
}

/**
 * Pull product-specific tags from a GF page.
 * Strategy: parse the breadcrumb (`<nav class="gfl_breadcrumbs">`) and take
 * every link in it except "Home". Each entry is a category this product is
 * specifically classified under by GF — accurate, unique per product.
 *
 * Falls back to an empty array if no breadcrumb found. We do NOT scrape the
 * page-wide `/categories/` links because they include sidebar/footer items
 * that are the same for every product.
 */
export function extractGfTags(html: string): string[] {
  const breadcrumbMatch = html.match(
    /<nav[^>]*breadcrumb[^>]*>[\s\S]*?<ol[^>]*>([\s\S]*?)<\/ol>[\s\S]*?<\/nav>/i,
  );
  if (!breadcrumbMatch) return [];
  const ol = breadcrumbMatch[1];
  const tags: string[] = [];
  // Each <li> with an <a> inside is a category step (not the final product title)
  for (const liMatch of ol.matchAll(/<li[^>]*>\s*<a[^>]*>\s*<span[^>]*>([^<]+)<\/span>/gi)) {
    const text = decodeEntities(liMatch[1]).trim();
    if (text && text.toLowerCase() !== "home" && text.length < 60) {
      tags.push(text);
    }
  }
  return tags;
}

/** Normalize a GF product URL to always end with a trailing slash — GF's
 *  server redirects slashless URLs to the homepage, which poisons scraping. */
export function normalizeGfUrl(url: string): string {
  if (!/^https:\/\/thegadgetflow\.com\/product\//i.test(url)) return url;
  return url.endsWith("/") ? url : url + "/";
}

export async function scrapeGfProduct(url: string): Promise<ScrapeResult> {
  url = normalizeGfUrl(url);
  const result: ScrapeResult = {
    gadgetFlowUrl: url,
    title: null,
    description: null,
    image: null,
    images: [],
    amazonUrl: null,
    asin: null,
    hasAmazonLink: false,
    externalUrl: null,
    priceHint: null,
    categoryHint: null,
    tags: [],
  };

  let html: string;
  try {
    html = await fetchHtml(url);
  } catch (e) {
    result.error = `fetch: ${String(e)}`;
    return result;
  }

  result.title = extractMetaContent(html, "og:title");
  if (result.title) {
    result.title = result.title.replace(/\s*\|\s*Gadget Flow.*$/i, "").trim();
  }

  // Abort if we got redirected to GF's homepage (happens when the product URL
  // is stale, malformed, or missing a trailing slash). Signature: og:image
  // points at the site-wide og_home image and/or title is the generic
  // "Gadget Flow - The Original Product Discovery Platform".
  const ogImage = extractMetaContent(html, "og:image") ?? "";
  const isHomepageRedirect =
    /\/og_home/i.test(ogImage) ||
    /^Gadget Flow\b.*(Discovery|Platform)$/i.test(result.title ?? "");
  if (isHomepageRedirect) {
    result.error = "redirected to GF homepage (stale or malformed URL)";
    return result;
  }
  result.description = extractMetaContent(html, "og:description");
  result.image = extractMetaContent(html, "og:image");

  // Amazon link: find + resolve shortlinks
  let amazonUrl = findAmazonLink(html);
  if (amazonUrl && !ASIN_RE.test(amazonUrl)) {
    amazonUrl = await resolveAmazonUrl(amazonUrl);
  }

  // External link (candidate). Resolve tracker URLs to their final destination
  // so we can (a) detect if they end up on Amazon (promote to amazonUrl) and
  // (b) store the real merchant URL for brand-direct products.
  let externalCandidate = !amazonUrl ? findExternalLink(html) : null;
  if (externalCandidate) {
    const isTracker = /gftrk\.link|goto\.|redirect|\/out\//i.test(externalCandidate);
    if (isTracker) {
      externalCandidate = await resolveRedirects(externalCandidate);
    }
    // If the resolved URL ended up on Amazon, promote it to amazonUrl
    if (!amazonUrl && /amzn\.to|amazon\.com/i.test(externalCandidate)) {
      amazonUrl = externalCandidate;
      if (!ASIN_RE.test(amazonUrl)) amazonUrl = await resolveAmazonUrl(amazonUrl);
      externalCandidate = null;
    }
  }

  result.amazonUrl = amazonUrl;
  result.hasAmazonLink = !!amazonUrl;
  const asinMatch = amazonUrl?.match(ASIN_RE);
  result.asin = asinMatch ? asinMatch[1].toUpperCase() : null;
  result.externalUrl = externalCandidate;

  // Price hint
  result.priceHint =
    firstMatch(html, /class=["'][^"']*price[^"']*["'][^>]*>\s*\$?([0-9][0-9,.]*)\s*</i) ||
    firstMatch(html, /"price"\s*:\s*"([0-9.]+)"/i) ||
    null;

  // Category hint
  result.categoryHint = firstMatch(
    html,
    /breadcrumb[^>]*>[\s\S]*?<li[^>]*>[^<]*<\/li>\s*<li[^>]*>\s*<[^>]*>([^<]+)</i,
  );

  // Tags — try category links first (richer), fall back to rel="tag"
  result.tags = extractGfTags(html);
  if (result.tags.length === 0) {
    result.tags = [...html.matchAll(/rel=["']tag["'][^>]*>([^<]+)</gi)]
      .map((m) => decodeEntities(m[1]).trim())
      .filter(Boolean);
  }

  // Gallery images. Strategy:
  //   1. Find every GF-upload image URL on the page (any attribute / JSON context).
  //   2. Filter to product-specific ones via (in order):
  //      a. Prefix match on og:image stem (e.g. "Foo-01.jpg" → prefix "Foo-")
  //      b. Folder match — only images in the same `/uploads/YYYY/MM/` as og:image
  //      c. Blocklist — reject known sitewide category images
  //   3. Drop WordPress auto-generated size variants (e.g. `-768x432.jpg`).
  //   4. Dedupe, cap at 8.
  const imageSet = new Set<string>();
  if (result.image) imageSet.add(result.image);

  // Known sitewide category images that GF includes in the sidebar on every
  // product page. Never product images — always reject.
  const BLOCKLIST = [
    "og_home_",
    "NewBBQ-Large",
    "AI-Gadgets-",
    "Gaming-Gadgets-",
    "Health-Fitness-",
    "iPhone-Accessories-",
    "Kitchen-Gadgets-",
    "Tech-Gadgets-",
    "Smart-Home-Category",
    "Wearables-Category",
    "Outdoor-Category",
    "/2221.jpg",
  ];

  // Try to derive a specific prefix from og:image. Works for filenames ending
  // in a numbered suffix like `Foo-Bar-01.jpg`. If the og:image filename is a
  // hash (like `3YjRjODI3ZGMt.jpeg`), the prefix will be null and we'll fall
  // back to folder-match.
  let prefix: string | null = null;
  let folder: string | null = null;
  if (result.image) {
    const prefixMatch = result.image.match(
      /^(.+\/)([^/]+?)-\d+(?:-\d+x\d+)?\.(?:jpg|jpeg|png|webp|avif)$/i,
    );
    if (prefixMatch) prefix = prefixMatch[1] + prefixMatch[2] + "-";
    const folderMatch = result.image.match(/^(.+\/uploads\/\d{4}\/\d{2}\/)/i);
    if (folderMatch) folder = folderMatch[1];
  }

  const WP_THUMB_RE = /-\d+x\d+\.(?:jpg|jpeg|png|webp|avif)$/i;
  for (const m of html.matchAll(/https?:\/\/[^\s"')<>]+\.(?:jpg|jpeg|png|webp|avif)/gi)) {
    const u = m[0];
    if (!/thegadgetflow\.com\/wp-content\/uploads/i.test(u)) continue;
    if (WP_THUMB_RE.test(u)) continue;
    if (BLOCKLIST.some((b) => u.includes(b))) continue;
    // Stricter: prefix match if we have one; otherwise folder match as fallback.
    if (prefix) {
      if (!u.startsWith(prefix)) continue;
    } else if (folder) {
      if (!u.startsWith(folder)) continue;
    } else {
      // No anchor → don't accept anything beyond the og:image itself.
      continue;
    }
    imageSet.add(u);
  }
  result.images = [...imageSet].slice(0, 8);

  // Videos — scope to product-gallery context only so we don't pick up
  // sidebar/related/trending videos. GF marks gallery videos with the class
  // `gfl-single-slide-video` on an anchor whose href is the embed URL.
  // Also catches standard <iframe src="youtube.com/embed/...">.
  const videoSet = new Set<string>();
  for (const m of html.matchAll(
    /<a[^>]+class=["'][^"']*gfl-single-slide-video[^"']*["'][^>]*href=["']([^"']+)["']/gi,
  )) {
    videoSet.add(m[1].replace(/&amp;/g, "&"));
  }
  for (const m of html.matchAll(
    /<iframe[^>]+src=["'](https?:\/\/(?:www\.)?(?:youtube\.com\/embed|youtube-nocookie\.com\/embed|player\.vimeo\.com\/video)\/[^"']+)["']/gi,
  )) {
    videoSet.add(m[1].replace(/&amp;/g, "&"));
  }
  for (const m of html.matchAll(/<video[^>]*>[\s\S]*?<\/video>/gi)) {
    for (const sm of m[0].matchAll(/\bsrc=["']([^"']+\.(?:mp4|webm|mov)[^"']*)["']/gi)) {
      videoSet.add(sm[1]);
    }
  }
  result.videos = [...videoSet]
    .filter((v) => !/youtube\.com\/embed\/?(?:\?|$)/.test(v))
    .slice(0, 4);

  return result;
}

/** Crawl discovery seed pages (including paginated depth), return unique GF product URLs. */
export async function discoverGfProductUrls(): Promise<string[]> {
  const found = new Set<string>();
  const seeds = discoverySeeds();
  // Parallel: fetch all seeds at once (network is the bottleneck, no rate issues at ~30 URLs)
  const htmls = await Promise.allSettled(seeds.map((s) => fetchHtml(s)));
  for (const res of htmls) {
    if (res.status !== "fulfilled") continue;
    for (const m of res.value.matchAll(/https:\/\/thegadgetflow\.com\/product\/[a-z0-9-]+\/?/gi)) {
      let u = m[0].toLowerCase();
      if (!u.endsWith("/")) u += "/";
      found.add(u);
    }
  }
  return [...found];
}

/** Run a mapper with bounded concurrency. */
export async function mapConcurrent<T, U>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<U>,
  onProgress?: (done: number, total: number) => void,
): Promise<U[]> {
  const results = new Array<U>(items.length);
  let cursor = 0;
  let done = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
      done++;
      onProgress?.(done, items.length);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

/** Slugify a title into a URL-safe slug. Matches the validator's SLUG_RE. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
