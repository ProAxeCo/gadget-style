/**
 * Nuclear reset: replace every product description in data.ts with a
 * valid placeholder. This rehabilitates the file after the $1-backreference
 * bug, and gets the compiler green so write:descriptions --force can
 * regenerate all 230 from a clean base.
 *
 * Uses a precise replacement: finds each `description:` field, locates the
 * next field marker, and replaces everything between them with a clean
 * `"Placeholder."` value.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");

const NEXT_FIELD_RE =
  /\n    (?:price|category|categorySlug|image|images|rating|reviewCount|asin|affiliateUrl|gadgetFlowUrl|tags|dateAdded|isFeatured|isTrending|specs|isDraft|destination|externalUrl|videos):/;

let src = readFileSync(DATA_PATH, "utf8");
let replaced = 0;

// Walk every product block. We iterate via id matches so we don't try to
// parse broken descriptions — we just anchor on the stable field boundary.
const idRe = /\n\s*id:\s*(\d+),/g;
const ids: number[] = [];
for (const m of src.matchAll(idRe)) {
  const id = parseInt(m[1], 10);
  if (id > 0 && id < 1000) ids.push(id);
}
console.log(`Found ${ids.length} id markers`);

// Only target PRODUCT ids (products.ts stores them in a specific range).
// We'll rewrite by searching for `\n    id: N,` then the next `description:`
// within ~2000 chars. Skip blog posts (which live at the end).
for (const id of ids) {
  const blockStartRe = new RegExp(`\\n\\s*id:\\s*${id},[\\s\\S]*?\\n    description:\\s*`);
  const m = src.match(blockStartRe);
  if (!m) continue;
  const prefixEnd = m.index! + m[0].length;
  const remainder = src.slice(prefixEnd, prefixEnd + 10_000);
  // Look for the next field boundary OR the end of the product block.
  const next = remainder.match(NEXT_FIELD_RE);
  if (!next) continue;
  // Replace whatever is there (valid literal or garbage) with a placeholder.
  src =
    src.slice(0, prefixEnd) +
    `"Description pending."` +
    "," +
    src.slice(prefixEnd + next.index!);
  replaced++;
}

writeFileSync(DATA_PATH, src);
console.log(`Reset ${replaced} descriptions.`);
console.log(`Next: pnpm check  (should be green), then pnpm write:descriptions --force`);
