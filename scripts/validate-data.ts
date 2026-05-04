/**
 * Data integrity validator for client/src/lib/data.ts.
 *
 * Enforces the invariants that Manus kept re-breaking:
 *   - ASIN format, ASIN ↔ affiliateUrl consistency, affiliate tag correctness
 *   - Non-ephemeral image hosts
 *   - Uniqueness (slug, id, asin) and duplicate-image detection
 *   - Category counts match actual product distribution
 *   - Required fields populated with sensible minimums
 *
 * Exits non-zero on any error. Warnings do not fail the build.
 * Run: pnpm check:data
 */

import {
  products,
  categories,
  blogPosts,
  type Product,
  type Category,
  type BlogPost,
} from "../client/src/lib/data.js";

const AFFILIATE_TAG = "gadgetstyle01-20";
const ASIN_RE = /^B0[A-Z0-9]{8}$/;
const SLUG_RE = /^[a-z0-9-]+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Image hosts we trust as durable. Anything else is a warning — if it's a new
// host we want to adopt, add it here; if it's ephemeral, replace the URL.
const DURABLE_IMAGE_HOSTS = new Set<string>([
  "d2xsxph8kpxj0f.cloudfront.net",
]);

// Image hosts we know are ephemeral — hard error.
const EPHEMERAL_IMAGE_HOSTS = new Set<string>([
  "files.manuscdn.com",
]);

type Severity = "error" | "warning";
interface Finding {
  severity: Severity;
  rule: string;
  where: string;
  detail: string;
}
const findings: Finding[] = [];

function error(rule: string, where: string, detail: string) {
  findings.push({ severity: "error", rule, where, detail });
}
function warn(rule: string, where: string, detail: string) {
  findings.push({ severity: "warning", rule, where, detail });
}

function parseUrl(raw: string): URL | null {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

/** True if the string is a site-local asset path (starts with `/`). */
function isLocalAssetPath(raw: string): boolean {
  return typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//");
}

function extractAsinFromUrl(url: URL): string | null {
  // Typical forms: /dp/ASIN, /dp/ASIN/, /gp/product/ASIN, /exec/obidos/ASIN/asin
  const m = url.pathname.match(/\/(?:dp|gp\/product|exec\/obidos\/asin)\/([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

function validateProduct(p: Product) {
  const where = `product #${p.id} "${p.title}"${p.isDraft ? " [DRAFT]" : ""}`;
  // Drafts are exempted from rules that only matter for publicly live products
  // (ASIN validity, affiliate URL correctness, non-zero price). They must
  // still pass structural rules (id, title, slug, category, images, booleans).
  const strict = !p.isDraft;

  if (!Number.isInteger(p.id) || p.id <= 0) error("id.format", where, `invalid id ${p.id}`);
  if (!p.title || p.title.trim().length === 0) error("title.empty", where, "missing title");
  if (!p.slug || !SLUG_RE.test(p.slug)) error("slug.format", where, `invalid slug "${p.slug}"`);
  if (!p.description || p.description.trim().length < 40)
    warn("description.short", where, `description < 40 chars (${p.description?.length ?? 0})`);
  if (strict && (typeof p.price !== "number" || p.price <= 0))
    error("price.format", where, `invalid price ${p.price}`);
  else if (!strict && (typeof p.price !== "number" || p.price < 0))
    warn("price.draft", where, `draft price ${p.price}`);

  if (!p.category || !p.categorySlug) error("category.missing", where, "category/categorySlug missing");

  // ASIN format — drafts may have a placeholder, but must still be a string.
  if (!p.asin || typeof p.asin !== "string") error("asin.empty", where, "asin missing");
  else if (strict && !ASIN_RE.test(p.asin))
    error("asin.format", where, `invalid ASIN "${p.asin}"`);

  // Destination gating. Amazon is the default; external means the product
  // links to a non-Amazon URL (no affiliate tag required).
  const destination = p.destination ?? "amazon";
  if (destination === "external") {
    // External products require an externalUrl and are exempt from Amazon rules.
    if (!p.externalUrl) {
      error("external.urlMissing", where, 'destination="external" but externalUrl is missing');
    } else {
      const eu = parseUrl(p.externalUrl);
      if (!eu) error("external.urlInvalid", where, `unparseable externalUrl "${p.externalUrl}"`);
    }
  } else {
    // Amazon destination — full affiliate rules.
    const affUrl = parseUrl(p.affiliateUrl);
    if (!affUrl) {
      error("affiliateUrl.invalid", where, `unparseable URL "${p.affiliateUrl}"`);
    } else {
      if (!/amazon\./i.test(affUrl.hostname))
        error("affiliateUrl.host", where, `non-amazon host ${affUrl.hostname}`);
      const urlAsin = extractAsinFromUrl(affUrl);
      if (strict) {
        if (!urlAsin) {
          error("affiliateUrl.noAsin", where, `no /dp/<ASIN> found in ${p.affiliateUrl}`);
        } else if (urlAsin !== p.asin) {
          error(
            "affiliateUrl.asinMismatch",
            where,
            `asin field "${p.asin}" != URL ASIN "${urlAsin}"`,
          );
        }
      }
      const tag = affUrl.searchParams.get("tag");
      if (!tag) error("affiliateUrl.tagMissing", where, "no tag query param");
      else if (tag !== AFFILIATE_TAG)
        error("affiliateUrl.tagWrong", where, `tag="${tag}" expected "${AFFILIATE_TAG}"`);
    }
  }

  // Images — accept either absolute URLs on durable hosts, or site-local /images/... paths.
  if (!Array.isArray(p.images) || p.images.length === 0)
    error("images.empty", where, "no images");
  else {
    for (const img of p.images) {
      if (isLocalAssetPath(img)) continue; // mirrored locally — OK
      const u = parseUrl(img);
      if (!u) {
        error("image.invalid", where, `unparseable image URL "${img}"`);
      } else {
        if (EPHEMERAL_IMAGE_HOSTS.has(u.hostname))
          error("image.ephemeralHost", where, `ephemeral host ${u.hostname} — ${img}`);
        else if (!DURABLE_IMAGE_HOSTS.has(u.hostname))
          warn("image.unknownHost", where, `unreviewed host ${u.hostname} — ${img}`);
      }
    }
    if (p.image && !p.images.includes(p.image))
      warn("image.primaryNotInImages", where, "primary image not in images[]");
  }

  // Rating / review
  if (typeof p.rating !== "number" || p.rating < 0 || p.rating > 5)
    error("rating.range", where, `rating out of [0,5]: ${p.rating}`);
  if (!Number.isInteger(p.reviewCount) || p.reviewCount < 0)
    error("reviewCount.range", where, `bad reviewCount ${p.reviewCount}`);

  // Tags
  if (!Array.isArray(p.tags) || p.tags.length === 0)
    warn("tags.empty", where, "no tags");

  // Date
  if (!ISO_DATE_RE.test(p.dateAdded)) warn("dateAdded.format", where, `"${p.dateAdded}"`);

  // Specs
  if (!p.specs || typeof p.specs !== "object" || Object.keys(p.specs).length === 0)
    warn("specs.empty", where, "no specs");

  // Booleans
  if (typeof p.isFeatured !== "boolean") error("isFeatured.type", where, `not boolean: ${p.isFeatured}`);
  if (typeof p.isTrending !== "boolean") error("isTrending.type", where, `not boolean: ${p.isTrending}`);
}

function validateUniqueness() {
  const ids = new Map<number, Product>();
  const slugs = new Map<string, Product>();
  const asins = new Map<string, Product>();
  const imageToProducts = new Map<string, Product[]>();

  for (const p of products) {
    if (ids.has(p.id))
      error("uniqueness.id", `product #${p.id}`, `id collision with "${ids.get(p.id)!.title}"`);
    else ids.set(p.id, p);

    if (p.slug) {
      if (slugs.has(p.slug))
        error(
          "uniqueness.slug",
          `product #${p.id}`,
          `slug "${p.slug}" also used by "${slugs.get(p.slug)!.title}"`,
        );
      else slugs.set(p.slug, p);
    }

    // ASIN uniqueness only matters for live Amazon products. Drafts and
    // external-destination products use placeholder ASINs (B000000000) so
    // sharing is expected — skip those.
    const dest = p.destination ?? "amazon";
    if (!p.isDraft && dest === "amazon" && p.asin && p.asin !== "B000000000" && ASIN_RE.test(p.asin)) {
      if (asins.has(p.asin))
        warn(
          "uniqueness.asin",
          `product #${p.id}`,
          `ASIN ${p.asin} shared with "${asins.get(p.asin)!.title}"`,
        );
      else asins.set(p.asin, p);
    }

    if (Array.isArray(p.images)) {
      for (const img of p.images) {
        if (!imageToProducts.has(img)) imageToProducts.set(img, []);
        imageToProducts.get(img)!.push(p);
      }
    }
  }

  for (const [img, ps] of imageToProducts) {
    if (ps.length > 1) {
      warn(
        "uniqueness.image",
        `${ps.length} products`,
        `image shared by ${ps.map((p) => "#" + p.id).join(", ")}: ${img}`,
      );
    }
  }
}

function validateCategories() {
  const slugs = new Map<string, Category>();
  for (const c of categories) {
    if (!c.slug || !SLUG_RE.test(c.slug))
      error("category.slug", `category "${c.name}"`, `invalid slug "${c.slug}"`);
    if (slugs.has(c.slug))
      error("uniqueness.categorySlug", `category "${c.name}"`, `slug "${c.slug}" collides`);
    else slugs.set(c.slug, c);
  }
  // Category productCount reflects live-on-site products only. Drafts are
  // hidden from the public site and must not inflate the displayed count.
  const productsPerSlug = new Map<string, number>();
  for (const p of products) {
    if (p.isDraft) continue;
    productsPerSlug.set(p.categorySlug, (productsPerSlug.get(p.categorySlug) ?? 0) + 1);
  }
  for (const c of categories) {
    const actual = productsPerSlug.get(c.slug) ?? 0;
    if (actual !== c.productCount) {
      error(
        "category.productCount",
        `category "${c.name}"`,
        `productCount=${c.productCount} but ${actual} live products reference it`,
      );
    }
  }
  for (const [slug, count] of productsPerSlug) {
    if (!slugs.has(slug)) {
      error(
        "category.orphanSlug",
        `${count} products`,
        `reference categorySlug "${slug}" which has no matching category`,
      );
    }
  }
}

function validateBlog() {
  const ids = new Set<number>();
  const slugs = new Set<string>();
  for (const b of blogPosts) {
    const where = `blogPost #${b.id} "${b.title}"`;
    if (ids.has(b.id)) error("uniqueness.blogId", where, `id collision`);
    else ids.add(b.id);
    if (slugs.has(b.slug)) error("uniqueness.blogSlug", where, `slug collision "${b.slug}"`);
    else slugs.add(b.slug);
    if (isLocalAssetPath(b.image)) {
      /* local mirrored image — OK */
    } else {
      const u = parseUrl(b.image);
      if (!u) error("blog.image.invalid", where, `bad image URL "${b.image}"`);
      else if (EPHEMERAL_IMAGE_HOSTS.has(u.hostname))
        error("blog.image.ephemeralHost", where, `ephemeral host ${u.hostname}`);
    }
  }
}

// ---- run ----
for (const p of products) validateProduct(p);
validateUniqueness();
validateCategories();
validateBlog();

// ---- report ----
const errors = findings.filter((f) => f.severity === "error");
const warnings = findings.filter((f) => f.severity === "warning");
const byRule = new Map<string, number>();
for (const f of findings) byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1);

console.log(`\n=== data.ts validation ===`);
console.log(`  products:   ${products.length}`);
console.log(`  categories: ${categories.length}`);
console.log(`  blogPosts:  ${blogPosts.length}`);
console.log(`  errors:     ${errors.length}`);
console.log(`  warnings:   ${warnings.length}\n`);

if (findings.length) {
  console.log("--- findings by rule ---");
  const sortedRules = [...byRule.entries()].sort((a, b) => b[1] - a[1]);
  for (const [rule, count] of sortedRules) {
    const sev = findings.find((f) => f.rule === rule)!.severity;
    console.log(`  ${sev === "error" ? "E" : "W"} ${rule.padEnd(32)} ${count}`);
  }

  console.log("\n--- detail ---");
  for (const f of findings) {
    console.log(`  [${f.severity.toUpperCase()}] ${f.rule} — ${f.where}: ${f.detail}`);
  }
}

if (errors.length > 0) {
  console.log(`\n❌ FAILED — ${errors.length} error${errors.length === 1 ? "" : "s"}\n`);
  process.exit(1);
} else if (warnings.length > 0) {
  console.log(`\n⚠  passed with ${warnings.length} warning${warnings.length === 1 ? "" : "s"}\n`);
  process.exit(0);
} else {
  console.log(`\n✅ clean\n`);
  process.exit(0);
}
