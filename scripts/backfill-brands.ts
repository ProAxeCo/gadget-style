/**
 * scripts/backfill-brands.ts
 *
 * Idempotent brand inference over `client/src/lib/data.ts`. Scans every
 * product title and tag list, infers a brand slug, then writes the proposed
 * mapping to `docs/brand-backfill-proposal.json` for human review.
 *
 * IT DOES NOT MODIFY data.ts. The companion script `apply-brand-backfill.ts`
 * applies the JSON proposal to data.ts in a second pass — separating
 * "infer" from "edit" makes the change reviewable.
 *
 * Usage:
 *   pnpm tsx scripts/backfill-brands.ts
 *
 * Output:
 *   docs/brand-backfill-proposal.json
 *     {
 *       brands: { slug, name, productCount }[],
 *       proposals: { id, slug, currentBrand, proposedBrand, source }[],
 *       skipped: { id, slug, reason }[],
 *     }
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products, type Product } from "../client/src/lib/data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "docs", "brand-backfill-proposal.json");

/**
 * Curated set of brand candidates. Order matters — longer/multi-word brands
 * must come before shorter ones to avoid "Apple" matching inside other names.
 * Each entry: [displayName, slug, regexes...]. Regexes are case-insensitive.
 */
const BRAND_PATTERNS: Array<{ name: string; slug: string; patterns: RegExp[] }> = [
  { name: "All-Clad", slug: "all-clad", patterns: [/\ball-?clad\b/i] },
  { name: "Amazon", slug: "amazon", patterns: [/\bamazon\b/i, /\bkindle\b/i, /\becho\b/i] },
  { name: "Anker", slug: "anker", patterns: [/\banker\b/i, /\bsoundcore\b/i, /\beufy\b/i] },
  { name: "Apple", slug: "apple", patterns: [/\bapple\b/i, /\biphone\b/i, /\bipad\b/i, /\bmacbook\b/i, /\bairpods\b/i, /\bapple watch\b/i] },
  { name: "Asus", slug: "asus", patterns: [/\basus\b/i, /\brog\b/i] },
  { name: "Audio-Technica", slug: "audio-technica", patterns: [/\baudio-?technica\b/i] },
  { name: "Bang & Olufsen", slug: "bang-olufsen", patterns: [/\bbang ?& ?olufsen\b/i, /\bb&o\b/i] },
  { name: "Beats", slug: "beats", patterns: [/\bbeats by dre\b/i, /^beats /i] },
  { name: "Belkin", slug: "belkin", patterns: [/\bbelkin\b/i] },
  { name: "Best Choice Products", slug: "best-choice-products", patterns: [/\bbest choice products\b/i] },
  { name: "Bose", slug: "bose", patterns: [/\bbose\b/i] },
  { name: "Breville", slug: "breville", patterns: [/\bbreville\b/i] },
  { name: "Bulova", slug: "bulova", patterns: [/\bbulova\b/i] },
  { name: "Canon", slug: "canon", patterns: [/\bcanon\b/i] },
  { name: "Casio", slug: "casio", patterns: [/\bcasio\b/i, /\bg-shock\b/i] },
  { name: "Citizen", slug: "citizen", patterns: [/\bcitizen\b/i] },
  { name: "DJI", slug: "dji", patterns: [/\bdji\b/i] },
  { name: "Dyson", slug: "dyson", patterns: [/\bdyson\b/i] },
  { name: "Ecobee", slug: "ecobee", patterns: [/\becobee\b/i] },
  { name: "Ecovacs", slug: "ecovacs", patterns: [/\becovacs\b/i, /\bdeebot\b/i] },
  { name: "Fitbit", slug: "fitbit", patterns: [/\bfitbit\b/i] },
  { name: "Fizz Creations", slug: "fizz-creations", patterns: [/\bfizz creations\b/i] },
  { name: "Fujifilm", slug: "fujifilm", patterns: [/\bfujifilm\b/i, /\bfuji\b/i] },
  { name: "GoPro", slug: "gopro", patterns: [/\bgopro\b/i] },
  { name: "Google", slug: "google", patterns: [/\bgoogle\b/i, /\bnest\b/i, /\bpixel\b/i, /\bchromecast\b/i] },
  { name: "Garmin", slug: "garmin", patterns: [/\bgarmin\b/i] },
  { name: "Govee", slug: "govee", patterns: [/\bgovee\b/i] },
  { name: "HP", slug: "hp", patterns: [/^hp /i, /\bhewlett-packard\b/i, /\bomen\b/i] },
  { name: "Hamilton Beach", slug: "hamilton-beach", patterns: [/\bhamilton beach\b/i] },
  { name: "Honeywell", slug: "honeywell", patterns: [/\bhoneywell\b/i] },
  { name: "iRobot", slug: "irobot", patterns: [/\birobot\b/i, /\broomba\b/i] },
  { name: "Insta360", slug: "insta360", patterns: [/\binsta360\b/i] },
  { name: "JBL", slug: "jbl", patterns: [/\bjbl\b/i] },
  { name: "Jackery", slug: "jackery", patterns: [/\bjackery\b/i] },
  { name: "KitchenAid", slug: "kitchenaid", patterns: [/\bkitchenaid\b/i] },
  { name: "LG", slug: "lg", patterns: [/^lg /i, /\blg [a-z0-9]/i] },
  { name: "Lenovo", slug: "lenovo", patterns: [/\blenovo\b/i, /\bthinkpad\b/i] },
  { name: "Logitech", slug: "logitech", patterns: [/\blogitech\b/i] },
  { name: "Microsoft", slug: "microsoft", patterns: [/\bmicrosoft\b/i, /\bsurface\b/i, /\bxbox\b/i] },
  { name: "Nanoleaf", slug: "nanoleaf", patterns: [/\bnanoleaf\b/i] },
  { name: "Nikon", slug: "nikon", patterns: [/\bnikon\b/i] },
  { name: "Nintendo", slug: "nintendo", patterns: [/\bnintendo\b/i, /\bswitch\b/i] },
  { name: "Nothing", slug: "nothing", patterns: [/\bnothing (ear|phone)\b/i] },
  { name: "OnePlus", slug: "oneplus", patterns: [/\boneplus\b/i] },
  { name: "Oura", slug: "oura", patterns: [/\boura ring\b/i] },
  { name: "Panasonic", slug: "panasonic", patterns: [/\bpanasonic\b/i] },
  { name: "Philips", slug: "philips", patterns: [/\bphilips\b/i, /\bhue\b/i] },
  { name: "Polaroid", slug: "polaroid", patterns: [/\bpolaroid\b/i] },
  { name: "Razer", slug: "razer", patterns: [/\brazer\b/i] },
  { name: "Ring", slug: "ring", patterns: [/^ring (video|alarm|stick)/i] },
  { name: "Roborock", slug: "roborock", patterns: [/\broborock\b/i] },
  { name: "Samsung", slug: "samsung", patterns: [/\bsamsung\b/i, /\bgalaxy\b/i] },
  { name: "Seiko", slug: "seiko", patterns: [/\bseiko\b/i] },
  { name: "Sennheiser", slug: "sennheiser", patterns: [/\bsennheiser\b/i] },
  { name: "Shokz", slug: "shokz", patterns: [/\bshokz\b/i, /\baftershokz\b/i] },
  { name: "Sonos", slug: "sonos", patterns: [/\bsonos\b/i] },
  { name: "Sony", slug: "sony", patterns: [/\bsony\b/i, /\bplaystation\b/i, /\bps5\b/i, /\bxperia\b/i] },
  { name: "Steam Deck", slug: "valve", patterns: [/\bsteam deck\b/i] },
  { name: "Tile", slug: "tile", patterns: [/^tile (mate|pro|slim)/i] },
  { name: "Twelve South", slug: "twelve-south", patterns: [/\btwelve south\b/i] },
  { name: "UE", slug: "ultimate-ears", patterns: [/\bultimate ears\b/i] },
  { name: "Wyze", slug: "wyze", patterns: [/\bwyze\b/i] },
  { name: "Yale", slug: "yale", patterns: [/\byale (lock|smart|home)/i] },
  { name: "iFi Audio", slug: "ifi-audio", patterns: [/\bifi audio\b/i] },
  { name: "Moccamaster", slug: "moccamaster", patterns: [/\b(?:technivorm )?moccamaster\b/i] },
  { name: "novium", slug: "novium", patterns: [/\bnovium\b/i] },
  { name: "Bowflex", slug: "bowflex", patterns: [/\bbowflex\b/i] },
];

interface Proposal {
  id: number;
  slug: string;
  currentBrand?: string;
  proposedBrand: string;
  brandName: string;
  source: "title" | "tag" | "title-leading-word";
  matched: string;
}

function inferBrand(p: Product): { slug: string; name: string; source: Proposal["source"]; matched: string } | null {
  // 1. Tag match — strongest signal because it's a deliberate annotation.
  for (const tag of p.tags ?? []) {
    for (const b of BRAND_PATTERNS) {
      if (b.patterns.some((re) => re.test(tag))) {
        return { slug: b.slug, name: b.name, source: "tag", matched: tag };
      }
    }
  }
  // 2. Title match — broad sweep across the title.
  for (const b of BRAND_PATTERNS) {
    if (b.patterns.some((re) => re.test(p.title))) {
      return { slug: b.slug, name: b.name, source: "title", matched: p.title };
    }
  }
  // 3. Title leading-word fallback (capitalized first word that isn't a noise word).
  const NOISE = new Set([
    "the", "a", "an", "best", "new", "ultra", "pro", "max", "smart", "deluxe",
    "premium", "stainless", "wireless", "bluetooth", "portable", "compact",
  ]);
  const firstWord = p.title.split(/[\s,—-]+/)[0]?.toLowerCase();
  if (firstWord && !NOISE.has(firstWord) && firstWord.length >= 3) {
    // We don't auto-create unknown brand entries; flag instead.
    return null;
  }
  return null;
}

const proposals: Proposal[] = [];
const skipped: Array<{ id: number; slug: string; reason: string }> = [];
const brandCounts = new Map<string, { name: string; count: number }>();

for (const p of products) {
  const inferred = inferBrand(p);
  if (!inferred) {
    skipped.push({ id: p.id, slug: p.slug, reason: "no-brand-match" });
    continue;
  }
  proposals.push({
    id: p.id,
    slug: p.slug,
    currentBrand: p.brand,
    proposedBrand: inferred.slug,
    brandName: inferred.name,
    source: inferred.source,
    matched: inferred.matched,
  });
  const cur = brandCounts.get(inferred.slug) ?? { name: inferred.name, count: 0 };
  cur.count += 1;
  brandCounts.set(inferred.slug, cur);
}

// Brands that appear on 3+ products are first-class candidates for a brand
// page. The rest are still proposed for tagging, just flagged for review.
const summarized = [...brandCounts.entries()]
  .map(([slug, v]) => ({ slug, name: v.name, productCount: v.count }))
  .sort((a, b) => b.productCount - a.productCount);

const candidatesForBrandPages = summarized.filter((b) => b.productCount >= 3);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      summary: {
        productsScanned: products.length,
        productsWithProposal: proposals.length,
        productsSkipped: skipped.length,
        brandsDetected: summarized.length,
        brandsWithThreePlusProducts: candidatesForBrandPages.length,
      },
      brands: summarized,
      candidatesForBrandPages,
      proposals,
      skipped,
    },
    null,
    2,
  ),
);

console.log(`wrote ${OUT}`);
console.log(
  `  scanned ${products.length}, proposed ${proposals.length} brand mappings across ${summarized.length} brands`,
);
console.log(`  ${candidatesForBrandPages.length} brands have 3+ products and are page-worthy:`);
for (const b of candidatesForBrandPages.slice(0, 20)) {
  console.log(`    ${b.slug.padEnd(20)} ${b.productCount} products  (${b.name})`);
}
