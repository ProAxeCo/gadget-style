/**
 * Amazon end-to-end discovery — best-sellers → quality filter → drafts.
 *
 * Sourced from Amazon's public best-seller and movers-and-shakers pages.
 * All new products land as `isDraft: true` — nothing goes live without review.
 *
 * Why scrape the listing page (not each product page):
 *   As of April 2026, Amazon renders prices client-side on the /dp/ page,
 *   so HTML scraping of individual products can't get price. Best-seller
 *   listings render tiles server-side with title, price, rating, review
 *   count, and thumbnail — exactly what we need for the quality filter.
 *   We only fetch the detail page for products that pass the filter, to
 *   pull hi-res images and feature bullets.
 *
 * Quality filters (applied on listing-tile data):
 *   - Price in [$40, $3000] — skip cables, batteries, enterprise outliers
 *   - Rating ≥ 4.0
 *   - Reviews ≥ 100
 *   - Must have title + thumbnail URL
 *   - Reject consumable/multipack titles
 *
 * Usage:
 *   pnpm amazon:discover                      # default: 8 per source, 40 max ingest
 *   pnpm amazon:discover --per-source 15      # take top 15 from each source
 *   pnpm amazon:discover --max-ingest 20      # cap total drafts
 *   pnpm amazon:discover --min-price 100      # override price floor
 *   pnpm amazon:discover --dry-run            # preview without touching data.ts
 *   pnpm amazon:discover --source Audio       # only run sources with "Audio" in label
 *
 * Environment:
 *   AMZ_CONCURRENCY=3                         # detail-page fetch parallelism
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { products, categories } from "../client/src/lib/data.js";
import { AFFILIATE_TAG } from "../shared/const.js";
import {
  ASIN_STRICT_RE,
  BESTSELLER_SOURCES,
  type ListingTile,
  type ProductDetail,
  scrapeListingPage,
  fetchProductDetail,
  mapConcurrent,
  mapAmazonCategory,
  slugify,
} from "./lib/amazon.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_PATH = join(REPO_ROOT, "client", "src", "lib", "data.ts");
const DOCS_DIR = join(REPO_ROOT, "docs");
const CONCURRENCY = Number(process.env.AMZ_CONCURRENCY ?? "3");

// --- CLI args ---
interface Args {
  perSource: number;
  maxIngest: number;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  minReviews: number;
  dryRun: boolean;
  sources: string[] | null;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const out: Args = {
    perSource: 8,
    maxIngest: 40,
    minPrice: 40,
    maxPrice: 3000,
    minRating: 4.0,
    minReviews: 100,
    dryRun: false,
    sources: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--per-source") out.perSource = parseInt(argv[++i] ?? "8", 10);
    else if (a === "--max-ingest") out.maxIngest = parseInt(argv[++i] ?? "40", 10);
    else if (a === "--min-price") out.minPrice = parseFloat(argv[++i] ?? "40");
    else if (a === "--max-price") out.maxPrice = parseFloat(argv[++i] ?? "3000");
    else if (a === "--min-rating") out.minRating = parseFloat(argv[++i] ?? "4.0");
    else if (a === "--min-reviews") out.minReviews = parseInt(argv[++i] ?? "100", 10);
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--source") out.sources = (argv[++i] ?? "").split(",").filter(Boolean);
    else if (a === "--help" || a === "-h") {
      console.log(
        "pnpm amazon:discover [--per-source N] [--max-ingest N] [--min-price N] [--max-price N] [--min-rating N] [--min-reviews N] [--source substr[,substr]] [--dry-run]",
      );
      process.exit(0);
    }
  }
  return out;
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
  tile: ListingTile;
  detail: ProductDetail | null;
  ourCategorySlug: string;
}

function formatBlock(input: DraftInput, id: number): string {
  const { tile, detail, ourCategorySlug } = input;
  const title = tile.title ?? detail?.title ?? "UNTITLED";
  const slug = slugify(title);
  const categoryName = pickCategoryName(ourCategorySlug);
  const price = tile.price ?? 0;

  // Images: prefer detail-page hi-res. Fall back to listing thumbnail.
  const detailImgs = detail?.images ?? [];
  const imgs =
    detailImgs.length > 0
      ? detailImgs.slice(0, 8)
      : tile.thumbnailUrl
        ? [tile.thumbnailUrl]
        : [];
  const image = imgs[0] ?? "";
  const imagesStr = imgs.map((u) => JSON.stringify(u)).join(", ");

  // Tags: brand + breadcrumb + "Amazon Best Seller"
  const rawTags: string[] = [];
  if (detail?.brand) rawTags.push(detail.brand);
  if (detail?.category) rawTags.push(detail.category);
  rawTags.push(tile.sourceLabel.includes("Movers") ? "Trending" : "Amazon Best Seller");
  const tags = [...new Set(rawTags)].slice(0, 5);
  const tagsStr = tags.map((t) => JSON.stringify(t)).join(", ");

  const today = new Date().toISOString().slice(0, 10);
  const affiliateUrl = `https://www.amazon.com/dp/${tile.asin}?tag=${AFFILIATE_TAG}`;
  const rating = tile.rating ?? 4.5;
  const reviewCount = tile.reviewCount ?? 0;
  const seed = detail?.description ?? "";

  return `  {
    id: ${id},
    title: ${JSON.stringify(title)},
    slug: ${JSON.stringify(slug)},
    description: ${JSON.stringify(seed)},
    price: ${price},
    category: ${JSON.stringify(categoryName)},
    categorySlug: ${JSON.stringify(ourCategorySlug)},
    image: ${JSON.stringify(image)},
    images: [${imagesStr}],
    rating: ${rating},
    reviewCount: ${reviewCount},
    asin: ${JSON.stringify(tile.asin)},
    affiliateUrl: ${JSON.stringify(affiliateUrl)},
    gadgetFlowUrl: "",
    tags: [${tagsStr}],
    dateAdded: ${JSON.stringify(today)},
    isFeatured: false,
    isTrending: ${tile.sourceLabel.includes("Movers") || tile.rank <= 10},
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

// --- Quality filter on listing-tile data (fast, no detail-page fetch needed) ---

function qualityFilter(
  tile: ListingTile,
  args: Args,
): { ok: true } | { ok: false; reason: string } {
  if (!tile.title) return { ok: false, reason: "no title" };
  if (!tile.thumbnailUrl) return { ok: false, reason: "no thumbnail" };
  if (tile.price == null) return { ok: false, reason: "no price on tile" };
  if (tile.price < args.minPrice)
    return { ok: false, reason: `price $${tile.price} < floor $${args.minPrice}` };
  if (tile.price > args.maxPrice)
    return { ok: false, reason: `price $${tile.price} > ceiling $${args.maxPrice}` };
  if (tile.rating == null) return { ok: false, reason: "no rating" };
  if (tile.rating < args.minRating)
    return { ok: false, reason: `rating ${tile.rating} < ${args.minRating}` };
  if (tile.reviewCount == null || tile.reviewCount < args.minReviews)
    return {
      ok: false,
      reason: `reviews ${tile.reviewCount ?? 0} < ${args.minReviews}`,
    };
  // Reject consumables / replacement parts / multipacks — they rarely fit a
  // curated gadget catalog and inflate noise.
  if (
    /\b(replacement|refill|cartridge|filter pack|pack of \d+|\d+-pack|set of \d+|subscription)\b/i.test(
      tile.title,
    )
  )
    return { ok: false, reason: "consumable / multipack / subscription" };
  // Reject Amazon-service SKUs (Prime memberships, Blink plans, gift cards)
  if (/\b(plan|subscription|membership|gift card)\b/i.test(tile.title))
    return { ok: false, reason: "service/membership/gift card" };
  return { ok: true };
}

// --- report ---

interface DiscoverReport {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  dryRun: boolean;
  sources: Array<{ label: string; tiles: number }>;
  dedupe: { totalDiscovered: number; duplicateAsin: number; unique: number };
  filter: {
    passed: number;
    rejected: number;
    rejections: Array<{ asin: string; title: string | null; reason: string }>;
  };
  detailFetch: { attempted: number; succeeded: number; failed: number };
  ingest: { added: number; skipped: Array<{ asin: string; reason: string }> };
  images: { mirrored: number; failed: number };
  validate: { ok: boolean; summary: string };
  drafts: Array<{
    id: number;
    asin: string;
    title: string;
    price: number;
    rating: number;
    reviews: number;
    category: string;
    source: string;
    rank: number;
  }>;
}

// ======================================================================
// Main
// ======================================================================

async function main(): Promise<void> {
  const args = parseArgs();
  const started = Date.now();
  const report: DiscoverReport = {
    startedAt: new Date(started).toISOString(),
    finishedAt: "",
    durationMs: 0,
    dryRun: args.dryRun,
    sources: [],
    dedupe: { totalDiscovered: 0, duplicateAsin: 0, unique: 0 },
    filter: { passed: 0, rejected: 0, rejections: [] },
    detailFetch: { attempted: 0, succeeded: 0, failed: 0 },
    ingest: { added: 0, skipped: [] },
    images: { mirrored: 0, failed: 0 },
    validate: { ok: false, summary: "" },
    drafts: [],
  };

  const sourceFilter = args.sources;
  const activeSources = sourceFilter
    ? BESTSELLER_SOURCES.filter((s) =>
        sourceFilter.some((f) => s.label.toLowerCase().includes(f.toLowerCase())),
      )
    : BESTSELLER_SOURCES;

  console.log(`■ scraping ${activeSources.length} best-seller/movers listing pages...`);

  // 1. Scrape each listing page in full (title/price/rating/reviews/thumbnail)
  const allTiles: ListingTile[] = [];
  for (const src of activeSources) {
    try {
      const tiles = await scrapeListingPage(src);
      const top = tiles.slice(0, args.perSource);
      allTiles.push(...top);
      report.sources.push({ label: src.label, tiles: top.length });
      console.log(`  ${src.label}: ${top.length} tiles (top ${args.perSource})`);
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`  ${src.label}: ERROR — ${msg}`);
      report.sources.push({ label: src.label, tiles: 0 });
    }
  }
  report.dedupe.totalDiscovered = allTiles.length;

  // 2. Dedupe against existing catalog + within-run
  const existingAsins = new Set(
    products.map((p) => p.asin).filter((a) => ASIN_STRICT_RE.test(a)),
  );
  const seenInRun = new Set<string>();
  const uniqueTiles: ListingTile[] = [];
  for (const t of allTiles) {
    if (existingAsins.has(t.asin)) {
      report.dedupe.duplicateAsin++;
      continue;
    }
    if (seenInRun.has(t.asin)) continue;
    seenInRun.add(t.asin);
    uniqueTiles.push(t);
  }
  report.dedupe.unique = uniqueTiles.length;
  console.log(
    `\n■ dedupe: ${allTiles.length} tiles → ${uniqueTiles.length} unique (${report.dedupe.duplicateAsin} already in catalog)`,
  );

  if (uniqueTiles.length === 0) {
    console.log("nothing new to process. Exiting.");
    finalize(report);
    return;
  }

  // 3. Quality filter (fast — no network calls)
  const passed: ListingTile[] = [];
  for (const t of uniqueTiles) {
    const q = qualityFilter(t, args);
    if (q.ok) {
      passed.push(t);
      report.filter.passed++;
    } else {
      report.filter.rejected++;
      report.filter.rejections.push({ asin: t.asin, title: t.title, reason: q.reason });
    }
  }
  console.log(
    `\n■ quality filter: ${report.filter.passed} passed · ${report.filter.rejected} rejected`,
  );
  if (report.filter.rejections.length > 0 && report.filter.rejections.length <= 20) {
    for (const r of report.filter.rejections) {
      console.log(`    - ${r.asin} ${(r.title ?? "").slice(0, 50)}: ${r.reason}`);
    }
  }

  // 4. Cap at maxIngest BEFORE spending bandwidth on detail fetches
  const capped = passed.slice(0, args.maxIngest);
  if (capped.length < passed.length) {
    console.log(`  capped to ${capped.length} (max-ingest=${args.maxIngest})`);
  }

  // 5. Fetch product detail only for passed tiles (for hi-res images + bullets)
  console.log(
    `\n■ fetching detail pages for ${capped.length} products (concurrency ${CONCURRENCY})...`,
  );
  report.detailFetch.attempted = capped.length;
  const details = await mapConcurrent(
    capped,
    CONCURRENCY,
    async (t) => fetchProductDetail(t.asin),
    (done, total) => {
      if (done === total || done % 5 === 0)
        process.stdout.write(`  ${done}/${total}\n`);
    },
  );
  for (const d of details) {
    if (d.error) report.detailFetch.failed++;
    else report.detailFetch.succeeded++;
  }

  // 6. Dedupe by slug (Amazon sometimes runs variant ASINs with near-identical titles)
  const existingSlugs = new Set(products.map((p) => p.slug));
  const usedSlugs = new Set<string>();
  const finalDrafts: DraftInput[] = [];
  for (let i = 0; i < capped.length; i++) {
    const tile = capped[i];
    const detail = details[i];
    const slug = slugify(tile.title ?? "");
    if (existingSlugs.has(slug)) {
      report.ingest.skipped.push({ asin: tile.asin, reason: `duplicate slug: ${slug}` });
      continue;
    }
    if (usedSlugs.has(slug)) {
      report.ingest.skipped.push({ asin: tile.asin, reason: `in-run slug collision: ${slug}` });
      continue;
    }
    usedSlugs.add(slug);
    const catSlug = mapAmazonCategory(detail.category, tile.ourCategory);
    finalDrafts.push({ tile, detail, ourCategorySlug: catSlug });
  }

  // 7. Build blocks
  let id = nextId();
  const blocks: string[] = [];
  for (const draft of finalDrafts) {
    blocks.push(formatBlock(draft, id));
    report.drafts.push({
      id,
      asin: draft.tile.asin,
      title: draft.tile.title ?? "",
      price: draft.tile.price ?? 0,
      rating: draft.tile.rating ?? 0,
      reviews: draft.tile.reviewCount ?? 0,
      category: draft.ourCategorySlug,
      source: draft.tile.sourceLabel,
      rank: draft.tile.rank,
    });
    id++;
  }
  report.ingest.added = blocks.length;

  if (blocks.length === 0) {
    console.log("nothing to insert after filter + dedupe.");
    finalize(report);
    return;
  }

  if (args.dryRun) {
    console.log(`\n■ DRY RUN — would insert ${blocks.length} drafts:`);
    for (const d of report.drafts) {
      console.log(
        `    #${d.id} [${d.category}] $${d.price} ★${d.rating} (${d.reviews}) ${d.title.slice(0, 70)}`,
      );
      console.log(`         ← ${d.source} rank ${d.rank}`);
    }
    finalize(report);
    return;
  }

  // 8. Write to data.ts
  console.log(`\n■ inserting ${blocks.length} drafts into data.ts...`);
  writeToDataTs(blocks);
  for (const d of report.drafts) {
    console.log(
      `    #${d.id} [${d.category}] $${d.price} ★${d.rating} (${d.reviews}) ${d.title.slice(0, 70)}`,
    );
  }

  // 9. Mirror images
  console.log(`\n■ mirroring new images...`);
  const mirror = runPnpm("mirror:images");
  const okMatch = mirror.output.match(/ok=(\d+)/);
  const failMatch = mirror.output.match(/fail=(\d+)/);
  report.images.mirrored = okMatch ? parseInt(okMatch[1], 10) : 0;
  report.images.failed = failMatch ? parseInt(failMatch[1], 10) : 0;
  console.log(`  mirrored: ${report.images.mirrored}, failed: ${report.images.failed}`);

  // 10. Fix category counts (no-op for drafts, safety net)
  runPnpm("fix:counts");

  // 11. Validate
  console.log(`\n■ validating data.ts...`);
  const validate = runPnpm("check:data");
  report.validate.ok = validate.ok;
  const errMatch = validate.output.match(/errors:\s+(\d+)/);
  const warnMatch = validate.output.match(/warnings:\s+(\d+)/);
  report.validate.summary = `errors=${errMatch?.[1] ?? "?"}, warnings=${warnMatch?.[1] ?? "?"}`;
  console.log(`  ${report.validate.summary} ${validate.ok ? "✓" : "✗"}`);
  if (!validate.ok) {
    console.log(validate.output.split("\n").slice(-25).join("\n"));
  }

  finalize(report);
}

function finalize(report: DiscoverReport): void {
  report.finishedAt = new Date().toISOString();
  report.durationMs = Date.now() - new Date(report.startedAt).getTime();

  if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });
  const reportPath = join(
    DOCS_DIR,
    `amazon-discover-${report.startedAt.replace(/[:.]/g, "-")}.json`,
  );
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`amazon:discover complete in ${(report.durationMs / 1000).toFixed(1)}s`);
  console.log(
    `  discovered ${report.dedupe.totalDiscovered} tiles · ${report.dedupe.unique} unique · ${report.dedupe.duplicateAsin} already in catalog`,
  );
  console.log(
    `  filter: ${report.filter.passed} passed · ${report.filter.rejected} rejected`,
  );
  console.log(
    `  detail fetch: ${report.detailFetch.succeeded}/${report.detailFetch.attempted}`,
  );
  console.log(
    `  ingested ${report.ingest.added} drafts (skipped ${report.ingest.skipped.length})`,
  );
  if (report.dryRun) {
    console.log(`  images: (skipped — dry run)`);
    console.log(`  validate: (skipped — dry run)`);
  } else if (report.ingest.added === 0) {
    console.log(`  images: (skipped — nothing ingested)`);
    console.log(`  validate: (skipped — nothing ingested)`);
  } else {
    console.log(`  images ok=${report.images.mirrored} fail=${report.images.failed}`);
    console.log(`  validate: ${report.validate.summary} ${report.validate.ok ? "✓" : "✗"}`);
  }
  console.log(`  full report: ${reportPath}`);
  console.log(`═══════════════════════════════════════════════════════`);

  if (!report.dryRun && report.ingest.added > 0 && !report.validate.ok) process.exit(1);
}

await main();
