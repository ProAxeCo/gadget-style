# High-AOV Content Strategy 2026

**Author:** gs-growth | **Date:** 2026-05-06 | **Status:** Strategy memo + 90-day pipeline

Companion to:
- `docs/cluster-tvs-under-2000.md`
- `docs/cluster-premium-home-audio.md`
- `docs/cluster-drones-content-creators.md`

---

## Why the AOV pivot matters

Click-through-sales is the metric (per `feedback_working_practices.md` rule 9). Catalog skews lower-AOV today: smart plugs, Echo Dots, Fire TV Sticks, mid-tier wearables. Each click-through-sale on those carries AU$0.40–AU$3 in commission. A buyer who lands on `/category/smart-home`, clicks a Kasa Smart Plug, and converts on Amazon generates roughly the same content effort and far less revenue than a buyer who lands on a comparison roundup, clicks an LG C5 OLED CTA, and converts.

The AOV pivot is not about chasing big numbers — it is about preserving the SAME content effort (one long-form roundup, ~3,000 words, four hours of writing, one hour of fact-checking) and pairing it with categories where ONE conversion equals 30–80 conversions in our current catalog skew. TVs (AU$1,400–$1,900 AOV), premium audio (AU$479–$2,089 AOV), and drones (AU$1,150–$5,000+ AOV) deliver that. The math does not need traffic to scale — it needs the right traffic to find the right product.

This pivot also aligns with where Gadget Flow, our gold-standard reference per `reference_gadgetflow.md`, concentrates editorial weight: premium tier, statement products, hardware-first storytelling. If we write Wirecutter-tier content for cheap commodities, we lose to Wirecutter on volume. If we write Wired-tier hardware-first prose for premium gear with AU specificity, we own a moat the giants don't compete in.

---

## Catalog cross-reference: what we already have per cluster

This section pulls from `client/src/lib/data.ts` (live + drafts as of 2026-05-06).

### Cluster 1: TVs under $2,000 — current catalog fit

**Quick wins (already live):**
- `id 50` — DJI Mini 4 Pro (cross-link from drone cluster, not TV)
- *(no current live OLED TV in catalog)*

**Live but tangential / soundbar pairing:**
- `id 21` — Sonos Beam (Gen 2) Smart Soundbar (audio pair)
- Sony BRAVIA Theatre Bar 5 Soundbar (already in data.ts; review status with `gs-catalog` — appears live)

**Drafts that fit the cluster:**
- `id 292` LG C7 65-inch OLED TV — DRAFT, ASIN B01NAYM1TP, price 0
- `id 293` LG C7 55-inch OLED TV — DRAFT, ASIN B01MZF7WCT, price 0
- *Verdict:* C7 is 2017-era and EOL. Description is good prose but commercially obsolete — keep as historical reference draft, do NOT promote. **Recommend deleting both via `pnpm tsx scripts/remove-products.ts 292 293` once cluster article ships.**

**Recommended ADDITIONS (priority order):**
1. **LG C5 OLED 65"** — most-mentioned in 2026 AU "best TV" lists. Owner: gs-catalog. Path: manual Amazon AU listing pull.
2. **Samsung S90F OLED 65"** — RTINGS "best TV under $2000" verified.
3. **Sony Bravia 8 OLED 55"/65"** — Sony AU.
4. **Hisense U8Q 65" mini-LED** — verified launch AU$2,699.
5. **TCL C8K 65" mini-LED** — verified launch AU$2,695, TCL AU direct site available.
6. **LG B5 OLED 65"** — budget OLED option.
7. **LG C5 OLED 48"** — compact AU apartment + bedroom pick.

All 7 should be added as **drafts** until amazon.com.au stock + ASIN confirmed (per CLAUDE.md draft pattern).

### Cluster 2: Premium home audio — current catalog fit

**Quick wins (already live):**
- `id 10` — Sonos Era 100 Wireless Smart Speaker (AU$199 equivalent — ENTRY tier, link as starter product in the Sonos ladder section)
- `id 21` — Sonos Beam (Gen 2) Smart Soundbar
- `id 12 / 23` (verify ids) — Bose QuietComfort Ultra Earbuds (audio category, but not in this cluster — flag for sister "best premium headphones" cluster)
- Sony WH-1000XM5, Sennheiser Momentum 4, Marshall Stanmore III, Bose SoundLink Max, JBL Charge 5, Apple AirPods Pro 2 — all live, all audio category, **none in the premium home-audio sub-cluster** (they are headphones / portable). Confirms the gap.

**Drafts that fit:**
- *(No current premium home audio drafts found in data.ts beyond Bose Smart Soundbar 300 — older/lower-tier)*
- Bose Smart Soundbar 300 (id ~144) — DRAFT or live? — verify with `gs-catalog`. Older SKU; Bose Smart Soundbar 900 is the cluster pick.

**Recommended ADDITIONS (priority order):**
1. **Sonos Era 300** — verified AU$749, anchors the spatial-audio storyline.
2. **Sonos Arc Ultra** — verified AU$1,499, top-tier Atmos soundbar.
3. **Apple HomePod 2** — verified AU$479, Apple-household pick.
4. **KEF LSX II** — verified ~AU$2,089, hi-fi alternate.
5. **Bose Smart Soundbar 900** *(or current Bose flagship Atmos soundbar)* — pending AU price verification.
6. **B&W Zeppelin (current gen)** — pending AU price verification.

Add 1–4 immediately as drafts. 5–6 after price verification.

### Cluster 3: Drones for content creators — current catalog fit

**Quick wins (already live):**
- `id 50` — DJI Mini 4 Pro Drone with RC 2 Controller (the entry-tier pick — strong existing asset)
- `id 47` — DJI Osmo Action 5 Pro (action camera; cross-link as "consider this instead for ground-level action footage")
- `id 100` — DJI Osmo Pocket 4 (gimbal camera; cross-link)
- `id 49` — Insta360 X4 360° Action Camera (cross-link)
- `id 45` — GoPro HERO13 Black (cross-link)

**Drafts that fit:**
- *(No current drone drafts found in this pass — confirm with `gs-catalog`)*

**Recommended ADDITIONS (priority order):**
1. **DJI Mavic 4 Pro** — flagship; highest AOV in catalog if added.
2. **DJI Mavic 4 Pro 512GB Creator Combo (RC Pro 2)** — separate SKU, premium upsell.
3. **DJI Air 3S** — mid-tier, highest expected volume seller for the cluster.
4. **DJI Avata 2** — FPV niche.
5. *(If shipping by publish)* DJI Mini 5 Pro.
6. *(Optional alt)* Autel EVO Lite+.

All 4–5 should be added as drafts. Mavic 4 Pro has Amazon US listing (B0DS2HDF1M), Mavic 4 Pro 512GB Creator Combo has Amazon US listing (B0DS49VDHG) per research — verify amazon.com.au cross-stock before promoting from draft.

---

## Social cron rotation — cluster mapping

Per `feedback_autonomous_posting.md`: Pinterest + Meta direct API stack already shipped. This is the cluster-to-platform allocation.

### Pinterest (primary discovery + click-driver per `gs-growth.md` Section C)

Pinterest sends 33% of social ecommerce traffic on average — the highest-converting social platform for affiliate. Cluster fit by pin format:

- **TV cluster → Pinterest priority HIGH.** Comparison-table pins, "OLED vs mini-LED" infographic pins, per-model vertical pins. AU-buying-guide pins (evergreen). 12+ pins per article, with 3 pins/product spread over 30 days per `gs-growth.md` cadence.
- **Audio cluster → Pinterest priority HIGH.** "Sonos system ladder" infographic (high save rate), "Sonos vs HomePod 60-second decision" idea pin. Spatial-audio explainer pin. 12+ pins.
- **Drone cluster → Pinterest priority HIGH.** "DJI lineup 2026" tier ladder infographic, CASA registration step-by-step pin (evergreen high-save). Per-drone pins. The CASA pin alone is a permanent traffic asset — a niche keyword competitors don't address with Pinterest content.

**Total Pinterest pin target across 3 articles: 90+ pins over 90 days** (3 articles × 30 pins each).

### Instagram (secondary, brand-equity + nurture)

Reels-first per `gs-growth.md` Section D. Cluster fit by Reel format:

- **TV cluster → IG priority MEDIUM.** 3 Reels per article: "AU$2k OLED in 30 seconds", "WOLED vs QD-OLED in 60 seconds", "PS5 OLED checklist". Carousel post (8 cards). 5 Stories with poll stickers.
- **Audio cluster → IG priority MEDIUM-HIGH.** Audio products demo well in Reels (sound-on engagement). 3 Reels + carousel + Stories. "Sonos Era 300 in 60 seconds" has strong demo potential; "spatial audio explained in 30 seconds" has educational save value.
- **Drone cluster → IG priority HIGH.** Drones own visual content — aerial footage clips embedded in Reels are inherently shareable. 3 Reels + carousel + Stories. "DJI tier guide in 60 seconds", "CASA in 30 seconds", "Mavic 4 Pro vs Air 3S".

**Total IG Reel target: 9 Reels + 3 carousels + 15 Stories series** (3 articles × 3 Reels + 1 carousel + 5 Stories each).

### Facebook Page (tertiary, retention + AU-specific community)

Per `reference_meta_tokens_status.md`: FB Page READ + WRITE + DELETE end-to-end verified. Use as the AU-specific community + comment-engagement layer, not net-new content channel.

- **All 3 clusters → FB Page priority LOW-MEDIUM.** Repurpose IG carousels as FB album posts. Share the long-form article direct to the Page with a 60-word teaser. Engage on comments — FB's algorithm rewards Page-author replies more than other platforms.

**Total FB Page target: 3 article shares + 3 carousel reposts + 3 evergreen reshare posts (4-week refresh)** = 9 posts over 90 days.

---

## 90-day pipeline target

**Window:** 2026-05-06 → 2026-08-06.

### Content output

- **3 long-form roundup articles published** (one per cluster) — TV first (week 2), audio second (week 5), drones third (week 8).
- **5 follow-on comparison articles** drafted (1 per cluster + 2 cross-cluster head-to-heads). Examples: "LG C5 vs Sony Bravia 8", "Sonos Era 300 vs HomePod 2", "DJI Mavic 4 Pro vs Air 3S", "best soundbar under AU$1,000", "best drone for real estate AU".
- **1 standalone CASA registration explainer page** as a permanent SEO asset — pulled from the drone cluster article into its own URL once that article publishes.

### Social output

- **90+ Pinterest pins** (3 articles × 30 pins). Cron: 3–5/day per `gs-growth.md` Section C. **Pinterest is the primary click-driver — this is the most important social KPI for the 90 days.**
- **9 IG Reels + 3 carousels + 15 Stories series**. IG is Reels-first per `gs-growth.md` Section D.
- **9 FB Page posts** (3 article shares + 3 carousel reposts + 3 reshares).

### Catalog output

- **17–18 new product drafts added** to data.ts (7 TVs + 6 audio + 4–5 drones).
- **All drafts promoted to live within 14 days of cluster article publish**, gated on AU pricing + AU stock + Amazon AU ASIN verification per CLAUDE.md draft pattern.
- **2 obsolete LG C7 drafts removed** (id 292, 293) via `pnpm tsx scripts/remove-products.ts 292 293`.

### Conversion goals (measurable in Vercel Analytics + GA4)

Per `gs-growth.md` Section B: GA4 setup is an open issue. Goals assume GA4 + Vercel Analytics live by week 2.

- **Article impressions (GSC):** 3,000+ across the 3 cluster articles by day 90.
- **Pinterest pin impressions:** 50,000+ across 90 pins.
- **Pinterest pin clicks → site:** 500+.
- **Outbound affiliate clicks (UTM-tagged):** 200+ across all 3 clusters.
- **Estimated Amazon-affiliate sales attributable:** 6–25 (modeled at ~3–12% click-to-sale rate, varies wildly by category).
- **Estimated commission revenue:** AU$200–$1,800 over 90 days (model-driven, per cluster monetization math in each cluster doc).

These are CONSERVATIVE targets — strong organic ranking on a single AU-specific long-tail can multiply Pinterest impressions 5–10× in months 4–6 of the timeline.

### Compliance gates (every article)

Per `feedback_working_practices.md` rule 14 + ACCC + Amazon Associates terms:
- Affiliate disclosure block above the fold
- ABN 75185709936 in footer
- No fabricated review counts, no "we tested this" language
- All prices marked "Last verified: YYYY-MM-DD"
- Per-product CTA dual-tag-aware (US tag now, AU tag once approved per `reference_amazon_au_us_strategy.md`)

---

## Risks and dependencies

**Highest-impact risks:**

1. **AU Amazon Associates not yet approved** — current US tag leaks AU traffic conversions to a US tag where the AU buyer often gets "cannot ship" (per `reference_amazon_au_us_strategy.md`). Material revenue leak. Resolution: `gs-affiliates` AU Associates application priority.
2. **Direct-brand affiliate signups not live** — KEF, B&W, Sony, Samsung, LG, DJI all run their own affiliate programs (CJ / Impact / Awin / Partnerize). At Gadget Style scale these often pay 4–8% vs Amazon's 2%. Per `project_direct_brand_affiliates.md`. Resolution: `gs-affiliates` parallel signup track.
3. **Product specs / pricing drift** — the 17–18 new SKUs need quarterly verification cycle. Resolution: build `scripts/check-product-prices.ts` (open issue).
4. **Search volume estimates are MODELED, not validated** — GSC + Google Trends data not yet pulled. Resolution: `gs-growth` GSC submission week 1.

**Highest-impact dependencies:**

1. `gs-catalog` adds 17–18 new SKUs as drafts within 7 days.
2. `gs-content` drafts 3 cluster articles within 30 days (one per ~10 days).
3. `gs-deploy` ensures FAQ + ItemList + Product + HowTo schema injectors live in blog post template before first article ships.
4. `gs-growth` submits sitemap to GSC (open issue per `gs-growth.md` Section B) and sets up GA4 within 14 days.
5. `gs-social` cron picks up the 90+ Pinterest pins within 90 days at 1–2 pins/day cadence.

---

## C. Standard Operator Wrapper

### Executive summary
Three AU-specific high-AOV content clusters defined and briefed: 4K OLED TVs under $2,000 (AOV ~AU$1,500), premium home audio systems (AOV ~AU$1,000), drones for content creators (AOV ~AU$2,000). Pivots Gadget Style from a low-AOV catalog skew (smart plugs, Echo Dots, mid-tier wearables) into commission territory where ONE conversion equals 30–80 conversions in current catalog. 90-day pipeline targets 3 long-form roundups, 5 follow-on comparisons, 90+ Pinterest pins, 9 IG Reels, modeled AU$200–AU$1,800 commission revenue at conservative click-to-sale rates. AU specificity (CASA regulation depth, AU Amazon stock check, AU pricing currency) is the editorial moat against Wirecutter / RTINGS / What Hi-Fi.

### Deliverables
- 4 files written:
  - `docs/cluster-tvs-under-2000.md` (existing, updated 2026-05-06 with verified AU SKUs + research footnote)
  - `docs/cluster-premium-home-audio.md` (NEW)
  - `docs/cluster-drones-content-creators.md` (NEW)
  - `docs/high-aov-content-strategy-2026.md` (NEW — this doc)
- 17–18 new product additions queued for `gs-catalog`
- 90-day social cron + content calendar mapped per cluster
- Compliance + verification checklist per cluster

### Assumptions and verification points
- TV cluster: LG C5, Samsung S90F, Sony Bravia 8 confirmed as 2026 AU reference picks (Tom's Guide AU + TechRadar AU + RTINGS); Hisense U8Q + TCL C8K verified launch pricing. AU prices on individual SKUs need verification before publish.
- Audio cluster: Sonos Era 300 (AU$749), Sonos Arc Ultra (AU$1,499), Apple HomePod 2 (AU$479), KEF LSX II (~AU$2,089) verified. Bose Smart Soundbar 900 + B&W Zeppelin AU prices NOT verified in this pass.
- Drone cluster: DJI Mavic 4 Pro, Mavic 4 Pro 512GB Creator Combo, Air 3S, Mini 4 Pro, Avata 2 all verified as current 2026 SKUs. AU pricing on Mavic 4 Pro + Air 3S + Avata 2 NOT verified in this pass. CASA AU$40/year commercial registration verified.
- Search volume estimates MODELED (need GSC + Google Trends).
- Conversion rate modeling assumes 2% Amazon electronics commission + dual-tag AU launch within 90 days.
- **No fabricated specs, ratings, review counts, prices, or testing claims.** All dynamic data marked re-verify.

### Next actions (priority order)

**Week 1:**
1. `gs-catalog`: add 17–18 new SKUs as drafts to data.ts (7 TVs + 6 audio + 4–5 drones). Path: `pnpm gf:sync` first, then manual Path A for any GF gaps. ETA: 2–3 hours total.
2. `gs-catalog`: remove obsolete LG C7 drafts (`pnpm tsx scripts/remove-products.ts 292 293 && pnpm fix:counts`).
3. `gs-affiliates`: file Amazon AU Associates application + flag direct-brand programs (CJ / Impact / Awin) for KEF, B&W, Sony, Samsung, LG, DJI.
4. `gs-growth`: submit sitemap to GSC + set up GA4 (open items per `gs-growth.md` Section B).

**Week 2:**
5. `gs-content`: draft TV cluster article per `docs/cluster-tvs-under-2000.md` brief. Publish gates: AU price verification, FAQ + ItemList + Product schema live.
6. `gs-growth`: build/verify ComparisonTable.tsx + schema injectors.
7. `gs-social`: launch first 30 Pinterest pins for TV cluster.

**Weeks 3–5:**
8. `gs-content`: draft audio cluster article per `docs/cluster-premium-home-audio.md` brief. Publish week 5.
9. `gs-social`: 30 more Pinterest pins (audio cluster), 3 IG Reels (TV), 1 IG carousel (TV).

**Weeks 6–8:**
10. `gs-content`: draft drone cluster article per `docs/cluster-drones-content-creators.md` brief, including CASA HowTo block. Publish week 8.
11. `gs-social`: 30 more Pinterest pins (drone cluster), 3 IG Reels each (audio + drone), carousel + Stories series each.

**Weeks 9–13:**
12. `gs-content`: 5 follow-on comparison articles (1 per cluster + 2 cross-cluster).
13. `gs-content`: extract CASA registration walkthrough into standalone `/blog/casa-drone-registration` page with HowTo schema.
14. Quarterly refresh pass on the 3 cluster articles (price + spec + AU stock verification). Owner: gs-catalog + gs-content.

### Biggest risk
The AU Amazon Associates tag is still US-only (per `reference_amazon_au_us_strategy.md`). Until dual-tag is live, AU traffic on the new high-AOV cluster pages converts at near-zero — the buyer hits "cannot ship to AU" on Amazon US. This is the SINGLE largest revenue blocker for the 90-day plan and must be resolved by `gs-affiliates` in week 1, in parallel with content drafting. If AU tag approval slips beyond week 6, expected commission revenue model collapses by ~70%.
