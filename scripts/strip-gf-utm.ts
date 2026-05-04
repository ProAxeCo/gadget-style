/**
 * Strip `utm_source=GadgetFlow&utm_medium=GadgetFlow&utm_campaign=GadgetFlow`
 * from every `externalUrl` in data.ts. Stops giving Gadget Flow referral
 * attribution on products we now own outright.
 *
 * Also removes duplicate utm_source params (some GoPro-style URLs have
 * TWO `utm_source=` query params — one from the brand's partner network
 * and the GF sub-affiliate tag appended on top).
 *
 * Idempotent.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "client", "src", "lib", "data.ts");

function stripGfUtm(url: string): string {
  // Parse query
  const qIdx = url.indexOf("?");
  if (qIdx === -1) return url;
  const base = url.slice(0, qIdx);
  const hashIdx = url.indexOf("#", qIdx);
  const query = hashIdx === -1 ? url.slice(qIdx + 1) : url.slice(qIdx + 1, hashIdx);
  const hash = hashIdx === -1 ? "" : url.slice(hashIdx);

  // Split on `&`, drop any param whose value is exactly `GadgetFlow`.
  // This covers utm_source, utm_medium, utm_campaign, utm_content set to GF.
  // Also drops GF-specific click tracker params if present.
  const kept: string[] = [];
  for (const part of query.split("&")) {
    const [k, v] = part.split("=");
    if (!k) continue;
    const decodedV = (() => { try { return decodeURIComponent(v ?? ""); } catch { return v ?? ""; } })();
    if (decodedV === "GadgetFlow") continue;
    if (k.toLowerCase() === "promotional_method" && decodedV.toLowerCase() === "subaffiliate") continue;
    kept.push(part);
  }
  return kept.length > 0 ? `${base}?${kept.join("&")}${hash}` : `${base}${hash}`;
}

const src = readFileSync(DATA_PATH, "utf8");
let changes = 0;

const updated = src.replace(
  /externalUrl:\s*"([^"]+)"/g,
  (_m, url: string) => {
    const stripped = stripGfUtm(url);
    if (stripped !== url) changes++;
    return `externalUrl: ${JSON.stringify(stripped)}`;
  },
);

writeFileSync(DATA_PATH, updated);
console.log(`Stripped GF UTM params from ${changes} externalUrl(s).`);
console.log(`Next: pnpm check`);
