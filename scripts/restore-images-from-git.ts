/**
 * Restore images for specific products from the HEAD commit of data.ts.
 * Used to recover from refinement corruption when a product's GF URL is dead
 * (so re-scraping can't recover the gallery). Reads the old images from git,
 * maps CloudFront URLs to their mirrored local paths, and writes them back.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_PATH = join(REPO_ROOT, "client", "src", "lib", "data.ts");
const MIRROR_DIR = join(REPO_ROOT, "client", "public", "images", "mirrored");

const ids = process.argv.slice(2).map((n) => parseInt(n, 10)).filter((n) => Number.isInteger(n));
if (ids.length === 0) {
  console.error("usage: pnpm tsx scripts/restore-images-from-git.ts <id> [id ...]");
  process.exit(1);
}

// Grab the HEAD version of data.ts
const headData = execSync("git show HEAD:client/src/lib/data.ts", {
  cwd: REPO_ROOT,
  encoding: "utf8",
  maxBuffer: 50_000_000,
});

function mapToLocal(url: string): string | null {
  if (url.startsWith("/images/mirrored/")) return url;
  // Skip externally-hosted originals — only convert URLs whose mirrored copy is on disk.
  const urlObj = (() => {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  })();
  if (!urlObj) return null;
  const name = basename(urlObj.pathname).split("?")[0];
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const local = `/images/mirrored/${safe}`;
  const localPath = join(MIRROR_DIR, safe);
  return existsSync(localPath) ? local : null;
}

let src = readFileSync(DATA_PATH, "utf8");
let fixed = 0;

for (const id of ids) {
  const oldBlockRe = new RegExp(
    `\\{\\s*\\n\\s*id:\\s*${id},[\\s\\S]*?image:\\s*"([^"]+)"[\\s\\S]*?images:\\s*\\[([^\\]]+)\\]`,
    "m",
  );
  const oldMatch = headData.match(oldBlockRe);
  if (!oldMatch) {
    console.log(`  #${id}: not found in HEAD`);
    continue;
  }
  const oldPrimary = oldMatch[1];
  const oldImages = [...oldMatch[2].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  // Map to local mirrored paths (originals were mirrored in earlier session)
  const mappedPrimary = mapToLocal(oldPrimary);
  const mappedImages = oldImages.map(mapToLocal).filter((u): u is string => !!u);
  if (!mappedPrimary || mappedImages.length === 0) {
    console.log(`  #${id}: couldn't map any images to local mirror`);
    continue;
  }
  // Write back into current data.ts
  const curBlockRe = new RegExp(`(\\{\\s*\\n\\s*id:\\s*${id},[\\s\\S]*?\\n  \\},)`, "m");
  const curMatch = src.match(curBlockRe);
  if (!curMatch) continue;
  let block = curMatch[1];
  block = block.replace(/image:\s*"[^"]*"/, `image: ${JSON.stringify(mappedPrimary)}`);
  block = block.replace(
    /images:\s*\[[^\]]*\]/,
    `images: [${mappedImages.map((u) => JSON.stringify(u)).join(", ")}]`,
  );
  if (block !== curMatch[1]) {
    src = src.replace(curMatch[1], block);
    console.log(`  #${id}: restored ${mappedImages.length} images`);
    fixed++;
  }
}

writeFileSync(DATA_PATH, src);
console.log(`\nRestored ${fixed} product(s) from HEAD.`);
