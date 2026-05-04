/**
 * Mirror external image URLs hardcoded in client/src/ components and pages.
 * Complements scripts/mirror-images.ts (which handles data.ts only).
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const PUBLIC_DIR = join(REPO_ROOT, "client", "public", "images", "mirrored");

function walk(dir: string): string[] {
  const out: string[] = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop()!;
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      const s = statSync(p);
      if (s.isDirectory()) stack.push(p);
      else if (/\.(tsx?|html)$/.test(name)) out.push(p);
    }
  }
  return out;
}

const files = [
  ...walk(join(REPO_ROOT, "client", "src")),
  join(REPO_ROOT, "client", "index.html"),
].filter(existsSync);

const urlRe = /"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif|avif|svg))"/gi;
const allUrls = new Map<string, string[]>(); // url -> file paths
for (const fp of files) {
  const src = readFileSync(fp, "utf8");
  for (const m of src.matchAll(urlRe)) {
    if (!allUrls.has(m[1])) allUrls.set(m[1], []);
    allUrls.get(m[1])!.push(fp);
  }
}

console.log(`found ${allUrls.size} unique external URLs across ${files.length} files`);
if (allUrls.size === 0) process.exit(0);

async function download(url: string, outPath: string): Promise<boolean> {
  if (existsSync(outPath)) return true;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
    return true;
  } catch {
    return false;
  }
}

for (const [url, usedIn] of allUrls) {
  const name = basename(new URL(url).pathname);
  const outPath = join(PUBLIC_DIR, name);
  process.stdout.write(`  ${url} ... `);
  const ok = await download(url, outPath);
  if (!ok) {
    console.log("fail (kept original URL)");
    continue;
  }
  const publicPath = `/images/mirrored/${name}`;
  for (const fp of usedIn) {
    const src = readFileSync(fp, "utf8");
    if (src.includes(url)) {
      writeFileSync(fp, src.split(url).join(publicPath));
    }
  }
  console.log(`ok (updated ${usedIn.length} file${usedIn.length === 1 ? "" : "s"})`);
}

console.log("done");
