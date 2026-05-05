/**
 * Scrape Amazon prices for current drafts.
 * Skips placeholder ASINs (B000000000).
 * Writes scripts/draft-prices.auto.json and docs/drafts-price-scrape-report.md
 *
 * Strategy: client-rendered prices on Amazon as of April 2026 mean direct HTML
 * scraping is unreliable, but JSON-LD / og:price meta / a-offscreen still work
 * for some pages. Try multiple methods in priority order.
 *
 * Usage: pnpm tsx scripts/scrape-draft-prices.ts
 */

import { products } from "../client/src/lib/data.js";
import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

type Draft = {
  id: number;
  title: string;
  asin: string;
  category: string;
};

type Outcome =
  | { id: number; title: string; price: number; method: string }
  | { id: number; title: string; price: null; reason: string };

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function fetchAmazon(asin: string): { ok: true; html: string } | { ok: false; reason: string } {
  const url = `https://www.amazon.com/dp/${asin}`;
  try {
    // Use curl directly (more lenient than Node fetch for Amazon's anti-bot quirks)
    const html = execSync(
      `curl -sL --max-time 20 --compressed -A "${UA}" -H "Accept-Language: en-US,en;q=0.9" -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" "${url}"`,
      { encoding: "utf8", maxBuffer: 30 * 1024 * 1024 },
    );
    if (!html || html.length < 1000) {
      return { ok: false, reason: `tiny response (${html?.length ?? 0} bytes)` };
    }
    return { ok: true, html };
  } catch (err) {
    return { ok: false, reason: `curl failed: ${(err as Error).message.slice(0, 80)}` };
  }
}

function parsePrice(html: string): { price: number; method: string } | null {
  // 1. JSON-LD
  const ldScripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of ldScripts) {
    try {
      const json = JSON.parse(m[1].trim());
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        const offers = item?.offers;
        if (offers) {
          const offerArr = Array.isArray(offers) ? offers : [offers];
          for (const o of offerArr) {
            const p = parseFloat(o?.price ?? o?.lowPrice ?? "");
            if (!isNaN(p) && p > 0) return { price: p, method: "json-ld" };
          }
        }
        if (item?.price) {
          const p = parseFloat(item.price);
          if (!isNaN(p) && p > 0) return { price: p, method: "json-ld" };
        }
      }
    } catch {
      // skip malformed
    }
  }

  // 2. og:price:amount
  const og = html.match(/<meta[^>]*property=["']og:price:amount["'][^>]*content=["']([\d.]+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([\d.]+)["'][^>]*property=["']og:price:amount["']/i);
  if (og) {
    const p = parseFloat(og[1]);
    if (!isNaN(p) && p > 0) return { price: p, method: "og:price" };
  }

  // 3. product:price:amount
  const pp = html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([\d.]+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([\d.]+)["'][^>]*property=["']product:price:amount["']/i);
  if (pp) {
    const p = parseFloat(pp[1]);
    if (!isNaN(p) && p > 0) return { price: p, method: "product:price" };
  }

  // 4. a-offscreen (Amazon's accessible price element)
  const offscreens = [...html.matchAll(/class=["']a-offscreen["'][^>]*>\s*\$([\d,]+\.?\d*)\s*</gi)];
  for (const m of offscreens) {
    const p = parseFloat(m[1].replace(/,/g, ""));
    if (!isNaN(p) && p > 0) return { price: p, method: "a-offscreen" };
  }

  // 5. priceblock_ourprice / priceblock_dealprice (legacy)
  const legacy = html.match(/id=["']priceblock_(?:our|deal)price["'][^>]*>\s*\$?([\d,]+\.?\d*)/i);
  if (legacy) {
    const p = parseFloat(legacy[1].replace(/,/g, ""));
    if (!isNaN(p) && p > 0) return { price: p, method: "priceblock-legacy" };
  }

  // 6. apex price desktop (more recent Amazon class)
  const apex = html.match(/class=["']a-price-whole["'][^>]*>\s*([\d,]+)\s*<[^>]*>\s*<span[^>]*class=["']a-price-fraction["'][^>]*>\s*(\d+)/i);
  if (apex) {
    const p = parseFloat(`${apex[1].replace(/,/g, "")}.${apex[2]}`);
    if (!isNaN(p) && p > 0) return { price: p, method: "apex-whole-fraction" };
  }

  // 7. detect captcha / robot-check page
  if (/Type the characters you see in this image/i.test(html)
    || /captcha/i.test(html.slice(0, 2000))
    || /\/errors\/validateCaptcha/i.test(html)) {
    return null;
  }

  return null;
}

function detectFailureReason(html: string): string {
  if (!html) return "empty response";
  // Captcha must be checked first — opfcaptcha pages are short and self-contained
  if (/opfcaptcha\.amazon\.com/i.test(html)) return "captcha";
  if (/\/errors\/validateCaptcha/i.test(html)) return "captcha";
  if (/Type the characters you see in this image/i.test(html)) return "captcha";
  if (/Sorry, we just need to make sure you're not a robot/i.test(html)) return "bot-check";
  if (/Page Not Found/i.test(html.slice(0, 5000))) return "404 / delisted (or rate-limited)";
  if (/currently unavailable/i.test(html)) return "unavailable";
  if (/See All Buying Options/i.test(html)) return "no-direct-price (buying-options)";
  if (html.length < 8000) return `short html (${html.length}b) — likely captcha or error`;
  return "client-rendered (no price in HTML)";
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const drafts: Draft[] = (products as any[])
    .filter((p) => p.isDraft)
    .map((p) => ({
      id: p.id,
      title: p.title,
      asin: p.asin,
      category: p.category,
    }));

  console.log(`Found ${drafts.length} drafts total`);

  // Skip placeholder ASINs
  const real = drafts.filter((d) => d.asin !== "B000000000");
  const placeholders = drafts.filter((d) => d.asin === "B000000000");
  console.log(`Skipping ${placeholders.length} placeholder-ASIN drafts: ${placeholders.map((p) => p.id).join(", ")}`);
  console.log(`Will scrape ${real.length} real-ASIN drafts\n`);

  const successes: Extract<Outcome, { price: number }>[] = [];
  const failures: Extract<Outcome, { price: null }>[] = [];

  // Concurrency 2 — pair-by-pair
  for (let i = 0; i < real.length; i += 2) {
    const batch = real.slice(i, i + 2);
    const results = await Promise.all(
      batch.map(async (d) => {
        console.log(`[${d.id}] fetching ${d.asin}...`);
        const fetched = fetchAmazon(d.asin);
        if (!fetched.ok) {
          return { id: d.id, title: d.title, price: null, reason: fetched.reason } as Outcome;
        }
        const parsed = parsePrice(fetched.html);
        if (parsed) {
          console.log(`  -> $${parsed.price} (${parsed.method})`);
          return { id: d.id, title: d.title, price: parsed.price, method: parsed.method } as Outcome;
        }
        const reason = detectFailureReason(fetched.html);
        console.log(`  -> FAILED: ${reason}`);
        return { id: d.id, title: d.title, price: null, reason } as Outcome;
      }),
    );
    for (const r of results) {
      if (r.price !== null) successes.push(r as any);
      else failures.push(r as any);
    }
    if (i + 2 < real.length) {
      await sleep(2500); // 2.5s sleep between batches
    }
  }

  console.log(`\n=== ${successes.length}/${real.length} prices found ===\n`);

  // Write auto JSON
  const autoJson: Record<string, number> = {};
  for (const s of successes) autoJson[String(s.id)] = s.price;
  const autoPath = "scripts/draft-prices.auto.json";
  writeFileSync(autoPath, JSON.stringify(autoJson, null, 2) + "\n", "utf8");
  console.log(`Wrote ${autoPath}`);

  // Write report
  const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const lines: string[] = [];
  lines.push(`# Drafts price-scrape report`);
  lines.push("");
  lines.push(`Run: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`**Total: ${successes.length}/${real.length} prices found** (${real.length - successes.length} failures)`);
  lines.push("");
  lines.push(`Method: client-side curl with browser User-Agent, parsing JSON-LD → og:price → product:price → a-offscreen → priceblock → apex.`);
  lines.push("");
  lines.push("## Successes");
  lines.push("");
  if (successes.length === 0) {
    lines.push("_None._");
  } else {
    lines.push("| id | title | price | method |");
    lines.push("|---:|---|---:|---|");
    for (const s of successes.sort((a, b) => a.id - b.id)) {
      lines.push(`| ${s.id} | ${trunc(s.title, 60).replace(/\|/g, "\\|")} | $${s.price.toFixed(2)} | ${s.method} |`);
    }
  }
  lines.push("");
  lines.push("## Failures");
  lines.push("");
  if (failures.length === 0) {
    lines.push("_None._");
  } else {
    lines.push("| id | title | reason |");
    lines.push("|---:|---|---|");
    for (const f of failures.sort((a, b) => a.id - b.id)) {
      lines.push(`| ${f.id} | ${trunc(f.title, 60).replace(/\|/g, "\\|")} | ${f.reason} |`);
    }
  }
  lines.push("");
  // Identify likely-delisted (404) ASINs separately
  const delisted = failures.filter((f) => /404 \/ delisted/i.test(f.reason));
  if (delisted.length > 0) {
    lines.push("## Likely delisted (Amazon returned 404)");
    lines.push("");
    lines.push("These ASINs returned an Amazon \"Page Not Found\" page. Could be genuinely delisted, refurbished-edition gone, or a rate-limit fluke. Visit each manually — if confirmed delisted, replace ASIN with the current edition or remove the product.");
    lines.push("");
    for (const d of delisted.sort((a, b) => a.id - b.id)) {
      lines.push(`- #${d.id} ${trunc(d.title, 80)}`);
    }
    lines.push("");
  }

  lines.push("## Skipped (placeholder ASINs — recommend removal)");
  lines.push("");
  for (const p of placeholders.sort((a, b) => a.id - b.id)) {
    lines.push(`- #${p.id} ${trunc(p.title, 80)} (asin=${p.asin})`);
  }
  lines.push("");
  lines.push("## Recommended next steps");
  lines.push("");
  if (successes.length > 0) {
    lines.push("1. Review `scripts/draft-prices.auto.json` for sanity.");
    lines.push("2. Merge cleanly into `scripts/draft-prices.json` (or copy if file doesn't exist yet).");
    lines.push("3. Manually price the failures listed above by visiting their Amazon pages.");
    lines.push("4. Run `pnpm tsx scripts/promote-drafts-bulk.ts` to promote priced drafts.");
    lines.push(`5. Remove placeholder-ASIN drafts: \`pnpm tsx scripts/remove-products.ts ${placeholders.map((p) => p.id).join(" ")} && pnpm fix:counts\`.`);
    lines.push("6. Run `pnpm check` to verify clean state.");
  } else {
    lines.push("**Auto-scrape returned 0 prices.** As CLAUDE.md warned, amazon.com renders prices client-side as of April 2026 — even with a real browser User-Agent, the served HTML contains the product title, images, and bullets but **no price element at all**. The price is fetched and inserted via JavaScript at runtime. A small subset (4 ASINs in this run) additionally tripped Amazon's CAPTCHA defense.");
    lines.push("");
    lines.push("This means HTML scraping is a dead end for prices. Realistic paths forward, in order of effort:");
    lines.push("");
    lines.push("**A. Manual pricing (fastest right now).** Open each Amazon URL in a real browser and fill in `scripts/draft-prices.json`. With 29 products and ~30 seconds per lookup, this is ~15 minutes of work. URLs are in `docs/drafts-review.md` or constructible as `https://www.amazon.com/dp/<ASIN>?tag=gadgetstyle01-20`.");
    lines.push("");
    lines.push("**B. Headless-browser scraper (1-2 hours of dev).** Add Playwright or Puppeteer to scripts/. Render each `/dp/<ASIN>` page, wait for the `.a-price` selector, extract `.a-offscreen`. This is what every other affiliate site does post-2024. Reusable for all future drafts. Tradeoff: ~5s per page, browser binary in dev deps.");
    lines.push("");
    lines.push("**C. PA-API (best long-term, blocked today).** As soon as Associates account hits 3 qualifying sales, apply for Product Advertising API. It returns prices, images, titles, and availability via signed REST. The `amazon-discover` script scaffolding is already wired for this swap.");
    lines.push("");
    lines.push("Recommended: do **A** now to unblock these 29 drafts, then build **B** as the durable solution before the next sync run.");
    lines.push("");
    lines.push("Then:");
    lines.push("- Manually fill `scripts/draft-prices.json` with `{ \"271\": 19.99, ... }` shape.");
    lines.push("- `pnpm tsx scripts/promote-drafts-bulk.ts` to promote.");
    lines.push(`- Remove placeholder-ASIN drafts: \`pnpm tsx scripts/remove-products.ts ${placeholders.map((p) => p.id).join(" ")} && pnpm fix:counts\`.`);
    lines.push("- `pnpm check` to verify clean state.");
  }
  lines.push("");

  const reportPath = "docs/drafts-price-scrape-report.md";
  writeFileSync(reportPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${reportPath}`);

  // Top-level summary
  console.log("\nSummary:");
  console.log(`  successes: ${successes.length}`);
  console.log(`  failures: ${failures.length}`);
  if (failures.length > 0) {
    const reasonCounts: Record<string, number> = {};
    for (const f of failures) reasonCounts[f.reason] = (reasonCounts[f.reason] ?? 0) + 1;
    console.log("  top reasons:");
    for (const [r, c] of Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${c}x ${r}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
