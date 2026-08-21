/**
 * Affiliate link checker — finds dead Amazon ASINs before they zero out
 * revenue.
 * ─────────────────────────────────────────────────────────────────────
 * Amazon delists/rotates products constantly. A delisted ASIN means the
 * CTA lands on Amazon's dog-404 page: zero commission, wasted click —
 * and nothing on this site would ever notice. This script fetches every
 * LIVE product's affiliateUrl and classifies it:
 *
 *   DEAD          HTTP 404/410 — the listing is gone. Actionable.
 *   UNAVAILABLE   page loads but shows "Currently unavailable". Actionable
 *                 (link works but can't convert).
 *   ALIVE         page loads with buy-box signals.
 *   INCONCLUSIVE  bot-wall/captcha/5xx/timeout — Amazon blocks datacenter
 *                 IPs aggressively; do NOT treat as dead.
 *
 * Exit codes: 0 = no DEAD links; 1 = at least one DEAD link (the weekly
 * workflow surfaces this as a failed run → email to the owner).
 * INCONCLUSIVE results never fail the run.
 *
 * Run:  pnpm links:check                  # all live Amazon products
 *       pnpm links:check -- --limit 20    # spot-check subset
 *       pnpm links:check -- --ids 97,258  # specific products
 *
 * Report: docs/link-check-report.json (latest run only, committed by the
 * weekly workflow so trends live in git history).
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../client/src/lib/data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "docs", "link-check-report.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const THROTTLE_MS = 2_000;

type Verdict = "ALIVE" | "DEAD" | "UNAVAILABLE" | "INCONCLUSIVE";
interface Result {
  id: number;
  asin: string;
  url: string;
  verdict: Verdict;
  detail: string;
}

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith("--limit"));
const limit = limitArg ? parseInt(args[args.indexOf(limitArg) + 1] || limitArg.split("=")[1], 10) : Infinity;
const idsArg = args.find((a) => a.startsWith("--ids"));
const onlyIds = idsArg
  ? new Set((args[args.indexOf(idsArg) + 1] || idsArg.split("=")[1]).split(",").map(Number))
  : null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function classify(url: string): Promise<{ verdict: Verdict; detail: string }> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    if (res.status === 404 || res.status === 410) {
      return { verdict: "DEAD", detail: `HTTP ${res.status}` };
    }
    if (res.status >= 500 || res.status === 429 || res.status === 403) {
      return { verdict: "INCONCLUSIVE", detail: `HTTP ${res.status}` };
    }
    const body = await res.text();
    if (/captcha|Robot Check|automated access/i.test(body)) {
      return { verdict: "INCONCLUSIVE", detail: "bot-wall" };
    }
    // Amazon's dog page serves 404 normally, but belt-and-braces:
    if (/Dogs of Amazon|couldn't find that page/i.test(body)) {
      return { verdict: "DEAD", detail: "dog page at HTTP " + res.status };
    }
    // ALIVE check must run BEFORE the unavailable check: Amazon's page
    // boilerplate contains the literal string "Currently unavailable" in
    // template fragments even on fully buyable listings (first sweep
    // misclassified 92 in-stock products as UNAVAILABLE because of this).
    if (/id="add-to-cart-button"|name="submit\.add-to-cart"/i.test(body)) {
      return { verdict: "ALIVE", detail: "buy box present" };
    }
    if (/Currently unavailable/i.test(body)) {
      return { verdict: "UNAVAILABLE", detail: "no buy box, unavailable marker" };
    }
    if (/id="productTitle"/i.test(body)) {
      return { verdict: "ALIVE", detail: "product page renders (no buy box detected)" };
    }
    return { verdict: "INCONCLUSIVE", detail: `HTTP ${res.status}, unrecognized body` };
  } catch (e) {
    return { verdict: "INCONCLUSIVE", detail: String(e).slice(0, 120) };
  }
}

async function main() {
  const targets = products
    .filter((p) => !p.isDraft)
    .filter((p) => (p.destination ?? "amazon") === "amazon")
    .filter((p) => (onlyIds ? onlyIds.has(p.id) : true))
    .slice(0, limit);

  console.log(`checking ${targets.length} live Amazon links (throttle ${THROTTLE_MS}ms)...`);
  const results: Result[] = [];
  for (const [i, p] of targets.entries()) {
    const { verdict, detail } = await classify(p.affiliateUrl);
    results.push({ id: p.id, asin: p.asin, url: p.affiliateUrl, verdict, detail });
    if (verdict !== "ALIVE") console.log(`  [${verdict}] #${p.id} ${p.asin} — ${detail}`);
    if ((i + 1) % 25 === 0) console.log(`  ...${i + 1}/${targets.length}`);
    await sleep(THROTTLE_MS);
  }

  const counts = { ALIVE: 0, DEAD: 0, UNAVAILABLE: 0, INCONCLUSIVE: 0 } as Record<Verdict, number>;
  for (const r of results) counts[r.verdict]++;

  writeFileSync(
    OUT,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        totals: counts,
        actionable: results.filter((r) => r.verdict === "DEAD" || r.verdict === "UNAVAILABLE"),
      },
      null,
      2
    )
  );

  console.log(
    `\nresult: ${counts.ALIVE} alive, ${counts.DEAD} dead, ${counts.UNAVAILABLE} unavailable, ${counts.INCONCLUSIVE} inconclusive`
  );
  console.log(`report: ${OUT}`);
  if (counts.DEAD > 0) {
    console.error(`✗ ${counts.DEAD} DEAD affiliate links — fix or remove these products`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
