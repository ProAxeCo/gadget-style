/**
 * External-destination revenue review — the standing queue of live
 * products that earn nothing.
 * ────────────────────────────────────────────────────────────────
 * `destination: "external"` is a legitimate catalog state (products not
 * sold on Amazon stay discoverable), but every live external product is
 * foregone commission until either (a) it's flipped to a real Amazon
 * ASIN, or (b) a direct-brand affiliate link replaces the plain URL.
 * This report exists so that state is never invisible again — the
 * 2026-08 audit treated externals as working-as-designed and a ~9-product
 * conversion opportunity sat unnoticed until a manual question surfaced it.
 *
 * Buckets:
 *   CONVERT?   host suggests the product is likely sold on Amazon —
 *              verify ASIN in a browser and flip (see CLAUDE.md
 *              "External product review loop")
 *   AFFILIATE  brand-direct host — candidate for Impact/CJ/Awin/ShareASale
 *   BROKEN     externalUrl is not a buyable page (news article, article
 *              path, tracking-parameter junk) — fix or demote to draft
 *
 * Run:  pnpm report:externals
 * Also written to docs/external-products.md for the ops loop.
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../client/src/lib/data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "docs", "external-products.md");

// Hosts whose products are near-certainly also sold on Amazon (Amazon-
// native brands, Amazon hardware, accessory brands with Amazon storefronts).
const LIKELY_ON_AMAZON = /eero\.com|tessan\.com|corsair\.com|8bitdo\.com|keychron\.com|denon\.com|soundboks\.com|dji\.com|anker|belkin/i;
// URL shapes that are not buyable pages.
const NOT_BUYABLE = /\/news\/|\/blog\/|news\.|\/press|\/announc|#|\?utm_|clickref=/i;

const externals = products.filter(
  (p) => !p.isDraft && (p.destination ?? "amazon") === "external"
);

const rows = externals.map((p) => {
  const url = p.externalUrl ?? "";
  let bucket = "AFFILIATE";
  if (!url || NOT_BUYABLE.test(url)) bucket = "BROKEN";
  else if (LIKELY_ON_AMAZON.test(url)) bucket = "CONVERT?";
  return { id: p.id, bucket, url, title: p.title };
});

const order = { "BROKEN": 0, "CONVERT?": 1, "AFFILIATE": 2 } as Record<string, number>;
rows.sort((a, b) => order[a.bucket] - order[b.bucket] || a.id - b.id);

const lines = [
  "# Live external-destination products — revenue review queue",
  "",
  `Updated: ${new Date().toISOString().slice(0, 10)} · ${rows.length} live products earning $0`,
  "",
  "Regenerate with `pnpm report:externals`. Review loop: CLAUDE.md → 'External product review loop'.",
  "",
  "| id | bucket | title | url |",
  "|---|---|---|---|",
  ...rows.map((r) => `| ${r.id} | ${r.bucket} | ${r.title.slice(0, 60)} | ${r.url.slice(0, 70)} |`),
  "",
];
writeFileSync(OUT, lines.join("\n"));

console.log(`${rows.length} live external products (earning $0):`);
for (const r of rows) console.log(`  [${r.bucket.padEnd(9)}] #${r.id} ${r.title.slice(0, 60)}`);
console.log(`\nreport: ${OUT}`);
const broken = rows.filter((r) => r.bucket === "BROKEN").length;
if (broken > 0) console.log(`⚠ ${broken} BROKEN buy-link(s) — fix or demote to draft`);
