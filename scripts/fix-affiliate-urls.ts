/**
 * Rewrites every affiliateUrl in data.ts to the canonical form:
 *   https://www.amazon.com/dp/<ASIN>?tag=gadgetstyle01-20
 *
 * Rationale: Manus's commit history shows they verified the `asin` field
 * against Amazon repeatedly, but the URL would then drift because it was
 * maintained separately. Treating `asin` as authoritative and deriving the
 * URL keeps the two consistent by construction.
 *
 * This does NOT verify ASINs against real Amazon listings — that's a
 * separate spot-check. Run after: `pnpm check:data`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");
const AFFILIATE_TAG = "gadgetstyle01-20";
const ASIN_RE = /^B0[A-Z0-9]{8}$/;

const src = readFileSync(DATA_PATH, "utf8");

// Walk each product block. A product block starts at `{\n    id: N,`
// and ends at the matching closing brace. Within each block:
//   - extract `asin: "..."` (source of truth)
//   - find `affiliateUrl: "..."` and rewrite to canonical form
const productBlockRe = /\{\s*id:\s*(\d+),[\s\S]*?\n  \},/g;
const asinRe = /asin:\s*"([^"]+)"/;
const affRe = /(affiliateUrl:\s*")([^"]+)(")/;

let changed = 0;
let unchanged = 0;
let skippedBadAsin = 0;

const newSrc = src.replace(productBlockRe, (block) => {
  const asinMatch = block.match(asinRe);
  if (!asinMatch) return block;
  const asin = asinMatch[1];

  // Preserve products with malformed ASINs — fix those separately
  if (!ASIN_RE.test(asin)) {
    skippedBadAsin++;
    return block;
  }

  const canonical = `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;

  return block.replace(affRe, (_m, pre, current, post) => {
    if (current === canonical) {
      unchanged++;
      return `${pre}${current}${post}`;
    }
    changed++;
    return `${pre}${canonical}${post}`;
  });
});

if (newSrc !== src) {
  writeFileSync(DATA_PATH, newSrc);
}

console.log(`affiliateUrl rewrite:`);
console.log(`  changed:           ${changed}`);
console.log(`  already canonical: ${unchanged}`);
console.log(`  skipped (bad ASIN, fix separately): ${skippedBadAsin}`);
