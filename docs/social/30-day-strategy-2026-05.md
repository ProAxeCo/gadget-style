# Gadget Style — 30-Day Social Strategy (May 2026)

**Generated:** 2026-05-06
**Posting window:** 2026-05-07 to 2026-06-05 (30 days)
**Channels:** Pinterest (3 pins/day = 90) + Instagram (1 carousel/day = 30) = **120 social assets**
**Status:** Queue is built, pre-validated, sitting on disk — ready to publish the moment Pinterest API credentials clear.

---

## Brief

We're loading 30 days of social content into a deterministic, AOV-weighted queue against the live 248-product catalog. Pinterest gets a 3-pins-per-day cadence (Pinterest's own recommended baseline for a new brand account, balanced against rate-limit risk during trial review). Instagram gets a daily carousel — feed only, no Reels in this batch since we don't have video assets at scale yet.

The core decision: don't optimize for vanity reach, optimize for click-through revenue. That means weighting the queue toward higher-AOV products (price > $300 gets 1.5x pick weight, > $500 gets 2x), even though those tend to have less mass appeal. A $599 smartwatch click-through earns ~$24 in commission at Amazon's 4% rate; a $49 speaker click-through earns ~$2. The queue tilts hard toward the former without abandoning the under-$200 layer that keeps engagement broad.

Voice register stays Wired/Engadget/RTINGS — every caption opens with the existing brand-voiced product description (already passes the gs-content rules), then adds an explicit `[paid affiliate link]` disclosure (Pinterest + IG community guidelines compliance). We never invent specs or prices; the script reads only from `data.ts` and excludes drafts and zero-price items.

---

## Daily theme map

The Pinterest cadence locks in a predictable weekly rhythm. Pinterest's algorithm rewards consistency more than novelty, and a brand that pins on the same beats every week becomes legible to the recommendation system faster.

| Weekday    | Slot 1 (AM)        | Slot 2 (Midday)    | Slot 3 (PM)        | Theme                        |
|------------|--------------------|--------------------|--------------------|------------------------------|
| Monday     | Comparison         | Product feature    | Product feature    | Head-to-heads anchor the week |
| Tuesday    | Product feature    | Category roundup   | Comparison         | Discovery + comparison        |
| Wednesday  | Product feature    | Category roundup   | Product feature    | Mid-week new arrivals         |
| Thursday   | Comparison         | Product feature    | Category roundup   | High-intent purchase day      |
| Friday     | Category roundup   | Product feature    | Lifestyle          | Weekend-shopping setup        |
| Saturday   | Product feature    | Lifestyle          | Category roundup   | Aspirational/lifestyle skew   |
| Sunday     | Product feature    | Comparison         | Category roundup   | Research/decision day         |

Instagram leans single-product for richness (60%), with Mondays as comparison day and Fridays as roundup day. Posting cadence alternates 7:30am / 7:30pm AEST — both are Pinterest-and-IG-confirmed engagement peaks for AU audiences and overlap with US East Coast prime time, capturing the bulk of Amazon-purchase-power traffic.

---

## Mix (actual queue distribution)

### Pinterest (90 pins)
| Type             | Count | Share | Target | Status |
|------------------|-------|-------|--------|--------|
| Product feature  | 38    | 42%   | 40%    | OK     |
| Category roundup | 26    | 29%   | 30%    | OK     |
| Comparison       | 17    | 19%   | 20%    | OK     |
| Lifestyle        | 9     | 10%   | 10%    | OK     |

### Instagram (30 carousels)
| Type             | Count | Share | Target | Status |
|------------------|-------|-------|--------|--------|
| Single product   | 18    | 60%   | 60%    | OK     |
| Comparison       | 7     | 23%   | 25%    | OK     |
| Category roundup | 5     | 17%   | 15%    | OK     |

---

## AOV-skew rationale

The catalog spans $19.99 to $1,599.99. Median live-product price is $159.99; average is $248.14. The queue sits at:

- **Queue median:** $229.00 (43% above catalog median)
- **Queue average:** $338.50 (36% above catalog average)
- **Queue max:** $1,599.99 (Amazon Astro robot — used in 1 comparison pin)

Why this matters: Amazon Associates pays a percentage commission, not a flat rate per click. A high-AOV product converting at the same rate as a low-AOV product produces materially more revenue per impression. The 1.5x/2x weights aren't arbitrary — they're a soft tilt that still allows the under-$200 layer (which has higher conversion rates and broader audience appeal) to do most of the volume work.

What the AOV-skew does NOT do:
- It doesn't push every pin toward the most expensive items. The under-$200 tier still drives ~40% of the queue.
- It doesn't sacrifice category balance. All six categories appear in both Pinterest and IG roundups.
- It doesn't break the cooldown rule — no product appears within 7 days of itself in the same channel.

---

## Year-1 commission forecast (back-of-envelope)

Assumptions (conservative):
- 500 click-throughs to Amazon per month from social (combined Pinterest + IG)
- 3% conversion rate on click-throughs (Amazon Associates AU/US blended)
- Average commission per converted order tracks queue average AOV
- Amazon commission rate: 4% (Australian Associates baseline category, conservative)

Math:
- 500 clicks × 3% = 15 conversions per month
- 15 × $338.50 (queue average AOV) = $5,077.50 attributable revenue per month
- Commission: $5,077.50 × 4% = **~$203/month**, or **~$2,438/year**

Sensitivities:
- If click-throughs scale to 1,500/month (3x — plausible by month 6 if Pinterest review approves and we hit cadence), monthly commission lands at ~$610, annualised at ~$7,300
- If we shift 30% of clicks to direct-brand affiliate programs (Impact / ShareASale / CJ — 8% average commission), blended rate rises to ~5.2%, lifting steady-state commission by ~30%

This is not a revenue forecast — it's a sanity check on whether the AOV-skew is worth the editorial effort. The answer: yes, modestly. The bigger lever is volume, not AOV.

---

## Hand-off checklist (when Pinterest credentials land)

Do these in this exact order:

1. **Validate credentials** — `pnpm tsx scripts/social-oauth-setup.ts` (or equivalent Pinterest token verification). Confirm token has `boards:read`, `pins:read_write`, and `user_accounts:read` scopes.

2. **Test pin upload (slot 1, day 1)** — manually post the first row of `pinterest-30-day-queue.csv` via API. Verify the pin renders correctly (image loads, description fits, hashtags display, link tracks). Wait 30 minutes and check that Pinterest hasn't flagged it.

3. **Bulk-upload via CSV import** — use Pinterest's bulk pin scheduler. Upload `pinterest-30-day-queue.csv`, set the dates from the `date` column. The CSV format here doesn't match Pinterest's exact bulk template (which uses different column names), so either:
   - Map columns in the Pinterest UI during import, OR
   - Run a one-off conversion script (~20 LOC) to remap to Pinterest's expected schema (`Title`, `Media URL`, `Pinterest board`, `Description`, `Link`, `Publish date`)

4. **Connect Instagram via Meta Business Suite** — IG carousels can be scheduled via Meta's planner. For each entry in `instagram-30-day-calendar.md`, paste the caption and upload the gallery URLs. Manual the first few; once IG Graph API access lands (post-business-verification, expected 2026-05-07/08 per `reference_meta_tokens_status.md`), automate via the existing `social-oauth-setup.ts` foundation.

5. **Set up tracking** — at minimum, add `?utm_source=pinterest&utm_medium=social&utm_campaign=may2026` to every destination URL. Verify analytics fires on the first published pin's destination page before publishing the rest.

---

## Risks & mitigations

| Risk                                              | Likelihood | Impact | Mitigation                                                                                       |
|---------------------------------------------------|------------|--------|--------------------------------------------------------------------------------------------------|
| Pinterest review rejects on first try             | Medium     | High   | Have all 248 product pages live and indexed; ensure each pin URL returns 200 with rich metadata. |
| Rate-limits trigger if blasted too fast           | Medium     | Medium | Stagger pin posting across the day (3 slots: AM, midday, PM). Don't bulk-upload >10 pins/hour.   |
| Image hosts return 404                            | Low        | High   | All images mirrored to `client/public/images/mirrored/`; no external CDN dependency.             |
| Queue runs against stale prices                   | Medium     | Low    | Re-run `generate-30-day-queue.ts` weekly to catch price changes. Queue is fully regeneratable.   |
| Affiliate disclosure flagged by either platform   | Low        | Medium | Every caption opens with `[paid affiliate link]`. Backup wording: "#ad" if rejected.             |
| Same product appears too often (audience fatigue) | Low        | Low    | Cooldown enforced: no product within 7 days. Top-featured products used max 3x in 30 days.       |
| AU geolocation hides products from AU buyers      | High       | Medium | Already flagged in `reference_amazon_au_us_strategy.md`. Long-term fix: AU Associates dual-tag.  |
| Pinterest review takes longer than expected       | Medium     | Low    | Queue is shelf-stable. If review takes 2 weeks, we just shift the start date 2 weeks.            |

---

## Files in this drop

- `docs/social/pinterest-30-day-queue.csv` — 90 pins, 12 columns, ready for bulk upload
- `docs/social/instagram-30-day-calendar.md` — 30 daily entries with hooks, captions, gallery URLs
- `docs/social/queue-stats.json` — machine-readable summary
- `docs/social/30-day-strategy-2026-05.md` — this document
- `docs/social/pinterest.csv` + `docs/social/instagram.md` — full-catalog baseline (existing `generate-social.ts` output, untouched)

Regenerate the queue any time:
```
pnpm tsx scripts/generate-30-day-queue.ts
```

The script is deterministic — same seed produces same queue. Change the seed (top of file) if you want a different mix.
