/**
 * Batch-promote drafts. For each product currently `isDraft: true`:
 *   - Verify it would pass strict validation (price > 0, valid ASIN, etc.)
 *   - If yes: remove the `isDraft: true,` line so it goes live
 *   - If no: leave it as a draft, log the reason
 *
 * After running, do `pnpm fix:counts && pnpm check` to update category
 * counts and confirm the validator is happy.
 *
 * Idempotent — re-running is safe; products already promoted are left alone.
 *
 * Usage:
 *   pnpm tsx scripts/promote-drafts.ts             # promote eligible drafts
 *   pnpm tsx scripts/promote-drafts.ts --dry-run   # show what would happen
 *   pnpm tsx scripts/promote-drafts.ts --ids 1,2   # promote only these ids
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products, type Product } from "../client/src/lib/data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");

const ASIN_RE = /^B0[A-Z0-9]{8}$/;
const SLUG_RE = /^[a-z0-9-]+$/;
const AFFILIATE_TAG = "gadgetstyle01-20";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const idFilter = (() => {
  const i = args.indexOf("--ids");
  if (i < 0) return null;
  return new Set(args[i + 1].split(",").map((n) => parseInt(n, 10)));
})();

interface Decision {
  id: number;
  title: string;
  promote: boolean;
  reasons: string[];
}

function evaluate(p: Product): Decision {
  const reasons: string[] = [];
  if (typeof p.price !== "number" || p.price <= 0) reasons.push(`price=${p.price}`);
  if (!p.title?.trim()) reasons.push("empty title");
  if (!SLUG_RE.test(p.slug)) reasons.push(`bad slug "${p.slug}"`);
  // For Amazon destination, the ASIN must be real (not the B000000000 placeholder).
  const dest = p.destination ?? "amazon";
  if (dest === "amazon") {
    if (!ASIN_RE.test(p.asin)) reasons.push(`bad ASIN "${p.asin}"`);
    if (p.asin === "B000000000") reasons.push("placeholder ASIN");
    if (!p.affiliateUrl?.includes(`tag=${AFFILIATE_TAG}`))
      reasons.push("missing affiliate tag");
  } else if (dest === "external") {
    if (!p.externalUrl) reasons.push("destination=external but no externalUrl");
  }
  return { id: p.id, title: p.title, promote: reasons.length === 0, reasons };
}

const drafts = products.filter((p) => p.isDraft && (!idFilter || idFilter.has(p.id)));
const decisions = drafts.map(evaluate);
const promotable = decisions.filter((d) => d.promote);
const blocked = decisions.filter((d) => !d.promote);

console.log(`Found ${drafts.length} drafts.`);
console.log(`  ${promotable.length} ready to promote`);
console.log(`  ${blocked.length} kept as drafts (need manual fixes)\n`);

if (blocked.length > 0) {
  console.log("Blocked from promotion:");
  for (const b of blocked) console.log(`  #${b.id}  ${b.reasons.join(", ")}  — ${b.title}`);
  console.log("");
}

if (dryRun) {
  console.log(`DRY RUN — pass without --dry-run to apply.`);
  process.exit(0);
}

if (promotable.length === 0) {
  console.log("Nothing to promote.");
  process.exit(0);
}

// Apply: remove `isDraft: true,` from each promotable product block.
let src = readFileSync(DATA_PATH, "utf8");
let promoted = 0;
for (const d of promotable) {
  // Match the product block by id, then strip the isDraft line.
  const blockRe = new RegExp(`(\\n\\s*id:\\s*${d.id},[\\s\\S]*?\\n  \\},)`, "m");
  const m = src.match(blockRe);
  if (!m) {
    console.warn(`  could not locate #${d.id}`);
    continue;
  }
  const block = m[1];
  const newBlock = block.replace(/\n\s*isDraft:\s*true,[^\n]*/g, "");
  if (newBlock !== block) {
    src = src.replace(block, newBlock);
    promoted++;
  }
}
writeFileSync(DATA_PATH, src);

console.log(`Promoted ${promoted} draft(s) to live.`);
console.log("Next: pnpm fix:counts && pnpm check");
