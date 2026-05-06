/**
 * Restore descriptions for every product flagged as corrupt (description
 * field doesn't open with `"` or backtick) by pulling the original value
 * from git HEAD. This rehabilitates data.ts into a syntactically valid
 * state so the Claude re-run has something to compile against.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_PATH = join(REPO_ROOT, "client", "src", "lib", "data.ts");

// Find unique corrupt IDs by scanning CURRENT data.ts.
const current = readFileSync(DATA_PATH, "utf8");
const corruptIds = new Set<number>();
for (const m of current.matchAll(
  /\n\s*id:\s*(\d+),[\s\S]*?\n    description:\s*([^,\n]{0,10})/g,
)) {
  const id = parseInt(m[1], 10);
  const opener = m[2].trimStart();
  if (!(opener.startsWith('"') || opener.startsWith("`"))) {
    corruptIds.add(id);
  }
}
console.log(`Found ${corruptIds.size} corrupt product IDs`);

// Pull the HEAD version of data.ts for the original descriptions.
const head = execSync("git show HEAD:client/src/lib/data.ts", {
  cwd: REPO_ROOT,
  encoding: "utf8",
  maxBuffer: 50_000_000,
});

// Extract each corrupt id's original description from HEAD.
// Matches the opening `description:` plus its string literal (backtick OR
// double-quoted). Descriptions in HEAD are backticks.
function extractOriginalDescription(id: number): string | null {
  const re = new RegExp(
    `\\n\\s*id:\\s*${id},[\\s\\S]*?\\n    description:\\s*(\`[^\`]*\`|"(?:[^"\\\\]|\\\\.)*")`,
    "m",
  );
  const m = head.match(re);
  return m ? m[1] : null;
}

// Also need to find-and-replace the broken description region in the current
// file. Since the current description is corrupt, we can't match it as a valid
// string literal. Instead match from `description:` to the end-of-line marker
// of the description — which in the broken state is either a newline ending
// the mangled text, or the next field line `    price:` / similar.
//
// The safe anchor: look for `    description:` through to the start of the
// next field. Next field is one of: price, category, categorySlug, image, images,
// rating, reviewCount, asin, affiliateUrl, gadgetFlowUrl, tags, dateAdded,
// isFeatured, isTrending, specs, isDraft, destination, externalUrl, videos.
const NEXT_FIELD_RE = /\n    (?:price|category|categorySlug|image|images|rating|reviewCount|asin|affiliateUrl|gadgetFlowUrl|tags|dateAdded|isFeatured|isTrending|specs|isDraft|destination|externalUrl|videos):/;

let updated = current;
let fixed = 0;
let failed = 0;
const failedIds: number[] = [];

for (const id of corruptIds) {
  // Try to get original from HEAD. If this product didn't exist at HEAD
  // (it's newly ingested in this session), fall back to a minimal valid
  // placeholder so the file compiles — write:descriptions --force will
  // overwrite it on the regeneration pass.
  const original = extractOriginalDescription(id) ?? '"Description pending."';

  const blockStartRe = new RegExp(`(\\n\\s*id:\\s*${id},[\\s\\S]*?\\n    description:\\s*)`);
  const startMatch = updated.match(blockStartRe);
  if (!startMatch) {
    failedIds.push(id);
    failed++;
    continue;
  }
  const prefixEnd = startMatch.index! + startMatch[0].length;
  const remainder = updated.slice(prefixEnd);
  const nextFieldMatch = remainder.match(NEXT_FIELD_RE);
  if (!nextFieldMatch) {
    failedIds.push(id);
    failed++;
    continue;
  }
  const brokenLength = nextFieldMatch.index!;
  updated = updated.slice(0, prefixEnd) + original + "," + updated.slice(prefixEnd + brokenLength);
  fixed++;
}

writeFileSync(DATA_PATH, updated);
console.log(`Restored ${fixed} descriptions. Failed on ${failed}.`);
if (failedIds.length > 0) console.log("Failed IDs:", failedIds.join(", "));
console.log("\nNext: pnpm check  (verify compile); then pnpm write:descriptions --force --ids <corrupt>");
