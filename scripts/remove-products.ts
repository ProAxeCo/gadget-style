/**
 * Remove products from data.ts by id. Pass ids as CLI args.
 * Usage: pnpm tsx scripts/remove-products.ts 134 135 136
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");

const ids = process.argv.slice(2).map((n) => parseInt(n, 10)).filter((n) => Number.isInteger(n));
if (ids.length === 0) {
  console.error("usage: pnpm tsx scripts/remove-products.ts <id> [id ...]");
  process.exit(1);
}

let src = readFileSync(DATA_PATH, "utf8");
let removed = 0;
for (const id of ids) {
  // Match the product block plus trailing comma and newline.
  const re = new RegExp(`\\n?  \\{\\s*\\n\\s*id:\\s*${id},[\\s\\S]*?\\n  \\},(?=\\s*\\n)`, "m");
  const before = src;
  src = src.replace(re, "");
  if (src !== before) {
    console.log(`  removed #${id}`);
    removed++;
  } else {
    console.log(`  skip #${id} (not found)`);
  }
}
writeFileSync(DATA_PATH, src);
console.log(`\nremoved ${removed} product${removed === 1 ? "" : "s"}`);
