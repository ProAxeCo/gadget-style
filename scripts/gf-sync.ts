/**
 * Gadget Flow end-to-end sync — one command, bulletproof.
 *
 * Orchestrates: discover → scrape (parallel) → ingest → mirror → fix:counts → validate.
 * Idempotent and safe to re-run. Dedupes by gadgetFlowUrl, slug, and ASIN.
 * All new products land as `isDraft: true` — nothing goes live without review.
 *
 * Usage:
 *   pnpm gf:sync                 # default: discover and ingest up to 20 fresh products
 *   pnpm gf:sync --limit 10      # cap discovery at 10 URLs
 *   pnpm gf:sync --amazon-only   # only ingest products with an Amazon ASIN
 *                                  (non-Amazon scrapes are discarded)
 *   pnpm gf:sync --url <u>,<u>   # scrape specific URLs instead of discovering
 *   pnpm gf:sync --dry-run       # show what would be ingested, don't touch data.ts
 *
 * Environment:
 *   GF_CONCURRENCY=8             # scrape parallelism (default 8)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { products, categories } from "../client/src/lib/data.js";
import {
  type ScrapeResult,
  ASIN_STRICT_RE,
  discoverGfProductUrls,
  scrapeGfProduct,
  mapConcurrent,
  slugify,
} from "./lib/gf.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_PATH = join(REPO_ROOT, "client", "src", "lib", "data.ts");
const DOCS_DIR = join(REPO_ROOT, "docs");
const AFFILIATE_TAG = "gadgetstyle01-20";
const CONCURRENCY = Number(process.env.GF_CONCURRENCY ?? "8");

// --- CLI args ---
interface Args {
  limit: number;
  maxIngest: number;
  urls: string[];
  dryRun: boolean;
  amazonOnly: boolean;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const out: Args = { limit: 20, maxIngest: Infinity, urls: [], dryRun: false, amazonOnly: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit") out.limit = parseInt(argv[++i] ?? "20", 10);
    else if (a === "--max-ingest") out.maxIngest = parseInt(argv[++i] ?? "0", 10);
    else if (a === "--url") out.urls.push(...(argv[++i] ?? "").split(",").filter(Boolean));
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--amazon-only") out.amazonOnly = true;
    else if (a === "--help" || a === "-h") {
      console.log(
        "pnpm gf:sync [--limit N] [--max-ingest N] [--url URL[,URL]] [--dry-run] [--amazon-only]",
      );
      process.exit(0);
    }
  }
  return out;
}

// --- category inference ---
const CATEGORY_KEYWORDS: Array<[RegExp, string]> = [
  [/\b(headphone|earbud|speaker|audio|soundbar|dac|amplifier|turntable|microphone)\b/i, "audio"],
  [/\b(gaming|console|controller|keyboard|mouse|gamer|xbox|playstation|nintendo|steam)\b/i, "gaming"],
  [/\b(smart home|alexa|google nest|doorbell|thermostat|smart bulb|robot vacuum|security camera|fan|air conditioner|air purifier)\b/i, "smart-home"],
  [/\b(watch|fitness|tracker|wearable|heart rate|smartwatch|gym|workout|apple watch)\b/i, "wearables"],
  [/\b(outdoor|camping|hiking|adventure|action cam|bike|expedition|hunting|fishing)\b/i, "outdoor-tech"],
  [/\b(wallet|backpack|bag|pen|edc|everyday carry|power bank|charger|drive|usb|phone|smartphone|tablet|laptop)\b/i, "everyday-carry"],
];

function pickCategory(r: ScrapeResult): { name: string; slug: string } {
  const haystack = `${r.title ?? ""} ${r.description ?? ""} ${r.tags.join(" ")} ${r.categoryHint ?? ""}`;
  for (const [re, slug] of CATEGORY_KEYWORDS) {
    if (re.test(haystack)) {
      const cat = categories.find((c) => c.slug === slug);
      if (cat) return { name: cat.name, slug: cat.slug };
    }
  }
  const def = categories.find((c) => c.slug === "everyday-carry")!;
  return { name: def.name, slug: def.slug };
}

// --- ingest helpers ---
function nextId(): number {
  let id = 0;
  for (const p of products) if (p.id > id) id = p.id;
  return id + 1;
}

function formatBlock(r: ScrapeResult, id: number): string {
  const title = r.title ?? "UNTITLED";
  const slug = slugify(title);
  const category = pickCategory(r);
  const price = r.priceHint ? parseFloat(r.priceHint) : 0;
  const image = r.image ?? r.images[0] ?? "";
  const imgs = r.images.length ? r.images : image ? [image] : [];
  const imagesStr = imgs.map((u) => JSON.stringify(u)).join(", ");
  const tags = r.tags.length ? r.tags : ["Gadget Flow"];
  const tagsStr = tags.map((t) => JSON.stringify(t)).join(", ");
  const today = new Date().toISOString().slice(0, 10);

  const hasAmazon = !!r.asin;
  const asin = r.asin ?? "B000000000";
  const affiliateUrl = `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
  const destLine = hasAmazon
    ? ""
    : `\n    destination: "external",\n    externalUrl: ${JSON.stringify(r.externalUrl ?? r.gadgetFlowUrl)},`;
  const videosLine =
    r.videos && r.videos.length > 0
      ? `\n    videos: [${r.videos.map((v) => JSON.stringify(v)).join(", ")}],`
      : "";

  return `  {
    id: ${id},
    title: ${JSON.stringify(title)},
    slug: ${JSON.stringify(slug)},
    description: ${JSON.stringify(r.description ?? "")},
    price: ${price},
    category: ${JSON.stringify(category.name)},
    categorySlug: ${JSON.stringify(category.slug)},
    image: ${JSON.stringify(image)},
    images: [${imagesStr}],
    rating: 4.5,
    reviewCount: 0,
    asin: ${JSON.stringify(asin)},
    affiliateUrl: ${JSON.stringify(affiliateUrl)},
    gadgetFlowUrl: ${JSON.stringify(r.gadgetFlowUrl)},
    tags: [${tagsStr}],
    dateAdded: ${JSON.stringify(today)},
    isFeatured: false,
    isTrending: false,
    specs: {},
    isDraft: true,${destLine}${videosLine}
  },`;
}

function writeToDataTs(blocks: string[]): void {
  const src = readFileSync(DATA_PATH, "utf8");
  const productsArrayEnd = src.match(/\n\]\s*;\s*\n\s*\nexport const categories/);
  if (!productsArrayEnd) throw new Error("could not locate end of products[] array");
  const insertAt = src.indexOf(productsArrayEnd[0]);
  // Ensure trailing comma on the previous last element.
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

// --- structured report ---
interface SyncReport {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  dryRun: boolean;
  discovery: { total: number; alreadyInCatalog: number; fresh: number };
  scrape: { attempted: number; succeeded: number; failed: number; withAmazon: number; withExternal: number; noBuyLink: number };
  ingest: { added: number; skipped: Array<{ url: string; reason: string }> };
  images: { mirrored: number; failed: number };
  validate: { ok: boolean; summary: string };
  drafts: Array<{ id: number; title: string; destination: "amazon" | "external"; buyUrl: string }>;
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
    discovery: { total: 0, alreadyInCatalog: 0, fresh: 0 },
    scrape: { attempted: 0, succeeded: 0, failed: 0, withAmazon: 0, withExternal: 0, noBuyLink: 0 },
    ingest: { added: 0, skipped: [] },
    images: { mirrored: 0, failed: 0 },
    validate: { ok: false, summary: "" },
    drafts: [],
  };

  // 1. Discovery (or use user-provided URLs)
  let targetUrls: string[];
  if (args.urls.length > 0) {
    targetUrls = args.urls;
    console.log(`■ using ${args.urls.length} URL(s) from --url`);
  } else {
    console.log("■ discovering fresh GF product URLs...");
    const all = await discoverGfProductUrls();
    report.discovery.total = all.length;
    const existing = new Set(
      products.map((p) => p.gadgetFlowUrl?.toLowerCase()).filter(Boolean),
    );
    const fresh = all.filter((u) => !existing.has(u));
    report.discovery.alreadyInCatalog = all.length - fresh.length;
    targetUrls = fresh.slice(0, args.limit);
    report.discovery.fresh = targetUrls.length;
    console.log(
      `  ${all.length} found · ${report.discovery.alreadyInCatalog} already in catalog · ${targetUrls.length} fresh (limit ${args.limit})`,
    );
    if (targetUrls.length === 0) {
      console.log("nothing fresh to ingest. Exiting cleanly.");
      finalize(report);
      return;
    }
  }

  // 2. Scrape in parallel
  console.log(`\n■ scraping ${targetUrls.length} pages (concurrency ${CONCURRENCY})...`);
  report.scrape.attempted = targetUrls.length;
  const scrapes = await mapConcurrent(
    targetUrls,
    CONCURRENCY,
    async (url) => {
      const r = await scrapeGfProduct(url);
      return r;
    },
    (done, total) => {
      if (done === total || done % 5 === 0) process.stdout.write(`  ${done}/${total}\n`);
    },
  );
  for (const r of scrapes) {
    if (r.error) report.scrape.failed++;
    else {
      report.scrape.succeeded++;
      if (r.hasAmazonLink && r.asin) report.scrape.withAmazon++;
      else if (r.externalUrl) report.scrape.withExternal++;
      else report.scrape.noBuyLink++;
    }
  }

  // 3. Dedupe + build draft blocks
  console.log(`\n■ deduplicating against existing catalog...`);
  const existingGfUrls = new Set(products.map((p) => p.gadgetFlowUrl?.toLowerCase()).filter(Boolean));
  const existingSlugs = new Set(products.map((p) => p.slug));
  const existingAsins = new Set(
    products.map((p) => p.asin).filter((a) => ASIN_STRICT_RE.test(a)),
  );

  let id = nextId();
  const blocks: string[] = [];
  const drafts: SyncReport["drafts"] = [];

  for (const r of scrapes) {
    if (r.error) {
      report.ingest.skipped.push({ url: r.gadgetFlowUrl, reason: r.error });
      continue;
    }
    if (!r.title) {
      report.ingest.skipped.push({ url: r.gadgetFlowUrl, reason: "no title extracted" });
      continue;
    }
    if (args.amazonOnly && !r.asin) {
      report.ingest.skipped.push({
        url: r.gadgetFlowUrl,
        reason: "no Amazon ASIN (--amazon-only mode)",
      });
      continue;
    }
    if (existingGfUrls.has(r.gadgetFlowUrl.toLowerCase())) {
      report.ingest.skipped.push({ url: r.gadgetFlowUrl, reason: "duplicate gadgetFlowUrl" });
      continue;
    }
    const slug = slugify(r.title);
    if (existingSlugs.has(slug)) {
      report.ingest.skipped.push({ url: r.gadgetFlowUrl, reason: `duplicate slug: ${slug}` });
      continue;
    }
    if (r.asin && existingAsins.has(r.asin)) {
      report.ingest.skipped.push({ url: r.gadgetFlowUrl, reason: `duplicate ASIN: ${r.asin}` });
      continue;
    }
    blocks.push(formatBlock(r, id));
    drafts.push({
      id,
      title: r.title,
      destination: r.asin ? "amazon" : "external",
      buyUrl: r.asin
        ? `https://www.amazon.com/dp/${r.asin}?tag=${AFFILIATE_TAG}`
        : (r.externalUrl ?? r.gadgetFlowUrl),
    });
    existingSlugs.add(slug);
    if (r.asin) existingAsins.add(r.asin);
    existingGfUrls.add(r.gadgetFlowUrl.toLowerCase());
    id++;
    if (blocks.length >= args.maxIngest) {
      // Stop early — we hit the requested cap.
      break;
    }
  }
  report.ingest.added = blocks.length;
  report.drafts = drafts;

  if (blocks.length === 0) {
    console.log("  nothing to insert after dedupe.");
    finalize(report);
    return;
  }

  if (args.dryRun) {
    console.log(`\n■ DRY RUN — would insert ${blocks.length} drafts:`);
    for (const d of drafts) console.log(`    #${d.id} [${d.destination}] ${d.title}`);
    finalize(report);
    return;
  }

  // 4. Write to data.ts
  console.log(`\n■ inserting ${blocks.length} drafts into data.ts...`);
  writeToDataTs(blocks);
  for (const d of drafts) console.log(`    #${d.id} [${d.destination}] ${d.title}`);

  // 5. Mirror new images
  console.log(`\n■ mirroring new images...`);
  const mirror = runPnpm("mirror:images");
  const okMatch = mirror.output.match(/ok=(\d+)/);
  const failMatch = mirror.output.match(/fail=(\d+)/);
  report.images.mirrored = okMatch ? parseInt(okMatch[1], 10) : 0;
  report.images.failed = failMatch ? parseInt(failMatch[1], 10) : 0;
  console.log(`  mirrored: ${report.images.mirrored}, failed: ${report.images.failed}`);

  // 6. Fix category counts (no-op for drafts, safety net)
  runPnpm("fix:counts");

  // 7. Validate
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

function finalize(report: SyncReport): void {
  report.finishedAt = new Date().toISOString();
  report.durationMs = Date.now() - new Date(report.startedAt).getTime();

  if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });
  const reportPath = join(
    DOCS_DIR,
    `gf-sync-${report.startedAt.replace(/[:.]/g, "-")}.json`,
  );
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`gf-sync complete in ${(report.durationMs / 1000).toFixed(1)}s`);
  console.log(
    `  discovered ${report.discovery.fresh} fresh (of ${report.discovery.total} total)`,
  );
  console.log(
    `  scraped ${report.scrape.succeeded}/${report.scrape.attempted}   amazon=${report.scrape.withAmazon}  external=${report.scrape.withExternal}  no-buy=${report.scrape.noBuyLink}  failed=${report.scrape.failed}`,
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

  // Only non-zero exit if we actually ran validation and it failed.
  // Dry runs and empty-discoveries intentionally exit 0.
  if (!report.dryRun && report.ingest.added > 0 && !report.validate.ok) process.exit(1);
}

await main();
