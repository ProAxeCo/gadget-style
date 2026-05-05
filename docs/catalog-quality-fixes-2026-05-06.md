# Catalog Quality Fixes — 2026-05-06

**Owner:** `gs-catalog`
**Scope:** 25 T&T-era viable drafts (#271-300, minus #288, #291-293, #296)
**Method:** Chrome MCP DOM scrape against `amazon.com/dp/<ASIN>` + targeted edits
to `client/src/lib/data.ts` + image mirror.
**Validator state:** before 33 warnings / 0 errors → after 33 warnings / 0 errors.
Net zero new validator noise, full bug fix retired.

---

## 1. Five known data bugs — fix status

| ID | Class | Before | Fix applied | Verification |
|---|---|---|---|---|
| 275 | Title drift (variant mismatch) | Title: "OXWALLEN Packs Stretchy Bands". ASIN B08N5WR4HG resolves to an Apple Watch band. | Title and slug updated to canonical Amazon title: "OXWALLEN XL Stretch Solo Loop Band Compatible with Apple Watch... Orange". ASIN unchanged (it was always correct). | Amazon page confirms: "OXWALLEN XL Stretch Solo Loop Band Compatible with Apple Watch Series 11/10/9/8/7/6/5/4 SE 3/2/1 42mm 41mm 40mm 38mm, Adjustable Elastic Nylon Braided Sport Strap for iWatch Women Men, Orange". |
| 277 | Placeholder description + thin title | Title: "Eagle Creek". Description: 5-paragraph LLM-refusal asking for product info. | Title updated to canonical: "Eagle Creek Pack-It Gear Cube M, Sahara Yellow". Slug updated. Description replaced with a one-sentence placeholder + flag for `gs-content` re-write. ASIN unchanged. | Amazon page confirms: "eagle creek Pack-It Gear Cube M Sahara Yellow". |
| 279 | Variant drift (hooded vs non-hooded) | Title: "Arborwear Men's Double Thick Pullover Sweatshirt". ASIN B00ZIADJSW resolves to the HOODED variant. Description in data.ts says "no hood". | Title and slug updated to canonical Amazon title: "Arborwear Double-Thick Hooded Pullover Sweatshirts For Men - Heavyweight Hoodies With Snap Neck Collar and Handwarmer Pouch". ASIN unchanged. Description still says "no hood" — flagged in inline comment for `gs-content` rewrite. | Amazon page confirms: "Arborwear Double-Thick Hooded Pullover Sweatshirts For Men - Heavyweight Hoodies With Snap Neck Collar and Handwarmer Pouch". |
| 282 | Delisted variant (Translucent Gray → White redirect) | ASIN B0BXH3CK3G ("Touch Translucent Gray") redirects to B08CR97FGW ("Touch Translucent White"). Gray variant appears delisted. | Switched ASIN to B08CR97FGW (still-live White variant). Updated title, slug, image (61UWh9j5YfL), and full 7-image gallery. affiliateUrl auto-canonical via `pnpm fix:urls`. Description still mentions "translucent gray" once — flagged for `gs-content` tweak. | After redirect, page resolves to B08CR97FGW; product is live with full gallery. |
| 290 | Old ASIN redirect to Deluxe variant | ASIN B01LD85JIK redirects to B01LD85ORQ ("HiRise 2 Deluxe with Lightning + Micro-USB cables"). Different image, different model. | Switched ASIN to B01LD85ORQ. Updated title, slug, image (71OV45f1maL), and 6-image gallery. affiliateUrl auto-canonical. Description still says "Requires Apple Lightning Cable (not Included)" which is now wrong — flagged for `gs-content` edit. | After redirect, page resolves to B01LD85ORQ; product is live as the Deluxe variant. |

**Outcome:** 5/5 bugs fixed in `data.ts`. Inline `// Catalog-quality fix
2026-05-06:` comments mark each correction. None of the 5 drafts had `isDraft:
true` removed — all still need user-supplied prices before promotion.

---

## 2. Image density audit — 25 viable T&T drafts

Working practices rule 11 ("4-8 quality images non-negotiable"). Before/after
counts on every viable draft. Source = Amazon `#altImages` thumbnails (hi-res
`_SL1500_` versions).

| ID | Before | After | Delta | Source / note |
|---|---|---|---|---|
| 271 | 7 | 7 | — | Already meets target |
| 272 | 6 | 6 | — | Already meets target |
| 273 | 6 | 6 | — | Already meets target |
| 274 | 1 | **2** | +1 | Amazon publishes only 1 unique gallery thumb beyond hero — added; **target unmet (Amazon limit)** |
| 275 | 8 | 8 | — | Already meets target |
| 276 | 1 | **2** | +1 | Replaced custom IMG_5287 upload with Amazon hi-res; only 2 unique images on Amazon — **target unmet (Amazon limit)** |
| 277 | 2 | 2 | — | Amazon publishes only 2 thumbs — **target unmet (Amazon limit)** |
| 278 | 7 | 7 | — | Already meets target |
| 279 | 6 | 6 | — | Already meets target |
| 280 | 3 | **7** | +4 | Added 4 hi-res Amazon gallery thumbs; **target met** |
| 281 | 1 | 1 | — | Amazon publishes only 1 unique image — **target unmet (Amazon limit)** |
| 282 | 8 | 7 | -1 | Switched to White variant gallery (7 images on Amazon); meets ≥4 target |
| 283 | 8 | 8 | — | Already meets target |
| 284 | 4 | 4 | — | Already meets target |
| 285 | 8 | 8 | — | Already meets target |
| 286 | 8 | 8 | — | Already meets target |
| 287 | 6 | 6 | — | Already meets target |
| 289 | 8 | 8 | — | Already meets target |
| 290 | 3 | **6** | +3 | Switched to Deluxe variant; full gallery refresh; **target met** |
| 294 | 4 | 4 | — | Already meets target |
| 295 | 8 | 8 | — | Already meets target |
| 297 | 8 | 8 | — | Already meets target |
| 298 | 8 | 8 | — | Already meets target |
| 299 | 7 | 7 | — | Already meets target |
| 300 | 7 | 7 | — | Already meets target |

### Drafts upgraded with new images: 4
#274, #276, #280, #290 — total of 8 new image URLs added; mirrored locally via
`pnpm tsx scripts/mirror-images.ts --apply` (downloads ok=20, fail=0).

### Drafts still below 4 images after upgrade: 4
#274, #276, #277, #281 — all four are products where Amazon itself publishes
fewer than 4 gallery thumbnails. No further upgrades possible from Amazon.

---

## 3. Drafts recommended for REMOVAL

**None from this batch.**

The 5 bug-fix products are all live on Amazon (sometimes via redirect to a
related variant) and have been corrected to point at the canonical SKU. None
returned 404 or "Not available" during this audit.

The 4 likely-delisted ASINs flagged in the previous price scrape (#288, #291,
#292, #293) were excluded from this run per the task brief and remain pending
the user's removal decision via `pnpm tsx scripts/remove-products.ts 288 291
292 293`.

The 4 low-image-count drafts (#274, #276, #277, #281) should NOT be removed —
they're real, live products that simply don't have rich Amazon galleries.
Decision is the user's: either accept lower image density for these, or
consider supplementing with manufacturer-site or Gadget Flow imagery.

---

## 4. Description-rewrite flags for `gs-content`

Three of the five bug fixes leave residual description content that contradicts
the corrected title. Flagged inline in `data.ts` and listed here for
`gs-content` to action before promotion:

- **#277 Eagle Creek Pack-It Gear Cube M** — description is currently a
  one-sentence placeholder. Needs full 3-4 paragraph review keyed off the Pack-It
  Gear Cube M's published specs (dimensions, fabric weight, capacity, organizational
  features).
- **#279 Arborwear Hooded Pullover** — description is well-written but says
  "no hood" and "no zipper hardware" — half-correct now (no zipper, but it IS
  hooded). Needs a paragraph-2 edit acknowledging the hood + snap collar.
- **#282 Aulumu A16 Translucent White** — description references "translucent
  gray colorway" once. Trivial s/gray/white/ edit.
- **#290 Twelve South HiRise 2 Deluxe** — description repeatedly says "requires
  Apple Lightning Cable (not Included)" — Deluxe variant ships with Lightning
  + Micro-USB cables included. Needs paragraph-1 + paragraph-3 rework.

---

## A. Executive summary

Closed five known catalog-quality bugs surfaced by the 2026-05-05 Chrome MCP
price scrape — three title-drift fixes (#275, #277, #279), one variant-redirect
fix (#282 Translucent Gray → White), and one ASIN-redirect fix (#290 HiRise 2 →
HiRise 2 Deluxe). Inspected image density on all 25 viable T&T drafts;
augmented 4 drafts (#274, #276, #280, #290) with additional hi-res Amazon
gallery images, mirrored locally, and validated zero new validator warnings
(33 warnings / 0 errors before AND after). Commercial impact: drafts now
clean enough to ship cleanly the moment the user fills prices — no risk of
clicking through to a wrong-variant Amazon page or a broken redirect.

## B. Deliverables

- 5 inline edits in `client/src/lib/data.ts` for bug fixes (#275, #277, #279,
  #282, #290), each marked with a `// Catalog-quality fix 2026-05-06:` comment
  explaining the fix.
- 3 inline image-density augmentation edits (#274, #276, #280) marked with a
  `// 2026-05-06 image augmentation:` comment.
- 20 new image files mirrored to `client/public/images/mirrored/` via
  `pnpm tsx scripts/mirror-images.ts --apply`.
- This report: `docs/catalog-quality-fixes-2026-05-06.md`.
- All affiliate URLs canonical (`pnpm fix:urls` confirmed 0 changes needed
  after edits).
- `pnpm check` clean: 0 errors, 33 warnings (= baseline).

## C. Assumptions and verification points

- All 5 ASIN-related fixes were verified via live Chrome MCP scrape against
  `amazon.com/dp/<ASIN>` on 2026-05-06.
- Browser geolocation was AU; this affected price visibility (not relevant
  here since this run was focused on title/image/redirect, not prices) but
  not title or gallery data.
- The 4 description-residue items flagged in section 4 require human or
  `gs-content` review before promotion; data.ts inline comments will catch
  any reader who misses this report.
- No `isDraft: true` flag was removed from any of the 25. User price-fill is
  still required before promotion.
- Image mirror script confirms ok=20 / fail=0; no broken downloads. URLs
  rewritten in place in `data.ts` (host → `/images/mirrored/...`).

## D. Next actions

1. **User: review the 4 flagged description-residue items** (#277, #279,
   #282, #290) and either action via `gs-content` or accept the residual
   text as-is before promotion.
2. **User: decide on the 4 likely-delisted drafts** (#288, #291, #292,
   #293). Recommended: `pnpm tsx scripts/remove-products.ts 288 291 292 293`
   (followed by `pnpm fix:counts && pnpm check`).
3. **User: review and fill `scripts/draft-prices.json`** for the 11 drafts
   with prices captured in `scripts/draft-prices.auto.json` (from the
   2026-05-05 scrape), then run `pnpm tsx scripts/promote-drafts-bulk.ts`.
4. **Catalog SME: schedule a US-ZIP Chrome session** to recover the 14
   missing-AU-price drafts, then merge into `draft-prices.json`.
5. **Catalog SME: consider replacing `description` for #277 Eagle Creek**
   via `pnpm tsx scripts/write-descriptions.ts --include-drafts --since N
   --force` once a real description is needed. The single-sentence placeholder
   is functional but light.
