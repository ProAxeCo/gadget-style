/**
 * One-off: apply the 2026-04-21 triage decisions for the 22 Manus-era drafts.
 *
 * Modes:
 *   (default)         promotions only — safe, reversible via isDraft flag
 *   --with-removals   also delete the 13 products flagged for removal
 *
 * Split because the REMOVALS need a broader product strategy decision (GF
 * replication — many "removals" are real products not on Amazon that should
 * stay in the catalog with external destinations). Promotions are always
 * safe to run.
 *
 * For each promotion:
 *   - overwrite `asin: "..."` with the verified Amazon ASIN
 *   - remove the `isDraft: true,` line so the product goes live
 *   (affiliateUrl is rebuilt afterward by scripts/fix-affiliate-urls.ts)
 *
 * For each removal (with --with-removals):
 *   - delete the entire product block from data.ts
 *
 * After this runs, manually update category productCount totals and run
 * `pnpm check`.
 */

const WITH_REMOVALS = process.argv.includes("--with-removals");

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");

// WebSearch findings (2026-04-21). Each ASIN verified on amazon.com.
const PROMOTIONS: Record<number, { asin: string; note: string }> = {
  86:  { asin: "B0GQJLR58S", note: "Skullcandy Push 540 Open Wireless Open-Ear" },
  90:  { asin: "B00BHZQ6OG", note: "4iiii Viiiiva HR Monitor V100 (original listing still active)" },
  95:  { asin: "B0CCJ6TH74", note: "Unihertz Jelly Star (Blue)" },
  110: { asin: "B0DDQJZVHW", note: "SanDisk 128GB Phone Drive USB-C/Lightning" },
  111: { asin: "B0G52BVRLQ", note: "Aqara Doorbell G400 with Chime, Wired/PoE" },
  114: { asin: "B0GTNDFJV5", note: "ASUS ROG Strix Morph 96 Wireless" },
  115: { asin: "B0FC1VJJFP", note: "Kindle Scribe Colorsoft 64GB with Premium Pen" },
  118: { asin: "B0DMQ1QMVV", note: "Echo Studio (newest model, Graphite)" },
  120: { asin: "B0DC8ZMR1P", note: "Echo Show 8 4th Gen 2025 (Graphite)" },
};

// IDs to delete entirely — either not on Amazon, not released, or duplicates.
const REMOVALS: Array<{ id: number; reason: string }> = [
  { id: 93,  reason: "8BitDo Retro 68 AP50th — doesn't exist on Amazon" },
  { id: 96,  reason: "Numi B1 Waste Bin — not on Amazon" },
  { id: 99,  reason: "PettiChat AI Pet Translator — not on Amazon" },
  { id: 101, reason: "Silhouette Clear Sky SPX Green+ — listing ambiguous" },
  { id: 102, reason: "OnePlus Nord 6 — not released / not on Amazon" },
  { id: 103, reason: "Motorola moto pad 2026 — only accessories on US Amazon" },
  { id: 104, reason: "ASUS ExpertCenter PN55 — only PN54 exists" },
  { id: 105, reason: "Dell KM726 Pro 7 Slim — not on Amazon" },
  { id: 106, reason: "Xiaomi Mijia AC Eco 2.6kW — not on US Amazon" },
  { id: 107, reason: "Tin Can Kids WiFi Phone — not on Amazon" },
  { id: 112, reason: "Schiit Lyr 5 Fusion — doesn't exist" },
  { id: 113, reason: "HUAWEI Pura 80 Ultra — only 70-series on US Amazon" },
  { id: 121, reason: "duplicate of product #115 (same Kindle Scribe Colorsoft)" },
];

let src = readFileSync(DATA_PATH, "utf8");
const log: string[] = [];

// --- apply promotions ---
for (const [idStr, { asin, note }] of Object.entries(PROMOTIONS)) {
  const id = parseInt(idStr, 10);
  // Match the block by id
  const blockRe = new RegExp(`(\\{\\s*\\n\\s*id:\\s*${id},[\\s\\S]*?\\n  \\},)`, "m");
  const m = src.match(blockRe);
  if (!m) {
    log.push(`  [skip] #${id}: block not found`);
    continue;
  }
  let block = m[1];
  const before = block;
  // Overwrite asin line
  block = block.replace(/asin:\s*"[^"]*"/, `asin: "${asin}"`);
  // Remove the isDraft: true line (whole line, including trailing comma + newline)
  block = block.replace(/\n\s*isDraft:\s*true,[^\n]*/g, "");
  if (block === before) {
    log.push(`  [skip] #${id}: no change`);
    continue;
  }
  src = src.replace(m[1], block);
  log.push(`  [promote] #${id} -> ${asin}  (${note})`);
}

// --- apply removals (only in --with-removals mode)
const removalsToApply = WITH_REMOVALS ? REMOVALS : [];
if (!WITH_REMOVALS) {
  log.push(`  [hold] ${REMOVALS.length} removals deferred (run with --with-removals)`);
}
for (const { id, reason } of removalsToApply) {
  const blockRe = new RegExp(
    // Match block plus the trailing blank line AND the `  },` terminator.
    // Block can be surrounded by commas (typical list separator); we want to
    // match the whole element including any trailing comma.
    `(\\{\\s*\\n\\s*id:\\s*${id},[\\s\\S]*?\\n  \\},\\s*\\n)`,
    "m",
  );
  const m = src.match(blockRe);
  if (!m) {
    log.push(`  [skip] #${id}: block not found for removal`);
    continue;
  }
  src = src.replace(m[1], "");
  log.push(`  [remove]  #${id}  (${reason})`);
}

writeFileSync(DATA_PATH, src);

console.log("Triage applied:");
for (const line of log) console.log(line);
const removalCount = removalsToApply.length;
console.log(
  `\n${Object.keys(PROMOTIONS).length} promotions + ${removalCount} removals = ${
    Object.keys(PROMOTIONS).length + removalCount
  } changes.\n`,
);
console.log("Next: pnpm fix:urls && pnpm check — and update category productCount totals if the validator complains.");
