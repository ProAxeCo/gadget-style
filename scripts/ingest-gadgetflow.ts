/**
 * Ingest scraped Gadget Flow results into data.ts as DRAFT products.
 *
 * Input: one or more JSON files produced by `pnpm scrape:gf`, or a single
 *        GF URL (scraped + ingested in one shot).
 * Output: new product entries inserted at the end of the `products` array
 *         with `isDraft: true`, ready for human review.
 *
 * Design choices (2026-04-21):
 *   - Always inserts as draft. Nothing ever goes live without human review.
 *   - Assigns the next unused integer id.
 *   - Category is inferred from GF's category hint + keyword matching
 *     against our 6 categories. If no match, defaults to a guessed one
 *     and flags for review (we can't auto-create new categories).
 *   - Products WITHOUT a resolved ASIN get `destination: "external"` with
 *     `externalUrl` set (to GF article or direct buy link if scraped).
 *   - Images are written as their GF/origin URLs; follow up with
 *     `pnpm mirror:images` to localize them.
 *
 * Usage:
 *   pnpm ingest:gf --file docs/gf-scrape-xxxx.json
 *   pnpm ingest:gf --url https://thegadgetflow.com/product/foo/
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products, categories } from "../client/src/lib/data.js";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_PATH = join(REPO_ROOT, "client", "src", "lib", "data.ts");
const AFFILIATE_TAG = "gadgetstyle01-20";

interface ScrapeResult {
  gadgetFlowUrl: string;
  title: string | null;
  description: string | null;
  image: string | null;
  images: string[];
  amazonUrl: string | null;
  asin: string | null;
  hasAmazonLink: boolean;
  externalUrl: string | null;
  priceHint: string | null;
  categoryHint: string | null;
  tags: string[];
}

// Keyword → category slug mapping. Ordered so more specific terms win.
const CATEGORY_KEYWORDS: Array<[RegExp, string]> = [
  [/\b(headphone|earbud|speaker|audio|soundbar|dac|amplifier|turntable|microphone)\b/i, "audio"],
  [/\b(gaming|console|controller|keyboard|mouse|gamer|xbox|playstation|nintendo|steam)\b/i, "gaming"],
  [/\b(smart home|alexa|google nest|doorbell|thermostat|smart bulb|robot vacuum|security camera)\b/i, "smart-home"],
  [/\b(watch|fitness|tracker|wearable|heart rate|smartwatch|gym|workout)\b/i, "wearables"],
  [/\b(outdoor|camping|hiking|adventure|action cam|bike|expedition)\b/i, "outdoor-tech"],
  [/\b(wallet|backpack|bag|pen|edc|everyday carry|power bank|charger|drive|usb)\b/i, "everyday-carry"],
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function pickCategory(r: ScrapeResult): { name: string; slug: string } {
  const haystack = `${r.title ?? ""} ${r.description ?? ""} ${r.tags.join(" ")} ${r.categoryHint ?? ""}`;
  for (const [re, slug] of CATEGORY_KEYWORDS) {
    if (re.test(haystack)) {
      const cat = categories.find((c) => c.slug === slug);
      if (cat) return { name: cat.name, slug: cat.slug };
    }
  }
  // default: EDC is the catch-all closest to "cool tech accessories"
  const def = categories.find((c) => c.slug === "everyday-carry")!;
  return { name: def.name, slug: def.slug };
}

function nextId(): number {
  let id = 0;
  for (const p of products) if (p.id > id) id = p.id;
  return id + 1;
}

function formatProductBlock(r: ScrapeResult, id: number): string {
  const title = r.title ?? "UNTITLED";
  const slug = slugify(title);
  const description = r.description ?? "";
  const category = pickCategory(r);
  const price = r.priceHint ? parseFloat(r.priceHint) : 0;
  const image = r.image ?? r.images[0] ?? "";
  const imgs = r.images.length ? r.images : image ? [image] : [];
  const imagesStr = imgs.map((u) => JSON.stringify(u)).join(", ");
  const tags = r.tags.length ? r.tags : ["Gadget Flow"];
  const tagsStr = tags.map((t) => JSON.stringify(t)).join(", ");
  const today = new Date().toISOString().slice(0, 10);

  const hasAmazon = !!r.asin;
  const asin = r.asin ?? "B000000000"; // placeholder for drafts without Amazon
  const affiliateUrl = hasAmazon
    ? `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`
    : `https://www.amazon.com/dp/B000000000?tag=${AFFILIATE_TAG}`;
  const destinationLine = hasAmazon
    ? ""
    : `\n    destination: "external",\n    externalUrl: ${JSON.stringify(r.externalUrl ?? r.gadgetFlowUrl)},`;

  // Use JSON.stringify for description too — handles all special chars
  // (quotes, newlines, backticks, smart quotes, unicode) safely.
  return `  {
    id: ${id},
    title: ${JSON.stringify(title)},
    slug: ${JSON.stringify(slug)},
    description: ${JSON.stringify(description)},
    price: ${price},
    category: ${JSON.stringify(category.name)},
    categorySlug: ${JSON.stringify(category.slug)},
    image: ${JSON.stringify(image)},
    images: [${imagesStr}],
    rating: 4.5,
    reviewCount: 0,
    asin: ${JSON.stringify(asin)},
    affiliateUrl: ${JSON.stringify(affiliateUrl)},
    gadgetFlowUrl: ${JSON.stringify(r.gadgetFlowUrl)},
    tags: [${tagsStr}],
    dateAdded: ${JSON.stringify(today)},
    isFeatured: false,
    isTrending: false,
    specs: {},
    isDraft: true,${destinationLine}
  },`;
}

function loadScrapes(): ScrapeResult[] {
  const args = process.argv.slice(2);
  const out: ScrapeResult[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--file") {
      const p = args[++i];
      const parsed = JSON.parse(readFileSync(p, "utf8"));
      if (Array.isArray(parsed)) out.push(...parsed);
      else out.push(parsed);
    } else if (a === "--url") {
      const urls = (args[++i] ?? "").split(",").filter(Boolean);
      // scrape on the fly
      for (const url of urls) {
        const res = spawnSync(
          "pnpm",
          ["tsx", "scripts/scrape-gadgetflow.ts", "--url", url],
          { cwd: REPO_ROOT, encoding: "utf8", shell: true },
        );
        const match = res.stdout.match(/saved (.+)$/m);
        if (!match) throw new Error(`scrape failed for ${url}:\n${res.stdout}\n${res.stderr}`);
        const parsed = JSON.parse(readFileSync(match[1].trim(), "utf8"));
        out.push(...parsed);
      }
    }
  }
  return out;
}

// --- run ---
const scrapes = loadScrapes();
if (scrapes.length === 0) {
  console.error("usage: pnpm ingest:gf --file <scrape.json>  OR  --url <gf-url>");
  process.exit(1);
}

let id = nextId();
let src = readFileSync(DATA_PATH, "utf8");

// Find the closing `]` of the products array to insert before it.
// The products array ends with `\n];\n` after the last `  },`.
const productsArrayEnd = src.match(/\n\]\s*;\s*\n\s*\nexport const categories/);
if (!productsArrayEnd) {
  console.error("could not locate end of products[] array in data.ts");
  process.exit(1);
}
const insertAt = src.indexOf(productsArrayEnd[0]);

const blocks: string[] = [];
const summary: string[] = [];
const existingGfUrls = new Set(products.map((p) => p.gadgetFlowUrl).filter(Boolean));
const existingSlugs = new Set(products.map((p) => p.slug));
const existingAsins = new Set(products.map((p) => p.asin).filter((a) => /^B0[A-Z0-9]{8}$/.test(a)));

for (const r of scrapes) {
  if (!r.title) {
    summary.push(`  [skip] missing title: ${r.gadgetFlowUrl}`);
    continue;
  }
  if (existingGfUrls.has(r.gadgetFlowUrl)) {
    summary.push(`  [skip] duplicate gadgetFlowUrl: ${r.gadgetFlowUrl}`);
    continue;
  }
  const proposedSlug = slugify(r.title);
  if (existingSlugs.has(proposedSlug)) {
    summary.push(`  [skip] duplicate slug: ${proposedSlug} (title already in catalog)`);
    continue;
  }
  if (r.asin && existingAsins.has(r.asin)) {
    summary.push(`  [skip] duplicate ASIN: ${r.asin} (${r.title})`);
    continue;
  }
  const block = formatProductBlock(r, id);
  blocks.push(block);
  summary.push(`  [add]  #${id}  ${r.asin ? `ASIN=${r.asin}` : "external"}  ${r.title}`);
  existingSlugs.add(proposedSlug);
  if (r.asin) existingAsins.add(r.asin);
  id++;
}

if (blocks.length === 0) {
  console.log("nothing to ingest.\n" + summary.join("\n"));
  process.exit(0);
}

// Ensure the product immediately before our insertion has a trailing comma.
// The original file often ends the array with `  }\n];` (no comma on the
// final element). Once we add elements, that final `}` is no longer the last
// and MUST have a comma.
let before = src.slice(0, insertAt);
before = before.replace(/(\n  \})(\s*)$/, "$1,$2");
const newSrc = before + "\n" + blocks.join("\n") + src.slice(insertAt);
writeFileSync(DATA_PATH, newSrc);

console.log("Ingested:");
for (const line of summary) console.log(line);
console.log(`\nInserted ${blocks.length} draft(s) into data.ts.`);
console.log("Next:");
console.log("  pnpm mirror:images   # download GF image URLs locally");
console.log("  pnpm check           # verify structural rules pass");
console.log("  then review each draft and remove isDraft: true to go live");
