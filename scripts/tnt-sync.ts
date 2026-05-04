/**
 * Tools and Toys end-to-end sync — discover → curate ASINs → ingest.
 *
 * Parallel to `gf-sync.ts`. Tools and Toys (toolsandtoys.net) is a small
 * curated-gear site with:
 *   - Server-rendered HTML (reliable scrape target)
 *   - Heavy Amazon-affiliate-direct links in /dp/<ASIN> format
 *   - "Gear Guide" roundup articles bundling 10–20 products each
 *
 * Every new product lands as `isDraft: true` — nothing goes live without review.
 *
 * Optional augmentation: when `--augment-amazon` is set, we fetch each new
 * ASIN's Amazon product page to pull the canonical title + hi-res images +
 * feature bullets. (Amazon title/images are still server-side-reliable as of
 * April 2026; only price is client-side-only.) Without the flag, we use the
 * Tools and Toys article image + anchor text.
 *
 * Usage:
 *   pnpm tnt:sync                          # default: discover, up to 40 new products
 *   pnpm tnt:sync --limit 10               # cap new products
 *   pnpm tnt:sync --articles-limit 5       # cap articles to scrape
 *   pnpm tnt:sync --augment-amazon         # also hit Amazon for each ASIN (hi-res images)
 *   pnpm tnt:sync --dry-run                # preview without touching data.ts
 *
 * Environment:
 *   TNT_CONCURRENCY=4                      # article-scrape parallelism
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { products, categories } from "../client/src/lib/data.js";
import {
  ASIN_STRICT_RE,
  type ArticleProduct,
  discoverArticleUrls,
  scrapeToolsAndToysArticle,
  mapConcurrent,
  slugify,
  inferCategory,
} from "./lib/toolsandtoys.js";
import { fetchProductDetail } from "./lib/amazon.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_PATH = join(REPO_ROOT, "client", "src", "lib", "data.ts");
const DOCS_DIR = join(REPO_ROOT, "docs");
const AFFILIATE_TAG = "gadgetstyle01-20";
const CONCURRENCY = Number(process.env.TNT_CONCURRENCY ?? "4");
const AMAZON_CONCURRENCY = Number(process.env.AMZ_CONCURRENCY ?? "2");

// --- CLI ---
interface Args {
  limit: number;
  articlesLimit: number;
  augmentAmazon: boolean;
  dryRun: boolean;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const out: Args = {
    limit: 40,
    articlesLimit: Infinity,
    augmentAmazon: false,
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit") out.limit = parseInt(argv[++i] ?? "40", 10);
    else if (a === "--articles-limit")
      out.articlesLimit = parseInt(argv[++i] ?? "0", 10);
    else if (a === "--augment-amazon") out.augmentAmazon = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--help" || a === "-h") {
      console.log(
        "pnpm tnt:sync [--limit N] [--articles-limit N] [--augment-amazon] [--dry-run]",
      );
      process.exit(0);
    }
  }
  return out;
}

// --- Title quality filter ---

function isQualityTitle(title: string): boolean {
  const t = title.trim();
  if (t.length < 12) return false;
  // Reject all-lowercase-no-brand ("a few things", "iconic french oven")
  if (t === t.toLowerCase() && !/\b(tpu|edc|dac|usb-c|hd|4k|8k|lcd|oled|ssd|hdmi)\b/i.test(t))
    return false;
  // Reject titles that are mostly a quoted phrase — those are usually
  // nicknames / colorway names, not product titles.
  //   "Flame" stoneware mugs  → ok (has trailing descriptor)
  //   "Nexode RobotGaN"       → reject (entire title in quotes)
  //   "Zero One" Ultra Hybrid Case → ok (has trailing descriptor)
  const strippedOfQuotes = t.replace(/[“”"‘’'`]/g, "").trim();
  if (strippedOfQuotes.length < 8) return false;
  // Require at least 3 words
  if (t.split(/\s+/).length < 3) return false;
  // Require at least one capitalized word of 3+ letters (brand/model marker)
  if (!/\b[A-Z][a-z]{2,}/.test(t) && !/\b[A-Z]{2,}\b/.test(t)) return false;
  return true;
}

// --- ingest helpers ---

function nextId(): number {
  let id = 0;
  for (const p of products) if (p.id > id) id = p.id;
  return id + 1;
}

function pickCategoryName(slug: string): string {
  const c = categories.find((x) => x.slug === slug);
  return c?.name ?? "Everyday Carry";
}

interface DraftInput {
  src: ArticleProduct;
  // augmented fields from Amazon (optional)
  canonicalTitle?: string;
  brand?: string;
  amazonImages?: string[];
  bullets?: string[];
  amazonCategory?: string | null;
}

function formatBlock(d: DraftInput, id: number): string {
  const title = d.canonicalTitle ?? d.src.title;
  const slug = slugify(title);
  const catSlug = inferCategory(title, d.src.articleTitle);
  const categoryName = pickCategoryName(catSlug);

  // Image preference: Amazon hi-res > T&T article image.
  const imgs =
    d.amazonImages && d.amazonImages.length > 0
      ? d.amazonImages.slice(0, 8)
      : d.src.articleImage
        ? [d.src.articleImage]
        : [];
  const image = imgs[0] ?? "";
  const imagesStr = imgs.map((u) => JSON.stringify(u)).join(", ");

  // Tags: brand + article title topic + "Tools & Toys Pick"
  const topic = d.src.articleTitle
    .replace(/^(gear guide|everyday carry|gift guide)[:\s]*/i, "")
    .trim()
    .slice(0, 40);
  const rawTags: string[] = [];
  if (d.brand) rawTags.push(d.brand);
  if (topic) rawTags.push(topic);
  rawTags.push("Tools & Toys Pick");
  const tags = [...new Set(rawTags)].filter(Boolean).slice(0, 5);
  const tagsStr = tags.map((t) => JSON.stringify(t)).join(", ");

  const today = new Date().toISOString().slice(0, 10);
  const affiliateUrl = `https://www.amazon.com/dp/${d.src.asin}?tag=${AFFILIATE_TAG}`;
  const seed = (d.bullets ?? []).slice(0, 3).join(" ").slice(0, 1200);

  return `  {
    id: ${id},
    title: ${JSON.stringify(title)},
    slug: ${JSON.stringify(slug)},
    description: ${JSON.stringify(seed)},
    price: 0,
    category: ${JSON.stringify(categoryName)},
    categorySlug: ${JSON.stringify(catSlug)},
    image: ${JSON.stringify(image)},
    images: [${imagesStr}],
    rating: 4.5,
    reviewCount: 0,
    asin: ${JSON.stringify(d.src.asin)},
    affiliateUrl: ${JSON.stringify(affiliateUrl)},
    gadgetFlowUrl: "",
    tags: [${tagsStr}],
    dateAdded: ${JSON.stringify(today)},
    isFeatured: false,
    isTrending: false,
    specs: {},
    isDraft: true,
  },`;
}

function writeToDataTs(blocks: string[]): void {
  const src = readFileSync(DATA_PATH, "utf8");
  const productsArrayEnd = src.match(/\n\]\s*;\s*\n\s*\nexport const categories/);
  if (!productsArrayEnd) throw new Error("could not locate end of products[] array");
  const insertAt = src.indexOf(productsArrayEnd[0]);
  let before = src.slice(0, insertAt);
  before = before.replace(/(\n  \})(\s*)$/, "$1,$2");
  const newSrc = before + "\n" + blocks.join("\n") + src.slice(insertAt);
  writeFileSync(DATA_PATH, newSrc);
}

function runPnpm(script: string): { ok: boolean; output: string } {
  const res = spawnSync("pnpm", [script], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    shell: true,
  });
  return {
    ok: res.status === 0,
    output: (res.stdout ?? "") + (res.stderr ?? ""),
  };
}

// --- report ---

interface SyncReport {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  dryRun: boolean;
  augmentAmazon: boolean;
  discovery: { articleUrls: number; scraped: number };
  candidates: {
    totalExtracted: number;
    lowQualityTitle: number;
    duplicateAsin: number;
    unique: number;
  };
  augment: { attempted: number; succeeded: number; failed: number };
  ingest: { added: number };
  images: { mirrored: number; failed: number };
  validate: { ok: boolean; summary: string };
  drafts: Array<{
    id: number;
    asin: string;
    title: string;
    category: string;
    sourceArticle: string;
    augmented: boolean;
  }>;
}

// ======================================================================
// Main
// ======================================================================

async function main(): Promise<void> {
  const args = parseArgs();
  const started = Date.now();
  const report: SyncReport = {
    startedAt: new Date(started).toISOString(),
    finishedAt: "",
    durationMs: 0,
    dryRun: args.dryRun,
    augmentAmazon: args.augmentAmazon,
    discovery: { articleUrls: 0, scraped: 0 },
    candidates: { totalExtracted: 0, lowQualityTitle: 0, duplicateAsin: 0, unique: 0 },
    augment: { attempted: 0, succeeded: 0, failed: 0 },
    ingest: { added: 0 },
    images: { mirrored: 0, failed: 0 },
    validate: { ok: false, summary: "" },
    drafts: [],
  };

  // 1. Discovery
  console.log("■ discovering Tools and Toys article URLs...");
  const allUrls = await discoverArticleUrls();
  report.discovery.articleUrls = allUrls.length;
  console.log(`  ${allUrls.length} unique article URLs found`);
  const articleUrls =
    args.articlesLimit === Infinity
      ? allUrls
      : allUrls.slice(0, args.articlesLimit);

  // 2. Scrape articles in parallel
  console.log(
    `\n■ scraping ${articleUrls.length} articles (concurrency ${CONCURRENCY})...`,
  );
  const articleResults = await mapConcurrent(
    articleUrls,
    CONCURRENCY,
    async (u) => scrapeToolsAndToysArticle(u),
    (done, total) => {
      if (done === total || done % 10 === 0) process.stdout.write(`  ${done}/${total}\n`);
    },
  );
  report.discovery.scraped = articleResults.length;

  // 3. Flatten candidates + dedupe
  const existingAsins = new Set(
    products.map((p) => p.asin).filter((a) => ASIN_STRICT_RE.test(a)),
  );
  const existingSlugs = new Set(products.map((p) => p.slug));
  const seenInRun = new Set<string>();
  const candidates: ArticleProduct[] = [];
  let totalExtracted = 0;
  for (const res of articleResults) {
    totalExtracted += res.products.length;
    for (const p of res.products) {
      if (!isQualityTitle(p.title)) {
        report.candidates.lowQualityTitle++;
        continue;
      }
      if (existingAsins.has(p.asin)) {
        report.candidates.duplicateAsin++;
        continue;
      }
      if (seenInRun.has(p.asin)) continue;
      seenInRun.add(p.asin);
      candidates.push(p);
    }
  }
  report.candidates.totalExtracted = totalExtracted;
  report.candidates.unique = candidates.length;
  console.log(
    `\n■ candidates: ${totalExtracted} extracted · ${report.candidates.lowQualityTitle} rejected (low-quality title) · ${report.candidates.duplicateAsin} already in catalog · ${candidates.length} unique`,
  );

  // 4. Cap at limit
  const capped = candidates.slice(0, args.limit);
  if (capped.length < candidates.length) {
    console.log(`  capped to ${capped.length} (limit=${args.limit})`);
  }

  if (capped.length === 0) {
    console.log("nothing to ingest.");
    finalize(report);
    return;
  }

  // 5. (Optional) Augment with Amazon product-page data
  const augmented = new Map<string, DraftInput>();
  if (args.augmentAmazon) {
    console.log(
      `\n■ augmenting ${capped.length} products from Amazon (concurrency ${AMAZON_CONCURRENCY})...`,
    );
    report.augment.attempted = capped.length;
    const details = await mapConcurrent(
      capped,
      AMAZON_CONCURRENCY,
      async (p) => ({ asin: p.asin, detail: await fetchProductDetail(p.asin) }),
      (done, total) => {
        if (done === total || done % 5 === 0) process.stdout.write(`  ${done}/${total}\n`);
      },
    );
    for (let i = 0; i < capped.length; i++) {
      const src = capped[i];
      const { detail } = details[i];
      if (detail.error) {
        report.augment.failed++;
        augmented.set(src.asin, { src });
      } else {
        report.augment.succeeded++;
        augmented.set(src.asin, {
          src,
          canonicalTitle: detail.title ?? undefined,
          brand: detail.brand ?? undefined,
          amazonImages: detail.images,
          bullets: detail.bullets,
          amazonCategory: detail.category,
        });
      }
    }
  } else {
    for (const p of capped) augmented.set(p.asin, { src: p });
  }

  // 6. Slug dedupe + build blocks
  const usedSlugs = new Set<string>();
  let id = nextId();
  const blocks: string[] = [];
  for (const p of capped) {
    const d = augmented.get(p.asin)!;
    const title = d.canonicalTitle ?? p.title;
    const slug = slugify(title);
    if (existingSlugs.has(slug) || usedSlugs.has(slug)) continue;
    usedSlugs.add(slug);
    blocks.push(formatBlock(d, id));
    report.drafts.push({
      id,
      asin: p.asin,
      title,
      category: inferCategory(title, p.articleTitle),
      sourceArticle: p.articleUrl,
      augmented: !!d.canonicalTitle,
    });
    id++;
  }
  report.ingest.added = blocks.length;

  if (args.dryRun) {
    console.log(`\n■ DRY RUN — would insert ${blocks.length} drafts:`);
    for (const d of report.drafts) {
      const aug = d.augmented ? " ⬆️Amz" : "";
      console.log(`    #${d.id} [${d.category}]${aug} ${d.title.slice(0, 70)}`);
    }
    finalize(report);
    return;
  }

  // 7. Write to data.ts
  console.log(`\n■ inserting ${blocks.length} drafts into data.ts...`);
  writeToDataTs(blocks);
  for (const d of report.drafts) {
    const aug = d.augmented ? " ⬆️Amz" : "";
    console.log(`    #${d.id} [${d.category}]${aug} ${d.title.slice(0, 70)}`);
  }

  // 8. Mirror images
  console.log(`\n■ mirroring new images...`);
  const mirror = runPnpm("mirror:images");
  const okMatch = mirror.output.match(/ok=(\d+)/);
  const failMatch = mirror.output.match(/fail=(\d+)/);
  report.images.mirrored = okMatch ? parseInt(okMatch[1], 10) : 0;
  report.images.failed = failMatch ? parseInt(failMatch[1], 10) : 0;
  console.log(`  mirrored: ${report.images.mirrored}, failed: ${report.images.failed}`);

  // 9. Category counts (no-op for drafts)
  runPnpm("fix:counts");

  // 10. Validate
  console.log(`\n■ validating data.ts...`);
  const validate = runPnpm("check:data");
  report.validate.ok = validate.ok;
  const errMatch = validate.output.match(/errors:\s+(\d+)/);
  const warnMatch = validate.output.match(/warnings:\s+(\d+)/);
  report.validate.summary = `errors=${errMatch?.[1] ?? "?"}, warnings=${warnMatch?.[1] ?? "?"}`;
  console.log(`  ${report.validate.summary} ${validate.ok ? "✓" : "✗"}`);
  if (!validate.ok) console.log(validate.output.split("\n").slice(-25).join("\n"));

  finalize(report);
}

function finalize(report: SyncReport): void {
  report.finishedAt = new Date().toISOString();
  report.durationMs = Date.now() - new Date(report.startedAt).getTime();

  if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });
  const reportPath = join(
    DOCS_DIR,
    `tnt-sync-${report.startedAt.replace(/[:.]/g, "-")}.json`,
  );
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`tnt:sync complete in ${(report.durationMs / 1000).toFixed(1)}s`);
  console.log(
    `  articles: ${report.discovery.scraped}/${report.discovery.articleUrls}`,
  );
  console.log(
    `  candidates: ${report.candidates.totalExtracted} extracted → ${report.candidates.unique} unique (${report.candidates.duplicateAsin} dup, ${report.candidates.lowQualityTitle} low-quality)`,
  );
  if (report.augmentAmazon) {
    console.log(
      `  amazon augment: ${report.augment.succeeded}/${report.augment.attempted} succeeded`,
    );
  }
  console.log(`  ingested ${report.ingest.added} drafts`);
  if (report.dryRun) {
    console.log(`  images/validate: (skipped — dry run)`);
  } else if (report.ingest.added === 0) {
    console.log(`  images/validate: (skipped — nothing ingested)`);
  } else {
    console.log(`  images ok=${report.images.mirrored} fail=${report.images.failed}`);
    console.log(`  validate: ${report.validate.summary} ${report.validate.ok ? "✓" : "✗"}`);
  }
  console.log(`  full report: ${reportPath}`);
  console.log(`═══════════════════════════════════════════════════════`);

  if (!report.dryRun && report.ingest.added > 0 && !report.validate.ok) process.exit(1);
}

await main();
