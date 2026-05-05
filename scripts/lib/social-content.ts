/**
 * Shared social-content builders. Both the CSV/Markdown generator
 * (`generate-social.ts`) and the live publisher (`post-product.ts`)
 * import from here so captions and hashtags stay consistent.
 */

import { products, categories } from "../../client/src/lib/data.js";

export const SITE_BASE = "https://www.gadgetstyle.com.au";

const BRAND_HASHTAGS = ["#gadgetstyle", "#techfinds", "#coolgadgets"];

const CATEGORY_HASHTAGS: Record<string, string[]> = {
  "smart-home": ["#smarthome", "#homeautomation", "#smarthometech", "#iot", "#connectedhome"],
  audio: ["#audiophile", "#headphones", "#wirelessaudio", "#hifi", "#musiclovers"],
  electronics: ["#tech", "#techgear", "#consumertech", "#newtech", "#gadgetlove"],
  wearables: ["#wearabletech", "#fitnesstracker", "#smartwatch", "#healthtech", "#fitnessgadgets"],
  "outdoor-tech": ["#outdoorgear", "#adventuretech", "#hikinggear", "#campingtech", "#overlanding"],
  "everyday-carry": ["#edc", "#everydaycarry", "#edctech", "#minimalgear", "#techessentials"],
};

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

function toHashtag(s: string): string {
  return "#" + s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
}

function truncateWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const slice = s.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(/[.,;:!?]$/, "") + "…";
}

export function absoluteImageUrl(imagePath: string): string {
  if (/^https?:\/\//.test(imagePath)) return imagePath;
  return `${SITE_BASE}${imagePath.startsWith("/") ? imagePath : "/" + imagePath}`;
}

export interface PinterestContent {
  title: string; // ≤100 chars
  description: string; // ≤500 chars
  destinationUrl: string;
  imageUrl: string;
  boardSuggestion: string;
}

export function buildPinterestContent(
  p: (typeof products)[number],
): PinterestContent {
  const firstSentence = p.description.split(/(?<=[.!?])\s+/)[0].trim();
  const category = categories.find((c) => c.slug === p.categorySlug);
  const tagHashes = p.tags.map(toHashtag);
  const catHashes = CATEGORY_HASHTAGS[p.categorySlug] ?? [];
  const title = truncateWords(p.title, 95);
  const bodyText = truncateWords(firstSentence, 300);
  const priceLine =
    p.price > 0
      ? `$${p.price.toFixed(2)}. Tap for full review and where to buy.`
      : "Tap for full review and where to buy.";
  const hashtagLine = [
    ...BRAND_HASHTAGS,
    ...catHashes.slice(0, 3),
    ...tagHashes.slice(0, 2),
  ].join(" ");
  const description = `${bodyText} ${priceLine}\n\n${hashtagLine}`.slice(0, 500);
  return {
    title,
    description,
    destinationUrl: `${SITE_BASE}/product/${p.slug}`,
    imageUrl: absoluteImageUrl(p.image),
    boardSuggestion: category?.name ?? p.category,
  };
}

export interface InstagramContent {
  caption: string; // ≤2200 chars
  imageUrl: string;
  galleryUrls: string[]; // for carousel posts; [imageUrl] if no gallery
}

export function buildInstagramContent(
  p: (typeof products)[number],
): InstagramContent {
  const firstSentence = p.description.split(/(?<=[.!?])\s+/)[0].trim();
  const specsLine = Object.entries(p.specs)
    .slice(0, 3)
    .map(([k, v]) => `• ${k}: ${v}`)
    .join("\n");
  const tagHashes = p.tags.map(toHashtag);
  const catHashes = CATEGORY_HASHTAGS[p.categorySlug] ?? [];
  // Rotate evergreen hashtags by product id for variety.
  const shift = (p.id * 3) % EVERGREEN_HASHTAGS.length;
  const evergreen = [
    ...EVERGREEN_HASHTAGS.slice(shift),
    ...EVERGREEN_HASHTAGS.slice(0, shift),
  ].slice(0, 5);
  const hashtags = [
    ...BRAND_HASHTAGS,
    ...catHashes,
    ...tagHashes.slice(0, 4),
    ...evergreen,
  ].filter((h, i, arr) => arr.indexOf(h) === i);

  const priceBlock =
    p.price > 0
      ? `💸 $${p.price.toFixed(2)} · ⭐ ${p.rating} (${p.reviewCount.toLocaleString()} reviews)`
      : `⭐ ${p.rating} · Tap link in bio for current price`;

  const caption = (
    `${p.title}\n\n` +
    `${firstSentence}\n\n` +
    (specsLine ? `${specsLine}\n\n` : "") +
    `${priceBlock}\n\n` +
    `🔗 Link in bio → ${p.category}\n\n` +
    hashtags.join(" ")
  ).slice(0, 2200);

  // Use the first 4 gallery images (capped at 10 per Meta's limit)
  const gallery = [p.image, ...p.images.filter((u) => u !== p.image)]
    .slice(0, 8)
    .map(absoluteImageUrl);

  return {
    caption,
    imageUrl: absoluteImageUrl(p.image),
    galleryUrls: gallery,
  };
}

export interface FbPageContent {
  caption: string; // ~300-500 chars; FB allows much longer but engagement drops
  link: string; // product page on gadgetstyle.com.au — shown as link card
  imageUrl: string; // hero product image
}

/**
 * Build a Facebook Page caption + link.
 *
 * Conventions:
 *   - Caption ~300-500 chars: punchy headline, one-sentence pitch, price+rating
 *     line, link, then a few hashtags. FB engagement drops sharply past ~600
 *     chars and hashtag returns are smaller than IG, so we keep the tag block
 *     short (3 brand + up to 3 category + 2 product = max 8).
 *   - Affiliate disclosure is implicit via the "🛒 Affiliate link" prefix on
 *     the URL line per CLAUDE.md compliance rules; the destination URL itself
 *     points at gadgetstyle.com.au where the full disclosure lives.
 *   - Link is the on-site product page (gadgetstyle.com.au/product/<slug>),
 *     NOT the raw Amazon URL — keeps users in our funnel and lets us rotate
 *     destinations later (e.g. AU/US tag split).
 */
export function buildFbPageContent(
  p: (typeof products)[number],
): FbPageContent {
  const firstSentence = p.description.split(/(?<=[.!?])\s+/)[0].trim();
  const tagHashes = p.tags.map(toHashtag);
  const catHashes = CATEGORY_HASHTAGS[p.categorySlug] ?? [];
  const hashtags = [
    ...BRAND_HASHTAGS,
    ...catHashes.slice(0, 3),
    ...tagHashes.slice(0, 2),
  ]
    .filter((h, i, arr) => arr.indexOf(h) === i)
    .join(" ");

  const link = `${SITE_BASE}/product/${p.slug}`;

  const priceLine =
    p.price > 0
      ? `💸 $${p.price.toFixed(2)} · ⭐ ${p.rating} (${p.reviewCount.toLocaleString()} reviews)`
      : `⭐ ${p.rating} · Tap for current price`;

  // Build body, then trim the description to fit a soft 500-char total budget.
  const fixed =
    `${p.title}\n\n` +
    `\n` + // gap before pitch
    `${priceLine}\n\n` +
    `🛒 Affiliate link: ${link}\n\n` +
    `${hashtags}`;
  const room = Math.max(80, 500 - fixed.length);
  const pitch = truncateWords(firstSentence, room);

  const caption =
    `${p.title}\n\n` +
    `${pitch}\n\n` +
    `${priceLine}\n\n` +
    `🛒 Affiliate link: ${link}\n\n` +
    `${hashtags}`;

  return {
    caption,
    link,
    imageUrl: absoluteImageUrl(p.image),
  };
}
