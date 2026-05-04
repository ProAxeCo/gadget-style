/**
 * Print the current draft products in a compact JSON form suitable for triage.
 */
import { products } from "../client/src/lib/data.js";

const drafts = products
  .filter((p) => p.isDraft)
  .map((p) => ({
    id: p.id,
    title: p.title,
    currentAsin: p.asin,
    price: p.price,
    category: p.category,
    gadgetFlowUrl: p.gadgetFlowUrl,
  }));

console.log(JSON.stringify(drafts, null, 2));
console.log(`\n${drafts.length} drafts`);
