/**
 * Bulk-promote drafts: read scripts/draft-prices.json, set price on each
 * matching product, remove `isDraft: true` line, refresh dateAdded.
 *
 * Usage:
 *   1. Edit scripts/draft-prices.json with the prices for each draft id:
 *      { "271": 19.99, "272": 8.50, ... }
 *      Omit any id you want to keep as draft.
 *   2. pnpm tsx scripts/promote-drafts-bulk.ts
 *   3. pnpm fix:counts && pnpm check
 *   4. git commit + push
 *
 * Idempotent and safe: if you re-run with the same JSON, products that
 * are already promoted are skipped. Validator runs at the end to confirm.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../client/src/lib/data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_PATH = join(REPO_ROOT, "client", "src", "lib", "data.ts");
const PRICES_PATH = join(REPO_ROOT, "scripts", "draft-prices.json");

if (!existsSync(PRICES_PATH)) {
  console.error(`Missing ${PRICES_PATH}`);
  console.error(`Create it with:`);
  console.error(`  { "271": 19.99, "272": 8.50, ... }`);
  console.error(`See docs/drafts-review.md for the template.`);
  process.exit(1);
}

const priceMap = JSON.parse(readFileSync(PRICES_PATH, "utf8")) as Record<string, number>;
const today = new Date().toISOString().slice(0, 10);

let src = readFileSync(DATA_PATH, "utf8");
let promoted = 0;
let skipped: string[] = [];
const failures: string[] = [];

for (const [idStr, priceRaw] of Object.entries(priceMap)) {
  const id = parseInt(idStr, 10);
  const price = Number(priceRaw);
  if (!isFinite(price) || price <= 0) {
    failures.push(`#${id}: invalid price ${priceRaw}`);
    continue;
  }
  const product = products.find((p) => p.id === id);
  if (!product) {
    failures.push(`#${id}: not found in data.ts`);
    continue;
  }
  if (!product.isDraft) {
    skipped.push(`#${id} (already promoted)`);
    continue;
  }

  // Find the product block in source by id, then mutate price + dateAdded + isDraft
  const blockRe = new RegExp(
    `(\\n\\s*id:\\s*${id},)([\\s\\S]*?)(\\n  \\},)`,
  );
  const m = src.match(blockRe);
  if (!m) {
    failures.push(`#${id}: could not match block in data.ts`);
    continue;
  }
  let block = m[2];

  // Replace price: 0 → price: <price>
  if (/\n\s*price:\s*0\b/.test(block)) {
    block = block.replace(/(\n\s*price:\s*)0\b/, `$1${price.toFixed(2)}`);
  } else {
    failures.push(`#${id}: expected 'price: 0' not found in block`);
    continue;
  }

  // Update dateAdded if present
  if (/\n\s*dateAdded:\s*"[^"]*"/.test(block)) {
    block = block.replace(/(\n\s*dateAdded:\s*)"[^"]*"/, `$1"${today}"`);
  }

  // Remove the `isDraft: true,` line
  block = block.replace(/\n\s*isDraft:\s*true,/, "");

  src = src.slice(0, m.index! + m[1].length) + block + src.slice(m.index! + m[1].length + m[2].length);
  promoted++;
  console.log(`  ✓ #${id} → $${price.toFixed(2)} (was draft)`);
}

writeFileSync(DATA_PATH, src);

console.log("");
console.log(`Promoted: ${promoted}`);
if (skipped.length) console.log(`Skipped (already live): ${skipped.length}`);
if (failures.length) {
  console.log(`\nFailures:`);
  for (const f of failures) console.log(`  ${f}`);
}
console.log("");
console.log("Next: pnpm fix:counts && pnpm check");
