/**
 * Scan data.ts for products whose `description:` field isn't properly
 * opened with `"` or `` ` ``. These are victims of the `$1` backreference
 * bug in the first write-descriptions.ts run.
 *
 * Outputs the list of product IDs that need regeneration.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");

const src = readFileSync(DATA_PATH, "utf8");

// Find every product block and check its description opener.
const blockRe = /\n\s*id:\s*(\d+),[\s\S]*?\n    description:\s*([^,\n]{0,10})/g;
const corruptIds: number[] = [];
const okIds: number[] = [];
for (const m of src.matchAll(blockRe)) {
  const id = parseInt(m[1], 10);
  const opener = m[2].trimStart();
  if (opener.startsWith('"') || opener.startsWith("`")) {
    okIds.push(id);
  } else {
    corruptIds.push(id);
    console.log(`  #${id}  opener: ${JSON.stringify(m[2].slice(0, 40))}`);
  }
}

console.log(`\nok: ${okIds.length}  corrupt: ${corruptIds.length}`);
if (corruptIds.length > 0) {
  const outPath = join(__dirname, "..", "docs", "corrupt-ids.txt");
  writeFileSync(outPath, corruptIds.join(","));
  console.log(`Wrote corrupt IDs to ${outPath}`);
  console.log(`\nTo regenerate only these, run:`);
  console.log(`  pnpm write:descriptions --ids ${corruptIds.join(",")} --force`);
}
