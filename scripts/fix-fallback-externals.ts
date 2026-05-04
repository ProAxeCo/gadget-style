/**
 * Find every live product where `externalUrl === gadgetFlowUrl` (fallback used
 * because the original scraper missed the real buy link), re-scrape with the
 * improved detector, and patch the externalUrl. If the re-scrape finds an
 * Amazon ASIN, we DON'T auto-promote — just report it for the user to
 * review (changing destination amazon<->external needs manual intent).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../client/src/lib/data.js";
import { scrapeGfProduct, mapConcurrent } from "./lib/gf.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");

const targets = products.filter(
  (p) => p.destination === "external" && p.externalUrl === p.gadgetFlowUrl,
);
console.log(`Found ${targets.length} products with fallback externalUrl\n`);
if (targets.length === 0) process.exit(0);

interface Patch {
  id: number;
  title: string;
  before: string;
  after: string | null;
  isAmazon: boolean;
  note: string;
}

const patches = await mapConcurrent<typeof targets[number], Patch>(
  targets,
  8,
  async (p) => {
    const patch: Patch = {
      id: p.id,
      title: p.title,
      before: p.externalUrl ?? "",
      after: null,
      isAmazon: false,
      note: "",
    };
    try {
      const r = await scrapeGfProduct(p.gadgetFlowUrl);
      if (r.asin) {
        patch.isAmazon = true;
        patch.note = `now resolves to Amazon ASIN ${r.asin} — needs manual destination flip`;
      } else if (r.externalUrl && r.externalUrl !== p.gadgetFlowUrl) {
        patch.after = r.externalUrl;
        patch.note = "patched";
      } else {
        patch.note = "still no real buy link — keep as-is";
      }
    } catch (e) {
      patch.note = `scrape error: ${String(e)}`;
    }
    return patch;
  },
  (done, total) => console.log(`  ${done}/${total}`),
);

console.log("\nResults:");
for (const p of patches) {
  console.log(`  #${p.id}  ${p.note}${p.after ? `  →  ${p.after.slice(0, 80)}` : ""}`);
}

const toPatch = patches.filter((p) => p.after);
if (toPatch.length === 0) {
  console.log("\nNo patches to apply.");
  process.exit(0);
}

let src = readFileSync(DATA_PATH, "utf8");
let applied = 0;
for (const p of toPatch) {
  const blockRe = new RegExp(
    `(\\n\\s*id:\\s*${p.id},[\\s\\S]*?externalUrl:\\s*)"[^"]*"`,
    "m",
  );
  const before = src;
  src = src.replace(blockRe, `$1${JSON.stringify(p.after)}`);
  if (src !== before) applied++;
}
writeFileSync(DATA_PATH, src);
console.log(`\nApplied ${applied} patches.`);
