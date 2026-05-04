/**
 * Post a single product to Pinterest and/or Instagram.
 *
 * Prereqs:
 *   - OAuth tokens in .env.local (see scripts/social-oauth-setup.ts)
 *   - Product must be live (not isDraft) and have a valid image URL
 *   - Site must be reachable so Pinterest/Meta can fetch the image
 *
 * Usage:
 *   pnpm tsx scripts/post-product.ts --id 42
 *   pnpm tsx scripts/post-product.ts --id 42 --platforms pinterest
 *   pnpm tsx scripts/post-product.ts --id 42 --platforms instagram --dry-run
 *   pnpm tsx scripts/post-product.ts --id 42 --pinterest-board "<board-id>"
 *   pnpm tsx scripts/post-product.ts --id 42 --ig-mode single    # default single-image
 *   pnpm tsx scripts/post-product.ts --id 42 --ig-mode carousel  # 2-10 image carousel
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../client/src/lib/data.js";
import { createPin, listBoards, type PinterestBoard } from "./lib/pinterest.js";
import {
  verifyAuth,
  publishSingle,
  publishCarousel,
} from "./lib/meta-ig.js";
import {
  buildInstagramContent,
  buildPinterestContent,
} from "./lib/social-content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const ENV_PATH = join(REPO_ROOT, ".env.local");

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
  id: number;
  platforms: ("pinterest" | "instagram")[];
  pinterestBoardId?: string;
  igMode: "single" | "carousel";
  dryRun: boolean;
}
function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const out: Args = {
    id: 0,
    platforms: ["pinterest", "instagram"],
    igMode: "single",
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") out.id = parseInt(argv[++i] ?? "0", 10);
    else if (a === "--platforms") {
      const list = (argv[++i] ?? "").split(",").map((s) => s.trim()) as Args["platforms"];
      out.platforms = list.filter((p) => p === "pinterest" || p === "instagram");
    } else if (a === "--pinterest-board") out.pinterestBoardId = argv[++i];
    else if (a === "--ig-mode")
      out.igMode = argv[++i] === "carousel" ? "carousel" : "single";
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--help" || a === "-h") {
      console.log(
        "Usage: pnpm tsx scripts/post-product.ts --id N [--platforms pinterest,instagram] [--pinterest-board ID] [--ig-mode single|carousel] [--dry-run]",
      );
      process.exit(0);
    }
  }
  return out;
}

// --- board picker ---
/**
 * Pick the Pinterest board that best matches the product's category.
 * Match rule: board.name case-insensitively contains the product's
 * category name (or vice versa). Falls back to the first board.
 */
function pickBoard(boards: PinterestBoard[], boardHint: string): PinterestBoard {
  if (boards.length === 0) throw new Error("No Pinterest boards found on account");
  const hint = boardHint.toLowerCase();
  const match = boards.find(
    (b) =>
      b.name.toLowerCase().includes(hint) ||
      hint.includes(b.name.toLowerCase()),
  );
  return match ?? boards[0];
}

// --- main ---

async function main(): Promise<void> {
  const args = parseArgs();
  if (!args.id) {
    console.error("--id <product-id> required");
    process.exit(1);
  }
  const product = products.find((p) => p.id === args.id);
  if (!product) {
    console.error(`Product #${args.id} not found`);
    process.exit(1);
  }
  if (product.isDraft) {
    console.error(
      `Product #${args.id} is a draft (${product.title}). Promote it first.`,
    );
    process.exit(1);
  }
  if (!product.image) {
    console.error(`Product #${args.id} has no image URL — skipping.`);
    process.exit(1);
  }

  console.log(`\n■ Posting #${product.id} "${product.title}"`);
  console.log(`  categorySlug: ${product.categorySlug}`);
  console.log(`  image:        ${product.image}`);
  console.log(`  platforms:    ${args.platforms.join(", ")}`);
  console.log(`  dry-run:      ${args.dryRun}`);

  const pinContent = buildPinterestContent(product);
  const igContent = buildInstagramContent(product);

  if (args.dryRun) {
    console.log("\n── Pinterest ──");
    console.log(`  title:       ${pinContent.title}`);
    console.log(`  description: ${pinContent.description}`);
    console.log(`  link:        ${pinContent.destinationUrl}`);
    console.log(`  image:       ${pinContent.imageUrl}`);
    console.log(`  board hint:  ${pinContent.boardSuggestion}`);
    console.log("\n── Instagram ──");
    console.log(`  caption:\n${igContent.caption}`);
    console.log(
      `  image${args.igMode === "carousel" ? "s" : ""}:     ${args.igMode === "carousel" ? igContent.galleryUrls.join(", ") : igContent.imageUrl}`,
    );
    console.log("\n(dry run — no API calls made)");
    return;
  }

  // Pinterest
  if (args.platforms.includes("pinterest")) {
    console.log("\n■ Pinterest: posting...");
    let boardId = args.pinterestBoardId;
    if (!boardId) {
      const boards = await listBoards();
      const board = pickBoard(boards, pinContent.boardSuggestion);
      boardId = board.id;
      console.log(`  using board "${board.name}" (id=${board.id})`);
    }
    const pin = await createPin({
      boardId,
      title: pinContent.title,
      description: pinContent.description,
      link: pinContent.destinationUrl,
      imageUrl: pinContent.imageUrl,
    });
    console.log(`  ✓ pin created: id=${pin.id}`);
    console.log(`    url: ${pin.url}`);
  }

  // Instagram
  if (args.platforms.includes("instagram")) {
    console.log("\n■ Instagram: posting...");
    const who = await verifyAuth();
    console.log(`  authed as @${who.username} (ig id=${who.id})`);

    if (args.igMode === "carousel" && igContent.galleryUrls.length >= 2) {
      console.log(
        `  publishing carousel (${igContent.galleryUrls.length} images)...`,
      );
      const post = await publishCarousel({
        imageUrls: igContent.galleryUrls.slice(0, 10),
        caption: igContent.caption,
      });
      console.log(`  ✓ carousel published: id=${post.id}`);
    } else {
      console.log(`  publishing single-image post...`);
      const post = await publishSingle({
        imageUrl: igContent.imageUrl,
        caption: igContent.caption,
      });
      console.log(`  ✓ post published: id=${post.id}`);
    }
  }

  console.log("\n■ Done.\n");
}

await main();
