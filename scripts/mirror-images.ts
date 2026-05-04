/**
 * Downloads every external image URL in data.ts to client/public/images/mirrored/
 * and rewrites data.ts to use local paths. Makes the site independent of
 * Manus's CDN so we can deploy to Vercel + www.gadgetstyle.com.
 *
 * Strategy: content-addressed filenames preserving the URL basename when safe.
 * If two URLs collide on basename, disambiguate with a short hash suffix.
 *
 * Idempotent: if a file already exists, skip the download. Safe to rerun.
 *
 * Usage:
 *   pnpm tsx scripts/mirror-images.ts            # dry-run: list what would happen
 *   pnpm tsx scripts/mirror-images.ts --apply    # actually download + rewrite
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_PATH = join(REPO_ROOT, "client", "src", "lib", "data.ts");
const OUT_DIR = join(REPO_ROOT, "client", "public", "images", "mirrored");
const PUBLIC_PREFIX = "/images/mirrored/";

const APPLY = process.argv.includes("--apply");
const CONCURRENCY = 8;
const TIMEOUT_MS = 30_000;

// Hosts we want to migrate off. Every image URL from these hosts gets
// downloaded and rewritten to a local path.
const EXTERNAL_HOST_RE = /^https?:\/\//i;

// --- extract unique image URLs from data.ts ---
const src = readFileSync(DATA_PATH, "utf8");
const urlRe = /"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif|avif|svg))"/gi;
const urls = new Set<string>();
for (const m of src.matchAll(urlRe)) urls.add(m[1]);

console.log(`found ${urls.size} unique external image URLs`);

// --- plan local filenames ---
function safeBasename(u: string): string {
  const url = new URL(u);
  let b = basename(url.pathname);
  // strip query string artifacts
  b = b.split("?")[0];
  // sanitize — keep only [a-zA-Z0-9._-]
  b = b.replace(/[^a-zA-Z0-9._-]/g, "_");
  return b;
}

function shortHash(u: string): string {
  return createHash("sha1").update(u).digest("hex").slice(0, 8);
}

const urlToLocal = new Map<string, string>(); // url -> local basename
const takenNames = new Map<string, string>(); // basename -> url that claimed it

for (const u of urls) {
  const base = safeBasename(u);
  if (!takenNames.has(base)) {
    takenNames.set(base, u);
    urlToLocal.set(u, base);
  } else {
    // collision — disambiguate with hash prefix
    const ext = extname(base);
    const stem = base.slice(0, base.length - ext.length);
    const disambiguated = `${stem}-${shortHash(u)}${ext}`;
    takenNames.set(disambiguated, u);
    urlToLocal.set(u, disambiguated);
  }
}

// --- summary by host ---
const byHost = new Map<string, number>();
for (const u of urls) {
  const h = new URL(u).hostname;
  byHost.set(h, (byHost.get(h) ?? 0) + 1);
}
console.log("by host:");
for (const [h, c] of [...byHost.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${h.padEnd(40)} ${c}`);
}

if (!APPLY) {
  console.log("\nDRY RUN — pass --apply to download and rewrite data.ts.");
  process.exit(0);
}

// --- download with concurrency cap ---
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

async function download(u: string, outPath: string): Promise<"ok" | "exists" | "fail"> {
  if (existsSync(outPath) && statSync(outPath).size > 0) return "exists";
  const ctl = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const res = await fetch(u, { signal: ctl, redirect: "follow" });
    if (!res.ok) return "fail";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) return "fail";
    writeFileSync(outPath, buf);
    return "ok";
  } catch {
    return "fail";
  }
}

type Result = { url: string; status: "ok" | "exists" | "fail"; local: string };
const results: Result[] = [];
const queue = [...urlToLocal.entries()];
let done = 0;

async function worker() {
  while (queue.length) {
    const pair = queue.shift();
    if (!pair) return;
    const [u, localName] = pair;
    const outPath = join(OUT_DIR, localName);
    const status = await download(u, outPath);
    results.push({ url: u, status, local: localName });
    done++;
    if (done % 25 === 0 || done === urlToLocal.size) {
      console.log(`  ${done}/${urlToLocal.size}`);
    }
  }
}

const workers = Array.from({ length: CONCURRENCY }, () => worker());
await Promise.all(workers);

const ok = results.filter((r) => r.status === "ok").length;
const exists = results.filter((r) => r.status === "exists").length;
const fail = results.filter((r) => r.status === "fail");
console.log(`downloads: ok=${ok} already-present=${exists} fail=${fail.length}`);

// --- rewrite data.ts ---
let newSrc = src;
let rewrites = 0;
for (const r of results) {
  if (r.status === "fail") continue; // leave URL as-is so failures are visible
  const pub = PUBLIC_PREFIX + r.local;
  const before = newSrc;
  newSrc = newSrc.split(`"${r.url}"`).join(`"${pub}"`);
  if (newSrc !== before) rewrites++;
}
writeFileSync(DATA_PATH, newSrc);
console.log(`rewrote ${rewrites} URL occurrences in data.ts`);

// --- report failures ---
if (fail.length > 0) {
  console.log("\nFAILED downloads (left as original URL in data.ts):");
  for (const f of fail) console.log(`  ${f.url}`);
}
