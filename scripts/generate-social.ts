/**
 * Generate Pinterest + Instagram content for every product in data.ts.
 *
 * Outputs:
 *   docs/social/pinterest.csv   — one row per pin (ready for bulk upload)
 *   docs/social/instagram.md    — one block per post (copy-paste friendly)
 *
 * Both link back to the product page at https://www.gadgetstyle.com.au/product/<slug>.
 * Pinterest pins can link to external URLs; Instagram uses link-in-bio so
 * destination is informational.
 *
 * Regenerate any time: `pnpm tsx scripts/generate-social.ts`
 * Or filter to specific IDs: `pnpm tsx scripts/generate-social.ts --ids 1,2,3`
 */

import { products, categories } from "../client/src/lib/data.js";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const OUT_DIR = join(REPO_ROOT, "docs", "social");
const SITE_BASE = "https://www.gadgetstyle.com.au";

// --- optional id filter ---
const idsArg = process.argv.find((a) => a.startsWith("--ids"))?.split("=")[1];
const idFilter = idsArg ? new Set(idsArg.split(",").map((s) => parseInt(s, 10))) : null;

// --- slug-ish-to-hashtag helper ---
function toHashtag(s: string): string {
  return (
    "#" +
    s
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "")
  );
}

// Brand + site tags that go on EVERY post.
const BRAND_HASHTAGS = ["#gadgetstyle", "#techfinds", "#coolgadgets"];

// Broad hashtags by category — pre-reviewed for size/quality balance.
const CATEGORY_HASHTAGS: Record<string, string[]> = {
  "smart-home": ["#smarthome", "#homeautomation", "#smarthometech", "#iot", "#connectedhome"],
  audio: ["#audiophile", "#headphones", "#wirelessaudio", "#hifi", "#musiclovers"],
  gaming: ["#gaming", "#gamersetup", "#pcgaming", "#gamergear", "#streamer"],
  wearables: ["#wearabletech", "#fitnesstracker", "#smartwatch", "#healthtech", "#fitnessgadgets"],
  "outdoor-tech": ["#outdoorgear", "#adventuretech", "#hikinggear", "#campingtech", "#overlanding"],
  "everyday-carry": ["#edc", "#everydaycarry", "#edctech", "#minimalgear", "#techessentials"],
};

// Utility hashtags — cycled so not every post looks identical.
const EVERGREEN_HASHTAGS = [
  "#techgifts",
  "#giftideas",
  "#innovation",
  "#newtech",
  "#gadgetreview",
  "#musthave",
  "#techlife",
  "#designedforyou",
];

/** Truncate on a word boundary. */
function truncateWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const slice = s.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(/[.,;:!?]$/, "") + "…";
}

/** Fix quoting for CSV. */
function csvCell(s: string): string {
  return `"${s.replace(/"/g, '""')}"`;
}

// --- per-product content builders ---

interface PinterestPost {
  title: string;
  description: string;
  destinationUrl: string;
  boardSuggestion: string;
  imagePath: string;
  hashtags: string[];
}

interface InstagramPost {
  imagePath: string;
  caption: string;
  hashtags: string[];
  destinationNote: string;
}

function buildPinterest(p: (typeof products)[number]): PinterestPost {
  const firstSentence = p.description.split(/(?<=[.!?])\s+/)[0].trim();
  const category = categories.find((c) => c.slug === p.categorySlug);
  const tagHashes = p.tags.map(toHashtag);
  const catHashes = CATEGORY_HASHTAGS[p.categorySlug] ?? [];
  // Pinterest pin titles cap at 100 chars, descriptions at 500. Be punchy.
  const title = truncateWords(p.title, 95);
  const body = truncateWords(firstSentence, 380);
  const description =
    `${body} $${p.price.toFixed(2)}. Tap for full review and where to buy.`.trim();
  const hashtags = [...BRAND_HASHTAGS, ...catHashes.slice(0, 3), ...tagHashes.slice(0, 3)];
  return {
    title,
    description,
    destinationUrl: `${SITE_BASE}/product/${p.slug}`,
    boardSuggestion: category?.name ?? p.category,
    imagePath: p.image,
    hashtags,
  };
}

function buildInstagram(p: (typeof products)[number]): InstagramPost {
  const specsLine = Object.entries(p.specs)
    .slice(0, 3)
    .map(([k, v]) => `• ${k}: ${v}`)
    .join("\n");
  const firstSentence = p.description.split(/(?<=[.!?])\s+/)[0].trim();
  const tagHashes = p.tags.map(toHashtag);
  const catHashes = CATEGORY_HASHTAGS[p.categorySlug] ?? [];
  // Rotate evergreen by product id for variety.
  const evergreen = EVERGREEN_HASHTAGS.slice((p.id * 3) % EVERGREEN_HASHTAGS.length)
    .concat(EVERGREEN_HASHTAGS.slice(0, (p.id * 3) % EVERGREEN_HASHTAGS.length))
    .slice(0, 5);
  const hashtags = [
    ...BRAND_HASHTAGS,
    ...catHashes,
    ...tagHashes.slice(0, 4),
    ...evergreen,
  ].filter((h, i, arr) => arr.indexOf(h) === i); // dedupe while preserving order

  const caption =
    `${p.title}\n\n` +
    `${firstSentence}\n\n` +
    (specsLine ? `${specsLine}\n\n` : "") +
    `💸 $${p.price.toFixed(2)} · ⭐ ${p.rating} (${p.reviewCount.toLocaleString()} reviews)\n\n` +
    `🔗 Link in bio → ${p.category} picks\n\n` +
    hashtags.join(" ");

  return {
    imagePath: p.image,
    caption: caption.slice(0, 2200), // IG hard cap
    hashtags,
    destinationNote: `${SITE_BASE}/product/${p.slug}`,
  };
}

// --- run ---

const selected = idFilter ? products.filter((p) => idFilter.has(p.id)) : products;
if (selected.length === 0) {
  console.error("no products matched");
  process.exit(1);
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// Pinterest CSV — column order follows Pinterest's bulk upload template.
const pinterestRows = [
  [
    "Title",
    "Media URL",
    "Pinterest board",
    "Thumbnail",
    "Description",
    "Link",
    "Publish date",
    "Keywords",
  ].map(csvCell).join(","),
];
for (const p of selected) {
  const pin = buildPinterest(p);
  pinterestRows.push(
    [
      pin.title,
      pin.imagePath, // local path — user uploads from disk OR host CDN once live
      pin.boardSuggestion,
      pin.imagePath,
      `${pin.description} ${pin.hashtags.join(" ")}`,
      pin.destinationUrl,
      "", // schedule yourself
      pin.hashtags.join(" ").replace(/#/g, ""),
    ]
      .map(csvCell)
      .join(","),
  );
}
writeFileSync(join(OUT_DIR, "pinterest.csv"), pinterestRows.join("\n"));

// Instagram — markdown, one section per product, copy-paste friendly.
const igLines: string[] = [
  "# Instagram posts\n",
  `Generated ${new Date().toISOString().slice(0, 10)} — ${selected.length} posts.\n`,
  "Each section is one post. Upload the referenced image in Meta Business Suite and paste the caption.",
  "Image paths are relative to `client/public/` — e.g. `/images/mirrored/foo.jpg` lives at `client/public/images/mirrored/foo.jpg`.\n",
];
for (const p of selected) {
  const ig = buildInstagram(p);
  igLines.push(`## #${p.id} — ${p.title}\n`);
  igLines.push(`**Image:** \`${ig.imagePath}\`  \n`);
  igLines.push(`**Destination (for your records):** ${ig.destinationNote}\n`);
  igLines.push("**Caption:**\n");
  igLines.push("```");
  igLines.push(ig.caption);
  igLines.push("```\n");
  igLines.push("---\n");
}
writeFileSync(join(OUT_DIR, "instagram.md"), igLines.join("\n"));

console.log(`generated social content for ${selected.length} products:`);
console.log(`  - ${join(OUT_DIR, "pinterest.csv")}`);
console.log(`  - ${join(OUT_DIR, "instagram.md")}`);
