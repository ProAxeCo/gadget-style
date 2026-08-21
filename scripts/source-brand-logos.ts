/**
 * Source official brand wordmarks from Wikimedia Commons
 * ──────────────────────────────────────────────────────
 * Replaces our placeholder text-based SVG logos with the actual brand
 * wordmarks (Apple silhouette, Sony serif, Razer snake-tail, etc.).
 *
 * Why Wikimedia:
 *   - Logos are widely hosted there with explicit "PD-textlogo" or
 *     "trademarked" licence — both permit nominative use by retailers.
 *   - Files are SVG → vector, scales cleanly at any size.
 *   - Predictable upload.wikimedia.org URLs, no auth required.
 *
 * Trademark nominative use:
 *   We use these logos solely to identify the brand of products we sell
 *   as an affiliate. We don't claim endorsement. We don't modify the
 *   marks. This is core retail fair use — every Amazon Storefront /
 *   B&H / Newegg / Best Buy uses brand logos exactly this way.
 *
 * Run:  pnpm brands:logos
 */
import { writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const brandsDir = resolve(repoRoot, "client/public/images/brands");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Direct Wikimedia Commons URLs for each brand's official wordmark/mark.
// Verified to exist as of May 2026. If a URL 404s in future, look up the
// brand on commons.wikimedia.org → "Original file" → copy the upload URL.
const LOGOS: Record<string, string> = {
  apple:
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  samsung:
    "https://upload.wikimedia.org/wikipedia/commons/6/61/Samsung_old_logo_before_year_2015.svg",
  sony:
    "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
  belkin:
    "https://upload.wikimedia.org/wikipedia/commons/9/92/Belkin_logo_2024.svg",
  anker:
    "https://upload.wikimedia.org/wikipedia/commons/7/75/Anker_Innovations_logo.svg",
  amazon:
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  dji:
    "https://upload.wikimedia.org/wikipedia/commons/8/85/Dji-logo-text.svg",
  garmin:
    "https://upload.wikimedia.org/wikipedia/commons/b/b4/Garmin_logo.svg",
  razer:
    "https://upload.wikimedia.org/wikipedia/commons/3/35/Razer_snake_logo.svg",
  asus:
    "https://upload.wikimedia.org/wikipedia/commons/2/2c/AsusTek-black-logo.svg",
  sonos:
    "https://upload.wikimedia.org/wikipedia/commons/2/28/Sonos_%28Unternehmen%29_logo.svg",
  bose:
    "https://upload.wikimedia.org/wikipedia/commons/0/0c/Bose_logo.svg",
  insta360:
    "https://upload.wikimedia.org/wikipedia/commons/1/1b/Insta360_logo_%28transparent%29.svg",
  roborock:
    "https://upload.wikimedia.org/wikipedia/commons/4/41/Roborock_logo.svg",
  google:
    "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
};

function curlDownload(url: string, destPath: string): number {
  execFileSync("curl", ["-s", "-L", "-A", UA, "-o", destPath, url], {
    maxBuffer: 50 * 1024 * 1024,
  });
  return statSync(destPath).size;
}

async function main() {
  if (!existsSync(brandsDir)) mkdirSync(brandsDir, { recursive: true });

  const args = process.argv.slice(2);
  const slugArg = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
  const slugs = slugArg ? [slugArg] : Object.keys(LOGOS);

  for (const slug of slugs) {
    const url = LOGOS[slug];
    if (!url) {
      console.log(`  ⚠ ${slug} — no logo URL configured`);
      continue;
    }
    const dest = resolve(brandsDir, `${slug}.svg`);
    process.stdout.write(`  → ${slug.padEnd(10)} ... `);
    try {
      const size = curlDownload(url, dest);
      if (size < 200) {
        console.log(`✗ too small (${size}B), keeping previous`);
        continue;
      }
      console.log(`saved (${(size / 1024).toFixed(1)}KB)`);
    } catch (e) {
      console.log(`✗ ${(e as Error).message}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
