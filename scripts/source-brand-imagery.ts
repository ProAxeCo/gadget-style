/**
 * Source brand-themed lifestyle photography from Pexels
 * ─────────────────────────────────────────────────────
 * Pexels is the source we use because the licence is unambiguous: photos
 * are royalty-free for commercial use, no attribution legally required (we
 * still credit the photographer on the brand page anyway). The public
 * search page returns photo CDN URLs without an API key, so the script is
 * self-contained.
 *
 * For every brand in `client/src/lib/brands.ts`, the script:
 *   1. Maps the brand slug → curated Pexels search query (the only design
 *      surface to tweak).
 *   2. Fetches the search HTML.
 *   3. Extracts the first N candidate photo CDN URLs.
 *   4. Picks one (skipping the leading thumbnails which are duplicates).
 *   5. Downloads at 1600px wide and saves to
 *      `client/public/images/brands/heroes/<slug>.jpg`.
 *   6. Prints the slug → relative URL map ready to paste into brands.ts as
 *      `heroImageUrl: "/images/brands/heroes/<slug>.jpg"`.
 *
 * Run:    pnpm brands:imagery
 *         pnpm brands:imagery -- --force          # re-download all
 *         pnpm brands:imagery -- --slug=razer     # one brand only
 *
 * COPYRIGHT: NEVER scrape brand banners or hero imagery from competitor
 * publishers (Gadget Flow, etc). They paid for / licensed those assets and
 * we have no rights to redistribute them. Pexels is clean. Brand press
 * kits (manually downloaded with the brand's permission for editorial use)
 * are also clean — drop those into `client/public/images/brands/heroes/`
 * directly and skip this script for that brand.
 */
import { writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const heroesDir = resolve(repoRoot, "client/public/images/brands/heroes");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Curated Pexels search per brand. Tweak these queries to change the visual
// identity each brand projects on its hero. Keep queries short — Pexels
// ranks short queries better.
// Tight, brand-category-specific queries. Each must describe a clear,
// single product type the brand actually makes — no abstract setups.
const QUERIES: Record<string, string> = {
  apple: "macbook pro",
  samsung: "galaxy phone",
  sony: "noise cancelling headphones",
  belkin: "wireless charger phone",
  anker: "power bank battery",
  amazon: "echo speaker",
  dji: "drone flying",
  garmin: "fitness watch",
  razer: "mechanical keyboard rgb",
  asus: "gaming laptop",
  sonos: "home speaker living room",
  bose: "wireless earbuds",
  insta360: "action camera adventure",
  roborock: "robot vacuum floor",
  google: "smart display kitchen",
};

const args = process.argv.slice(2);
const force = args.includes("--force");
const slugArg = args.find((a) => a.startsWith("--slug="))?.split("=")[1];

// Pexels CDN URL pattern.
const PHOTO_RE =
  /https:\/\/images\.pexels\.com\/photos\/(\d+)\/[^"?]+\.(?:jpeg|jpg|png|webp)/g;

// Pexels rate-limits Node's native fetch but accepts curl with browser-like
// headers. Shell out to curl for both the search HTML and image download —
// it's already on every dev/CI machine the script will run on.
function curlFetch(url: string): string {
  return execFileSync(
    "curl",
    [
      "-s",
      "-L",
      "-A",
      UA,
      "-H",
      "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "-H",
      "Accept-Language: en-US,en;q=0.9",
      url,
    ],
    { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 }
  );
}

function curlDownload(url: string, destPath: string): number {
  execFileSync("curl", ["-s", "-L", "-A", UA, "-o", destPath, url], {
    maxBuffer: 50 * 1024 * 1024,
  });
  return statSync(destPath).size;
}

async function fetchSearchPhotoIds(query: string): Promise<number[]> {
  const url = `https://www.pexels.com/search/${encodeURIComponent(query)}/`;
  let html = "";
  try {
    html = curlFetch(url);
  } catch (e) {
    console.error(`  ✗ search ${query} → curl failed: ${(e as Error).message}`);
    return [];
  }
  const ids = new Set<number>();
  for (const m of html.matchAll(PHOTO_RE)) {
    const id = parseInt(m[1], 10);
    if (Number.isFinite(id) && id > 0) ids.add(id);
  }
  return Array.from(ids);
}

async function downloadById(id: number, destPath: string): Promise<boolean> {
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop`;
  try {
    const size = curlDownload(url, destPath);
    if (size < 5000) {
      console.error(`  ✗ download ${id} suspiciously small (${size}B)`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`  ✗ download ${id} → ${(e as Error).message}`);
    return false;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!existsSync(heroesDir)) mkdirSync(heroesDir, { recursive: true });

  const slugs = slugArg ? [slugArg] : Object.keys(QUERIES);
  const results: Record<string, string | null> = {};

  for (const slug of slugs) {
    const query = QUERIES[slug];
    if (!query) {
      console.log(`  ⚠ ${slug} — no query defined; skipping`);
      results[slug] = null;
      continue;
    }
    const dest = resolve(heroesDir, `${slug}.jpg`);
    if (existsSync(dest) && !force) {
      console.log(`  ⏩ ${slug.padEnd(10)} already exists; use --force to refresh`);
      results[slug] = `/images/brands/heroes/${slug}.jpg`;
      continue;
    }
    process.stdout.write(`  → ${slug.padEnd(10)} "${query}" ... `);
    // Throttle so we don't hammer Pexels (10 brands × ~2s = manageable)
    await sleep(800);
    const ids = await fetchSearchPhotoIds(query);
    if (ids.length === 0) {
      console.log(`no candidates`);
      results[slug] = null;
      continue;
    }
    // Pexels search HTML lists each photo multiple times (different sizes).
    // Skip duplicates already handled by Set; pick from the leading content
    // results (index 1 to skip a possible feature/banner asset).
    const pickIdx = Math.min(1, ids.length - 1);
    const ok = await downloadById(ids[pickIdx], dest);
    if (!ok) {
      // try one more
      const ok2 = await downloadById(ids[Math.min(2, ids.length - 1)], dest);
      if (!ok2) {
        results[slug] = null;
        continue;
      }
    }
    console.log(`saved (id ${ids[pickIdx]})`);
    results[slug] = `/images/brands/heroes/${slug}.jpg`;
  }

  console.log("\nResults:");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
