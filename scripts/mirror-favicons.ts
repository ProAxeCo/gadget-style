/**
 * Download favicon assets referenced from index.html.
 * One-off; run after mirror-images.ts covers data.ts.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const INDEX_HTML = join(REPO_ROOT, "client", "index.html");
const PUBLIC_DIR = join(REPO_ROOT, "client", "public");

const src = readFileSync(INDEX_HTML, "utf8");
const urls = [...src.matchAll(/href="(https?:\/\/[^"]+\.(?:png|jpg|jpeg|webp|ico|svg))"/g)].map(
  (m) => m[1],
);

let newSrc = src;
for (const u of urls) {
  const name = basename(new URL(u).pathname);
  const outPath = join(PUBLIC_DIR, name);
  if (!existsSync(outPath)) {
    const res = await fetch(u);
    if (!res.ok) {
      console.warn(`  fail ${u}`);
      continue;
    }
    writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
    console.log(`  ok   ${u} -> /${name}`);
  }
  newSrc = newSrc.split(u).join(`/${name}`);
}
writeFileSync(INDEX_HTML, newSrc);
console.log(`updated ${INDEX_HTML}`);
