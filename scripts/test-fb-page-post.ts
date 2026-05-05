/**
 * Smoke test: end-to-end FB Page posting flow with auto-cleanup.
 *
 * What it does:
 *   1. Loads .env.local (so it works without `set -a; source .env.local`)
 *   2. Picks one live, valid product from data.ts (real ASIN, price > 0,
 *      hosted image — uses preferred id=100 if it qualifies, otherwise the
 *      first product that passes)
 *   3. Builds an FB Page caption via buildFbPageContent
 *   4. Posts to FB Page with `published=false` (unpublished_post / draft)
 *   5. Captures the resulting post id
 *   6. DELETES the post — verifies deletion via API success flag
 *   7. Logs everything to console with clear status
 *
 * Idempotent: every run creates and deletes its own post; nothing leaks.
 * Safe to re-run any number of times.
 *
 * Run:
 *   pnpm tsx scripts/test-fb-page-post.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../client/src/lib/data.js";
import { buildFbPageContent } from "./lib/social-content.js";
import {
  deletePost,
  publishPhoto,
  verifyPage,
} from "./lib/meta-fb-page.js";

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

function pickProduct(): (typeof products)[number] {
  const isLive = (p: (typeof products)[number]): boolean =>
    !p.isDraft &&
    !!p.image &&
    p.price > 0 &&
    /^B0[A-Z0-9]{8}$/.test(p.asin);
  // Prefer id=100 if it qualifies, then walk live products in order.
  const preferred = products.find((p) => p.id === 100 && isLive(p));
  if (preferred) return preferred;
  const fallback = products.find(isLive);
  if (!fallback) throw new Error("No live product with valid ASIN+price+image found in data.ts");
  return fallback;
}

async function main(): Promise<void> {
  console.log("■ FB Page smoke test");
  console.log("  This creates an UNPUBLISHED post and DELETES it. Nothing visible on the Page.\n");

  // Step 1: env + token sanity
  console.log("Step 1/5: verifyPage ...");
  const v = await verifyPage();
  console.log(`  page_id=${v.id}  isValid=${v.isValid}  type=${v.type}`);
  if (v.scopes.length) {
    const must = ["pages_manage_posts", "pages_read_engagement"];
    const missing = must.filter((s) => !v.scopes.includes(s));
    console.log(`  scopes=${v.scopes.length}  missing-required=${missing.length === 0 ? "none" : missing.join(",")}`);
  }
  if (!v.isValid) {
    console.error("  Token is invalid. Aborting.");
    process.exit(1);
  }

  // Step 2: pick product
  console.log("\nStep 2/5: pick product from data.ts ...");
  const p = pickProduct();
  console.log(`  #${p.id}  ${p.title.slice(0, 80)}`);
  console.log(`  asin=${p.asin}  price=$${p.price}  category=${p.categorySlug}`);

  // Step 3: build caption
  console.log("\nStep 3/5: buildFbPageContent ...");
  const content = buildFbPageContent(p);
  console.log(`  caption (${content.caption.length} chars):`);
  for (const line of content.caption.split("\n")) console.log(`    ${line}`);
  console.log(`  link: ${content.link}`);
  console.log(`  imageUrl: ${content.imageUrl}`);

  if (!content.imageUrl.startsWith("https://")) {
    console.error(
      "\n  ⚠ imageUrl is not a public HTTPS URL — Meta cannot fetch it.",
    );
    console.error("    For staging tests against products with /images/mirrored/ paths,");
    console.error("    the SITE_BASE prepend in social-content.ts produces a https://www.gadgetstyle.com.au URL.");
    console.error("    Verify that the image is publicly accessible at that URL before posting.");
  }

  // Step 4: post (published=false)
  console.log("\nStep 4/5: publishPhoto (published=false) ...");
  let postId: string | undefined;
  let photoId: string | undefined;
  try {
    const r = await publishPhoto({
      url: content.imageUrl,
      caption: content.caption,
      published: false,
    });
    postId = r.post_id;
    photoId = r.id;
    console.log(`  ✓ photo_id=${r.id}`);
    console.log(`  ✓ post_id=${r.post_id} (the deletable feed item)`);
  } catch (e) {
    console.error(`  ✗ publishPhoto failed: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  }

  // Step 5: delete
  console.log("\nStep 5/5: deletePost ...");
  const deleteTarget = postId ?? photoId;
  if (!deleteTarget) {
    console.error("  No id captured. Cannot delete.");
    process.exit(1);
  }
  try {
    await deletePost(deleteTarget);
    console.log(`  ✓ deleted ${deleteTarget}`);
  } catch (e) {
    console.error(`  ✗ delete failed: ${e instanceof Error ? e.message : e}`);
    console.error(`  ⚠ Manual cleanup required for post id ${deleteTarget}`);
    process.exit(1);
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  FB Page smoke test PASSED");
  console.log(`  post created + deleted: ${deleteTarget}`);
  console.log("  No visible artifact on the Page wall. Capability confirmed.");
  console.log("═══════════════════════════════════════════════════════");
}

main().catch((e) => {
  console.error("\nFatal:", e);
  process.exit(1);
});
