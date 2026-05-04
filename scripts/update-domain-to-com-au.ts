/**
 * One-off: replace every reference to gadgetstyle.com.au with gadgetstyle.com.au
 * (without double-replacing if .au is already there). Only touches text
 * files in the repo; skips node_modules and .git.
 *
 * After running: pnpm check, then git diff to review, then commit.
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

// Files we want to edit. Restrict to text files we know about.
const ALLOWED_EXT = new Set([
  ".ts",
  ".tsx",
  ".md",
  ".json",
  ".html",
  ".xml",
  ".txt",
  ".csv",
  ".yml",
  ".yaml",
]);

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".vercel",
]);

// Replace `gadgetstyle.com.au` only when NOT followed by `.au`.
// (?!\.au) is a negative lookahead — JS regex supports it.
const RE = /gadgetstyle\.com(?!\.au)/g;

interface Hit {
  path: string;
  count: number;
}

const hits: Hit[] = [];

function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
    } else if (ALLOWED_EXT.has(extname(full))) {
      const src = readFileSync(full, "utf8");
      const matches = src.match(RE);
      if (!matches) continue;
      const next = src.replace(RE, "gadgetstyle.com.au");
      if (next !== src) {
        writeFileSync(full, next);
        hits.push({ path: full.replace(REPO_ROOT + "\\", "").replace(REPO_ROOT + "/", ""), count: matches.length });
      }
    }
  }
}

walk(REPO_ROOT);

console.log(`Updated ${hits.length} files (gadgetstyle.com.au → gadgetstyle.com.au):`);
for (const h of hits.sort((a, b) => b.count - a.count)) {
  console.log(`  ${String(h.count).padStart(3)}× ${h.path}`);
}
console.log(`\nNext: pnpm check`);
