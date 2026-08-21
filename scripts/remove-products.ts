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
  // Anchor on the `id: N,` LINE, then expand to the enclosing `  {` … `  },`
  // by index scanning. A pure block regex (`\{\s*\n\s*id:`) breaks whenever
  // an object carries leading comment lines between `{` and `id:` — which
  // several hand-annotated products do.
  const idLine = new RegExp(`^    id: ${id},$`, "m");
  const m = idLine.exec(src);
  if (!m) {
    console.log(`  skip #${id} (not found)`);
    continue;
  }
  const blockStart = src.lastIndexOf("\n  {", m.index);
  const blockEnd = src.indexOf("\n  },", m.index);
  if (blockStart === -1 || blockEnd === -1) {
    console.log(`  skip #${id} (could not resolve block bounds)`);
    continue;
  }
  const block = src.slice(blockStart, blockEnd + "\n  },".length);
  // Safety: exactly one product id inside the resolved bounds.
  const idCount = (block.match(/^    id: \d+,$/gm) || []).length;
  if (idCount !== 1) {
    console.log(`  skip #${id} (unsafe bounds: ${idCount} ids in block)`);
    continue;
  }
  src = src.slice(0, blockStart) + src.slice(blockEnd + "\n  },".length);
  console.log(`  removed #${id}`);
  removed++;
}
writeFileSync(DATA_PATH, src);
console.log(`\nremoved ${removed} product${removed === 1 ? "" : "s"}`);
