/**
 * Manual review at scale: enrich GF-sourced products with proper data from
 * Gadget Flow. For each product with a `gadgetFlowUrl` pointing at
 * thegadgetflow.com/product/<slug>/, re-fetch the page (and the /specs/
 * subpage) and patch in:
 *   - empty specs       → key/value table from GF's /specs/ page
 *   - `["Gadget Flow"]` tags → real tags from GF's category links
 *   - thin image gallery → up to 6 gallery images from GF
 * Title, description, ASIN, price, affiliateUrl, category are NOT touched.
 *
 * Idempotent. Safe to re-run. Concurrency 8 by default.
 *
 * Usage:
 *   pnpm tsx scripts/refine-products.ts                    # all GF-sourced live products
 *   pnpm tsx scripts/refine-products.ts --ids 163,164,165  # specific ids
 *   pnpm tsx scripts/refine-products.ts --since 100        # ids >= 100
 *   pnpm tsx scripts/refine-products.ts --dry-run          # preview only
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products, type Product } from "../client/src/lib/data.js";
import { scrapeGfProduct, scrapeGfSpecs, mapConcurrent } from "./lib/gf.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");
const CONCURRENCY = Number(process.env.GF_CONCURRENCY ?? "8");

// CLI
const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const ids = (() => {
  const i = argv.indexOf("--ids");
  if (i < 0) return null;
  return new Set(argv[i + 1].split(",").map((n) => parseInt(n, 10)));
})();
const sinceId = (() => {
  const i = argv.indexOf("--since");
  if (i < 0) return 0;
  return parseInt(argv[i + 1] ?? "0", 10);
})();

// Pick targets
function isGfSourced(p: Product): boolean {
  return /^https:\/\/thegadgetflow\.com\/product\//i.test(p.gadgetFlowUrl ?? "");
}

const targets = products.filter((p) => {
  if (!isGfSourced(p)) return false;
  if (ids) return ids.has(p.id);
  if (sinceId && p.id < sinceId) return false;
  return true;
});

console.log(`Refining ${targets.length} GF-sourced products (concurrency ${CONCURRENCY})${dryRun ? " — DRY RUN" : ""}\n`);

interface Refinement {
  id: number;
  title: string;
  changes: string[];
  newSpecs?: Record<string, string>;
  newTags?: string[];
  newImages?: string[];
  newVideos?: string[];
  err?: string;
}

const refinements = await mapConcurrent<Product, Refinement>(
  targets,
  CONCURRENCY,
  async (p) => {
    const r: Refinement = { id: p.id, title: p.title, changes: [] };
    try {
      // Fetch main page (for tags + image gallery) AND specs page in parallel
      const [main, specs] = await Promise.all([
        scrapeGfProduct(p.gadgetFlowUrl),
        scrapeGfSpecs(p.gadgetFlowUrl),
      ]);
      // Specs: only fill if currently empty
      if ((!p.specs || Object.keys(p.specs).length === 0) && Object.keys(specs).length > 0) {
        r.newSpecs = specs;
        r.changes.push(`+${Object.keys(specs).length} specs`);
      }
      // Tags: replace if currently the placeholder ["Gadget Flow"] or empty
      const placeholderTags =
        !p.tags || p.tags.length === 0 || (p.tags.length === 1 && p.tags[0] === "Gadget Flow");
      if (placeholderTags && main.tags.length > 0) {
        r.newTags = main.tags;
        r.changes.push(`tags: [${main.tags.join(", ")}]`);
      }
      // Images: extend if we have more (but don't shrink)
      if (main.images.length > (p.images?.length ?? 0)) {
        r.newImages = main.images;
        r.changes.push(`images: ${p.images?.length ?? 0} → ${main.images.length}`);
      }
      // Videos: attach if GF has any and we don't
      if (main.videos.length > 0 && !(p.videos && p.videos.length > 0)) {
        r.newVideos = main.videos;
        r.changes.push(`+${main.videos.length} videos`);
      }
    } catch (e) {
      r.err = String(e);
    }
    return r;
  },
  (done, total) => {
    if (done === total || done % 10 === 0) console.log(`  ${done}/${total}`);
  },
);

const changed = refinements.filter((r) => r.changes.length > 0);
const errored = refinements.filter((r) => r.err);

console.log(`\nRefinement plan:`);
console.log(`  ${changed.length} products with changes`);
console.log(`  ${refinements.length - changed.length - errored.length} unchanged`);
console.log(`  ${errored.length} errored`);

if (changed.length === 0 && !dryRun) {
  console.log("\nNothing to apply. Done.");
  process.exit(0);
}

if (dryRun) {
  console.log("\nSample of changes (first 15):");
  for (const r of changed.slice(0, 15)) {
    console.log(`  #${r.id}  ${r.changes.join("; ")}`);
  }
  process.exit(0);
}

// --- apply ---
console.log(`\nApplying refinements...`);
let src = readFileSync(DATA_PATH, "utf8");
let applied = 0;
let imagesAdded = 0;

for (const r of changed) {
  const blockRe = new RegExp(`(\\{\\s*\\n\\s*id:\\s*${r.id},[\\s\\S]*?\\n  \\},)`, "m");
  const m = src.match(blockRe);
  if (!m) {
    console.warn(`  could not locate #${r.id}`);
    continue;
  }
  let block = m[1];
  const before = block;

  // Specs: replace `specs: {}` with the new specs object
  if (r.newSpecs) {
    const specsJson = "{ " +
      Object.entries(r.newSpecs)
        .map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`)
        .join(", ") +
      " }";
    block = block.replace(/specs:\s*\{[^}]*\}/, `specs: ${specsJson}`);
  }

  // Tags: replace tags array
  if (r.newTags) {
    const tagsJson = "[" + r.newTags.map((t) => JSON.stringify(t)).join(", ") + "]";
    block = block.replace(/tags:\s*\[[^\]]*\]/, `tags: ${tagsJson}`);
  }

  // Images: replace images array (also update primary image to first one)
  if (r.newImages) {
    imagesAdded += r.newImages.length - (r.newImages.length > 0 ? 1 : 0);
    const imagesJson = "[" + r.newImages.map((u) => JSON.stringify(u)).join(", ") + "]";
    block = block.replace(/images:\s*\[[^\]]*\]/, `images: ${imagesJson}`);
    block = block.replace(/image:\s*"[^"]*"/, `image: ${JSON.stringify(r.newImages[0])}`);
  }

  // Videos: add a `videos: [...]` line before the closing brace if new videos exist.
  if (r.newVideos && r.newVideos.length > 0) {
    const videosJson = "[" + r.newVideos.map((u) => JSON.stringify(u)).join(", ") + "]";
    if (/videos:\s*\[/.test(block)) {
      block = block.replace(/videos:\s*\[[^\]]*\]/, `videos: ${videosJson}`);
    } else {
      // Insert before the closing `\n  },`
      block = block.replace(/(\n  \},)$/, `\n    videos: ${videosJson},$1`);
    }
  }

  if (block !== before) {
    src = src.replace(m[1], block);
    applied++;
  }
}

writeFileSync(DATA_PATH, src);
console.log(`\nApplied ${applied} refinement(s).`);
if (errored.length > 0) {
  console.log(`\nErrors (first 10):`);
  for (const e of errored.slice(0, 10)) console.log(`  #${e.id}  ${e.err}`);
}
console.log("\nNext: pnpm mirror:images && pnpm check");
