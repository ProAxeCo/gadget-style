/**
 * One-off: add "Price TBD" tag to every T&T draft (drafts whose tags
 * include "Tools & Toys Pick" and price === 0). Idempotent — safe to re-run.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../client/src/lib/data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");
const NEW_TAG = "Price TBD";

const targets = products.filter(
  (p) =>
    p.isDraft &&
    p.price === 0 &&
    p.tags.some((t) => t.toLowerCase().includes("tools & toys pick")) &&
    !p.tags.includes(NEW_TAG),
);

console.log(`Found ${targets.length} T&T drafts needing "${NEW_TAG}" tag`);

let src = readFileSync(DATA_PATH, "utf8");
let updated = 0;

for (const p of targets) {
  // Find the product block by id, then update its tags array
  const blockRe = new RegExp(
    `(\\n\\s*id:\\s*${p.id},[\\s\\S]*?\\n    tags:\\s*\\[)([^\\]]*)(\\])`,
  );
  const m = src.match(blockRe);
  if (!m) {
    console.log(`  #${p.id}: could not match block`);
    continue;
  }
  const existingInner = m[2].trim();
  const newInner = existingInner.length > 0
    ? `${existingInner}, ${JSON.stringify(NEW_TAG)}`
    : JSON.stringify(NEW_TAG);
  src = src.slice(0, m.index! + m[1].length) + newInner + src.slice(m.index! + m[1].length + m[2].length);
  updated++;
  console.log(`  ✓ #${p.id} ${p.title.slice(0, 60)}`);
}

writeFileSync(DATA_PATH, src);
console.log(`\nUpdated ${updated} products. Next: pnpm check`);
