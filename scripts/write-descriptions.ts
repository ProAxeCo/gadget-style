/**
 * Generate professional product descriptions using Claude.
 *
 * For each product, prompts Claude with the product's title, category, tags,
 * specs, and the existing (thin) description, and asks for a 300–400 word
 * editorial description in the Gadget Style voice: informed, confident,
 * lifestyle-aware, not sales-y.
 *
 * Replaces `description` on each product in data.ts in-place. Idempotent —
 * products that already have a long description (>= 400 chars AND not the
 * GF seed) are skipped by default.
 *
 * Requires: ANTHROPIC_API_KEY env var. Get one at
 * https://console.anthropic.com/settings/keys
 *
 * Usage:
 *   pnpm tsx scripts/write-descriptions.ts                    # all live products
 *   pnpm tsx scripts/write-descriptions.ts --ids 1,2,3        # specific ids
 *   pnpm tsx scripts/write-descriptions.ts --since 130        # ids >= 130
 *   pnpm tsx scripts/write-descriptions.ts --dry-run          # preview first 3
 *   pnpm tsx scripts/write-descriptions.ts --limit 5          # only 5 products (testing)
 *   pnpm tsx scripts/write-descriptions.ts --force            # overwrite even long descriptions
 *
 * Environment:
 *   GF_CONCURRENCY=4     # parallel API calls (default 4)
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products, type Product } from "../client/src/lib/data.js";
import { mapConcurrent } from "./lib/gf.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DATA_PATH = join(REPO_ROOT, "client", "src", "lib", "data.ts");
const CONCURRENCY = Number(process.env.GF_CONCURRENCY ?? "4");

// Lightweight .env.local loader (no dependency). Accepts KEY=value lines,
// ignores blanks and `#` comments, strips surrounding quotes. Only sets keys
// that aren't already in process.env so existing shell env takes priority.
function loadDotEnv(path: string): void {
  if (!existsSync(path)) return;
  const src = readFileSync(path, "utf8");
  for (const raw of src.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip wrapping quotes if present
    if (/^["'].*["']$/.test(value)) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadDotEnv(join(REPO_ROOT, ".env.local"));
loadDotEnv(join(REPO_ROOT, ".env"));

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "ANTHROPIC_API_KEY is not set.\n" +
      "Option A: create gadget-style/.env.local with this single line:\n" +
      "    ANTHROPIC_API_KEY=sk-ant-...\n" +
      "Option B: export it in your shell first:\n" +
      "    export ANTHROPIC_API_KEY=sk-ant-...\n" +
      "Get a key at https://console.anthropic.com/settings/keys",
  );
  process.exit(1);
}

const client = new Anthropic();

// --- CLI args ---
const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const force = argv.includes("--force");
const ids = (() => {
  const i = argv.indexOf("--ids");
  if (i < 0) return null;
  return new Set(argv[i + 1].split(",").map((n) => parseInt(n, 10)));
})();
const sinceId = (() => {
  const i = argv.indexOf("--since");
  return i < 0 ? 0 : parseInt(argv[i + 1] ?? "0", 10);
})();
const limitCount = (() => {
  const i = argv.indexOf("--limit");
  return i < 0 ? Infinity : parseInt(argv[i + 1] ?? "0", 10);
})();
const includeDrafts = argv.includes("--include-drafts");

// --- prompt ---
// Editorial voice prompt — targeted at hard-core gadget enthusiasts.
// Cached across the run (prompt caching + concurrency) for cost efficiency.
const SYSTEM_PROMPT = `You are a senior product reviewer at Gadget Style. Your audience is **hardcore gadget enthusiasts** — they read Wired, Engadget, The Verge, Anandtech, RTINGS, and GSMArena. They know the specs before they hit your page; your job is to add context, judgment, and real-world signal they can't get from a spec sheet.

Write a detailed product description in **500–700 words**, four paragraphs:

**Paragraph 1 — Positioning (100-140 words)**: What category this competes in and where this product sits in that category. What's notable about the hardware choices (chipset family, driver size, sensor type, panel technology, battery chemistry — whatever applies). Lead with something concrete. Assume the reader knows the category vocabulary.

**Paragraph 2 — Hardware and tech (160-220 words)**: Go deep on the specs. Don't list them — translate each into what it actually means. A Snapdragon 8s Gen 4 isn't just "powerful"; it's a specific tier with known thermal behavior and sustained-performance characteristics versus the flagship 8 Elite. A 50MP Sony Lytia sensor has specific pixel binning behavior. 165Hz on AMOLED means X frames with Y response time. If specs are limited, reason from what's given and from the product category's reference points. Quote specific numbers wherever useful.

**Paragraph 3 — Real-world performance and trade-offs (140-180 words)**: What actually matters in daily use. Battery life under specific workloads, charge times at specific wattages, codec support, connectivity standards (Wi-Fi 7 band support, Bluetooth codecs — aptX Lossless? LDAC? LHDC?), thermal behavior, noise floor, latency, audio FR targeting, whatever is category-appropriate. Honest trade-offs the enthusiast will care about: which spec is held back versus the flagship tier, where the product cuts corners, where it punches above its price.

**Paragraph 4 — Who this is for (80-120 words)**: Specific buyer profile. The mobile photographer vs the gamer vs the all-day commuter. Why they should consider this versus the obvious alternatives at the same price. When the right buyer would skip this for its sibling product. One line on value — what this beats and what this doesn't.

**Style rules:**
- Substance over prose. Every sentence earns its place with information.
- Confident reviewer voice — you've held the product or an equivalent. Use "the" instead of "this."
- Cite numbers generously. "42-hour battery life" > "long battery life." "120 Hz OLED" > "smooth display."
- Reference the competitive set by name when helpful. "Competes with the Sony WH-1000XM5 and Bose QC Ultra." "A tier below the iPhone 16 Pro in sustained GPU performance but matches it in burst."
- Banned words and phrases: "revolutionary", "game-changing", "cutting-edge", "state-of-the-art", "seamless", "immersive", "exquisite", "unprecedented", "next-level", "redefines", "unlocks", "elevates". Also no: "Looking for X? Look no further", "Say goodbye to", "Introducing", "Meet the", "The all-new".
- No exclamation points. No rhetorical questions. No second-person sales pitch ("You'll love…"). No CTAs.
- No emoji. No all-caps. No hashtags. No markdown headings.
- Don't copy phrasing from the source description — you use the source for facts, not language.
- Don't restate the product name in the opening sentence.

Output only the description — four paragraphs separated by blank lines. No preamble, no commentary, no markdown.`;

function buildUserPrompt(p: Product): string {
  const specsText = Object.entries(p.specs ?? {})
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
  return [
    `Product title: ${p.title}`,
    `Category: ${p.category}`,
    `Tags: ${p.tags.join(", ")}`,
    `Price: $${p.price}`,
    p.rating ? `Rating: ${p.rating} / 5` : "",
    "",
    `Existing short description (do NOT copy phrases from this — use it only as factual grounding):`,
    p.description || "(none)",
    "",
    specsText ? `Specifications:\n${specsText}` : "(no specs available — lean on title and category)",
  ]
    .filter(Boolean)
    .join("\n");
}

async function generateDescription(p: Product): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1600, // target 500-700 words → ~900-1100 tokens; leave headroom
    cache_control: { type: "ephemeral" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildUserPrompt(p) }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return text;
}

// --- pick targets ---
function shouldRewrite(p: Product): boolean {
  if (!p.title) return false;
  if (p.isDraft && !includeDrafts) return false;
  if (ids) return ids.has(p.id);
  if (sinceId && p.id < sinceId) return false;
  if (force) return true;
  // Skip already-long descriptions (likely already rewritten) unless forced.
  // Target is 500-700 words ≈ 3000-4500 chars; threshold of 2000 chars means
  // anything shorter will get rewritten.
  return (p.description?.length ?? 0) < 2000;
}

const allTargets = products.filter(shouldRewrite);
const targets = allTargets.slice(0, limitCount);

console.log(
  `Products needing description: ${allTargets.length} (processing ${targets.length}, concurrency ${CONCURRENCY})${
    dryRun ? " — DRY RUN (first 3 only)" : ""
  }\n`,
);

if (targets.length === 0) {
  console.log("Nothing to do.");
  process.exit(0);
}

// --- run ---
interface RewriteResult {
  id: number;
  title: string;
  newDescription?: string;
  error?: string;
  chars?: number;
}

const dryTargets = dryRun ? targets.slice(0, 3) : targets;
const t0 = Date.now();

const results = await mapConcurrent<Product, RewriteResult>(
  dryTargets,
  CONCURRENCY,
  async (p) => {
    try {
      const newDescription = await generateDescription(p);
      return { id: p.id, title: p.title, newDescription, chars: newDescription.length };
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) {
        return { id: p.id, title: p.title, error: `rate limited — wait and retry` };
      }
      if (e instanceof Anthropic.APIError) {
        return { id: p.id, title: p.title, error: `API error ${e.status}: ${e.message}` };
      }
      return { id: p.id, title: p.title, error: String(e) };
    }
  },
  (done, total) => {
    if (done % 5 === 0 || done === total) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  ${done}/${total} (${elapsed}s)`);
    }
  },
);

const ok = results.filter((r) => r.newDescription);
const errored = results.filter((r) => r.error);

console.log(`\nGenerated ${ok.length} descriptions.`);
if (errored.length) {
  console.log(`${errored.length} errored:`);
  for (const e of errored.slice(0, 5)) console.log(`  #${e.id}  ${e.error}`);
}

if (dryRun) {
  console.log(`\nDRY RUN preview (first 3):`);
  for (const r of ok) {
    console.log(`\n─────── #${r.id} — ${r.title} (${r.chars} chars) ───────`);
    console.log(r.newDescription);
  }
  process.exit(0);
}

// --- apply: write back to data.ts ---
let src = readFileSync(DATA_PATH, "utf8");
let applied = 0;

for (const r of ok) {
  if (!r.newDescription) continue;
  const blockRe = new RegExp(
    `(\\n\\s*id:\\s*${r.id},[\\s\\S]*?description:\\s*)(\`[^\`]*\`|"(?:[^"\\\\]|\\\\.)*")`,
    "m",
  );
  const m = src.match(blockRe);
  if (!m) {
    console.warn(`  could not locate #${r.id} description`);
    continue;
  }
  const newLiteral = JSON.stringify(r.newDescription);
  // CRITICAL: use a replacement FUNCTION, not a string. String replacements
  // treat `$1`, `$&`, etc. as backreferences — and product descriptions
  // often contain "$107.99" style dollar amounts that would be misread.
  src = src.replace(blockRe, (_match, prefix: string) => prefix + newLiteral);
  applied++;
}

writeFileSync(DATA_PATH, src);
console.log(`\nApplied ${applied} descriptions. Next: pnpm check`);
