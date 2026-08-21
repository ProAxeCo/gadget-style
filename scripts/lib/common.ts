/**
 * Shared utilities for the ingestion/maintenance scripts.
 * ───────────────────────────────────────────────────────
 * Single source of truth for helpers that used to be copy-pasted (with
 * drifting behavior) across gf.ts, amazon.ts, and toolsandtoys.ts. The
 * three source libs re-export from here so existing call sites don't
 * churn. If you need one of these in a new script, import from here —
 * never re-implement.
 */

export const ASIN_STRICT_RE = /^B0[A-Z0-9]{8}$/;

/**
 * Canonical slugify — the ONE implementation all pipelines share.
 *
 * History: gf.ts mapped `&`→"and" but turned apostrophes into hyphens;
 * amazon.ts/toolsandtoys.ts stripped apostrophes but dropped `&`. The
 * same title could mint different slugs depending on which pipeline saw
 * it first, silently defeating cross-source slug dedupe. This version
 * takes the union (strip apostrophes AND map `&`→"and"). Historical
 * slugs with punctuation edge cases may differ — cross-source dedupe is
 * backstopped by ASIN and source-URL matching, so that's acceptable.
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Bounded-concurrency map with per-item error isolation.
 *
 * Previously a thrown exception in any item rejected the whole
 * Promise.all and aborted the entire scrape wave, discarding completed
 * work. Now a throwing item logs a warning and resolves to `null`;
 * callers already treat falsy scrape results as per-item failures.
 */
export async function mapConcurrent<T, U>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<U>,
  onProgress?: (done: number, total: number) => void,
): Promise<(U | null)[]> {
  const results = new Array<U | null>(items.length);
  let cursor = 0;
  let done = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        results[i] = await fn(items[i], i);
      } catch (e) {
        console.warn(`  [mapConcurrent] item ${i} threw: ${String(e).slice(0, 160)}`);
        results[i] = null;
      }
      done++;
      onProgress?.(done, items.length);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

/** Decode the HTML entities that show up in scraped titles/descriptions. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => {
      try {
        return String.fromCodePoint(parseInt(n, 10));
      } catch {
        return "";
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => {
      try {
        return String.fromCodePoint(parseInt(n, 16));
      } catch {
        return "";
      }
    });
}

/** Read a required environment variable or die with a clear message. */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}
