/**
 * Generate a sitemap.xml in client/public/ so Vite copies it to dist at build.
 * Includes homepage, category pages, product pages (live only), blog pages.
 *
 * Run at build time via the `build` script (we'll wire this in after initial
 * deploy) or manually: `pnpm sitemap`.
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products, categories, blogPosts } from "../client/src/lib/data.js";
import { brands } from "../client/src/lib/brands.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = "https://www.gadgetstyle.com.au";
const OUT = join(__dirname, "..", "client", "public", "sitemap.xml");

type Entry = { loc: string; changefreq?: string; priority?: string; lastmod?: string };
const entries: Entry[] = [];

entries.push({ loc: `${SITE}/`, changefreq: "daily", priority: "1.0" });
entries.push({ loc: `${SITE}/blog`, changefreq: "weekly", priority: "0.7" });
entries.push({ loc: `${SITE}/about`, changefreq: "monthly", priority: "0.5" });
entries.push({ loc: `${SITE}/contact`, changefreq: "monthly", priority: "0.5" });

for (const c of categories) {
  // Skip empty "in the pipeline" categories — submitting thin/empty pages
  // at high priority invites soft-404 classification. They re-enter the
  // sitemap automatically once products are backfilled (the validator
  // guarantees productCount matches live products).
  if (c.productCount === 0) continue;
  entries.push({ loc: `${SITE}/category/${c.slug}`, changefreq: "daily", priority: "0.8" });
}

// Brand directory + per-brand landing pages. Brand pages with zero live
// products still render a real curated empty state, but only include the
// stocked ones in the sitemap for the same thin-content reason as above.
entries.push({ loc: `${SITE}/brands`, changefreq: "weekly", priority: "0.7" });
for (const b of brands) {
  const count = products.filter((p) => !p.isDraft && p.brand === b.slug).length;
  if (count === 0) continue;
  entries.push({ loc: `${SITE}/brand/${b.slug}`, changefreq: "weekly", priority: "0.7" });
}

for (const p of products) {
  if (p.isDraft) continue;
  entries.push({
    loc: `${SITE}/product/${p.slug}`,
    changefreq: "weekly",
    priority: "0.9",
    lastmod: p.dateAdded,
  });
}

for (const b of blogPosts) {
  entries.push({
    loc: `${SITE}/blog/${b.slug}`,
    changefreq: "monthly",
    priority: "0.6",
    lastmod: b.date,
  });
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map((e) => {
    const parts = [`<loc>${e.loc}</loc>`];
    if (e.lastmod) parts.push(`<lastmod>${e.lastmod}</lastmod>`);
    if (e.changefreq) parts.push(`<changefreq>${e.changefreq}</changefreq>`);
    if (e.priority) parts.push(`<priority>${e.priority}</priority>`);
    return `  <url>${parts.join("")}</url>`;
  }),
  "</urlset>",
].join("\n");

writeFileSync(OUT, xml);
console.log(`wrote ${OUT} — ${entries.length} URLs`);
