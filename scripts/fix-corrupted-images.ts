/**
 * Find and fix products whose images were corrupted by scraping redirects
 * (og:image pointing at GF's homepage landing graphic, or sidebar category
 * thumbnails leaking into the gallery).
 *
 * Strategy:
 *   1. Normalize every gadgetFlowUrl in data.ts to have a trailing slash.
 *   2. Re-scrape affected products (those whose images contain known-bad
 *      homepage/category markers).
 *   3. Replace images; if the re-scrape reports homepage redirect, leave
 *      the product flagged in the report instead of overwriting.
 *   4. `pnpm mirror:images` afterwards picks up any fresh URLs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../client/src/lib/data.js";
import { scrapeGfProduct, normalizeGfUrl, mapConcurrent } from "./lib/gf.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");

// Image markers that indicate corruption (generic category/homepage images)
const CORRUPT_MARKERS = [
  "og_home_",
  "NewBBQ-Large",
  "AI-Gadgets-2021-New-Category-Large",
  "Gaming-Gadgets-Category-Large",
  "Health-Fitness-Category-Large",
  "iPhone-Accessories-2021-Category-Large",
  "Kitchen-Gadgets-Large",
  "Tech-Gadgets-New-2021-Category-Large",
];

const isCorrupt = (imgs: string[]): boolean =>
  imgs.some((img) => CORRUPT_MARKERS.some((m) => img.includes(m)));

let src = readFileSync(DATA_PATH, "utf8");

// Pass 1: normalize all gadgetFlowUrls to have trailing slashes
let urlsNormalized = 0;
for (const p of products) {
  if (!p.gadgetFlowUrl) continue;
  const normalized = normalizeGfUrl(p.gadgetFlowUrl);
  if (normalized !== p.gadgetFlowUrl) {
    src = src.split(`"${p.gadgetFlowUrl}"`).join(`"${normalized}"`);
    urlsNormalized++;
  }
}
if (urlsNormalized > 0) {
  writeFileSync(DATA_PATH, src);
  console.log(`Normalized ${urlsNormalized} gadgetFlowUrl(s) to trailing-slash form.`);
}

// Pass 2: re-scrape corrupted products
const corrupted = products.filter((p) => p.images && isCorrupt(p.images));
if (corrupted.length === 0) {
  console.log("No corrupted images detected. Clean.");
  process.exit(0);
}

console.log(`\n${corrupted.length} products with corrupted images — re-scraping...`);
interface Fix {
  id: number;
  title: string;
  note: string;
  newImages?: string[];
}
const fixes = await mapConcurrent<typeof corrupted[number], Fix>(
  corrupted,
  8,
  async (p) => {
    const gfUrl = normalizeGfUrl(p.gadgetFlowUrl);
    const r = await scrapeGfProduct(gfUrl);
    if (r.error) return { id: p.id, title: p.title, note: r.error };
    if (r.images.length === 0) return { id: p.id, title: p.title, note: "no images returned" };
    return { id: p.id, title: p.title, note: "patched", newImages: r.images };
  },
  (done, total) => console.log(`  ${done}/${total}`),
);

console.log("\nResults:");
for (const f of fixes) {
  const imgs = f.newImages ? `  (${f.newImages.length} fresh images)` : "";
  console.log(`  #${f.id}  ${f.note}${imgs}  — ${f.title.slice(0, 50)}`);
}

const toApply = fixes.filter((f) => f.newImages);
if (toApply.length === 0) {
  console.log("\nNothing to apply.");
  process.exit(0);
}

// Write fixes
src = readFileSync(DATA_PATH, "utf8"); // re-read after normalization
let applied = 0;
for (const f of toApply) {
  const blockRe = new RegExp(`(\\{\\s*\\n\\s*id:\\s*${f.id},[\\s\\S]*?\\n  \\},)`, "m");
  const m = src.match(blockRe);
  if (!m) continue;
  let block = m[1];
  const imagesJson = "[" + f.newImages!.map((u) => JSON.stringify(u)).join(", ") + "]";
  block = block.replace(/images:\s*\[[^\]]*\]/, `images: ${imagesJson}`);
  block = block.replace(/image:\s*"[^"]*"/, `image: ${JSON.stringify(f.newImages![0])}`);
  if (block !== m[1]) {
    src = src.replace(m[1], block);
    applied++;
  }
}
writeFileSync(DATA_PATH, src);
console.log(`\nApplied ${applied} fix(es). Next: pnpm mirror:images && pnpm check`);
