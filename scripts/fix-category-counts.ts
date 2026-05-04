/**
 * Auto-update category `productCount` in data.ts to match the actual number
 * of live (non-draft) products in each category. Idempotent — safe to run
 * any time. Part of the "unbreakable" chain: any product add/remove/promote
 * can be followed by this script to keep counts truthful.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products, categories } from "../client/src/lib/data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");

// count live products per category
const counts = new Map<string, number>();
for (const p of products) {
  if (p.isDraft) continue;
  counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1);
}

let src = readFileSync(DATA_PATH, "utf8");
let changed = 0;

for (const c of categories) {
  const actual = counts.get(c.slug) ?? 0;
  if (actual === c.productCount) continue;
  // Find the category block by slug and rewrite productCount inside it.
  const blockRe = new RegExp(
    `(slug:\\s*"${c.slug.replace(/[-/]/g, "\\$&")}",[\\s\\S]*?productCount:\\s*)(\\d+)`,
    "m",
  );
  const m = src.match(blockRe);
  if (!m) {
    console.warn(`  [skip] ${c.slug}: could not locate productCount`);
    continue;
  }
  src = src.replace(blockRe, `$1${actual}`);
  console.log(`  ${c.slug}: ${c.productCount} -> ${actual}`);
  changed++;
}

if (changed > 0) writeFileSync(DATA_PATH, src);
console.log(`updated ${changed} category count${changed === 1 ? "" : "s"}`);
