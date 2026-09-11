# Gadget Style — System Brief for AI Strategic Advisor

**Prepared:** 2026-09-11 · **Owner:** Con Tsekouras (sole trader, Gadget Style Australia, ABN 75185709936) · **Site:** https://www.gadgetstyle.com.au

---

## 0. How to use this brief (read first)

You (ChatGPT) are being brought in as a **strategic advisor and co-planner** for an Australian tech-affiliate website that is already built and live. This document is the single source of truth for the system as it stands today, what has been done, what the constraints are, and where we want to go.

**Your job:** help design and pressure-test the roadmap to the stated revenue goal; propose improvements, third-party integrations, skills, and best practices; and challenge assumptions with evidence. Be honest and specific — the owner values a truthful "this will take 3 years" over an optimistic fiction.

**Ground rules that must survive any plan you propose** (these are hard-won house rules):
1. **Revenue > SEO > content quality > compliance > maintainability** is the priority order, but **compliance is non-negotiable** — a plan that risks the Amazon account or a Google penalty is off the table regardless of upside.
2. **`client/src/lib/data.ts` is the single source of truth** for all products/categories/blog posts. No database. A validator gates every change.
3. **Draft-first, human-in-the-loop.** Nothing auto-publishes. New products are ingested as hidden drafts and a human reviews before they go live. Do not propose "fully autonomous publish."
4. **No fabricated data.** No invented ASINs, no AI-generated product photos, no fake reviews/ratings. Every ASIN is browser-verified.
5. **No scraping competitor hero imagery** (copyright). Product data with attribution is fine; their photography is not.

---

## 1. Executive summary

Gadget Style is a curated Amazon-affiliate + direct-brand tech-product site for the Australian market, styled after [thegadgetflow.com](https://thegadgetflow.com). It is **live, technically healthy, and structurally sound**: static React site, all data in one file, prerendered to real HTML, deployed on Vercel from GitHub with a three-gate validation chain that makes it effectively impossible to ship broken data to production. Roughly **236 live products, 12 categories, 15 brand pages, 82 commits** of engineering.

**The stated goal is A$5,000/week (~A$260,000/year) in affiliate commission, fully automated.** This brief must be blunt about that number up front (full math in §3): it is achievable only in the **top few percent of affiliate sites**, over a **3–5 year horizon**, and **not by automation alone** — in fact, in the 2026 environment, over-automation is now the single biggest *risk* to the goal, not the lever for it. The credible path is a **human-edited editorial core + aggressive monetization diversification + non-Google traffic**, with automation as leverage underneath. There is a material (>50%) chance the site plateaus at A$500–1,500/week even with excellent execution. That is not a reason not to pursue it — it is the reason to sequence correctly and diversify early.

**The two biggest facts that dominate everything else:**
- **The site has zero analytics instrumented.** It cannot currently tell which products, pages, or channels earn. This is the #0 blocker — you cannot manage toward a revenue goal you cannot measure.
- **The Amazon tag is US-only (`gadgetstyle01-20`) on an Australian audience.** An estimated **75–85% of addressable Amazon commission is leaking** because AU shoppers sent to amazon.com don't convert or drift un-tagged to amazon.com.au. Fixing this is ~1–2 hours of work for a ~3–5× uplift on existing traffic and costs nothing.

---

## 2. Business & operating context

| Fact | Detail |
|---|---|
| Legal entity | Gadget Style Australia, sole trader, ABN 75185709936 (ASIC reg. 2026-05-05) |
| Public address | Level 2, 450 St Kilda Road, Melbourne VIC 3004 (use for all external-facing forms/schema) |
| Domain / registrar | gadgetstyle.com.au · Crazy Domains · A+CNAME → Vercel, auto-SSL |
| Amazon tag | `gadgetstyle01-20` (US marketplace — **the leak**) |
| Reference/benchmark | thegadgetflow.com (design + curation gold standard; attribution preserved via `gadgetFlowUrl` on every product) |
| Social handles | Instagram @gadgetstyleaustralia (47 followers, cleaned, dormant); Facebook Page (cleaned); Pinterest (trial) |
| Operator | Solo, can code; prefers building tooling over one-off manual fixes |

---

## 3. The revenue goal — honest math

**A$5,000/week = A$260,000/yr ≈ A$21,700/mo ≈ A$714/day in net commission.**

**Why the current niche is the hard way to get there:** consumer electronics pays Amazon's **lowest** commission rates (1–3%; PCs 2.5%, TVs 2%, headphones 3%, general electronics 1–2.5%). The empirical anchor for electronics-affiliate content is ~**US$6.67 RPM (~A$10 per 1,000 sessions)** — the widely-cited "150,000 visitors ≈ US$1,000/month" figure. Effective *credited* order value is lower than sticker price (~A$90–130 modelled) because Amazon credits the whole 24-hour basket, and post-April-2026 no longer credits "halo" cart-overflow items at all.

**Traffic required at A$5k/week, by blended RPM:**

| Blended RPM | Monthly sessions needed | Feasibility |
|---|---|---|
| A$10 (Amazon-only, electronics) | ~2.17M | Effectively out of reach solo |
| A$15 | ~1.44M | Out of reach solo |
| A$25 (Amazon AU + some direct-brand) | ~867k | Top-tier, conceivable over years |
| A$40 (+ display + owned traffic) | ~541k | The realistic route |
| A$60 (mature diversified) | ~361k | Best case |

**The three scenarios:**
- **A — Amazon-only, AU tag fixed:** needs ~1.4–2.2M sessions/mo. Electronics is the wrong vertical to run Amazon-only. Not realistic.
- **B — Amazon AU + direct-brand networks** (Impact/CJ/Awin/Rakuten/ShareASale at 5–15% on higher AOV): lifts blended RPM to ~A$25–40 → ~540k–870k sessions/mo. Top-tier but conceivable over 3–5 years.
- **C — Amazon AU + direct-brand + display + owned email/Pinterest:** RPM ~A$40–60 → ~360k–620k sessions/mo. **This is the realistic route.**

**Honest verdict:** central estimate **3–5 years** of excellent, compounding execution with Google/social cooperation; **>50% chance of plateauing at A$500–1,500/week.** The catalog today (~236 products) is roughly **1–3% of the ~hundreds-to-1,000+ ranking pages** a ~500k-session site typically needs. The goal is a **multi-year traffic-and-conversion build, not a procurement decision.** No tool on any list below produces the number by itself.

**Highest-ROI order of operations (this is the spine of the roadmap):**
1. Fix the AU tag leak + geo-routing (**free, ~1–2 hrs, ~3–5× Amazon revenue from existing traffic**).
2. Instrument analytics so every subsequent decision is measured.
3. Join 3–5 direct-brand networks; re-point high-AOV products (lifts RPM).
4. Build a small, differentiated buyer-intent content layer (roundups/comparisons) — not more thin catalog pages.
5. Activate Pinterest + email to de-risk Google dependence.
6. Add display ads (Raptive) once at 25k pageviews/mo.

---

## 4. Current system architecture

**Stack:** React 19 · Vite 7 · TypeScript 5.6 · Tailwind 4 · wouter (routing) · Express (static file server only). pnpm. Deployed on **Vercel** from **GitHub `ProAxeCo/gadget-style`**; every push to `main` = production deploy.

**Data model:** everything lives in `client/src/lib/data.ts` (products, categories, blog posts) + `client/src/lib/brands.ts` (brand metadata). No DB, no API. Products carry: id, title, slug, description, price, category/categorySlug, image/images, rating, reviewCount, asin, affiliateUrl, gadgetFlowUrl (attribution), tags, dateAdded, isFeatured/isTrending, specs, optional `brand`, optional `isDraft`, and `destination: "amazon" | "external"` (+ externalUrl for non-Amazon).

**Build & deploy pipeline (`pnpm build`):** `check` (typecheck + data validation) → `sitemap` → `vite build` → server bundle → **`prerender`** (headless-Chrome snapshot of all ~272 routes to static HTML). Vercel serves the prerendered HTML first, SPA as fallback. This means crawlers and social scrapers get real, per-page titles/meta/JSON-LD/content — not an empty shell.

**The three-gate validation chain** (broken data cannot reach production):
1. **Build gate:** `pnpm build` runs `pnpm check` first; Vercel's build command is `pnpm build`.
2. **CI:** `.github/workflows/ci.yml` runs the full build on every push/PR.
3. **Pre-commit:** `.husky/pre-commit` runs `check:data`; self-enables on every `pnpm install` via the `prepare` script.

**Pages (12):** Home, Category, Product, Brand, BrandsIndex, Blog, BlogPost, About, Contact, Search, Wishlist, NotFound. One canonical product-grid design system across all surfaces (documented in `docs/brand-design-system.md` + memory).

---

## 5. What has been built / completed

**Catalog & data integrity**
- ~236 live products, 19 drafts, 12 categories, 15 brand pages. Validator holds 0 errors.
- Fabricated-ASIN legacy ("Manus") bugs purged; validator now blocks ASIN drift, ephemeral image hosts, fake ASINs, stale category counts, bad slugs.
- All product images mirrored locally (no hotlinks). Affiliate URLs canonicalized and tag-enforced.

**Brand visual system** (15 brands)
- Real Wikimedia wordmark logos + Pexels lifestyle hero photos, native-colour logo rendering with spotlight bloom (never invert), sourced via `pnpm brands:logos` / `brands:imagery`, gated by `brands:audit`. Copyright-clean (no competitor imagery).

**SEO/rendering foundation**
- Build-time prerendering of all routes; per-page `<title>`/meta/canonical; Product + Breadcrumb JSON-LD on product pages, ItemList on category pages; sitemap auto-regenerated (excludes empty categories); `rel="sponsored"` on affiliate CTAs; 1200×630 OG cards + per-product og:image; robots.txt; scroll-to-top on nav.

**Automation (GitHub Actions)**
- `ci.yml` — full build gate.
- `link-check.yml` — **weekly** affiliate-link checker (`check-links.ts`); exits non-zero (→ owner email) when a live ASIN 404s. **Already caught and fixed ~16 dead/fabricated ASINs to date.**
- `ingest.yml` — **weekly** catalog ingest (`gf-sync` + `tnt-sync`) that opens a **review PR** of new drafts. (Was failing on an image-less draft; fixed 2026-09-11 — next run should produce the first clean PR.)
- `social-cron.yml` — daily social posting, **built but dormant** (schedule disabled, secrets not set, `permissions: contents: write` fix applied so the dedup log won't 403 when enabled).

**Ingestion pipelines** (`gf-sync`, `tnt-sync`): discover → dedupe → scrape → ingest as drafts → mirror images → validate → structured report. Idempotent, error-isolated, consolidated shared lib (`scripts/lib/common.ts`).

**Social stack** (built, dormant): Pinterest API v5 + Meta Graph (FB Page + IG) via `social:oauth` / `social:post` / `social:queue`, with per-day dedup log. IG previously cleaned (59 old posts removed); FB Page cleaned.

**Operator tooling / skills** (34 `pnpm` scripts) — full list in Appendix A. Highlights: `report:externals` (revenue-review queue), `links:check`, `drafts:list/prices/promote`, `brands:audit`, `fix:urls/counts`.

**Governance & knowledge**: `CLAUDE.md` operating manual, `README.md`, `docs/` living playbooks (affiliate signups, dual-tag implementation, high-AOV content strategy, content clusters, social playbook), a persistent memory store, and 6 documented SME "agent" role definitions (`.claude/agents/`).

---

## 6. Current state snapshot

| Metric | Value |
|---|---|
| Live products / drafts | ~236 / 19 |
| Categories / brands | 12 / 15 |
| Live products earning commission | ~93% (Amazon links); ~15 external (earn $0 pending direct-brand programs) |
| Dead affiliate links | 0 (as of last sweep) |
| Analytics instrumented | **None** |
| Social posting | Built, **dormant** |
| Amazon marketplace | **US tag on AU audience (leaking)** |
| Traffic / revenue | Not measured (no analytics) — assume minimal until instrumented |

---

## 7. The three operator keystones (owner action, in progress)

These unlock the revenue engine and are **prerequisites**, not optional polish. The owner will complete them as the rest falls into place.

1. **Amazon AU Associates application** — the single biggest unlock. Stops the US/AU leak (~3–5× Amazon revenue from existing traffic) and is the gateway to authoritative product data. *Note (verified 2026): the old PA-API 5.0 is being retired; its successor, the **Amazon Creators API**, is free but gated behind **10 qualifying sales in a trailing 30 days** — so a paid data bridge (Keepa/Rainforest) is needed in the interim.*
2. **Meta re-auth + 4 GitHub secrets** — Instagram/FB posting is built and ready; May's token expired (~60-day TTL). ~10 minutes to mint a fresh token + set `META_APP_ID/SECRET/PAGE_ACCESS_TOKEN/FB_PAGE_ID`. IG publishing may still be gated by Meta business verification.
3. **Direct-brand affiliate signups** (Sony, Dell, ASUS, Samsung, Belkin, Anker, DJI, Garmin, Bose, Sonos…) — 15 named external products are queued waiting on these programs; direct rates (5–20%) dwarf Amazon's 1–3% and are the core of Scenario B/C.

---

## 8. Critical gaps & risks (what could stop us)

**Gaps to close (in priority order):**
1. **No analytics** — flying blind; cannot prioritise, prove ROI, or detect a penalty. *Fix first, costs ~A$0.*
2. **AU tag leak** — the ongoing revenue haemorrhage. *Fix second, costs ~A$0.*
3. **Thin catalog vs. traffic need** — 236 pages is ~1–3% of the footprint required; but the answer is *differentiated* pages, not *more* thin ones (see risk below).
4. **Prices hardcoded in data.ts** — both an Amazon Operating-Agreement violation (prices must be API-sourced + timestamped) and an ACCC misleading-price exposure. *Either drop numeric prices ("Check price on Amazon") or wire a price API with an "as of" timestamp.*
5. **No affiliate disclosure on-page** — Amazon mandates the exact phrase *"As an Amazon Associate, I earn from qualifying purchases"* near the links (footer-only is non-compliant); ACCC + FTC require clear disclosure.

**Existential risks (2026 environment — do not ignore):**
- **Google's 2026 spam/core updates specifically target the exact profile of this site** — programmatic Amazon-affiliate catalogues with thin, templated pages (case studies: 14k–200k queries lost, penalties are **site-wide**, recovery 3–6 months of *removing* content). **The planned "fully automated source→publish" flow is precisely the penalised pattern.** Guardrail: keep the human draft-gate as a hard rule; add genuine per-product commentary; never mass-publish near-duplicates.
- **Amazon's April 2026 Operating Agreement changes**: killed halo commissions (~25% income drop industry-wide), added a 180-day pay/ship window, and now **require "commentary, analysis, or transformation" on every page that links to Amazon** — bare catalog pages no longer earn.
- **Single-channel dependency** (one program + one traffic source) is the #1 affiliate-site failure mode. Diversify programs and traffic early.
- **Amazon account termination** (zero-tolerance on price-display/cloaking/disclosure) forfeits accrued earnings. **Chrome-render price scraping violates Amazon ToS** — replace with a compliant data source.
- **Trademark:** brand pages using distinctive logos can imply endorsement beyond nominative fair use. Add an "independent — not affiliated/endorsed" disclaimer; keep logos restrained.

---

## 9. Improvement roadmap (phased)

> Sequencing principle: **measure → stop the leak → get compliant → build differentiated content → diversify revenue → mature automation → scale traffic.** Each phase de-risks the next.

### Phase 0 — Instrument & stop the leak (days; ~A$0) — DO FIRST
- Verify **Google Search Console** + Bing Webmaster (free; richest free SEO signal — surfaces page-2 opportunities).
- Add analytics, SPA-aware (fire on wouter route change): **GA4 + free BigQuery export** (best for the AI layer) *or* **PostHog free** *or* privacy-first **Plausible/Vercel/Fathom**. Add **Microsoft Clarity** (free heatmaps/replay).
- Instrument the **`affiliate_click` event** on every CTA (product id, ASIN, category, price, destination, brand, surface) — this is the highest-value event and powers the whole funnel.
- Complete **Amazon AU Associates**; wire **OneLink or Geniuslink** geo-routing so AU clicks hit amazon.com.au with the AU tag.

### Phase 1 — Compliance hardening (days)
- Add the required Amazon disclosure phrase on every linking surface + social posts.
- Resolve the price-display issue (drop numeric prices *or* API-source them with timestamp).
- Add per-product original commentary (satisfies Amazon's "transformation" rule + EEAT).
- Add the brand-page "independent / not affiliated" disclaimer.
- Retire Chrome-render Amazon scraping in favour of a compliant data source.

### Phase 2 — SEO revenue engine (3–12 months)
- **Do NOT scale thin catalog pages.** Instead add **~30–60 genuinely differentiated buyer-intent pages**: "Best X in Australia 2026" roundups + "A vs B" comparison pages, each with an original comparison table, a first-hand angle, an answer-capsule (120–150 chars), FAQ block, and *at least one piece of data that exists nowhere else* (your ranking, your price-tracked figure, your use-case verdict).
- Restructure into **pillar-cluster topical hubs** (each category = a hub; roundups/comparisons/products = spokes with keyword-rich internal links).
- Target **long-tail, commercial, AU-localised** queries ("best [product] for [use case] Australia", "[A] vs [B]", "is [product] worth it 2026").
- Fix **INP** (the SPA Core Web Vital risk from React hydration) with partial hydration / less JS on content pages.
- Wire **IndexNow** into the weekly pipeline (instant Bing/DuckDuckGo indexing).
- Optimise for **AI-search citations** (answer capsules, freshness/"Updated [date]", original data) — a distinct, winnable 2026 channel.
- **noindex the thinnest product pages** (missing images / no unique text) rather than let them drag the domain.

### Phase 3 — Monetization diversification (parallel with Phase 2)
- Join **Impact, CJ, Awin, Rakuten, ShareASale**; re-point high-AOV products (audio, smart home, drones, wearables, laptops) to direct-brand links (5–20%).
- Add **AU-shippable alternatives**: eBay Partner Network AU (impulse/deal inventory only — ~24h cookie), Commission Factory (AU-local retailers: Catch, MyDeal), Kogan.
- Add a **link-monetization layer** (Skimlinks/Sovrn + Geniuslink) to capture the long tail and geo-route on a single link.

### Phase 4 — Automation maturation (parallel)
- Keep custom Node scripts on GitHub Actions as the backbone (free). Add **self-hosted n8n (~A$8/mo)** *only* if webhook/approval glue pain grows. **Do not buy Zapier/Make.**
- Add a **product-data/price API bridge** — **Keepa (~A$82/mo)** or **Rainforest ($66/mo)** — replacing the fragile Chrome scrape; migrate to the free **Amazon Creators API** once the 10-sales/30-day gate is cleared.
- Add **AI-assisted content drafting** (Claude API, ~A$15–30/mo) feeding the **human draft-gate** — with an AI-probability/thinness check before promotion.
- Add **more sourcing signals** (Amazon Movers & Shakers, Product Hunt, Reddit, TikTok Creative Center, Kickstarter) as new draft-gated ingest scripts.
- Build the **weekly "Operator Report"**: a GitHub Actions cron (`operator-report.ts`) that pulls GSC + analytics + Associates/network data, computes deltas, and uses the already-installed Claude SDK to emit a markdown report of **what to do next, ranked by revenue impact**. (This is the "AI analytics" layer.)

### Phase 5 — Scale traffic & owned channels
- Activate **Pinterest + Instagram/FB** posting (keystone #2) — non-Google traffic that de-risks the whole plan.
- Start an **email list** (owned audience; note: Amazon links/prices may **not** appear in email — link to on-site pages only).
- Add **display ads** once at **25k pageviews/mo** (Raptive; Mediavine at 50k; AdSense before that).

---

## 10. Third-party integrations & tools (consolidated, with cost)

| Area | Recommended | Cost (2026) | Notes |
|---|---|---|---|
| Search data | Google Search Console + Bing Webmaster | Free | Verify now; richest free signal |
| Analytics | GA4 + BigQuery free export (or PostHog free) | ~A$0 | SPA-aware; BigQuery enables the AI layer |
| Heatmaps | Microsoft Clarity | Free | Qualitative "do they reach the buy button" |
| Dashboards | Looker Studio | Free | One spine for human + LLM views |
| Geo-routing | Amazon OneLink (free) / Geniuslink (~US$9–49/mo) | Free–low | Fixes the AU leak |
| Price/product data | Keepa (~A$82/mo) or Rainforest ($66/mo) → Amazon Creators API (free, gated) | A$66–110/mo | Replaces ToS-risky Chrome scrape |
| AI content | Claude API (Sonnet, already an SDK dependency) | ~A$15–30/mo | ~A$0.05–0.15/roundup; human-gated |
| SEO tool (pick one) | SE Ranking (~US$52/mo) or Ahrefs Lite (~US$129/mo) | US$52–129/mo | Screaming Frog free ≤500 URLs; GKP+Trends free |
| Social scheduling | Native Meta + Pinterest APIs (already built) | Free | Skip Buffer; Metricool free tier optional for analytics |
| Social graphics | Canva Pro | ~A$18/mo | Real photos + licensed stock only (no AI product images) |
| Orchestration | GitHub Actions (keep) + optional self-hosted n8n | Free + ~A$8/mo | Do not buy Zapier/Make |
| Affiliate networks | Impact, CJ, Awin, Rakuten, ShareASale, Commission Factory, eBay EPN AU | Free (Awin ~US$5 refundable) | The RPM lever |
| Link monetization | Skimlinks/Sovrn (~25% rev share) + Geniuslink | Free to start | Long-tail capture |
| Content self-audit | Originality.ai (optional) | ~US$15–30/mo | AI-probability/thinness gate pre-publish |

**Realistic all-in tooling budget: ~A$100–160/month (~A$1,200–1,900/yr)** — price API + AI content + optional Canva + optional n8n. Hosting, orchestration, social, stock images, and analytics are ~A$0. **Tooling is cheap; the binding constraint is traffic + the AU-tag fix, not procurement.**

---

## 11. Skills to build or acquire

The system already treats capabilities as **repeatable, version-controlled skills** (the 34 `pnpm` scripts + GitHub Actions). New skills to create, in priority order:

1. **`analytics:setup`** — instrument GA4/PostHog + GSC + affiliate-click events (Phase 0).
2. **`operator-report`** — weekly cron: pull GSC + analytics + earnings → Claude → ranked action list ("AI analytics").
3. **`dual-tag` / geo-routing** — AU/US tag switching (already scoped in `docs/dual-tag-implementation.md`).
4. **`content:roundup`** — generate a differentiated buyer-intent roundup/comparison draft (AI-assisted, human-gated, schema-complete).
5. **`price:sync`** — Keepa/Rainforest → refresh prices with timestamps (compliance).
6. **`sourcing:*`** — new draft-gated ingest scripts for Movers & Shakers, Reddit, Product Hunt, TikTok.
7. **`compliance:check`** — validator extension asserting disclosure presence + price freshness + image-locality on every linking page before publish.
8. **`indexnow`** — ping Bing on catalog change from the weekly pipeline.

Prefer **build** (custom scripts, free, no lock-in) over **buy** (no-code SaaS) wherever the owner can code — which is most places.

---

## 12. Best practices & guardrails (carry into every plan)

- **Human draft-gate is mandatory** before any auto-sourced product goes live (the anti-penalty guardrail).
- **Genuine editorial value per page** — original commentary, comparison, AU-specific pricing/shipping angle. Selectivity and EEAT (named author, first-hand notes, real photography) are what protect against Google spam updates.
- **Disclosure everywhere** — Amazon's exact phrase near links; #Ad/#Sponsored + paid-partnership labels on social; ACCC + FTC compliant.
- **Never fabricate** — ASINs (browser-verify), reviews/ratings (only mark up genuine, displayed ones), or product images.
- **Prices must be compliant** — API-sourced + timestamped, or not shown numerically.
- **Diversify early** — programs and traffic sources; single-channel dependency kills affiliate sites.
- **Validator-first** — extend the validator whenever a new bug class appears; a new rule is cheaper than fixing the same bug twice.
- **Trademark restraint** on brand pages; independence disclaimer.
- **Respect scrape targets** — rate-limit, honour robots.txt, cache; keep source attribution.

---

## 13. Open questions for the advisor (where we want your push-back)

1. Given the honest §3 math, **what is the right 12-month target** (leading indicators: sessions, indexed differentiated pages, RPM, programs live) that keeps A$5k/week credible without fiction?
2. **Content velocity vs. quality:** what's the maximum safe publish rate for differentiated pages that grows topical authority without tripping scaled-content filters?
3. **Category focus:** electronics is the worst Amazon niche — should we deliberately expand the catalog mix toward higher-commission adjacencies (kitchen tech, home, tools) while keeping the gadget brand?
4. **Automation ceiling:** where exactly should the human-in-the-loop line sit to stay Google-safe while still scaling?
5. **Traffic strategy:** given AI Overviews cutting organic CTR, how should we weight Pinterest, email, and AI-search citations vs. classic SEO?
6. **Build vs. buy** for the price-data bridge and orchestration — do you agree with keep-custom + one paid API?

---

## Appendix A — Command / skill reference (34 scripts)

```
Build/validate: dev, build, prerender, sitemap, check, check:data, format
Data hygiene:   fix:urls, fix:counts, mirror:images, report:placeholders, report:externals
Drafts:         drafts:list, drafts:prices, drafts:promote, product:remove
Links:          links:check
Sourcing:       gf:sync, tnt:sync, scrape:gf, ingest:gf, gf:refine, amazon:discover
Brands:         brands:audit, brands:logos, brands:imagery
Social:         social:oauth, social:post, social:queue
Content:        write:descriptions
```

## Appendix B — Repository map

```
client/src/lib/data.ts        ← single source of truth (products/categories/blog)
client/src/lib/brands.ts      ← brand metadata
client/src/pages/             ← 12 pages
client/src/components/         ← ProductCard + canonical UI
scripts/                       ← 34 maintenance/automation scripts (+ lib/, _archive/)
.github/workflows/             ← ci, ingest, link-check, social-cron
docs/                          ← living playbooks (affiliate signups, dual-tag, content strategy, clusters, social)
CLAUDE.md                      ← full operating manual (read before changing data/UI)
README.md                      ← cold-start guide
```

## Appendix C — Key living docs to hand to the advisor alongside this brief

- `docs/dual-tag-implementation.md` — AU/US tag plan
- `docs/direct-brand-affiliates.md` + `docs/affiliate-signup-checklist.md` — program strategy
- `docs/high-aov-content-strategy-2026.md` + `docs/cluster-*.md` — content clusters
- `docs/social-posting-playbook.md` — social stack
- `docs/brand-design-system.md` — UI/brand rules
- `CLAUDE.md` — the operating manual

---

*This brief reflects the system as of 2026-09-11. Figures for commission rates, tool pricing, and platform policies are 2026 directional estimates from secondary sources and must be confirmed in each vendor/program dashboard before being relied upon for revenue commitments.*
