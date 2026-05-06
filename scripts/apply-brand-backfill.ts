/**
 * scripts/apply-brand-backfill.ts
 *
 * Reads `docs/brand-backfill-proposal.json` (produced by
 * `backfill-brands.ts`) and applies the brand mappings to
 * `client/src/lib/data.ts` by inserting a `brand: "<slug>"` field on
 * each matched product.
 *
 * Idempotent: products that already have a `brand` field are left alone.
 *
 * Usage:
 *   pnpm tsx scripts/apply-brand-backfill.ts
 *   pnpm tsx scripts/apply-brand-backfill.ts --dry-run  # preview only
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROPOSAL = join(__dirname, "..", "docs", "brand-backfill-proposal.json");
const DATA = join(__dirname, "..", "client", "src", "lib", "data.ts");

const dryRun = process.argv.includes("--dry-run");

interface Proposal {
  id: number;
  slug: string;
  currentBrand?: string;
  proposedBrand: string;
}

const proposal = JSON.parse(readFileSync(PROPOSAL, "utf8")) as {
  proposals: Proposal[];
};

const proposalById = new Map<number, string>();
for (const p of proposal.proposals) proposalById.set(p.id, p.proposedBrand);

let data = readFileSync(DATA, "utf8");

/**
 * Find each product object by walking the file and tracking brace depth.
 * We only look inside the `products` array, identified by the `id:` field
 * at the top of each object.
 */
interface ObjRange {
  id: number;
  start: number; // index of `{`
  end: number; // index of `}`
}

function findProductObjects(src: string): ObjRange[] {
  const ranges: ObjRange[] = [];
  // Find the products array start.
  const arrMatch = src.match(/export const products: Product\[\s*\n*\s*\]\s*=\s*\[/);
  if (!arrMatch || arrMatch.index === undefined) return ranges;
  const arrStart = arrMatch.index + arrMatch[0].length;

  let i = arrStart;
  let depth = 0;
  let objStart = -1;
  let foundId = -1;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "{") {
      if (depth === 0) {
        objStart = i;
        foundId = -1;
        // Look ahead for the id field (within a generous window).
        const window = src.slice(i, Math.min(i + 2000, src.length));
        const idMatch = window.match(/\{\s*\n?\s*id:\s*(\d+)\s*,/);
        if (idMatch) foundId = parseInt(idMatch[1], 10);
      }
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0 && objStart !== -1) {
        if (foundId > 0) {
          ranges.push({ id: foundId, start: objStart, end: i });
        }
        objStart = -1;
        foundId = -1;
      }
      if (depth < 0) {
        // We've exited the array.
        break;
      }
    } else if (ch === "]" && depth === 0) {
      break;
    }
    i += 1;
  }
  return ranges;
}

const ranges = findProductObjects(data);
console.log(`[apply-brand-backfill] found ${ranges.length} product objects`);

let updated = 0;
let alreadyTagged = 0;
let noProposal = 0;

// Apply edits from end to start so indices don't shift.
ranges.sort((a, b) => b.start - a.start);

for (const r of ranges) {
  const slug = proposalById.get(r.id);
  if (!slug) {
    noProposal += 1;
    continue;
  }
  const block = data.slice(r.start, r.end + 1);
  if (/\n\s*brand:\s*"/.test(block)) {
    alreadyTagged += 1;
    continue;
  }
  // Walk back from r.end-1 (right before `}`) through whitespace.
  let k = r.end - 1;
  while (k > r.start && /\s/.test(data[k])) k--;
  const indentMatch = data.slice(r.start, r.end).match(/\n([ \t]+)\w+:/);
  const indent = indentMatch?.[1] ?? "    ";
  const lastNonSpace = data[k];
  const prefix = lastNonSpace === "," ? "" : ",";
  const insertion = `${prefix}\n${indent}brand: "${slug}",`;
  // Insert at position `k+1` (right after the last non-space char before `}`).
  data = data.slice(0, k + 1) + insertion + data.slice(k + 1);
  updated += 1;
}

console.log(
  `[apply-brand-backfill] updated=${updated} already-tagged=${alreadyTagged} no-proposal=${noProposal} (dryRun=${dryRun})`,
);

if (!dryRun && updated > 0) {
  writeFileSync(DATA, data, "utf8");
  console.log(`wrote ${DATA}`);
}
