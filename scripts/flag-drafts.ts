/**
 * One-off: mark as `isDraft: true` every product that matches the placeholder
 * criteria documented in scripts/report-placeholders.ts (bad ASIN format,
 * price=0, or a duplicate ASIN across unrelated products).
 *
 * After running, `pnpm check` should pass and these products are hidden from
 * the live site via the helpers in client/src/lib/data.ts. They can be
 * promoted to live by removing the `isDraft: true,` line (or setting false).
 *
 * Idempotent: products already marked draft are left alone; non-draft
 * products gain the flag.
 *
 * Run:  `pnpm tsx scripts/flag-drafts.ts`
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../client/src/lib/data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");
const ASIN_RE = /^B0[A-Z0-9]{8}$/;

// Compute which ids to flag. Same logic as report-placeholders.ts.
const flagIds = new Set<number>();
const asinMap = new Map<string, number[]>();
for (const p of products) {
  if (!ASIN_RE.test(p.asin)) flagIds.add(p.id);
  if (typeof p.price !== "number" || p.price <= 0) flagIds.add(p.id);
  if (ASIN_RE.test(p.asin)) {
    if (!asinMap.has(p.asin)) asinMap.set(p.asin, []);
    asinMap.get(p.asin)!.push(p.id);
  }
}
for (const [, ids] of asinMap) if (ids.length > 1) for (const id of ids) flagIds.add(id);

if (flagIds.size === 0) {
  console.log("nothing to flag.");
  process.exit(0);
}

// Mutate data.ts by text. Each product block is bounded by `{ id: N,` at the
// start and the matching `},` at the closing brace. We only insert the flag
// once per product (guarded by existing `isDraft` detection).
let src = readFileSync(DATA_PATH, "utf8");
let flagged = 0;
let skipped = 0;

for (const id of flagIds) {
  // Match the product's block by its id line, capture up to the closing },
  const re = new RegExp(`(\\{\\s*\\n\\s*id:\\s*${id},[\\s\\S]*?\\n  \\},)`, "m");
  const m = src.match(re);
  if (!m) {
    console.warn(`  could not locate product #${id}`);
    continue;
  }
  const block = m[1];
  if (/isDraft:\s*true/.test(block)) {
    skipped++;
    continue;
  }
  // Insert `isDraft: true,` after the `specs: { ... },` line (the last field).
  // Conservative: insert just before the closing `  },`.
  const newBlock = block.replace(/(\n  \},)$/, "\n    isDraft: true, // flagged by scripts/flag-drafts.ts — verify or remove\n  },");
  if (newBlock === block) {
    console.warn(`  no insertion point in #${id}`);
    continue;
  }
  src = src.replace(block, newBlock);
  flagged++;
}

writeFileSync(DATA_PATH, src);
console.log(`flagged ${flagged} products as draft (${skipped} already were).`);
