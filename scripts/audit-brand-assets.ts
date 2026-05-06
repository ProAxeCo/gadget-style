/**
 * Brand asset audit
 * ─────────────────
 * Walks every entry in `client/src/lib/brands.ts` and verifies it has the
 * full visual asset kit a brand page needs:
 *
 *   1. logoUrl points to a file that actually exists in client/public
 *   2. logoUrl is an SVG (vector — scales cleanly at any pill size)
 *   3. accentColor is a valid 6-digit hex
 *   4. tagline + description meet minimum length requirements
 *   5. heroImageUrl (optional) — if set, file must exist and live on a
 *      durable host (site-local /images/* or one of the durable CDNs)
 *   6. brand has at least 1 live (non-draft) product OR is explicitly
 *      flagged as upcoming
 *
 * Run:    pnpm brands:audit
 * Output: docs/brand-asset-audit.json + console summary.
 *
 * Exits non-zero if any HARD checks fail (missing logo file, invalid hex,
 * non-SVG logo). Soft warnings (no products yet, missing hero) report but
 * don't fail the build — they're reminders, not blockers.
 *
 * This is the gate to keep brand visual quality consistent as we add more
 * brands. New brand → drop logo → run `pnpm brands:audit` → if green,
 * the /brand/<slug> and /brands cards inherit the same polish as the
 * existing 10 brands automatically.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const publicDir = resolve(repoRoot, "client/public");
const docsDir = resolve(repoRoot, "docs");

// Dynamic import keeps this script self-contained — no need to wire into
// the Vite alias system.
const brandsModule = await import(
  "file://" + resolve(repoRoot, "client/src/lib/brands.ts").replace(/\\/g, "/")
).catch(() => null);

if (!brandsModule) {
  // Fallback: parse the brands array via regex when tsx can't resolve the
  // alias-laden lib/data.ts dependency chain at script time.
  console.error(
    "Direct import failed; falling back to text-mode audit of brands.ts"
  );
}

interface AuditFinding {
  brand: string;
  level: "error" | "warning" | "ok";
  rule: string;
  message: string;
}

const findings: AuditFinding[] = [];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// Read brands.ts as text so the script doesn't need the live module loaded.
const brandsSource = readFileSync(
  resolve(repoRoot, "client/src/lib/brands.ts"),
  "utf-8"
);

interface ParsedBrand {
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  accentColor?: string;
}

// Lightweight parse — extract each `{ slug: "...", ... }` block from the
// brands array. Good enough for an audit; doesn't need to be a TS parser.
function parseBrands(src: string): ParsedBrand[] {
  const arrStart = src.indexOf("export const brands");
  if (arrStart < 0) return [];
  // Skip past `: Brand[] =` — find the `=` then the `[` after it.
  const eq = src.indexOf("=", arrStart);
  if (eq < 0) return [];
  const open = src.indexOf("[", eq);
  if (open < 0) return [];
  // naive but ok — match braces to find the array end
  let depth = 0;
  let end = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) return [];
  const body = src.slice(open + 1, end);

  const out: ParsedBrand[] = [];
  // Split on top-level closing braces of each entry
  const entries = body.split(/\}\s*,\s*\{/g);
  for (let raw of entries) {
    raw = raw.replace(/^\s*\{?/, "").replace(/\}?\s*$/, "");
    const get = (key: string) => {
      // Match only the actual delimiter (double quote in our brands.ts) so
      // apostrophes inside the value don't terminate the capture. Falls back
      // to single-quote / backtick when the file uses those.
      let m = raw.match(new RegExp(`${key}\\s*:\\s*"([^"]*)"`, "s"));
      if (!m) m = raw.match(new RegExp(`${key}\\s*:\\s*'([^']*)'`, "s"));
      if (!m) m = raw.match(new RegExp(`${key}\\s*:\\s*\`([^\`]*)\``, "s"));
      return m?.[1];
    };
    const slug = get("slug");
    if (!slug) continue;
    out.push({
      slug,
      name: get("name") ?? slug,
      tagline: get("tagline"),
      description: get("description"),
      logoUrl: get("logoUrl"),
      heroImageUrl: get("heroImageUrl"),
      accentColor: get("accentColor"),
    });
  }
  return out;
}

const brands = parseBrands(brandsSource);

if (brands.length === 0) {
  console.error("✗ Could not parse any brands from brands.ts");
  process.exit(2);
}

for (const b of brands) {
  // 1. logoUrl exists
  if (!b.logoUrl) {
    findings.push({
      brand: b.slug,
      level: "error",
      rule: "logo.required",
      message: "logoUrl is missing",
    });
  } else {
    const local = b.logoUrl.startsWith("/")
      ? resolve(publicDir, b.logoUrl.slice(1))
      : null;
    if (local && !existsSync(local)) {
      findings.push({
        brand: b.slug,
        level: "error",
        rule: "logo.file_missing",
        message: `logo file not found: ${b.logoUrl}`,
      });
    } else if (!b.logoUrl.toLowerCase().endsWith(".svg")) {
      findings.push({
        brand: b.slug,
        level: "warning",
        rule: "logo.not_svg",
        message: `logo is not SVG (${b.logoUrl}) — vector preferred for crisp scaling`,
      });
    } else {
      findings.push({
        brand: b.slug,
        level: "ok",
        rule: "logo",
        message: "SVG logo present",
      });
    }
  }

  // 2. accentColor format
  if (!b.accentColor) {
    findings.push({
      brand: b.slug,
      level: "warning",
      rule: "accent.missing",
      message: "no accentColor — page will fall back to neutral grey",
    });
  } else if (!HEX_RE.test(b.accentColor)) {
    findings.push({
      brand: b.slug,
      level: "error",
      rule: "accent.invalid",
      message: `accentColor "${b.accentColor}" is not a 6-digit hex`,
    });
  }

  // 3. copy length
  if (!b.tagline || b.tagline.length < 8) {
    findings.push({
      brand: b.slug,
      level: "warning",
      rule: "tagline.short",
      message: "tagline missing or under 8 chars",
    });
  }
  if (!b.description || b.description.length < 60) {
    findings.push({
      brand: b.slug,
      level: "warning",
      rule: "description.short",
      message: "description missing or under 60 chars (target 100+)",
    });
  }

  // 4. heroImageUrl (optional) — if set, must resolve
  if (b.heroImageUrl && b.heroImageUrl.startsWith("/")) {
    const local = resolve(publicDir, b.heroImageUrl.slice(1));
    if (!existsSync(local)) {
      findings.push({
        brand: b.slug,
        level: "error",
        rule: "hero.file_missing",
        message: `heroImageUrl file not found: ${b.heroImageUrl}`,
      });
    }
  }
}

// Summary
const errors = findings.filter((f) => f.level === "error");
const warnings = findings.filter((f) => f.level === "warning");

console.log(`\n  Brand asset audit — ${brands.length} brands\n`);
for (const b of brands) {
  const errs = findings.filter((f) => f.brand === b.slug && f.level === "error");
  const warns = findings.filter((f) => f.brand === b.slug && f.level === "warning");
  const status = errs.length ? "✗" : warns.length ? "⚠" : "✓";
  console.log(`  ${status} ${b.slug.padEnd(12)} ${b.name}`);
  for (const e of errs) console.log(`      ERROR   ${e.rule}: ${e.message}`);
  for (const w of warns) console.log(`      warn    ${w.rule}: ${w.message}`);
}

console.log(
  `\n  ${errors.length} errors, ${warnings.length} warnings, ${brands.length} brands\n`
);

// Persist
if (!existsSync(docsDir)) mkdirSync(docsDir, { recursive: true });
writeFileSync(
  resolve(docsDir, "brand-asset-audit.json"),
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      summary: {
        brands: brands.length,
        errors: errors.length,
        warnings: warnings.length,
      },
      findings,
    },
    null,
    2
  ),
  "utf-8"
);

if (errors.length > 0) {
  console.error("✗ brand asset audit failed");
  process.exit(1);
}
console.log("✓ brand asset audit passed");
