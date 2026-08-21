/**
 * Build-time prerender — real HTML for every route.
 * ──────────────────────────────────────────────────
 * The site is a client-only SPA: without this step, crawlers and social
 * link scrapers receive one identical empty shell for every URL — no
 * titles, no meta, no JSON-LD, no content. Since ALL data lives in
 * data.ts (zero runtime fetching), we can snapshot every route at build
 * time and ship static HTML that the SPA then takes over in the browser.
 *
 * How it works:
 *   1. Serves the freshly built dist/public locally (express, SPA fallback).
 *   2. Launches headless Chrome (puppeteer). Chrome is installed on demand
 *      into node_modules/.cache/puppeteer — pinned there so Vercel's build
 *      cache preserves it between deploys (~170MB, one-time per cache).
 *   3. Visits every route from the same enumeration the sitemap uses,
 *      waits for render, auto-scrolls to trigger whileInView animations,
 *      force-settles any residual opacity/transform, and captures the DOM.
 *   4. Post-processes per-page og:image for product routes (product photo
 *      instead of the generic site card).
 *   5. Writes dist/public/<route>/index.html. Vercel serves filesystem
 *      matches before the SPA rewrite, so prerendered HTML wins and
 *      unknown URLs still fall back to the SPA.
 *
 * Wired into `pnpm build` (after vite build). Standalone: `pnpm prerender`.
 * Retries each failed route once; exits non-zero if any route still fails
 * (same gate philosophy as the rest of the build).
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, type Server } from "node:http";
import { execSync } from "node:child_process";
import express from "express";
import { products, categories, blogPosts } from "../client/src/lib/data.js";
import { brands } from "../client/src/lib/brands.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const DIST = join(repoRoot, "dist", "public");
const SITE = "https://www.gadgetstyle.com.au";
const CONCURRENCY = 6;

// Pin Chrome's install location BEFORE importing puppeteer so both the
// on-demand install and the launcher agree on it. node_modules/.cache is
// preserved by Vercel's build cache; the default ~/.cache/puppeteer is not.
process.env.PUPPETEER_CACHE_DIR = join(repoRoot, "node_modules", ".cache", "puppeteer");
const { default: puppeteer } = await import("puppeteer");

/* ── Route enumeration (mirrors scripts/generate-sitemap.ts) ── */
const routes: string[] = ["/", "/blog", "/about", "/contact", "/brands"];
for (const c of categories) {
  if (c.productCount === 0) continue;
  routes.push(`/category/${c.slug}`);
}
for (const b of brands) {
  const count = products.filter((p) => !p.isDraft && p.brand === b.slug).length;
  if (count === 0) continue;
  routes.push(`/brand/${b.slug}`);
}
const productBySlug = new Map<string, (typeof products)[number]>();
for (const p of products) {
  if (p.isDraft) continue;
  routes.push(`/product/${p.slug}`);
  productBySlug.set(p.slug, p);
}
for (const bp of blogPosts) routes.push(`/blog/${bp.slug}`);

/* ── Local static server with SPA fallback ── */
function serveDist(): Promise<{ server: Server; port: number }> {
  const app = express();
  app.use(express.static(DIST, { index: "index.html" }));
  app.get("*", (_req, res) => res.sendFile(join(DIST, "index.html")));
  return new Promise((resolve) => {
    const server = createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({ server, port: typeof addr === "object" && addr ? addr.port : 0 });
    });
  });
}

/* ── Ensure Chrome exists (no-op when the build cache already has it) ──
 * Uses puppeteer's own CLI so the installed build EXACTLY matches what
 * this puppeteer version's launcher resolves — installing "stable" by
 * hand can drift ahead of the launcher's pinned revision. Respects the
 * PUPPETEER_CACHE_DIR pinned above. */
function ensureChrome(): void {
  console.log("  ensuring Chrome for puppeteer (no-op when cached) ...");
  execSync("pnpm exec puppeteer browsers install chrome", {
    stdio: "inherit",
    cwd: repoRoot,
    env: { ...process.env },
  });
}

/* ── Per-page snapshot ── */
async function snapshot(page: import("puppeteer").Page, origin: string, route: string): Promise<string> {
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle0", timeout: 45_000 });
  await page.waitForFunction(() => {
    const root = document.getElementById("root");
    return !!root && root.children.length > 0;
  }, { timeout: 15_000 });

  // Trigger whileInView animations by scrolling through the page, then
  // return to the top so captured scroll-position-dependent UI is sane.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  // Let framer-motion settle (its section fades run ~0.6s).
  await new Promise((r) => setTimeout(r, 800));

  // Force-settle any residual mid-animation inline styles so no content is
  // baked into the snapshot invisible (opacity:0) or offset (translate).
  await page.evaluate(() => {
    document.querySelectorAll<HTMLElement>('[style*="opacity"]').forEach((el) => {
      if (parseFloat(el.style.opacity || "1") < 1) el.style.opacity = "1";
      if (el.style.transform && el.style.transform !== "none") el.style.transform = "none";
    });
  });

  const html = await page.evaluate(() => document.documentElement.outerHTML);
  return `<!doctype html>\n${html}`;
}

/* ── Post-process: per-product og:image ── */
function postProcess(route: string, html: string): string {
  const m = route.match(/^\/product\/(.+)$/);
  if (!m) return html;
  const p = productBySlug.get(m[1]);
  if (!p) return html;
  const img = (p.images?.[0] || p.image) ?? "";
  const abs = img.startsWith("http") ? img : `${SITE}${img}`;
  return html
    .replace(
      /(<meta property="og:image" content=")[^"]*(")/,
      `$1${abs}$2`
    )
    .replace(
      /(<meta name="twitter:image" content=")[^"]*(")/,
      `$1${abs}$2`
    )
    .replace(/<meta property="og:image:width" content="[^"]*">\s*/, "")
    .replace(/<meta property="og:image:height" content="[^"]*">\s*/, "");
}

function outPath(route: string): string {
  return route === "/"
    ? join(DIST, "index.html")
    : join(DIST, ...route.replace(/^\//, "").split("/"), "index.html");
}

/* ── Main ── */
async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    console.error(`✗ ${DIST}/index.html not found — run vite build first`);
    process.exit(2);
  }

  const t0 = Date.now();
  await ensureChrome();
  const { server, port } = await serveDist();
  const origin = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    headless: true,
    // Vercel build containers run as root without a sandbox user namespace.
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const queue = [...routes];
  const failed: { route: string; error: string }[] = [];
  let done = 0;

  async function worker() {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    // Skip image/font/media loads — <img src> attributes survive in the DOM
    // regardless, and this cuts snapshot time by ~5x.
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      const url = req.url();
      if (type === "image" || type === "font" || type === "media") return req.abort();
      if (!url.startsWith(origin) && !url.startsWith("data:")) return req.abort();
      return req.continue();
    });

    while (queue.length > 0) {
      const route = queue.shift()!;
      let html: string | null = null;
      for (let attempt = 1; attempt <= 2 && html === null; attempt++) {
        try {
          html = await snapshot(page, origin, route);
        } catch (e) {
          if (attempt === 2) failed.push({ route, error: String(e).slice(0, 200) });
        }
      }
      if (html !== null) {
        const file = outPath(route);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, postProcess(route, html));
        done++;
        if (done % 50 === 0) console.log(`  ${done}/${routes.length} pages`);
      }
    }
    await page.close();
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  await browser.close();
  server.close();

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\nprerendered ${done}/${routes.length} routes in ${secs}s`);
  if (failed.length > 0) {
    console.error(`✗ ${failed.length} routes failed:`);
    for (const f of failed) console.error(`   ${f.route} — ${f.error}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
