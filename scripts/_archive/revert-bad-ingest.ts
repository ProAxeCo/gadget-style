/**
 * One-off: remove the 4 bad drafts inserted by the broken ingest run.
 * Identify by the ids 127-130 which collided with my previous ingest.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");

let src = readFileSync(DATA_PATH, "utf8");

// Match the 4 draft blocks starting at id 127 all the way through to the
// end of the last draft (ending with a `},` that's followed by `\n];`).
// The structure is: `id: 127,` ... `},\n  {` ... `id: 130,` ... `},\n];`
// We remove everything from the opening `{\n    id: 127,` up to (but not
// including) the terminating `];`.
const start = src.indexOf("  {\n    id: 127,");
if (start === -1) {
  console.error("could not locate start of bad block");
  process.exit(1);
}
const end = src.indexOf("];", start);
if (end === -1) {
  console.error("could not locate end of products array after bad block");
  process.exit(1);
}
// Trim up to but not including `];`. Prepend `\n` for nicer formatting.
const before = src.slice(0, start);
const after = src.slice(end);
// Also fix the previous product's trailing `}` -> `},` (if missing)
// The structure should be `  }\n];` OR `  },\n];`. Ensure it's `  },\n`.
const fixed = before.replace(/(\n  \})(\s*)$/m, "$1,$2");
writeFileSync(DATA_PATH, fixed + after);
console.log("reverted. new size:", (fixed + after).length, "bytes");
