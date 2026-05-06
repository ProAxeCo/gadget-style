/**
 * Generate a strategic 30-day social content queue for Gadget Style.
 *
 * Outputs:
 *   docs/social/pinterest-30-day-queue.csv  — 90 pins (3/day x 30 days)
 *   docs/social/instagram-30-day-calendar.md — 30 carousel posts
 *
 * Mix:
 *   Pinterest:
 *     40% product-feature pins
 *     30% category-roundup pins
 *     20% comparison pins
 *     10% lifestyle/aesthetic pins
 *   Instagram:
 *     60% single-product carousels
 *     25% comparison carousels
 *     15% category roundups
 *
 * AOV-weighted: price>500 = 2x weight, price>300 = 1.5x weight.
 * Time-spread: a product can't repeat within a 7-day window.
 *
 * Read-only against data.ts. Run: pnpm tsx scripts/generate-30-day-queue.ts
 */

import { products, categories } from "../client/src/lib/data.js";
import {
  buildPinterestContent,
  buildInstagramContent,
  absoluteImageUrl,
  SITE_BASE,
} from "./lib/social-content.js";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const OUT_DIR = join(REPO_ROOT, "docs", "social");

// ---- helpers ----

function csvCell(s: string | number): string {
  const str = String(s);
  return `"${str.replace(/"/g, '""')}"`;
}

function truncateWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const slice = s.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(/[.,;:!?]$/, "") + "…";
}

function aovWeight(price: number): number {
  if (price > 500) return 2;
  if (price > 300) return 1.5;
  return 1;
}

// Deterministic PRNG so the queue is reproducible.
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260506);

function pickWeighted<T>(pool: { item: T; weight: number }[]): T {
  const total = pool.reduce((s, x) => s + x.weight, 0);
  let r = rand() * total;
  for (const x of pool) {
    r -= x.weight;
    if (r <= 0) return x.item;
  }
  return pool[pool.length - 1].item;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- live product filter ----

const live = products.filter((p) => !p.isDraft && p.price > 0);
console.log(`Live products available: ${live.length}`);

if (live.length < 30) {
  console.error("Not enough live products to build a 30-day queue (need ~30).");
  process.exit(1);
}

// Group by category
const byCat: Record<string, typeof live> = {};
for (const p of live) {
  if (!byCat[p.categorySlug]) byCat[p.categorySlug] = [];
  byCat[p.categorySlug].push(p);
}

// AOV stats
const prices = live.map((p) => p.price).sort((a, b) => a - b);
const median = prices[Math.floor(prices.length / 2)];
const max = prices[prices.length - 1];
const avg = prices.reduce((s, x) => s + x, 0) / prices.length;
console.log(`AOV stats: median $${median.toFixed(2)}, avg $${avg.toFixed(2)}, max $${max.toFixed(2)}`);

// ---- date helpers ----

// Use Melbourne local dates as flat strings (avoid UTC drift).
// Day 1 = Thu 2026-05-07 (the day after the strategy is finalized).
function dateForDay(d: number): { iso: string; weekday: string } {
  const start = new Date(Date.UTC(2026, 4, 7)); // 2026-05-07 anchored UTC for arithmetic
  const dt = new Date(start.getTime() + (d - 1) * 24 * 60 * 60 * 1000);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  const iso = `${y}-${m}-${day}`;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getUTCDay()];
  return { iso, weekday };
}

// ---- 7-day cooldown tracker ----

class Cooldown {
  // map productId -> last-used-day
  private lastUsed = new Map<number, number>();

  canUse(id: number, day: number, window = 7): boolean {
    const last = this.lastUsed.get(id);
    if (last === undefined) return true;
    return day - last >= window;
  }

  use(id: number, day: number) {
    this.lastUsed.set(id, day);
  }
}

// AOV-weighted product pool builder with cooldown
function pickProduct(
  cooldown: Cooldown,
  day: number,
  filter?: (p: (typeof live)[number]) => boolean,
): (typeof live)[number] {
  let candidates = live.filter((p) => cooldown.canUse(p.id, day));
  if (filter) candidates = candidates.filter(filter);
  // If cooldown filtered everyone out, relax to 4-day
  if (candidates.length === 0) {
    candidates = live.filter((p) => cooldown.canUse(p.id, day, 4));
    if (filter) candidates = candidates.filter(filter);
  }
  if (candidates.length === 0) {
    // last resort
    candidates = filter ? live.filter(filter) : live;
  }
  const pool = candidates.map((p) => ({ item: p, weight: aovWeight(p.price) }));
  return pickWeighted(pool);
}

// Find a comparison pair: same category, different products, weighted toward high AOV
function pickComparisonPair(
  cooldown: Cooldown,
  day: number,
): { a: (typeof live)[number]; b: (typeof live)[number] } | null {
  const pickableCats = Object.entries(byCat).filter(([, arr]) => {
    const usable = arr.filter((p) => cooldown.canUse(p.id, day));
    return usable.length >= 2;
  });
  if (pickableCats.length === 0) return null;
  const cats = pickableCats.map(([slug, arr]) => {
    // weight category by sum of AOV weights of usable products
    const usable = arr.filter((p) => cooldown.canUse(p.id, day));
    const w = usable.reduce((s, p) => s + aovWeight(p.price), 0);
    return { item: { slug, arr: usable }, weight: w };
  });
  const cat = pickWeighted(cats);
  const aPool = cat.arr.map((p) => ({ item: p, weight: aovWeight(p.price) }));
  const a = pickWeighted(aPool);
  const remaining = cat.arr.filter((p) => p.id !== a.id);
  if (remaining.length === 0) return null;
  const bPool = remaining.map((p) => ({ item: p, weight: aovWeight(p.price) }));
  const b = pickWeighted(bPool);
  return { a, b };
}

// ---- pin types ----

type PinType = "product-feature" | "category-roundup" | "comparison" | "lifestyle";

interface QueuedPin {
  day_number: number;
  day_of_week: string;
  date: string;
  slot: number; // 1, 2, 3
  pin_title: string;
  pin_description: string;
  destination_url: string;
  image_url: string;
  board_suggestion: string;
  hashtags: string;
  product_id_or_cluster: string;
  pin_type: PinType;
}

// ---- builders ----

const BRAND_HASH = "#gadgetstyle #techfinds #coolgadgets";
const CATEGORY_HASH: Record<string, string> = {
  "smart-home": "#smarthome #homeautomation #iot",
  audio: "#audiophile #headphones #wirelessaudio",
  electronics: "#tech #techgear #consumertech",
  wearables: "#wearabletech #smartwatch #fitnesstracker",
  "outdoor-tech": "#outdoorgear #adventuretech #hikinggear",
  "everyday-carry": "#edc #everydaycarry #techessentials",
};

const AFFILIATE_NOTE = "[paid affiliate link]";

function buildProductFeaturePin(
  p: (typeof live)[number],
): { title: string; description: string; image: string; board: string; hashtags: string } {
  const c = buildPinterestContent(p);
  // Strip the auto hashtag block from description, keep body+price, add affiliate note
  const split = c.description.split("\n\n");
  const body = split[0];
  const hashLine = split[1] ?? "";
  const description = truncateWords(`${body} ${AFFILIATE_NOTE}`, 460);
  return {
    title: c.title,
    description,
    image: c.imageUrl,
    board: c.boardSuggestion,
    hashtags: hashLine,
  };
}

function buildLifestylePin(
  p: (typeof live)[number],
): { title: string; description: string; image: string; board: string; hashtags: string } {
  const c = buildPinterestContent(p);
  const useCase: Record<string, string> = {
    "smart-home": "Smart-home picks for the connected apartment",
    audio: "Audio kit for a focused home office",
    electronics: "Desk-setup tech that earns its footprint",
    wearables: "Wearables for training that actually tracks",
    "outdoor-tech": "EDC and tech for weekend overlanding",
    "everyday-carry": "EDC for travel that fits a single pocket",
  };
  const frame = useCase[p.categorySlug] ?? "Tech that earns a place in your kit";
  const split = c.description.split("\n\n");
  const body = split[0];
  const hashLine = split[1] ?? "";
  const titleBase = `${frame}: ${p.title}`;
  const title = truncateWords(titleBase, 95);
  const desc = truncateWords(`${frame}. ${body} ${AFFILIATE_NOTE}`, 460);
  return {
    title,
    description: desc,
    image: c.imageUrl,
    board: c.boardSuggestion,
    hashtags: hashLine,
  };
}

function buildCategoryRoundupPin(
  catSlug: string,
  day: number,
): { title: string; description: string; image: string; board: string; hashtags: string; cluster: string } | null {
  const arr = byCat[catSlug];
  if (!arr || arr.length < 3) return null;
  const cat = categories.find((c) => c.slug === catSlug);
  if (!cat) return null;
  // Pick 5 weighted-by-AOV products
  const picks: (typeof live)[number][] = [];
  const used = new Set<number>();
  let attempts = 0;
  while (picks.length < 5 && attempts < 50) {
    attempts++;
    const pool = arr
      .filter((p) => !used.has(p.id))
      .map((p) => ({ item: p, weight: aovWeight(p.price) }));
    if (pool.length === 0) break;
    const p = pickWeighted(pool);
    used.add(p.id);
    picks.push(p);
  }
  if (picks.length < 3) return null;
  const lead = picks[0];
  const titleOptions: Record<string, string[]> = {
    "smart-home": [
      `${picks.length} smart-home picks worth the spend right now`,
      `Smart home shortlist: ${picks.length} pieces that actually earn the install`,
    ],
    audio: [
      `${picks.length} audio picks: headphones and speakers worth a real listen`,
      `Audiophile shortlist: ${picks.length} gear picks worth the price`,
    ],
    electronics: [
      `${picks.length} electronics picks every gadget head should know about`,
      `Desk tech roundup: ${picks.length} gadgets that earn their footprint`,
    ],
    wearables: [
      `${picks.length} wearables that actually track what matters`,
      `Smartwatches and trackers: ${picks.length} picks worth your wrist`,
    ],
    "outdoor-tech": [
      `${picks.length} outdoor-tech picks for the next trip`,
      `Adventure tech shortlist: ${picks.length} pieces that survive the trail`,
    ],
    "everyday-carry": [
      `${picks.length} EDC picks that actually fit a pocket`,
      `EDC roundup: ${picks.length} pieces that earn their footprint`,
    ],
  };
  const opts = titleOptions[catSlug] ?? [`${picks.length} ${cat.name} picks worth knowing this week`];
  const title = truncateWords(opts[day % opts.length], 95);
  const productLines = picks
    .map(
      (p) =>
        `• ${truncateWords(p.title, 60)} — $${p.price.toFixed(0)}`,
    )
    .join("\n");
  const desc = truncateWords(
    `${picks.length} picks from our ${cat.name} catalog this week.\n${productLines}\nTap for full reviews. ${AFFILIATE_NOTE}`,
    490,
  );
  const hashtags = `${BRAND_HASH} ${CATEGORY_HASH[catSlug] ?? ""}`.trim();
  return {
    title,
    description: desc,
    image: absoluteImageUrl(lead.image),
    board: cat.name,
    hashtags,
    cluster: `roundup-${catSlug}-day${day}`,
  };
}

function buildComparisonPin(
  pair: { a: (typeof live)[number]; b: (typeof live)[number] },
): { title: string; description: string; image: string; board: string; hashtags: string; cluster: string } {
  const { a, b } = pair;
  const cat = categories.find((c) => c.slug === a.categorySlug);
  const titleBase = `${truncateWords(a.title, 38)} vs ${truncateWords(b.title, 38)}`;
  const title = truncateWords(titleBase, 95);
  const aSpec = Object.entries(a.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(", ");
  const bSpec = Object.entries(b.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(", ");
  const desc = truncateWords(
    `Two ${cat?.name ?? a.category} options compared.\n` +
      `A: ${truncateWords(a.title, 50)} — $${a.price.toFixed(0)} (${aSpec})\n` +
      `B: ${truncateWords(b.title, 50)} — $${b.price.toFixed(0)} (${bSpec})\n` +
      `Tap for the head-to-head. ${AFFILIATE_NOTE}`,
    490,
  );
  const hashtags = `${BRAND_HASH} ${CATEGORY_HASH[a.categorySlug] ?? ""}`.trim();
  return {
    title,
    description: desc,
    image: absoluteImageUrl(a.image),
    board: cat?.name ?? a.category,
    hashtags,
    cluster: `compare-${a.id}-vs-${b.id}`,
  };
}

// ---- daily theme map (Pinterest) ----
// Mon: comparison emphasis
// Tue: product feature
// Wed: new-arrival (product feature)
// Thu: comparison
// Fri: category roundup
// Sat: lifestyle
// Sun: product feature

function pinSlotPlan(weekday: string, slot: number): PinType {
  // base mix targets: 36 product-feature, 27 roundup, 18 comparison, 9 lifestyle = 90
  // Hand-tuned by weekday/slot to enforce the cadence + theme.
  const M = "product-feature";
  const R = "category-roundup";
  const C = "comparison";
  const L = "lifestyle";
  // Target across 30 days (~4-5 of each weekday):
  //   product-feature ~36 (40%), roundup ~27 (30%), comparison ~18 (20%), lifestyle ~9 (10%)
  // Target across 30 days: product-feature 36 (40%), roundup 27 (30%), comparison 18 (20%), lifestyle 9 (10%)
  const plan: Record<string, [PinType, PinType, PinType]> = {
    Mon: [C, M, M], // Mondays = comparison anchor + 2 product features
    Tue: [M, R, C],
    Wed: [M, R, M], // Wednesdays = new arrivals
    Thu: [C, M, R],
    Fri: [R, M, L], // Fridays = roundups + 1 lifestyle
    Sat: [M, L, R], // Saturdays = lifestyle
    Sun: [M, C, R],
  };
  return plan[weekday]?.[slot - 1] ?? "product-feature";
}

// ---- generate Pinterest 90 pins ----

const cooldown = new Cooldown();
const queuedPins: QueuedPin[] = [];

const counts = { "product-feature": 0, "category-roundup": 0, comparison: 0, lifestyle: 0 } as Record<PinType, number>;

const productUseCount = new Map<number, number>();
function bumpUse(id: number) {
  productUseCount.set(id, (productUseCount.get(id) ?? 0) + 1);
}

const catCycle = shuffle(Object.keys(byCat));
let catIdx = 0;
function nextCat(): string {
  const k = catCycle[catIdx % catCycle.length];
  catIdx++;
  return k;
}

for (let day = 1; day <= 30; day++) {
  const { iso, weekday } = dateForDay(day);
  for (let slot = 1; slot <= 3; slot++) {
    const wantedType = pinSlotPlan(weekday, slot);
    let row: QueuedPin | null = null;

    if (wantedType === "product-feature") {
      const p = pickProduct(cooldown, day);
      cooldown.use(p.id, day);
      bumpUse(p.id);
      const pin = buildProductFeaturePin(p);
      row = {
        day_number: day,
        day_of_week: weekday,
        date: iso,
        slot,
        pin_title: pin.title,
        pin_description: pin.description,
        destination_url: `${SITE_BASE}/product/${p.slug}`,
        image_url: pin.image,
        board_suggestion: pin.board,
        hashtags: pin.hashtags,
        product_id_or_cluster: String(p.id),
        pin_type: "product-feature",
      };
    } else if (wantedType === "lifestyle") {
      const p = pickProduct(cooldown, day);
      cooldown.use(p.id, day);
      bumpUse(p.id);
      const pin = buildLifestylePin(p);
      row = {
        day_number: day,
        day_of_week: weekday,
        date: iso,
        slot,
        pin_title: pin.title,
        pin_description: pin.description,
        destination_url: `${SITE_BASE}/product/${p.slug}`,
        image_url: pin.image,
        board_suggestion: pin.board,
        hashtags: pin.hashtags,
        product_id_or_cluster: String(p.id),
        pin_type: "lifestyle",
      };
    } else if (wantedType === "category-roundup") {
      // try a few categories until one returns
      let attempts = 0;
      let pin: ReturnType<typeof buildCategoryRoundupPin> = null;
      let usedCat = "";
      while (attempts < Object.keys(byCat).length && !pin) {
        usedCat = nextCat();
        pin = buildCategoryRoundupPin(usedCat, day);
        attempts++;
      }
      if (pin) {
        const cat = categories.find((c) => c.slug === usedCat);
        row = {
          day_number: day,
          day_of_week: weekday,
          date: iso,
          slot,
          pin_title: pin.title,
          pin_description: pin.description,
          destination_url: `${SITE_BASE}/category/${usedCat}`,
          image_url: pin.image,
          board_suggestion: pin.board,
          hashtags: pin.hashtags,
          product_id_or_cluster: pin.cluster,
          pin_type: "category-roundup",
        };
      }
    } else if (wantedType === "comparison") {
      const pair = pickComparisonPair(cooldown, day);
      if (pair) {
        cooldown.use(pair.a.id, day);
        cooldown.use(pair.b.id, day);
        bumpUse(pair.a.id);
        bumpUse(pair.b.id);
        const pin = buildComparisonPin(pair);
        row = {
          day_number: day,
          day_of_week: weekday,
          date: iso,
          slot,
          pin_title: pin.title,
          pin_description: pin.description,
          destination_url: `${SITE_BASE}/product/${pair.a.slug}`,
          image_url: pin.image,
          board_suggestion: pin.board,
          hashtags: pin.hashtags,
          product_id_or_cluster: pin.cluster,
          pin_type: "comparison",
        };
      }
    }

    // Fallback if any builder returned null
    if (!row) {
      const p = pickProduct(cooldown, day);
      cooldown.use(p.id, day);
      bumpUse(p.id);
      const pin = buildProductFeaturePin(p);
      row = {
        day_number: day,
        day_of_week: weekday,
        date: iso,
        slot,
        pin_title: pin.title,
        pin_description: pin.description,
        destination_url: `${SITE_BASE}/product/${p.slug}`,
        image_url: pin.image,
        board_suggestion: pin.board,
        hashtags: pin.hashtags,
        product_id_or_cluster: String(p.id),
        pin_type: "product-feature",
      };
    }

    counts[row.pin_type]++;
    queuedPins.push(row);
  }
}

console.log(
  `Pin type distribution:`,
  Object.entries(counts).map(([k, v]) => `${k}: ${v} (${((v / queuedPins.length) * 100).toFixed(0)}%)`).join(", "),
);

// ---- write Pinterest CSV ----

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const header = [
  "day_number",
  "day_of_week",
  "date",
  "slot",
  "pin_title",
  "pin_description",
  "destination_url",
  "image_url",
  "board_suggestion",
  "hashtags",
  "product_id_or_cluster",
  "pin_type",
];
const csvRows = [header.map(csvCell).join(",")];
for (const p of queuedPins) {
  csvRows.push(
    [
      p.day_number,
      p.day_of_week,
      p.date,
      p.slot,
      p.pin_title,
      p.pin_description,
      p.destination_url,
      p.image_url,
      p.board_suggestion,
      p.hashtags,
      p.product_id_or_cluster,
      p.pin_type,
    ]
      .map(csvCell)
      .join(","),
  );
}
writeFileSync(join(OUT_DIR, "pinterest-30-day-queue.csv"), csvRows.join("\n") + "\n");
console.log(`Wrote ${queuedPins.length} pins to docs/social/pinterest-30-day-queue.csv`);

// ---- generate IG 30 carousel calendar ----

type IGType = "single-product" | "comparison" | "category-roundup";

function igSlotForDay(day: number): IGType {
  // Target: 18 single, 7-8 comparison, 4-5 roundup => 60% / 25% / 15%
  // Pattern by weekday for predictability
  const { weekday } = dateForDay(day);
  // Mon=compare, Wed=compare/single, Fri=roundup, others=single
  if (weekday === "Mon") return "comparison";
  if (weekday === "Wed" && day % 6 === 0) return "comparison";
  if (weekday === "Fri") return "roundup-or-single";
  return "single";
}

interface IGEntry {
  day_number: number;
  date: string;
  weekday: string;
  type: IGType;
  title: string;
  hook: string;
  caption: string;
  galleryUrls: string[];
  posting_time: string;
  product_or_cluster: string;
}

const igCooldown = new Cooldown();
const igEntries: IGEntry[] = [];
const igCounts = { "single-product": 0, comparison: 0, "category-roundup": 0 } as Record<IGType, number>;

// Predetermined IG schedule:
// 30 days: 18 single, 7 comparison, 5 roundup
// Mondays = comparison (4 Mondays in 30d → 4 comp), one extra comparison mid-cycle on day 11, day 25
// Fridays = roundup (4 Fridays + extras → 5 roundups)
// Rest: single

const igPlan: IGType[] = [];
for (let day = 1; day <= 30; day++) {
  const { weekday } = dateForDay(day);
  if (weekday === "Mon") igPlan.push("comparison");
  else if (weekday === "Fri") igPlan.push("category-roundup");
  else igPlan.push("single-product");
}
// We need 7 comparison + 5 roundup. Count what we have and adjust.
let nComp = igPlan.filter((t) => t === "comparison").length;
let nRound = igPlan.filter((t) => t === "category-roundup").length;
// Adjust by reassigning some single-product days
const targetComp = 7;
const targetRound = 5;
function reassign(toType: IGType, current: IGType, count: number) {
  for (let i = 0; i < igPlan.length && count > 0; i++) {
    if (igPlan[i] === current) {
      // distribute every-3-days
      if (i % 3 === 1) {
        igPlan[i] = toType;
        count--;
      }
    }
  }
}
if (nComp < targetComp) reassign("comparison", "single-product", targetComp - nComp);
if (nRound < targetRound) reassign("category-roundup", "single-product", targetRound - nRound);

const catCycleIG = shuffle(Object.keys(byCat));
let catIdxIG = 0;

for (let day = 1; day <= 30; day++) {
  const { iso, weekday } = dateForDay(day);
  const type = igPlan[day - 1];
  const postingTime = day % 2 === 0 ? "7:30pm AEST" : "7:30am AEST";
  let entry: IGEntry | null = null;

  if (type === "single-product") {
    const p = pickProduct(igCooldown, day);
    igCooldown.use(p.id, day);
    bumpUse(p.id);
    const c = buildInstagramContent(p);
    const hook = truncateWords(`${p.title} — honest take, zero hype.`, 110);
    // Append affiliate disclosure at top of caption
    const caption = `${hook}\n\n${AFFILIATE_NOTE}\n\n${c.caption}`.slice(0, 2200);
    entry = {
      day_number: day,
      date: iso,
      weekday,
      type,
      title: p.title,
      hook,
      caption,
      galleryUrls: c.galleryUrls.slice(0, 8),
      posting_time: postingTime,
      product_or_cluster: String(p.id),
    };
  } else if (type === "comparison") {
    const pair = pickComparisonPair(igCooldown, day);
    if (pair) {
      igCooldown.use(pair.a.id, day);
      igCooldown.use(pair.b.id, day);
      bumpUse(pair.a.id);
      bumpUse(pair.b.id);
      const cat = categories.find((c) => c.slug === pair.a.categorySlug);
      const hook = truncateWords(
        `${truncateWords(pair.a.title, 35)} vs ${truncateWords(pair.b.title, 35)} — which earns your money?`,
        125,
      );
      const aSpec = Object.entries(pair.a.specs)
        .slice(0, 3)
        .map(([k, v]) => `• ${k}: ${v}`)
        .join("\n");
      const bSpec = Object.entries(pair.b.specs)
        .slice(0, 3)
        .map(([k, v]) => `• ${k}: ${v}`)
        .join("\n");
      const hashtags =
        `${BRAND_HASH} ${CATEGORY_HASH[pair.a.categorySlug] ?? ""} #vs #headtohead #honestreview`.trim();
      const caption = (
        `${hook}\n\n${AFFILIATE_NOTE}\n\n` +
        `Two ${cat?.name ?? pair.a.category} contenders, side by side.\n\n` +
        `A. ${pair.a.title} — $${pair.a.price.toFixed(0)}\n${aSpec}\n\n` +
        `B. ${pair.b.title} — $${pair.b.price.toFixed(0)}\n${bSpec}\n\n` +
        `Swipe → for the head-to-head. Full reviews: link in bio.\n\n${hashtags}`
      ).slice(0, 2200);
      const aImgs = [pair.a.image, ...pair.a.images.filter((u) => u !== pair.a.image)].slice(0, 4).map(absoluteImageUrl);
      const bImgs = [pair.b.image, ...pair.b.images.filter((u) => u !== pair.b.image)].slice(0, 4).map(absoluteImageUrl);
      entry = {
        day_number: day,
        date: iso,
        weekday,
        type,
        title: `${pair.a.title} vs ${pair.b.title}`,
        hook,
        caption,
        galleryUrls: [...aImgs, ...bImgs].slice(0, 8),
        posting_time: postingTime,
        product_or_cluster: `compare-${pair.a.id}-vs-${pair.b.id}`,
      };
    }
  } else if (type === "category-roundup") {
    // pick a category not used in last 4 days
    let usedCat = "";
    let arr: typeof live = [];
    let attempts = 0;
    while (attempts < catCycleIG.length) {
      usedCat = catCycleIG[catIdxIG % catCycleIG.length];
      catIdxIG++;
      arr = byCat[usedCat] ?? [];
      if (arr.length >= 4) break;
      attempts++;
    }
    const cat = categories.find((c) => c.slug === usedCat);
    if (cat && arr.length >= 4) {
      // Pick 6 weighted
      const picks: (typeof live)[number][] = [];
      const used = new Set<number>();
      while (picks.length < 6 && picks.length < arr.length) {
        const pool = arr
          .filter((p) => !used.has(p.id))
          .map((p) => ({ item: p, weight: aovWeight(p.price) }));
        if (pool.length === 0) break;
        const p = pickWeighted(pool);
        used.add(p.id);
        picks.push(p);
        igCooldown.use(p.id, day);
        bumpUse(p.id);
      }
      const hook = truncateWords(
        `This week in ${cat.name.toLowerCase()}: ${picks.length} picks worth your $`,
        125,
      );
      const list = picks
        .map((p, i) => `${i + 1}. ${truncateWords(p.title, 60)} — $${p.price.toFixed(0)}`)
        .join("\n");
      const hashtags = `${BRAND_HASH} ${CATEGORY_HASH[usedCat] ?? ""} #roundup #shortlist #weeklypicks`.trim();
      const caption = (
        `${hook}\n\n${AFFILIATE_NOTE}\n\n` +
        `${picks.length} ${cat.name} picks from our catalog this week. Swipe through the full set:\n\n` +
        `${list}\n\nFull reviews on each — link in bio.\n\n${hashtags}`
      ).slice(0, 2200);
      const galleryUrls = picks.map((p) => absoluteImageUrl(p.image)).slice(0, 8);
      entry = {
        day_number: day,
        date: iso,
        weekday,
        type,
        title: `${cat.name} Roundup — Day ${day}`,
        hook,
        caption,
        galleryUrls,
        posting_time: postingTime,
        product_or_cluster: `roundup-ig-${usedCat}-day${day}`,
      };
    }
  }

  if (!entry) {
    // fallback to single product
    const p = pickProduct(igCooldown, day);
    igCooldown.use(p.id, day);
    bumpUse(p.id);
    const c = buildInstagramContent(p);
    const hook = truncateWords(`${p.title} — honest take, zero hype.`, 110);
    const caption = `${hook}\n\n${AFFILIATE_NOTE}\n\n${c.caption}`.slice(0, 2200);
    entry = {
      day_number: day,
      date: iso,
      weekday,
      type: "single-product",
      title: p.title,
      hook,
      caption,
      galleryUrls: c.galleryUrls.slice(0, 8),
      posting_time: postingTime,
      product_or_cluster: String(p.id),
    };
  }

  igCounts[entry.type]++;
  igEntries.push(entry);
}

console.log(
  `IG type distribution:`,
  Object.entries(igCounts).map(([k, v]) => `${k}: ${v} (${((v / igEntries.length) * 100).toFixed(0)}%)`).join(", "),
);

// ---- write IG markdown ----

const igLines: string[] = [
  "# Instagram 30-Day Carousel Calendar",
  "",
  `Generated ${new Date().toISOString().slice(0, 10)} for posting period starting ${dateForDay(1).iso}.`,
  "",
  `${igEntries.length} carousel posts, 1 per day.`,
  "",
  `**Mix:** ${Object.entries(igCounts).map(([k, v]) => `${v} ${k}`).join(", ")}`,
  "",
  `**Brand voice rules:** Wired/Engadget/RTINGS register, no hype, comparison-aware.`,
  `**Affiliate disclosure:** every caption opens with ${AFFILIATE_NOTE} after the hook line.`,
  `**Posting cadence:** alternating 7:30am / 7:30pm AEST.`,
  "",
  "---",
  "",
];

for (const e of igEntries) {
  igLines.push(`## Day ${e.day_number} — ${e.date} (${e.weekday}) — ${e.type}`);
  igLines.push("");
  igLines.push(`**Posting time:** ${e.posting_time}`);
  igLines.push("");
  igLines.push(`**Title / cluster:** ${e.title}`);
  igLines.push("");
  igLines.push(`**Hook (above the cut):**  `);
  igLines.push(`> ${e.hook}`);
  igLines.push("");
  igLines.push(`**Gallery (${e.galleryUrls.length} images):**`);
  for (const url of e.galleryUrls) {
    igLines.push(`- ${url}`);
  }
  igLines.push("");
  igLines.push(`**Caption:**`);
  igLines.push("```");
  igLines.push(e.caption);
  igLines.push("```");
  igLines.push("");
  igLines.push(`**Cluster ID:** ${e.product_or_cluster}`);
  igLines.push("");
  igLines.push("---");
  igLines.push("");
}

writeFileSync(join(OUT_DIR, "instagram-30-day-calendar.md"), igLines.join("\n"));
console.log(`Wrote ${igEntries.length} IG entries to docs/social/instagram-30-day-calendar.md`);

// ---- AOV analysis of the queue ----

const allProductIdsInQueue: number[] = [];
for (const r of queuedPins) {
  if (/^\d+$/.test(r.product_id_or_cluster)) {
    allProductIdsInQueue.push(parseInt(r.product_id_or_cluster, 10));
  }
}
for (const e of igEntries) {
  if (/^\d+$/.test(e.product_or_cluster)) {
    allProductIdsInQueue.push(parseInt(e.product_or_cluster, 10));
  }
}

const queuedPrices = allProductIdsInQueue
  .map((id) => live.find((p) => p.id === id)?.price)
  .filter((p): p is number => typeof p === "number")
  .sort((a, b) => a - b);
const qMedian = queuedPrices[Math.floor(queuedPrices.length / 2)] ?? 0;
const qMax = queuedPrices[queuedPrices.length - 1] ?? 0;
const qAvg = queuedPrices.reduce((s, x) => s + x, 0) / Math.max(1, queuedPrices.length);
console.log(`Queue AOV: median $${qMedian.toFixed(2)}, avg $${qAvg.toFixed(2)}, max $${qMax.toFixed(2)} (n=${queuedPrices.length})`);

// Top 3 most-featured products
const usageRanked = Array.from(productUseCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log("Top 5 most-featured product IDs:");
for (const [id, count] of usageRanked) {
  const p = live.find((q) => q.id === id);
  console.log(`  #${id} ${p?.title ?? "?"} — used ${count}x ($${p?.price.toFixed(2) ?? "?"})`);
}

// Export aggregate stats for the strategy doc
writeFileSync(
  join(OUT_DIR, "queue-stats.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      pinsTotal: queuedPins.length,
      pinTypes: counts,
      igTotal: igEntries.length,
      igTypes: igCounts,
      queueAov: { median: qMedian, average: qAvg, max: qMax, n: queuedPrices.length },
      live: { count: live.length, median, average: avg, max },
      topFeatured: usageRanked.map(([id, count]) => {
        const p = live.find((q) => q.id === id);
        return { id, title: p?.title, price: p?.price, uses: count };
      }),
    },
    null,
    2,
  ),
);

console.log("Done.");
