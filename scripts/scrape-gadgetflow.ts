/**
 * Gadget Flow product scraper — PoC.
 *
 * Given one or more Gadget Flow product URLs, extracts:
 *   - title, description (first paragraphs)
 *   - primary image URL
 *   - Amazon affiliate link (if present) -> ASIN
 *   - price (best-effort)
 *   - category hint
 *
 * Emits a draft Product entry ready for review. Products WITH Amazon links
 * are high-priority (monetizable immediately); those without are tagged for
 * direct-brand affiliate work later (see memory: project_direct_brand_affiliates).
 *
 * Usage:
 *   pnpm scrape:gf --url https://thegadgetflow.com/product/slug/
 *   pnpm scrape:gf --url https://thegadgetflow.com/product/a/,https://thegadgetflow.com/product/b/
 *   pnpm scrape:gf --queue docs/gf-queue.md     # one URL per line
 *   pnpm scrape:gf --discover                   # crawl GF for fresh product URLs,
 *                                                  skip ones already in data.ts,
 *                                                  scrape all new ones
 *   pnpm scrape:gf --discover --limit 10        # limit discovery to N products
 *
 * Output is printed to stdout as JSON and also saved to
 * `docs/gf-scrape-<timestamp>.json` for review. It does NOT write to data.ts
 * automatically — user reviews, then a separate `ingest` step promotes
 * selected scrapes into drafts.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const OUT_DIR = join(REPO_ROOT, "docs");

const ASIN_RE = /\/(?:dp|gp\/product|exec\/obidos\/asin)\/([A-Z0-9]{10})/i;

interface ScrapeResult {
  gadgetFlowUrl: string;
  title: string | null;
  description: string | null;
  image: string | null;
  images: string[];
  amazonUrl: string | null;
  asin: string | null;
  hasAmazonLink: boolean;
  externalUrl: string | null; // non-Amazon buy link if that's all GF has
  priceHint: string | null;
  categoryHint: string | null;
  tags: string[];
  raw: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
}

function firstMatch(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? (m[1] ?? m[0]) : null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—");
}

function extractMetaContent(html: string, property: string): string | null {
  // Matches <meta property="..." content="..."> in either order.
  const re = new RegExp(
    `<meta\\s+(?:[^>]*?\\bproperty=["']${property}["'][^>]*?\\bcontent=["']([^"']+)["']|[^>]*?\\bcontent=["']([^"']+)["'][^>]*?\\bproperty=["']${property}["'])[^>]*>`,
    "i",
  );
  const m = html.match(re);
  return m ? decodeEntities(m[1] ?? m[2]) : null;
}

function resolveAmazonLink(html: string): string | null {
  // GF uses a mix of /out/ redirect links and direct amazon.com/amzn.to URLs.
  // Look for all URL-shaped hrefs that ultimately point to Amazon.
  const candidates = new Set<string>();
  const hrefRe = /href=["']([^"']+)["']/gi;
  for (const m of html.matchAll(hrefRe)) {
    const url = m[1];
    if (/amzn\.to|amazon\.com\/(?:dp|gp\/product|exec\/obidos\/asin)/i.test(url)) {
      candidates.add(url);
    }
  }
  // Prefer the longest Amazon URL (likely contains the ASIN path, not a shortlink)
  const sorted = [...candidates].sort((a, b) => b.length - a.length);
  return sorted[0] ?? null;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      // GF doesn't block a plain fetch in testing, but sending a browser-ish UA
      // is polite and reduces the chance of getting a cached light version.
      "User-Agent":
        "Mozilla/5.0 (compatible; GadgetStyleScraper/1.0; +https://www.gadgetstyle.com)",
    },
  });
  if (!res.ok) throw new Error(`fetch ${url}: HTTP ${res.status}`);
  return await res.text();
}

/**
 * Resolve an amzn.to / short Amazon URL to its canonical /dp/<ASIN> form by
 * following redirects with a HEAD request. Amazon blocks server-side fetches
 * of the full product page (500/503), but the redirect itself returns a
 * 3xx with a Location header that exposes the ASIN. If the fetch fails, we
 * fall back to the input URL unchanged.
 */
async function resolveAmazonUrl(url: string): Promise<string> {
  if (ASIN_RE.test(url)) return url; // already canonical
  // amzn.to always redirects; try HEAD first, GET as fallback.
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await fetch(url, { method, redirect: "follow", headers });
      // After following, res.url is the final URL — whether or not res.ok
      if (res.url && ASIN_RE.test(res.url)) return res.url;
    } catch {
      // try next
    }
  }
  return url;
}

async function scrape(url: string): Promise<ScrapeResult> {
  const html = await fetchHtml(url);

  const ogTitle = extractMetaContent(html, "og:title") ?? undefined;
  const ogDescription = extractMetaContent(html, "og:description") ?? undefined;
  const ogImage = extractMetaContent(html, "og:image") ?? undefined;

  // Amazon link extraction. Shortlinks (amzn.to) don't contain the ASIN — we
  // resolve them by following the redirect to get the canonical /dp/<ASIN> URL.
  let amazonUrl = resolveAmazonLink(html);
  if (amazonUrl && !ASIN_RE.test(amazonUrl)) {
    amazonUrl = await resolveAmazonUrl(amazonUrl);
  }
  const asinMatch = amazonUrl?.match(ASIN_RE);
  const asin = asinMatch ? asinMatch[1].toUpperCase() : null;

  // External buy link extraction. GF stamps utm_source=GadgetFlow on the buy
  // button href, which is a highly reliable signal across brand-direct products.
  let externalUrl: string | null = null;
  if (!amazonUrl) {
    // Primary signal: utm_source=GadgetFlow query param (their affiliate tracking)
    const utmMatch = html.match(/href=["']([^"']+utm_source=GadgetFlow[^"']*)["']/i);
    if (utmMatch) {
      externalUrl = utmMatch[1].replace(/&amp;/g, "&");
    }
    // Fallback: look for "Get it for $" patterns in anchors
    if (!externalUrl) {
      const getItRe = /<a[^>]+href=["']([^"']+)["'][^>]*>[^<]*Get it(?:\s+for)?/i;
      const m = html.match(getItRe);
      if (m && !/thegadgetflow\.com/i.test(m[1]) && /^https?:\/\//i.test(m[1])) {
        externalUrl = m[1].replace(/&amp;/g, "&");
      }
    }
  }

  // Price hint from microdata / visible text (best-effort)
  const priceHint =
    firstMatch(html, /class=["'][^"']*price[^"']*["'][^>]*>\s*\$?([0-9][0-9,.]*)\s*</i) ||
    firstMatch(html, /"price"\s*:\s*"([0-9.]+)"/i) ||
    null;

  // Category hint — GF uses breadcrumbs
  const categoryHint = firstMatch(
    html,
    /breadcrumb[^>]*>[\s\S]*?<li[^>]*>[^<]*<\/li>\s*<li[^>]*>\s*<[^>]*>([^<]+)</i,
  );

  // Tags — look for post_tag terms
  const tags = [...html.matchAll(/rel=["']tag["'][^>]*>([^<]+)</gi)]
    .map((m) => m[1].trim())
    .filter(Boolean);

  // Collect multiple images if present (GF often has a gallery)
  const imageSet = new Set<string>();
  if (ogImage) imageSet.add(ogImage);
  for (const m of html.matchAll(/<img[^>]+(?:data-src|data-lazy-src|src)=["']([^"']+\.(?:jpg|jpeg|png|webp))/gi)) {
    const u = m[1];
    if (/thegadgetflow\.com\/wp-content\/uploads/i.test(u)) imageSet.add(u);
  }

  return {
    gadgetFlowUrl: url,
    title: ogTitle ? ogTitle.replace(/\s*\|\s*Gadget Flow.*$/i, "").trim() : null,
    description: ogDescription ?? null,
    image: ogImage ?? null,
    images: [...imageSet].slice(0, 6),
    amazonUrl,
    asin,
    hasAmazonLink: !!amazonUrl,
    externalUrl,
    priceHint,
    categoryHint,
    tags,
    raw: { ogTitle, ogDescription, ogImage },
  };
}

// --- discovery: crawl GF for fresh product URLs ---
// Pages that tend to expose many product links quickly.
const DISCOVERY_SEEDS = [
  "https://thegadgetflow.com/",
  "https://thegadgetflow.com/blog/",
  "https://thegadgetflow.com/category/smart-home/",
  "https://thegadgetflow.com/category/audio/",
  "https://thegadgetflow.com/category/gaming/",
  "https://thegadgetflow.com/category/wearables/",
  "https://thegadgetflow.com/category/outdoor/",
];

async function discoverProductUrls(): Promise<string[]> {
  const found = new Set<string>();
  for (const seed of DISCOVERY_SEEDS) {
    try {
      const html = await fetchHtml(seed);
      const matches = html.matchAll(/https:\/\/thegadgetflow\.com\/product\/[a-z0-9-]+\/?/gi);
      for (const m of matches) {
        // Normalize: ensure trailing slash, lowercase
        let u = m[0].toLowerCase();
        if (!u.endsWith("/")) u += "/";
        found.add(u);
      }
    } catch {
      /* continue with other seeds */
    }
  }
  return [...found];
}

async function existingGfUrls(): Promise<Set<string>> {
  // Read data.ts as text — avoid importing which may re-trigger validation
  const dataTs = await import("../client/src/lib/data.js");
  return new Set(dataTs.products.map((p: { gadgetFlowUrl: string }) => p.gadgetFlowUrl?.toLowerCase()).filter(Boolean));
}

// --- CLI ---
interface Args { urls: string[]; discover: boolean; limit: number }

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const urls: string[] = [];
  let discover = false;
  let limit = 20;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--url") {
      urls.push(...(args[++i] ?? "").split(",").filter(Boolean));
    } else if (a === "--queue") {
      const p = args[++i];
      if (p && existsSync(p)) {
        const lines = readFileSync(p, "utf8").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
        urls.push(...lines);
      }
    } else if (a === "--discover") {
      discover = true;
    } else if (a === "--limit") {
      limit = parseInt(args[++i] ?? "20", 10);
    }
  }
  return { urls, discover, limit };
}

const { urls: cliUrls, discover, limit } = parseArgs();
let urls: string[] = [...cliUrls];
if (discover) {
  process.stdout.write("  discovering GF product URLs... ");
  const all = await discoverProductUrls();
  const existing = await existingGfUrls();
  const fresh = all.filter((u) => !existing.has(u)).slice(0, limit);
  console.log(`found ${all.length} total, ${all.length - fresh.length} already in catalog, ${fresh.length} new`);
  urls.push(...fresh);
}
if (urls.length === 0) {
  console.error("usage: pnpm scrape:gf --url <gf-url>[,<url>,...]  OR  --queue <file>");
  process.exit(1);
}

const results: ScrapeResult[] = [];
for (const url of urls) {
  process.stdout.write(`  fetching ${url} ... `);
  try {
    const r = await scrape(url);
    results.push(r);
    const flag = r.hasAmazonLink ? `ok, ASIN=${r.asin ?? "?"}` : r.externalUrl ? "ok, external only" : "ok, no buy link";
    console.log(flag);
  } catch (e) {
    console.log(`fail: ${String(e)}`);
  }
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
const outPath = join(OUT_DIR, `gf-scrape-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
writeFileSync(outPath, JSON.stringify(results, null, 2));

const amazonable = results.filter((r) => r.hasAmazonLink && r.asin);
const external = results.filter((r) => !r.hasAmazonLink && r.externalUrl);
const noBuy = results.filter((r) => !r.hasAmazonLink && !r.externalUrl);

console.log(`\nsaved ${outPath}`);
console.log(`  amazon-linked (ready to ingest): ${amazonable.length}`);
console.log(`  external-only (brand-affiliate work needed): ${external.length}`);
console.log(`  no buy link (editorial only): ${noBuy.length}`);
if (amazonable.length > 0) {
  console.log("\nAmazon-linked products:");
  for (const r of amazonable) console.log(`  ASIN=${r.asin}  ${r.title}`);
}
