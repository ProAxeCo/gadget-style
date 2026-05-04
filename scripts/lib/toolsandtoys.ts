/**
 * Tools and Toys (toolsandtoys.net) scraping library.
 * Pure logic; CLIs import from here.
 *
 * Why Tools and Toys:
 *   - Server-side rendered HTML (unlike Uncrate, HiConsumption — both went CSR)
 *   - Heavy Amazon-affiliate-direct links (/dp/<ASIN>?tag=toolsandtoys-20 format)
 *   - Each "Gear Guide" article curates 10–20 gadgets with inline product
 *     images — excellent discovery signal
 *
 * Pattern recognition (verified 2026-04):
 *   Product titles appear as <a> anchors ending with » (Right-Pointing Double
 *   Angle Quotation Mark). Example:
 *     <a href=".../dp/B07K4XY6PT?tag=toolsandtoys-20">Field Notes "Expedition"
 *      Waterproof Memo Books »</a>
 *   Product images appear as <img> tags from toolsandtoys.net CDN, in order,
 *   before each product's first anchor. We pair them by sequential walk.
 */

export const ASIN_RE = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i;
export const ASIN_STRICT_RE = /^B0[A-Z0-9]{8}$/;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const DISCOVERY_SEEDS = [
  "https://toolsandtoys.net/",
  "https://toolsandtoys.net/guides/",
  "https://toolsandtoys.net/guides/page/2/",
  "https://toolsandtoys.net/guides/page/3/",
  "https://toolsandtoys.net/guides/page/4/",
  "https://toolsandtoys.net/reviews/",
  "https://toolsandtoys.net/reviews/page/2/",
  "https://toolsandtoys.net/reviews/page/3/",
];

async function fetchHtml(url: string, timeoutMs = 15000): Promise<string> {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return await res.text();
}

// ---- Entities ----

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&raquo;/g, "»")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&hellip;/g, "…")
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

// ---- Discovery ----

/**
 * Crawl the homepage + /guides/ + /reviews/ pagination for article URLs.
 * Article URLs look like /guides/<slug>/ or /reviews/<slug>/.
 */
export async function discoverArticleUrls(): Promise<string[]> {
  const seen = new Set<string>();
  for (const seed of DISCOVERY_SEEDS) {
    try {
      const html = await fetchHtml(seed);
      for (const m of html.matchAll(
        /href="(https:\/\/toolsandtoys\.net\/(?:guides|reviews)\/[a-z0-9-]+\/)"/g,
      )) {
        const u = m[1];
        // Filter out RSS feeds, navigation leaves, and pagination
        if (/\/(feed|page)\/?$/.test(u)) continue;
        if (u === "https://toolsandtoys.net/guides/" || u === "https://toolsandtoys.net/reviews/")
          continue;
        seen.add(u);
      }
    } catch (e) {
      // seed 404s are normal past the pagination depth; ignore.
      if (!(e instanceof Error) || !/HTTP 404/.test(e.message)) {
        // eslint-disable-next-line no-console
        console.warn(`  discovery seed failed: ${seed} — ${e}`);
      }
    }
  }
  return [...seen];
}

// ---- Per-article extraction ----

export interface ArticleProduct {
  asin: string;
  title: string;
  articleImage: string | null; // Tools and Toys article image, if pairable
  articleUrl: string;
  articleTitle: string;
}

interface Token {
  type: "img" | "link";
  src?: string;
  asin?: string;
  anchorText?: string;
}

/**
 * Tokenize an article body into a sequential stream of <img> and Amazon-link
 * events, preserving order so we can pair images with products.
 */
function tokenize(article: string): Token[] {
  const tokens: Token[] = [];
  const re = /<img[^>]+src="([^"]+)"|<a\s+[^>]*href="([^"]*amazon\.com\/(?:dp|gp\/product)\/([A-Z0-9]{10})[^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
  for (const m of article.matchAll(re)) {
    if (m[1]) {
      // Only count Tools and Toys images (skip avatars / ads)
      if (m[1].includes("toolsandtoys.net"))
        tokens.push({ type: "img", src: m[1] });
    } else if (m[3]) {
      const anchor = (m[4] ?? "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      tokens.push({
        type: "link",
        asin: m[3],
        anchorText: decodeEntities(anchor),
      });
    }
  }
  return tokens;
}

/**
 * Parse one Tools and Toys article. Walks tokens in order and pairs each
 * unique ASIN with:
 *   - the best title (longest anchor text ending with »)
 *   - the nearest preceding article image
 */
export async function scrapeToolsAndToysArticle(
  articleUrl: string,
): Promise<{
  products: ArticleProduct[];
  articleTitle: string;
  error?: string;
}> {
  try {
    const html = await fetchHtml(articleUrl);
    const articleTitle = decodeEntities(
      (html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "").replace(
        / — Tools and Toys.*$/i,
        "",
      ).replace(/— Tools and Toys.*$/i, "").trim(),
    );
    const articleHtml = html.match(/<article[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? html;

    const tokens = tokenize(articleHtml);
    const perAsin = new Map<
      string,
      { bestTitle: string; image: string | null }
    >();
    let lastImage: string | null = null;
    for (const t of tokens) {
      if (t.type === "img" && t.src) {
        lastImage = t.src;
      } else if (t.type === "link" && t.asin) {
        const entry = perAsin.get(t.asin) ?? { bestTitle: "", image: lastImage };
        const anchor = t.anchorText ?? "";
        // Prefer anchors ending with » — those are "product name" headers.
        // Otherwise keep the longest anchor as a fallback.
        const isHeader = anchor.endsWith("»");
        const cleaned = anchor.replace(/\s*»\s*$/, "").trim();
        if (isHeader && cleaned.length > 3 && !entry.bestTitle.endsWith("[HEADER]")) {
          entry.bestTitle = `${cleaned}[HEADER]`;
        } else if (!entry.bestTitle && cleaned.length > 3) {
          entry.bestTitle = cleaned;
        }
        // First image we see for an ASIN wins.
        if (!entry.image) entry.image = lastImage;
        perAsin.set(t.asin, entry);
      }
    }

    const products: ArticleProduct[] = [];
    for (const [asin, { bestTitle, image }] of perAsin.entries()) {
      if (!ASIN_STRICT_RE.test(asin)) continue;
      let title = bestTitle.replace(/\[HEADER\]$/, "").trim();
      // Strip "— $NN (Normally $NN)" sale-price suffixes (common on T&T sale guides)
      title = title
        .replace(/\s*[—–-]\s*\$?\d[\d,.]*\s*(\([^)]*\))?\s*$/, "")
        .trim();
      if (!title || title.length < 4) continue;
      products.push({
        asin,
        title,
        articleImage: image,
        articleUrl,
        articleTitle,
      });
    }

    return { products, articleTitle };
  } catch (e) {
    return {
      products: [],
      articleTitle: "",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// ---- Concurrency ----

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

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Rough category inference based on title keywords. Maps to our 6 category slugs.
 */
export function inferCategory(title: string, articleTitle: string): string {
  const hay = `${title} ${articleTitle}`.toLowerCase();
  if (/\b(headphone|earbud|speaker|audio|soundbar|turntable|microphone|vinyl|dac)\b/.test(hay))
    return "audio";
  if (/\b(watch|fitness|tracker|smartwatch|wearable|band)\b/.test(hay)) return "wearables";
  if (/\b(smart home|alexa|doorbell|thermostat|smart bulb|vacuum|light|lamp|security camera)\b/.test(hay))
    return "smart-home";
  if (/\b(outdoor|camping|hiking|bike|cycling|travel|backpack|tent|lantern|survival)\b/.test(hay))
    return "outdoor-tech";
  if (/\b(wallet|pen|edc|flashlight|knife|multi-tool|bag|notebook|carry|desk)\b/.test(hay))
    return "everyday-carry";
  return "electronics";
}
