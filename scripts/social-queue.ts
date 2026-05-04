/**
 * Daily social posting queue — picks N products from the catalog using a
 * smart weighting (newer = higher weight, trending boost, anti-repeat) and
 * posts them to Pinterest and/or Instagram.
 *
 * Designed to run from a GitHub Actions cron — writes a log to
 * `docs/social-log/<yyyy-mm-dd>.json` and refuses to post the same product
 * within 30 days (checked against previous log files).
 *
 * Usage:
 *   pnpm tsx scripts/social-queue.ts                         # default: 3 Pinterest + 1 IG
 *   pnpm tsx scripts/social-queue.ts --pinterest 5 --ig 1
 *   pnpm tsx scripts/social-queue.ts --pinterest 0 --ig 1    # IG only
 *   pnpm tsx scripts/social-queue.ts --dry-run
 *
 * Environment:
 *   Same OAuth vars as post-product.ts (loaded from .env.local).
 */

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../client/src/lib/data.js";
import { createPin, listBoards, type PinterestBoard } from "./lib/pinterest.js";
import { publishSingle, verifyAuth } from "./lib/meta-ig.js";
import {
  buildInstagramContent,
  buildPinterestContent,
} from "./lib/social-content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const ENV_PATH = join(REPO_ROOT, ".env.local");
const LOG_DIR = join(REPO_ROOT, "docs", "social-log");
const REPOST_COOLDOWN_DAYS = 30;

function loadDotEnv(): void {
  if (!existsSync(ENV_PATH)) return;
  const text = readFileSync(ENV_PATH, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadDotEnv();

// --- args ---
interface Args {
  pinterestCount: number;
  igCount: number;
  dryRun: boolean;
}
function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const out: Args = { pinterestCount: 3, igCount: 1, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--pinterest") out.pinterestCount = parseInt(argv[++i] ?? "3", 10);
    else if (a === "--ig" || a === "--instagram")
      out.igCount = parseInt(argv[++i] ?? "1", 10);
    else if (a === "--dry-run") out.dryRun = true;
  }
  return out;
}

// --- Recently-posted lookup ---

/**
 * Read the last 30 days of log files and return a map of product-id →
 * last-posted dates per platform. Used to avoid reposting the same product.
 */
function loadRecentlyPosted(): Map<string, Set<number>> {
  const byPlatform = new Map<string, Set<number>>();
  byPlatform.set("pinterest", new Set<number>());
  byPlatform.set("instagram", new Set<number>());
  if (!existsSync(LOG_DIR)) return byPlatform;
  const cutoff = Date.now() - REPOST_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  for (const f of readdirSync(LOG_DIR)) {
    if (!f.endsWith(".json")) continue;
    const dateStr = f.replace(".json", "");
    const t = Date.parse(dateStr);
    if (!Number.isFinite(t) || t < cutoff) continue;
    try {
      const log = JSON.parse(readFileSync(join(LOG_DIR, f), "utf8")) as {
        posts: Array<{ id: number; platform: string; ok: boolean }>;
      };
      for (const post of log.posts) {
        if (!post.ok) continue;
        const set = byPlatform.get(post.platform);
        if (set) set.add(post.id);
      }
    } catch {
      /* ignore corrupt log */
    }
  }
  return byPlatform;
}

// --- Weighted selection ---

/**
 * Compute a selection weight for each product:
 *   - Base 1.0
 *   - Added products post-2025-01 get +0.5 bonus (fresher = higher)
 *   - isTrending gets +0.8
 *   - isFeatured gets +0.4
 *   - Lower priced ($50-300 sweet spot) gets +0.3 — these convert best
 *   - Products without an image get weight 0 (skip)
 *   - Draft products get weight 0
 */
function computeWeight(p: (typeof products)[number]): number {
  if (p.isDraft) return 0;
  if (!p.image) return 0;
  let w = 1.0;
  const added = Date.parse(p.dateAdded);
  if (Number.isFinite(added) && added > Date.parse("2025-01-01")) w += 0.5;
  if (p.isTrending) w += 0.8;
  if (p.isFeatured) w += 0.4;
  if (p.price >= 50 && p.price <= 300) w += 0.3;
  // Rating floor — avoid products with no reviews
  if (p.rating >= 4.0) w += 0.2;
  return w;
}

function weightedShuffle<T>(items: T[], weights: number[]): T[] {
  // Efraimidis–Spirakis weighted sampling without replacement:
  // key_i = U_i^(1/w_i), sort desc by key.
  const keys = items.map((_, i) => {
    const u = Math.random();
    return weights[i] > 0 ? Math.pow(u, 1 / weights[i]) : -1;
  });
  const indexed = items.map((item, i) => ({ item, key: keys[i], w: weights[i] }));
  indexed.sort((a, b) => b.key - a.key);
  return indexed.filter((x) => x.w > 0).map((x) => x.item);
}

// --- main ---

interface PostResult {
  id: number;
  platform: "pinterest" | "instagram";
  title: string;
  ok: boolean;
  error?: string;
  externalId?: string;
}

async function main(): Promise<void> {
  const args = parseArgs();
  const started = new Date();
  const dateStr = started.toISOString().slice(0, 10);

  console.log(`■ social-queue ${dateStr}`);
  console.log(
    `  pinterest=${args.pinterestCount}  ig=${args.igCount}  dryRun=${args.dryRun}`,
  );

  const recent = loadRecentlyPosted();
  const live = products.filter((p) => !p.isDraft);
  const weights = live.map(computeWeight);
  console.log(
    `  catalog: ${products.length} total, ${live.length} live, ${weights.filter((w) => w > 0).length} eligible`,
  );

  // Pick candidates per platform, excluding those posted in cooldown window
  const piPool = weightedShuffle(
    live.filter((p) => !recent.get("pinterest")!.has(p.id)),
    live.filter((p) => !recent.get("pinterest")!.has(p.id)).map(computeWeight),
  );
  const igPool = weightedShuffle(
    live.filter((p) => !recent.get("instagram")!.has(p.id)),
    live.filter((p) => !recent.get("instagram")!.has(p.id)).map(computeWeight),
  );
  const piPicks = piPool.slice(0, args.pinterestCount);
  const igPicks = igPool.slice(0, args.igCount);

  console.log(`\n  Pinterest picks (${piPicks.length}):`);
  for (const p of piPicks) console.log(`    #${p.id} [${p.categorySlug}] ${p.title.slice(0, 70)}`);
  console.log(`  Instagram picks (${igPicks.length}):`);
  for (const p of igPicks) console.log(`    #${p.id} [${p.categorySlug}] ${p.title.slice(0, 70)}`);

  if (args.dryRun) {
    console.log("\n(dry run — no API calls made)");
    return;
  }

  const results: PostResult[] = [];

  // Pinterest: use category-matched boards, fallback to first
  if (piPicks.length > 0) {
    console.log("\n■ Pinterest: fetching boards...");
    let boards: PinterestBoard[] = [];
    try {
      boards = await listBoards();
      console.log(`  ${boards.length} boards available`);
    } catch (e) {
      console.error(
        `  could not list boards: ${e instanceof Error ? e.message : e}`,
      );
    }
    for (const p of piPicks) {
      const content = buildPinterestContent(p);
      const board =
        boards.find(
          (b) =>
            b.name.toLowerCase().includes(content.boardSuggestion.toLowerCase()) ||
            content.boardSuggestion.toLowerCase().includes(b.name.toLowerCase()),
        ) ?? boards[0];
      if (!board) {
        results.push({
          id: p.id,
          platform: "pinterest",
          title: p.title,
          ok: false,
          error: "no board available",
        });
        continue;
      }
      try {
        const pin = await createPin({
          boardId: board.id,
          title: content.title,
          description: content.description,
          link: content.destinationUrl,
          imageUrl: content.imageUrl,
        });
        console.log(`  ✓ #${p.id} → board "${board.name}" pin=${pin.id}`);
        results.push({
          id: p.id,
          platform: "pinterest",
          title: p.title,
          ok: true,
          externalId: pin.id,
        });
      } catch (e) {
        console.error(
          `  ✗ #${p.id} Pinterest failed: ${e instanceof Error ? e.message : e}`,
        );
        results.push({
          id: p.id,
          platform: "pinterest",
          title: p.title,
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
      // Polite pacing: 5s between pins
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  // Instagram (single-image posts for the scheduler — carousel is manual)
  if (igPicks.length > 0) {
    console.log("\n■ Instagram: verifying auth...");
    try {
      const who = await verifyAuth();
      console.log(`  @${who.username}`);
    } catch (e) {
      console.error(
        `  auth failed, skipping IG: ${e instanceof Error ? e.message : e}`,
      );
      igPicks.length = 0;
    }
    for (const p of igPicks) {
      const content = buildInstagramContent(p);
      try {
        const post = await publishSingle({
          imageUrl: content.imageUrl,
          caption: content.caption,
        });
        console.log(`  ✓ #${p.id} IG post=${post.id}`);
        results.push({
          id: p.id,
          platform: "instagram",
          title: p.title,
          ok: true,
          externalId: post.id,
        });
      } catch (e) {
        console.error(
          `  ✗ #${p.id} IG failed: ${e instanceof Error ? e.message : e}`,
        );
        results.push({
          id: p.id,
          platform: "instagram",
          title: p.title,
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
      // Polite pacing: 30s between IG posts (IG throttles hard)
      await new Promise((r) => setTimeout(r, 30_000));
    }
  }

  // Write log
  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
  const logPath = join(LOG_DIR, `${dateStr}.json`);
  const log = {
    startedAt: started.toISOString(),
    finishedAt: new Date().toISOString(),
    args,
    totals: {
      attempted: results.length,
      succeeded: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
    },
    posts: results,
  };
  writeFileSync(logPath, JSON.stringify(log, null, 2));

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`social-queue complete`);
  console.log(
    `  succeeded: ${log.totals.succeeded}/${log.totals.attempted}   failed: ${log.totals.failed}`,
  );
  console.log(`  log: ${logPath}`);
  console.log(`═══════════════════════════════════════════════════════`);

  if (log.totals.failed > 0 && log.totals.succeeded === 0) process.exit(1);
}

await main();
