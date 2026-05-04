/**
 * For every product currently marked `destination: "external"` whose
 * externalUrl still points at a thegadgetflow.com page (the fallback used
 * before the scraper learned to extract real brand URLs), re-scrape the GF
 * page and patch the externalUrl with the true buy destination.
 *
 * Idempotent — re-running just leaves correct entries alone.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { products } from "../client/src/lib/data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_PATH = join(REPO_ROOT, "client", "src", "lib", "data.ts");

const targets = products.filter(
  (p) =>
    p.destination === "external" &&
    (p.externalUrl?.includes("thegadgetflow.com") ?? false),
);

console.log(`patching externalUrl for ${targets.length} drafts...`);

async function rescrape(url: string): Promise<string | null> {
  // Invoke the scraper as a subprocess — keeps the logic DRY.
  const res = spawnSync(
    "pnpm",
    ["tsx", "scripts/scrape-gadgetflow.ts", "--url", url],
    { cwd: REPO_ROOT, encoding: "utf8", shell: true },
  );
  const savedMatch = res.stdout.match(/saved (.+)$/m);
  if (!savedMatch) return null;
  const parsed = JSON.parse(readFileSync(savedMatch[1].trim(), "utf8"));
  return parsed[0]?.externalUrl ?? null;
}

let src = readFileSync(DATA_PATH, "utf8");
let changed = 0;

for (const p of targets) {
  process.stdout.write(`  #${p.id} ${p.title}... `);
  const newExternal = await rescrape(p.gadgetFlowUrl);
  if (!newExternal || newExternal === p.externalUrl) {
    console.log("no new URL");
    continue;
  }
  // Locate the product's externalUrl line and rewrite it.
  const blockRe = new RegExp(
    `(\\n\\s*id:\\s*${p.id},[\\s\\S]*?externalUrl:\\s*)"[^"]*"`,
    "m",
  );
  const before = src;
  src = src.replace(blockRe, `$1${JSON.stringify(newExternal)}`);
  if (src !== before) {
    console.log(`-> ${newExternal.slice(0, 80)}`);
    changed++;
  } else {
    console.log("(regex miss)");
  }
}

if (changed > 0) writeFileSync(DATA_PATH, src);
console.log(`\npatched ${changed} drafts.`);
