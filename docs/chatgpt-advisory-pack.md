# Gadget Style — Complete ChatGPT Advisory Pack
*Assembled 2026-09-11 for upload to ChatGPT. Contains: (1) the operating prompt, (2) the reconciled System Brief — the current source of truth, and (3) nine supporting operational docs. **Where a supporting doc conflicts with the System Brief, the Brief wins** — several supporting docs pre-date the 2026 research folded into the Brief.*

## Contents
1. Operating Prompt (your role & objectives)
2. System Brief — SOURCE OF TRUTH
3. Supporting doc — Dual-tag / AU-US implementation plan
4. Supporting doc — Direct-brand affiliate strategy
5. Supporting doc — Affiliate signup checklist
6. Supporting doc — High-AOV content strategy (2026)
7. Supporting doc — Social posting playbook
8. Supporting doc — Brand design system
9. Supporting doc — Content cluster — drones for content creators
10. Supporting doc — Content cluster — premium home audio
11. Supporting doc — Content cluster — TVs under $2000


---

# 1. Operating Prompt

# ChatGPT Operating Prompt — Gadget Style Strategic Advisor

*(Paste this into ChatGPT and attach `GadgetStyle-ChatGPT-Pack.md`. This prompt defines your role; the attached pack is your knowledge base.)*

---

## Your role

You are the **Senior Digital Strategy Advisor** for **Gadget Style Australia** (https://www.gadgetstyle.com.au) — a live Australian tech-affiliate website (Amazon Associates + direct-brand programs), styled after Gadget Flow. You are advising the **solo owner-operator**, Con, who can code and who runs the site end-to-end with an AI engineering agent (Claude Code) that implements changes.

You are not a cheerleader. You are the person in the room who does the honest math, challenges weak assumptions, and sequences work so the highest-leverage, lowest-cost moves happen first. Prefer a truthful "this is a 3-year build" over an optimistic fiction.

## The ultimate objective

**Grow the business to A$5,000 per week (≈ A$260,000/year) in net affiliate commission, through a system that is as automated as is safe — new products sourced, enriched, published (human-reviewed), and promoted across social — with SEO and AI-driven analytics built in.**

Treat this as a **multi-year, top-percentile outcome**, not a quarterly target. The attached brief contains the honest revenue math (§3): electronics is Amazon's lowest-commission niche, the goal implies ~360k–2.2M monthly sessions depending on blended RPM, and there is a material (>50%) chance of plateauing at A$500–1,500/week. Your job is to maximise the probability and speed of reaching the goal while being candid about the odds — and to define sensible **12-month leading-indicator targets** (sessions, indexed differentiated pages, blended RPM, live affiliate programs) that keep the ultimate goal credible.

## Non-negotiable ground rules (do not propose anything that breaks these)

1. **Priority order:** revenue > SEO > content quality > compliance > maintainability — **but compliance is absolute.** Never propose anything that risks the Amazon account or a Google penalty, regardless of upside.
2. **Human-in-the-loop.** Nothing auto-publishes. New products are ingested as hidden drafts; a human reviews before go-live. "Fully autonomous publishing" is off the table — in 2026 it is the single biggest *risk* to the goal, not a lever.
3. **No fabricated data** — no invented ASINs, no AI-generated product photos, no fake reviews or ratings. Every ASIN is browser-verified.
4. **Single source of truth** is one data file (`data.ts`), gated by a validator. No database.
5. **No scraping competitor imagery** (copyright). Product data with attribution is fine; their photography is not.

## What I want from you

1. **Pressure-test the roadmap** in the brief (§9) — reorder, cut, or add phases with reasoning.
2. **Answer the six open strategic questions** in the brief (§13).
3. **Propose specific improvements, third-party integrations, skills, and best practices** — always with (a) expected revenue/traffic impact, (b) cost, (c) effort, and (d) the compliance/penalty risk. Rank everything by ROI.
4. **Set the 12-month leading-indicator targets** and a quarter-by-quarter plan to hit them.
5. **Flag anything in the brief or supporting docs that is wrong, outdated, or over-optimistic** — the supporting docs pre-date some 2026 research; where they conflict with the brief, the **brief wins**, and where the brief is uncertain, say so.

## How to use the attached pack

The attached `GadgetStyle-ChatGPT-Pack.md` contains:
- **The System Brief** (the reconciled, current source of truth — read this first).
- **Nine supporting operational docs** (dual-tag plan, affiliate signups, content strategy, social playbook, brand system, and three content-cluster plans). These are detail behind the brief; **defer to the brief where they conflict.**

Start by confirming your understanding of the system and the goal in your own words, then give me: (1) your honest read on the A$5k/week goal and timeline, (2) the single highest-ROI move to make this month, and (3) your proposed 12-month plan with leading-indicator targets. Ask me clarifying questions before committing to a plan if anything material is unclear.

## Operator context you should assume

- Solo operator, can code; prefers building custom tooling over no-code SaaS and over manual work.
- Realistic third-party tooling budget: ~A$100–160/month.
- Three "keystone" tasks are in progress on the owner's side and will be completed as the rest falls into place: **(1) Amazon AU Associates application, (2) Meta re-auth for social posting, (3) direct-brand affiliate signups.** Plan around these being done, but sequence so progress isn't blocked waiting on them.


---

# 2. System Brief — SOURCE OF TRUTH

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


---

# 3. Supporting doc — Dual-tag / AU-US implementation plan
*Source: `docs/dual-tag-implementation.md`. Supporting detail — defer to the System Brief (section 2) on any conflict.*

# Dual-Tag Implementation Spec — AU + US Amazon Associates

**Owner:** `gs-affiliates` (spec) + `gs-deploy` (rollout)
**Status:** Spec only. Code NOT written. Apply step 1 before any code work.
**Companion docs:**
- `docs/amazon-au-application-pack.md` — full application pack for Amazon AU
- `docs/affiliate-signup-checklist.md` — multi-network checklist
- Memory: `reference_amazon_au_us_strategy.md`

---

## Why we need it (cite the evidence)

Site lives at `https://www.gadgetstyle.com.au` (AU-targeted) but every
`affiliateUrl` in `data.ts` points to `amazon.com` with the US tag
`gadgetstyle01-20`. Two compounding leaks:

1. **AU visitors who click an `amazon.com` link** are either
   FX-discounted on US-rate commission, or auto-redirected by Amazon to
   `amazon.com.au` — which **strips our tag entirely** (zero commission).
2. **14 of 25 recent T&T-source drafts** returned *"Cannot ship to your
   selected delivery location"* when accessed from AU geo (Chrome MCP
   pricing pipeline run, 2026-05-05). Those 14 are unshippable to AU
   today — visitor bounces, zero revenue. Source: memory note
   `reference_amazon_au_us_strategy.md`.

The fix is **dual-tag with geo-detect** (Path 1 in the strategy memo):
keep the US tag for non-AU traffic, add an AU tag for AU traffic, route
each visitor to the right Amazon storefront at click time.

---

## A. Executive summary

**What this enables.** AU visitors get sent to `amazon.com.au` with an
AU tag (`<AU_TAG_PLACEHOLDER>`). Everyone else continues to
`amazon.com` with the existing `gadgetstyle01-20`. No catalog changes
required for products that exist on both stores; products with an
`asinAu` field get routed to the AU listing, products without fall back
to the US listing (best we can do until the AU listing is verified).

**Why it matters.** Closes the AU-traffic revenue leak and unlocks the
14 currently-unshippable drafts (assuming they exist on amazon.com.au).

**Commercial impact (conservative).** See forecast in section 6.

**Sequencing.** Step 1 is the user's tomorrow-morning task. Steps 2–5
are build-time work that should NOT start until Amazon AU approval lands
(no point building a tag-switcher with no AU tag to switch to).

---

## Step 1 — Apply for Amazon AU Associates

**This is the user task. Do not write code until approval lands.**

**URL:** https://affiliate-program.amazon.com.au/

**Why first:** without the AU tag the rest of the spec has nothing to
plug in. Approval timeline is **1–3 business days** based on Amazon's
public guidance (verify on the application page when applying). Site is
already live, has 219 products, has the required affiliate disclosure
in the footer, has a Privacy Policy and About/Contact pages — this
clears the standard pre-flight check.

### Fields to fill (verbatim values)

| Field | Value |
|-------|-------|
| Account information — Payee name | Constantinos Tsekouras |
| Account information — Address line 1 | Level 2, 450 St Kilda Road |
| Account information — Address line 2 | (leave blank) |
| Suburb / City | Melbourne |
| State | VIC |
| Postcode | 3004 |
| Country | Australia |
| Phone | +61 414651195 |
| Business name | Gadget Style Australia |
| ABN | 75185709936 |
| Website list (one URL per line) | `https://www.gadgetstyle.com.au` |
| Preferred Associates Store ID | `gadgetstyle-22` (Amazon may auto-suffix `-22`; if taken try `gadgetstyleau-22`) |
| Niche / what your site is about | Consumer Electronics / Gadget Reviews — curated editorial site covering smart home, audio, computing, mobile, photography, gaming, emerging tech. Inspired by the Gadget Flow / Uncrate format. |
| Traffic sources | SEO, editorial curation, Pinterest, Instagram |
| Monthly unique visitors | <1,000 (newly launched, growing) |
| How will you drive traffic to Amazon | Editorial product reviews and category roundups; each product page has detailed specs and a direct buy link to Amazon |
| Primary product categories | Consumer Electronics; Computers; Home Audio; Cameras; Wearables |
| Promotional methods | Direct linking from product pages; SEO-optimized category hubs; social posts (Pinterest, Instagram) linking back to site articles |
| Amazon Payee Tax Information | Australian tax resident — non-US person — W-8BEN equivalent. ABN provides AU TFN equivalent for AU-side reporting. |
| Payment method | EFT to AU bank account (collect details when prompted; do NOT enter in this doc) |

### After submitting

1. Confirmation email arrives within 5 minutes from `associates@amazon.com.au`.
2. Active 180-day clock starts: must drive **3 qualifying sales** to keep the account.
3. Approval email lands with the assigned tag (probably `gadgetstyle-22`).
4. Save the tag to `.env.local` per Step 2.

---

## Step 2 — Build `scripts/lib/affiliate-link.ts` (spec only — DO NOT create yet)

**File path:** `scripts/lib/affiliate-link.ts`
**Companion:** `client/src/lib/affiliate-link.ts` (client-side mirror, see below)
**Trigger to build:** Amazon AU approval email received and AU tag saved to env.

### 2.1 Function signature

```ts
// scripts/lib/affiliate-link.ts (server-side / build-time)

export type Geo = 'AU' | 'OTHER';

export interface AmazonLinkInput {
  asin: string;           // US ASIN (always present)
  asinAu?: string;        // AU ASIN if known; falls back to asin
  geo: Geo;
}

export const AMAZON_US_TAG = process.env.AMAZON_US_TAG ?? 'gadgetstyle01-20';
export const AMAZON_AU_TAG = process.env.AMAZON_AU_TAG ?? '<AU_TAG_PLACEHOLDER>';

/**
 * Build the geo-correct Amazon affiliate URL.
 *
 * AU geo + asinAu present → amazon.com.au with AU tag and AU ASIN.
 * AU geo + no asinAu      → amazon.com.au with AU tag and US ASIN
 *                            (best-effort; many ASINs are shared across stores).
 * OTHER geo               → amazon.com with US tag and US ASIN.
 */
export function buildAmazonLink({ asin, asinAu, geo }: AmazonLinkInput): string {
  if (geo === 'AU') {
    const auAsin = asinAu ?? asin;
    return `https://www.amazon.com.au/dp/${auAsin}?tag=${AMAZON_AU_TAG}`;
  }
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_US_TAG}`;
}

/**
 * Parse hostname → tag from any existing affiliateUrl, used by the
 * validator to accept either tag. Idempotent.
 */
export function detectTagFromUrl(url: string): { tag: string; store: 'US' | 'AU' | null } {
  // ...regex parse host + tag query param
}
```

### 2.2 Geo-detection strategy

Two detection layers, server-first with client fallback:

**Layer A — Vercel edge header (preferred, cookie-free):**

```ts
// In a Vercel-hosted React component or middleware, read:
//   request.headers.get('x-vercel-ip-country')   // ISO-2 country code
// Vercel injects this on every request at the edge. AU = Australia.

export function geoFromVercelHeader(headers: Headers): Geo {
  const country = headers.get('x-vercel-ip-country')?.toUpperCase();
  return country === 'AU' ? 'AU' : 'OTHER';
}
```

**Layer B — client-side fallback (browsers, no edge header):**

```ts
// client/src/lib/affiliate-link.ts (mirror of the server module)
//
// Used when the page is statically rendered and we need to rewrite
// links at hydrate time. Two signals, OR'd:
//   1. navigator.language / navigator.languages includes 'en-AU' or 'AU'
//   2. Intl.DateTimeFormat().resolvedOptions().timeZone starts with 'Australia/'
// Either matching → AU. Both negative → OTHER.

export function geoFromBrowser(): Geo {
  if (typeof navigator === 'undefined') return 'OTHER';
  const langs = (navigator.languages ?? [navigator.language]).join(',').toLowerCase();
  if (langs.includes('en-au') || langs.includes(',au,') || langs.endsWith(',au')) return 'AU';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    if (tz.startsWith('Australia/')) return 'AU';
  } catch { /* ignore */ }
  return 'OTHER';
}
```

**Decision:** Layer A is canonical for SSR/edge. Since Gadget Style is a
static SPA (Vite + Vercel), we don't have request-time SSR — so Layer B
is the **runtime detector** for live users. Layer A is still useful for
any server-side preview or future SSR migration.

### 2.3 Wiring into the `affiliateUrl` field

Two patterns to choose from. **Recommend pattern P2** (runtime rewrite)
because it preserves the static-site model and doesn't require
regenerating data.ts on every deploy.

**P1 — Build-time (rejected):** `scripts/build-affiliate-urls.ts`
re-derives `affiliateUrl` for each product. Problem: the URL in data.ts
is now per-region, breaks the single-source-of-truth model, and would
require generating two builds (AU + ROW). Skip.

**P2 — Runtime client-side rewrite (recommended):**

1. `data.ts` keeps the existing US-tag URL unchanged (validator accepts
   either US or AU tag — see Step 3). Optional new field `asinAu`.
2. Add `client/src/lib/affiliate-link.ts` with `buildAmazonLink` +
   `geoFromBrowser`.
3. In the `Product` page component (`client/src/pages/Product.tsx` or
   wherever the Amazon CTA renders), import the helper and rewrite the
   button's `href` at render time:

   ```tsx
   import { buildAmazonLink, geoFromBrowser } from '@/lib/affiliate-link';

   const geo = geoFromBrowser();
   const href = product.destination === 'amazon'
     ? buildAmazonLink({ asin: product.asin, asinAu: product.asinAu, geo })
     : product.externalUrl;
   ```

4. **SEO consideration:** the static HTML still contains the US-tag
   URL (good for crawlers since amazon.com is the primary index). Geo
   rewrite happens after hydration. No impact on Lighthouse / SEO.

5. **`<a rel>`:** keep `rel="nofollow sponsored noopener"` per
   Associates ToS regardless of geo.

### 2.4 Where else affiliate URLs are emitted

Audit these surfaces before deploy — each must use the new helper or
otherwise be safe:

- Product detail page CTA — covered in §2.3
- Product card (`client/src/components/ProductCard.tsx`) — same pattern
- Search results, category hubs, "trending" / "featured" sections — same pattern
- `client/public/sitemap.xml` — does NOT contain affiliate URLs, no change
- `docs/social/pinterest.csv` and `docs/social/instagram.md` — generated
  by `scripts/generate-social.ts`. Leave as **US-tag-only** for now;
  Pinterest/IG audiences are global, AU click-throughs from social are a
  smaller share and the geo-rewrite happens server-side once they hit
  the site. Optional enhancement: add an `?gs_origin=social` UTM and
  rewrite to AU on the product page if origin AU.

---

## Step 3 — Validator update

**File:** `scripts/validate-data.ts`
**Change:** accept either US tag or AU tag in `affiliateUrl`.

Today:

```
Affiliate tag — every URL must carry tag=gadgetstyle01-20.
Any other tag (including thegadgetflow-20, gadgetstyle-20) is a bug.
```

After Step 1 lands the AU tag, update the rule to:

```ts
const ALLOWED_TAGS = new Set([
  process.env.AMAZON_US_TAG ?? 'gadgetstyle01-20',
  process.env.AMAZON_AU_TAG ?? '<AU_TAG_PLACEHOLDER>',
]);

// In the per-product validator:
const tag = new URL(product.affiliateUrl).searchParams.get('tag');
if (!tag || !ALLOWED_TAGS.has(tag)) {
  errors.push(`product ${product.id}: affiliateUrl tag '${tag}' is not in the allowed set`);
}
```

Also extend the URL-host check: currently `amazon.com` is the only
allowed host for `affiliateUrl`. Add `amazon.com.au` to the allowed set.

If `asinAu` is added as a new optional field, validate:

- `^B0[A-Z0-9]{8}$` format same as `asin`
- If present, must differ from `asin` only when truly different listings
  (warning only — many ASINs match across stores)

`pnpm fix:urls` (`scripts/fix-affiliate-urls.ts`) is unaffected — it
still canonicalizes the US-tag URL because data.ts is the
"primary/index" URL, with AU resolved at runtime.

---

## Step 4 — Data-migration plan (`asinAu` field)

**Goal:** populate `asinAu` for products that exist on amazon.com.au with
a different ASIN. Do NOT touch products where the AU listing uses the
same ASIN — `buildAmazonLink` falls back gracefully.

### Phase 1 (priority, ~1 hour) — the 14 unshippable T&T drafts

Per `reference_amazon_au_us_strategy.md`, these draft IDs hit the
"Cannot ship to AU" wall on amazon.com:

```
#273, #274, #276, #277, #278, #279, #280, #281, #284, #286, #287, #290, #294, #297
```

**Manual workflow per product** (no automation — Amazon blocks server
fetches per `feedback_working_practices.md` rule 4):

1. Open the product's title in `data.ts`.
2. Search amazon.com.au from a logged-in AU browser session for the
   exact product name + brand + key spec.
3. **Match found:** copy the ASIN from the URL. Compare to existing
   `asin`:
   - Same → no change needed; `buildAmazonLink` already works.
   - Different → add `asinAu: 'B0XXXXXXXX'` to the product entry.
4. **No match (product not sold on amazon.com.au):** add
   `noAuStock: true` to the product. The Product component should
   suppress the Amazon CTA for AU users and show "Not available on
   Amazon AU" + a fallback (brand site link if known).
5. After edits: `pnpm check:data && pnpm fix:counts`. Promote drafts
   that now have valid AU listings out of `isDraft: true`.

### Phase 2 (sweep, weekend project) — 219 live products

Same workflow but bulk. Order by AOV descending (high-AOV first — TVs,
audio, cameras, drones). Track in
`docs/au-asin-mapping-progress.md` (build as you go).

Stop criteria: by product 50 you should hit a "same ASIN both stores"
hit-rate around 60-80%. If it's lower, prioritize differently —
dual-listing brands first (Samsung, Sony, JBL, Bose).

### Phase 3 (catalog growth) — `gf:sync` and `tnt:sync`

Update both ingestion scripts to optionally probe amazon.com.au for the
AU ASIN at scrape time. Low priority — catalog growth is currently
limited by manual review, not scrape throughput.

---

## Step 5 — Testing the geo-routing in production

### 5.1 Dev-time unit tests

```ts
// scripts/lib/affiliate-link.test.ts
import { describe, it, expect } from 'vitest';
import { buildAmazonLink } from './affiliate-link';

describe('buildAmazonLink', () => {
  it('AU geo + asinAu → amazon.com.au with AU ASIN + AU tag', () => {
    const url = buildAmazonLink({ asin: 'B0AAAAAAAA', asinAu: 'B0BBBBBBBB', geo: 'AU' });
    expect(url).toContain('amazon.com.au/dp/B0BBBBBBBB');
    expect(url).toContain('tag=');
  });
  it('AU geo without asinAu → amazon.com.au with US ASIN + AU tag', () => { /* ... */ });
  it('OTHER geo → amazon.com with US ASIN + US tag', () => { /* ... */ });
});
```

### 5.2 Pre-deploy local verification

1. `pnpm dev`
2. Open product page, inspect the Amazon CTA `href`.
3. Open dev tools → Sensors → Locale: `en-AU` → reload.
4. CTA should now point at `amazon.com.au?tag=<AU_TAG>`.
5. Reset locale to `en-US` → CTA reverts.

### 5.3 Production VPN test (after deploy)

| Check | How | Pass criteria |
|-------|-----|---------------|
| AU traffic → AU storefront | Connect VPN to AU exit (Sydney/Melbourne); load 5 product pages | Every Amazon CTA `href` contains `amazon.com.au` and `tag=<AU_TAG>` |
| US traffic → US storefront | VPN to US exit; same 5 pages | CTAs contain `amazon.com` and `tag=gadgetstyle01-20` |
| UK / RoW → US storefront | VPN to UK exit | Defaults to US tag (we don't have a UK program) |
| Broken-tag regression | View source → grep for `tag=thegadgetflow-20` or `tag=gadgetstyle-20` (no dash) | 0 hits — validator should already block these but worth a re-check |
| Sitemap unchanged | Diff `client/public/sitemap.xml` pre/post deploy | No diff (no affiliate URLs in sitemap) |

### 5.4 Tracking verification (24-hour wait)

After deploy, click your own AU-routed link from an AU IP, complete a
small purchase on amazon.com.au, and confirm the click + sale land in
the Amazon AU Associates dashboard within 24h with the correct tag.
This is the only way to confirm end-to-end attribution.

---

## 6. Commission-uplift forecast

**Inputs (conservative; flagged as assumption):**
- 500 monthly visitors
- 70% AU / 30% other (matches the .com.au domain + AU SEO targeting)
- Click-through rate to Amazon CTA: 20% of pageviews
- Conversion rate on click: 3% (Amazon Associates typical low end)
- Average commission per qualifying sale: 3% of an average $200 AOV = $6

### Status quo (US tag only)

- 500 visitors × 70% AU = 350 AU visitors
- AU visitor click-throughs to amazon.com: 350 × 20% = 70 clicks
- Of those, ~50% get auto-redirected to amazon.com.au by Amazon and
  **lose the tag** = 35 untracked clicks → 0 commission
- Of the 35 that stay on amazon.com, ~40% bounce because product is
  unshippable to AU (the 14/25 evidence) = 14 lost clicks → 0
- Effective AU clicks earning commission: ~21
- AU commissions/month: 21 × 3% × $6 = **~$3.78/mo from AU**
- Plus 30% non-AU: 150 visitors × 20% × 3% × $6 = **~$5.40/mo**
- **Total: ~$9.18/mo**

### With dual-tag

- 350 AU visitors × 20% = 70 AU clicks, all routed to amazon.com.au
  with AU tag
- Bounces from "Cannot ship to AU" drop to ~5% (only products with no
  AU listing; most have one)
- Effective AU clicks earning commission: ~67
- AU commissions/month: 67 × 3% × $6 = **~$12.06/mo from AU**
- Non-AU unchanged: ~$5.40/mo
- **Total: ~$17.46/mo**

### Delta

**+$8.28/month per 500 visitors (+~90%).** Scales linearly with
traffic. At 5,000 visitors/month: **~$83/mo extra**. At 50,000:
**~$830/mo extra**.

**Caveats / verification points:**

- Real CTRs depend on copy, image quality, position of CTA. 20% is
  optimistic for organic traffic, low-end for high-intent traffic.
- 3% Amazon conversion is the **lower bound**. Premium/high-intent
  product pages can hit 5–8%.
- The $200 AOV is an estimate. Actual AOV depends on product mix —
  the user's "high-AOV preference" (`feedback_working_practices.md`
  rule 10) pushes this number up.
- Dollar numbers are illustrative. **The strategic value is closing
  the qualifying-sale gap on the 180-day clock**, not the raw $/mo at
  pre-traffic stage.

---

## C. Assumptions and verification points

| Assumption | How to verify |
|------------|---------------|
| Vercel injects `x-vercel-ip-country` on every request | Check a deployed function's request headers in the Vercel dashboard |
| `Intl.DateTimeFormat().resolvedOptions().timeZone` returns AU values for AU users on common browsers (Chrome/Safari/Firefox/Edge) | Browser test panel; usually reliable |
| Amazon AU approval timeline of 1–3 days | Check Amazon AU Associates application page wording; confirm with own application |
| Amazon AU commission rates match `gs-affiliates` agent's quoted rates | Pull current rates from https://affiliate-program.amazon.com.au/help/operating/policies after approval |
| 14 unshippable drafts have AU equivalents on amazon.com.au | Per-product manual lookup (Phase 1 of Step 4) |
| US-tag URLs in static HTML do not negatively impact AU SEO | Crawler test post-deploy with Bing/Google Search Console (geo-targeting unaffected because canonical domain is `.com.au`) |

---

## D. Next actions (priority order)

1. **User executes Step 1** (Amazon AU application, ~10 min). The
   bigger time cost is the wait, not the form.
2. **While waiting (1–3 days):** plan Step 4 Phase 1 — list the 14
   draft IDs in a side note, ready to populate `asinAu` once the AU tag
   lands.
3. **Approval lands:** add `AMAZON_AU_TAG=<assigned>` to `.env.local`
   and to Vercel project env. Implement Steps 2 and 3 in a single PR
   (~30 min code).
4. **Deploy and run Step 5.3** (VPN test) the same day.
5. **Step 4 Phase 1 in parallel** — populate `asinAu` for 14 drafts.
6. **First qualifying AU sale logged → 180-day clock survives.**
7. **Phase 2 sweep** queued for the following weekend.


---

# 4. Supporting doc — Direct-brand affiliate strategy
*Source: `docs/direct-brand-affiliates.md`. Supporting detail — defer to the System Brief (section 2) on any conflict.*

# Direct-Brand Affiliate Playbook

**Goal:** replace the "external" (unpaid) links on our non-Amazon products
with affiliate links that actually pay us commission. Amazon pays 3–4% on
most gadget categories; direct-brand programs on networks like Impact and
ShareASale often pay **5–10%**, sometimes higher, sometimes with higher AOV
products. Signing up is free and usually approved in 1–3 business days.

Status as of 2026-04-21: we have **18 live products** pointing to 18
distinct brand hosts with `destination: "external"`. Every one of these
products currently earns us $0. A single weekend of signup work could
unlock five-figure annual commission potential if traffic converts.

---

## How affiliate networks work (30-second primer)

Brands don't run their own affiliate programs directly — they partner with
**affiliate networks** that handle tracking, reporting, and payouts. Sign up
once with each network, then apply to each brand's program inside that
network. Same dashboard for all brands on that network.

The five networks that matter for consumer tech:

| Network | URL | Signup approval | Typical payout freq | Top gadget brands |
|---------|-----|-----------------|---------------------|-------------------|
| **Impact** | [impact.com](https://app.impact.com/campaign-mediapartner-signup/) | 1–3 days | Monthly (Net 30) | Samsung, Sony, DJI, Nikon, Canon, Bose, JBL, Shark |
| **Partnerize** | [partnerize.com](https://www.partnerize.com/en/partners/register) | 1–3 days | Monthly | GoPro, Dell, Lenovo, HP, Microsoft, Dyson |
| **ShareASale** (Awin) | [shareasale.com/newSignUp.cfm](https://www.shareasale.com/newSignUp.cfm) | Same-day to 2 days | Net 20 | Keychron, NuPhy, smaller boutique brands |
| **CJ Affiliate** | [cj.com/publisher-sign-up](https://www.cj.com/publisher-sign-up) | 2–5 days (stricter) | Net 30 | ASUS, Logitech, Lenovo, Office Depot, Best Buy |
| **Rakuten Advertising** | [rakutenadvertising.com/join](https://rakutenadvertising.com/join) | 3–7 days | Net 30 | Walmart, Best Buy, Macy's |
| **Awin** | [awin.com/us/publishers](https://www.awin.com/us/publishers/join-awin) | Same-day to 2 days | Varies | Philips, Huawei, Xiaomi, European brands |

### Approval tips that move the needle

- **Pre-fill a content-ready site.** You already have 248 live products with
  enthusiast-voice descriptions — that's exactly what networks want to see.
- **Use your real domain for the signup** (`www.gadgetstyle.com.au`). Networks
  reject accounts that use placeholders or pre-launch landing pages.
- **Set "niche" to "Consumer Electronics / Gadget Reviews"** — don't try to
  be broader than you are; specific niches get approved faster.
- **Skip the "networks" pitch.** Don't mention Pinterest/Instagram in your
  signup bio unless you already have follower counts to cite. Focus on SEO +
  editorial curation.
- **Tax forms:** US LLCs need a W-9; everyone else a W-8BEN. Have it ready.

---

## Our 18 brand-direct products — prioritized by signup target

Sorted by commission potential (higher-priced × more products = earlier
payoff). **Priority 1** brands should be signed up this week.

### Priority 1 — sign up first (biggest $ per click)

| Brand | Products | Network | Typical Commission | Notes |
|-------|---------|---------|-------------------|-------|
| **Samsung** | #131, #133 (2 smartphones, ~$400 AOV) | Impact | 3–5% | Apply to "Samsung US" program |
| **DJI** | #130 (Osmo Pocket 4, ~$500) | Impact **or** direct-apply | 5–8% | Drones/cameras have the best rates |
| **Sony** | #149 (BRAVIA Soundbar, ~$400) | Impact | 3–5% | Many sub-programs — pick "Sony Electronics" |
| **Dell** | #145 (Pro 5 Micro, ~$800) | Partnerize | 1–3% (vol-based) | Higher AOV offsets lower rate |
| **ASUS** | #148 (Zenbook A14, ~$1200) | CJ Affiliate | 1–3% | Strict approval — have site polished |
| **Denon** | #129 (Home 600 speaker, ~$600) | Impact | 4–6% | Masimo/D+M brand family |
| **Corsair** | #138, #256 (case + mousepad, $50-300) | Impact | 3–6% | Covers Elgato too — bonus brand |

**Expected monthly potential at 500 visitors:** $80–$250/mo once traffic is
there. Scales linearly with visitors.

### Priority 2 — sign up this month (good rates, smaller catalog impact)

| Brand | Products | Network | Typical Commission |
|-------|---------|---------|-------------------|
| **Keychron** | #146 (mouse) | ShareASale | 5–8% |
| **NuPhy** | #141 (Air 65 V3) | ShareASale | 5–10% |
| **8BitDo** | #137 (Retro 68 Keyboard) | Direct | Often higher — apply via their contact form |
| **TESSAN** | #150, #151 (travel adapter + charging station) | Impact (partial) | 4–8% |
| **eero** | #257 (Pro 7) | Amazon Associates (same tag) | 4% | Already covered — just convert to `/dp/` |
| **MSI** | #140 (HERALD BE9400 router) | Impact | 3–5% |
| **Soundboks** | #255 (Mix speaker) | ShareASale | 5–10% |

### Priority 3 — evaluate, may not be worth the time

| Brand | Products | Notes |
|-------|---------|-------|
| **OPPO** | #143 | Regional brand, no US affiliate program — link as-is |
| **Motorola News** | #144 | `motorolanews.com` isn't a storefront — replace with Amazon or Motorola.com |
| **Vastnaut** | #142 | Small brand, may not have a program — direct email ask |

### Special case — convert to Amazon ASINs instead

The 13 draft products with `externalUrl` pointing back to `thegadgetflow.com`
(Amazon devices: Echo, eero, Halo, Dash, etc.) should be **re-mapped to their
actual Amazon listings** since they're Amazon products anyway. This gives
us Amazon Associates commission automatically. Do this as part of draft
review.

---

## Execution checklist

- [ ] Create accounts on **Impact**, **Partnerize**, **ShareASale**,
      **CJ Affiliate** — all five at once, same-day. ~30 min total.
- [ ] Apply to **Samsung US**, **DJI**, **Sony**, **Dell**, **ASUS**,
      **Denon**, **Corsair** within Impact/Partnerize/CJ. ~15 min/app,
      ~90 min total.
- [ ] Await approvals (1–5 business days per brand).
- [ ] For each approved brand, grab the tracking-link format from their
      dashboard. Format varies — Impact uses `goto.impact.com`, Partnerize
      uses brand-specific subdomains like `prf.hn`, ShareASale uses
      `shareasale.com/r.cfm`.
- [ ] **Update data.ts** — replace each product's raw brand URL with the
      wrapped affiliate URL. (See script: `scripts/patch-external-urls.ts`
      pattern; we'll want a similar one-off script per network.)
- [ ] Re-run `pnpm check`, push, deploy, done.

### Long-term signup radar

Keep an eye on these networks as we add products:

- **Impact** — growing list; good for premium consumer tech
- **AvantLink** — small but has some enthusiast brands missing elsewhere
- **Pepperjam/Partnerize** — Dyson, Bose sometimes live here
- **Skimlinks / Viglink** — **not recommended**. They auto-convert links
  but take 25% of every commission. Only useful if you can't get direct
  approval, and even then the economics are bad.

---

## Related repo tooling

```
pnpm tsx scripts/strip-gf-utm.ts         # already run; strips GF attribution from all externalUrls
pnpm tsx scripts/patch-external-urls.ts  # re-scrape drafts with GF-fallback externals
```

**Future script** (not built yet): `scripts/apply-affiliate-wrappers.ts`
that takes a mapping of `{ hostname -> tracking template }` and rewrites
every `externalUrl` through the template. Build this once you have 3+
programs approved; until then, manual edits are fine.


---

# 5. Supporting doc — Affiliate signup checklist
*Source: `docs/affiliate-signup-checklist.md`. Supporting detail — defer to the System Brief (section 2) on any conflict.*

# Affiliate Signup Checklist

Pure-action companion to `docs/direct-brand-affiliates.md`. Work top to
bottom. Pinterest + Meta verifications land 2026-05-06; this is intended
to be executed the same week so direct-brand revenue starts accruing
alongside the social launch.

Site is **live** at https://www.gadgetstyle.com.au with 219 live
products. **18 of the live products are direct-brand** (`destination:
"external"`) and currently earn $0 — they are the targets below. Plus
13 GF-fallback Amazon products that should be remapped to real ASINs
(handled by `gs-catalog`, not in scope here).

---

## Before you start (info to have ready)

Have all of this in a single notes file, or open in tabs, before opening
any signup form. Every network asks for the same fields in slightly
different order.

| Field | Value |
|-------|-------|
| Site URL | `https://www.gadgetstyle.com.au` |
| Business name | Gadget Style Australia |
| Legal owner | Constantinos Tsekouras |
| ABN | 75185709936 |
| Business address | Level 2, 450 St Kilda Road, Melbourne VIC 3004, Australia |
| Contact email | contsekouras@gmail.com |
| Phone | +61 414651195 |
| Niche / category | Consumer Electronics / Gadget Reviews |
| Promotional methods | SEO, editorial curation, Pinterest, Instagram |
| Monthly traffic | "<1,000 unique visitors (newly launched, growing)" |
| Tax form | **W-8BEN** (Australian tax resident, individual) |
| Tax ID | Use ABN. US W-8BEN does not require a US TIN for AU residents under the AU/US tax treaty — claim treaty rate. |
| Payout method | PayPal (`contsekouras@gmail.com`) — fastest setup. Bank-transfer only if a network blocks PayPal. |

### Site description (paste verbatim)

> Gadget Style is an Australian consumer-electronics editorial site
> covering the most interesting gadgets launching globally — smart home,
> audio, computing, mobile, photography, gaming, and emerging tech.
> Inspired by the Gadget Flow / Uncrate format, every product is
> hand-curated and written up with enthusiast-voice descriptions, full
> spec tables, and direct buy links. The catalog currently spans 200+
> products across 25+ categories, growing weekly via a structured
> ingestion pipeline. Revenue model: Amazon Associates (US tag
> `gadgetstyle01-20`) plus direct-brand affiliate programs for non-Amazon
> products. Audience: tech enthusiasts and gift-shoppers in the US, AU,
> and UK, reached via SEO, Pinterest, and Instagram.

(~110 words. Trim the last sentence for any field that caps at 100.)

### Save as a `.txt` for paste-and-go

Suggest dropping the table above into
`docs/affiliate-signup-info.txt` (gitignored if you'd rather) so every
form is copy-paste, not retyping.

---

## Networks to apply to (priority order)

### 0. Amazon AU Associates — `https://affiliate-program.amazon.com.au/` ★ HIGHEST PRIORITY

**Do this BEFORE the other 6 networks.** It's the biggest immediate
revenue lever — site is .com.au, ~70% of traffic is AU, and the current
US-only tag either FX-discounts AU commissions or (on amazon.com →
amazon.com.au auto-redirect) strips them entirely.

Full application pack: `docs/amazon-au-application-pack.md`. Dual-tag
implementation spec: `docs/dual-tag-implementation.md`.

**Approval:** 1–3 business days (verify on application page).

**Network signup fields (paste-ready):**
- Account information — Payee name → Constantinos Tsekouras
- Address line 1 → Level 2, 450 St Kilda Road
- Suburb / City → Melbourne
- State → VIC, Postcode → 3004, Country → Australia
- Phone → +61 414651195
- Business name → Gadget Style Australia
- ABN → 75185709936
- Website list → `https://www.gadgetstyle.com.au`
- Preferred Associates Store ID → `gadgetstyle-22` (fallback: `gadgetstyleau-22`)
- Niche → Consumer Electronics / Gadget Reviews
- Tax → Australian tax resident, non-US person; AU bank EFT for payouts
- Site description → paste the verbatim block below

**No per-brand applications needed inside Amazon AU** — once the AU tag
is issued you can deep-link to any product on amazon.com.au using the
same `?tag=` pattern.

**While waiting for approval (parallel work):**
- Run `pnpm check:data` to confirm validator is green (Amazon checks
  the site on first crawl)
- Confirm Privacy Policy + About + Contact pages are live with the new
  St Kilda Road address
- Continue with Steps 1–6 below (the 6 brand networks)

---

### 1. Impact — `https://app.impact.com/campaign-mediapartner-signup/`

**Approval:** 1–3 business days for the network. Per-brand programs
within Impact often auto-approve.

**Network signup fields:**
- Account type → **Individual / Sole Trader**
- Country → Australia
- Promotional model → "Content / Reviews"
- Site URL → `https://www.gadgetstyle.com.au`
- Tax form → W-8BEN (claim AU treaty rate, 0% withholding on royalties)

**Brand programs to apply to inside Impact** (search each by name in the
Impact "Brands" / "Marketplace" tab, click "Apply"):

| Brand | Search term | Gadget Style product IDs |
|-------|-------------|--------------------------|
| Samsung | "Samsung US" | #131, #133 |
| Sony | "Sony Electronics" | #149 |
| DJI | "DJI" | #130 |
| Bose | "Bose" | (no live products yet — apply for future) |
| JBL | "JBL" | (no live products yet) |
| Shark | "Shark / Ninja" | (no live products yet) |
| Denon | "Denon" or "D+M / Masimo" | #129 |
| Corsair | "Corsair" | #138, #256 |
| MSI | "MSI" | #140 |
| TESSAN | "TESSAN" | #150, #151 |

10 program applications inside Impact. Plan ~2 minutes each.

---

### 2. Partnerize — `https://www.partnerize.com/en/partners/register`

**Approval:** 1–3 business days. Per-brand programs require separate
approval and can take 1–2 weeks for premium brands (Dell, GoPro).

**Network signup fields:** same as Impact. Partnerize labels
"promotional model" as "publisher type" — pick **Content Site / Review**.

**Brand programs to apply to inside Partnerize:**

| Brand | Gadget Style product IDs |
|-------|--------------------------|
| GoPro | #127 (draft — promote once price set) |
| Dell | #145 |
| Lenovo | (no live products yet — apply anyway, future-proof) |
| HP | (no live products yet — apply anyway) |
| Microsoft Store | (no live products yet — apply anyway) |
| Dyson | (no live products yet — apply anyway) |

6 program applications. Several of these will become relevant within a
month as the catalog grows past 250 products, so apply now even with no
matching products today.

---

### 3. ShareASale — `https://www.shareasale.com/newSignUp.cfm`

**Approval:** Same-day to 2 days. Per-brand approvals usually instant
or <24h for the smaller boutique brands ShareASale specializes in.

**Network signup fields:** ShareASale asks for site URL up front and
checks it for content. Site is live with 219 products, so this passes.
- Tax form: W-8BEN
- Payment threshold: lowered to $50 default; consider raising to $100 to
  reduce admin

**Brand programs to apply to inside ShareASale:**

| Brand | Gadget Style product IDs |
|-------|--------------------------|
| Keychron | #146 |
| NuPhy | #141 |
| Soundboks | #255 |
| 8BitDo | #137 — not always on ShareASale; if missing, apply via
8bitdo.com contact form |
| Vastnaut | #142 — small brand, may not have a program; direct email
fallback |

5 program applications.

---

### 4. CJ Affiliate — `https://www.cj.com/publisher-sign-up`

**Approval:** 2–5 business days. CJ has the strictest network-level
review — they manually check the site. Don't apply with a half-built
site; ours qualifies because it's live with content.

**Network signup fields:**
- Account type → **Individual** (sole trader, ABN as tax ID)
- Promotional method → "Content / Niche Site"
- Tax form → W-8BEN

**Brand programs to apply to inside CJ:**

| Brand | Gadget Style product IDs |
|-------|--------------------------|
| ASUS | #148 |
| Logitech | (no live products yet — apply anyway) |
| Lenovo | (also try CJ even though Partnerize lists it; some Lenovo
sub-brands live on CJ exclusively) |

3 program applications. Expect ASUS to take 5–7 business days because
ASUS reviews each new publisher manually.

---

### 5. Awin — `https://www.awin.com/us/publishers/join-awin`

**Approval:** Same-day to 2 days, but **Awin charges a $1 USD
verification fee** (refunded with first payout). Have a card ready.

**Network signup fields:** identical to others, plus the verification
fee step.

**Brand programs to apply to inside Awin** (Europe-leaning):

| Brand | Gadget Style product IDs |
|-------|--------------------------|
| Philips | (no live products yet) |
| Huawei | #132 (draft, AU/EU brand) — Huawei doesn't have a US
program; Awin AU/EU is the path |
| Xiaomi | (no live products yet) |

3 program applications. Lower priority than Impact/ShareASale because
the live-product overlap is thin — but worth doing now since Awin tends
to be the only home for European OEMs.

---

### 6. Rakuten Advertising — `https://rakutenadvertising.com/join`

**Approval:** 3–7 business days. Slowest of the six.

**Brand programs:**

| Brand | Gadget Style product IDs |
|-------|--------------------------|
| Walmart | (no live products) |
| Best Buy | (no live products) |
| Macy's | (no live products) |

0 matching live products. **Lowest priority — only do this once the
top 5 are submitted and you have spare time.** Useful future-proofing
only; skip if time-boxed.

---

## After approval — first hour per brand

For each brand-program approval email that lands:

1. **Find the tracking-link template:**
   - **Impact:** Brands tab → click brand → "Create Link" → copy the
     `https://goto.impact.com/c/...` template. Has a `&u1=` parameter
     for sub-ID — use the product slug.
   - **Partnerize:** Brand dashboard → "Tracking Links" → DeepLink
     generator. Format: `https://prf.hn/click/camref:.../destination:...`
   - **ShareASale:** Merchants tab → click merchant → "Get a Link" →
     "Create Custom Link" with destination URL. Format:
     `https://shareasale.com/r.cfm?b=<bid>&u=<userid>&m=<mid>&urllink=<encoded>`
   - **CJ:** Account → Links → Deep Link Generator. Format:
     `https://www.anrdoezrs.net/click-<userid>-<mid>?url=<encoded>`
   - **Awin:** Toolbox → Link Builder. Format:
     `https://www.awin1.com/cread.php?awinmid=<mid>&awinaffid=<affid>&ued=<encoded>`
   - **Rakuten:** Links tab → Deep Link Generator.

2. **Pilot on ONE product first.** Recommended pilot:
   - **#145 Dell Pro 5 Micro Desktop** (~$800 AOV, Partnerize) — high
     AOV so even a low-rate commission shows up clearly in reports.
   - Backup pilot if Dell takes too long: **#149 Sony BRAVIA Theatre Bar
     5** (~$400, Impact).

3. **Test the link works:**
   - Click your generated tracking URL in a fresh incognito window.
   - It should redirect through `goto.impact.com` (or equivalent) and
     land on the brand site with the tracking parameters intact.
   - Open the network's reporting dashboard within 5 minutes — your
     test click should appear (it won't be a sale, just a click event).
   - If the brand site is reached but the dashboard shows nothing, the
     deep link is malformed. Re-generate from the network UI rather
     than hand-editing.

4. **Spec for `scripts/apply-affiliate-wrappers.ts`** (do **NOT** build
   yet — outline only):

   ```ts
   // scripts/apply-affiliate-wrappers.ts
   //
   // Input: a JSON file `affiliate-wrappers.json` mapping brand-domain
   // hostnames to a tracking-link template per network. The template
   // contains a literal `__DEST__` token where the URL-encoded
   // destination URL goes.
   //
   // Example mapping:
   // {
   //   "samsung.com":  "https://goto.impact.com/c/12345/67890?u1=__SLUG__&dest=__DEST__",
   //   "dell.com":     "https://prf.hn/click/camref:1011lABCD/destination:__DEST__",
   //   "keychron.com": "https://shareasale.com/r.cfm?b=111&u=222&m=333&urllink=__DEST__",
   //   "asus.com":     "https://www.anrdoezrs.net/click-1234-5678?url=__DEST__"
   // }
   //
   // Behavior:
   //   1. Load data.ts via dynamic import.
   //   2. For every product where destination === "external":
   //      - Parse hostname from externalUrl.
   //      - Look up template by exact hostname, then by registrable
   //        domain (sld.tld) as fallback.
   //      - If no template: log "skip: no wrapper for <host>", continue.
   //      - If template found: replace __DEST__ with encodeURIComponent
   //        of original externalUrl; replace __SLUG__ with product.slug.
   //      - Mutate externalUrl in place; preserve all other fields.
   //   3. Write data.ts back via the same regex-edit pattern used by
   //      scripts/fix-affiliate-urls.ts (don't try AST rewrites; the
   //      file is hand-formatted).
   //   4. Run pnpm check:data afterwards; fail if validator fails.
   //   5. Idempotent: a second run with the same mapping should be a
   //      no-op (detect already-wrapped URLs by checking if hostname is
   //      in the wrapper-host whitelist like goto.impact.com / prf.hn /
   //      shareasale.com / anrdoezrs.net / awin1.com / rakuten*.com).
   //
   // CLI:
   //   pnpm tsx scripts/apply-affiliate-wrappers.ts \
   //     --mapping=docs/affiliate-wrappers.json \
   //     --dry-run     # preview only, no writes
   //
   // Build trigger: only after 3+ programs are approved and you have at
   // least 3 templates to dedupe-test against.
   ```

   The mapping file `docs/affiliate-wrappers.json` is what each network
   approval populates over time. **Keep it gitignored** — it contains
   your affiliate IDs (low-sensitivity but no reason to publish them).

---

## Skimlinks / Sovrn check

**Recommendation: do NOT add Skimlinks or Sovrn.**

Reasoning:
- Skimlinks and Sovrn auto-convert any merchant link they recognize
  into an affiliate link, but they take a **~25% revenue share** of
  every commission they generate.
- Direct-brand approval through Impact / ShareASale / Partnerize / CJ
  is free, takes 1–5 days, and you keep 100% of the commission.
- Skimlinks is only economical if you have **no time to apply** to
  networks directly, or if you need to monetize a long tail of
  hundreds of obscure brands. Neither applies — Gadget Style has a
  finite, curated catalog where direct programs cover ~95% of
  potential commission value.
- Adding Skimlinks alongside direct programs creates **attribution
  conflicts**: their JS rewrite can clobber your direct affiliate URL
  on click. Pick one path per brand.

**Possible exception:** if a single high-traffic article references a
brand with no available direct program (and won't be a recurring
catalog item), Skimlinks is fine for that one link. Not worth the JS
include site-wide.

---

## Awin Mass Connect check

**Status as of May 2026: unclear.** Awin's public publisher pages still
describe per-brand approval as the standard path. There's a feature
called **Awin Access** (advertiser-side, not publisher) and a "Partner
Discovery" tool, but I couldn't surface a publisher-side "Mass Connect"
program that auto-approves you to a bundle of brands.

**Action when you log into Awin:** in the Awin dashboard, search the
Programmes / Advertisers section for "Mass Connect" or
"auto-approve" filter. If it exists as a publisher option, opt in —
it's a free shortcut to dozens of approvals. If it doesn't, default to
applying to Philips / Huawei / Xiaomi individually as listed above.

**If found and enabled,** revisit `docs/direct-brand-affiliates.md`
priority list — Mass Connect may make European brands instant wins
that justify catalog expansion toward EU products.

---

## Estimated time

| Step | Time |
|------|------|
| Prep info file (one-off) | 15 min |
| Amazon AU Associates signup (Step 0) | 10 min |
| 6 network signups | ~30 min total (5 min each) |
| 27 brand applications across all networks | ~90 min total (~3 min each, mostly paste site description + agree to terms) |
| Initial approval wait | 1–7 business days, no work |
| First-hour-per-approval (template grab + pilot test) | 15 min × ~10 brands = 2.5 hrs spread over 2 weeks |
| **Total active work** | **~3.7 hours** |

---

## Out of scope here

- Building `apply-affiliate-wrappers.ts` — wait until 3+ programs are
  approved.
- Re-mapping the 13 GF-fallback Amazon products (#258–270) to real
  ASINs — that's `gs-catalog` work; tracked separately.
- Pinterest / Instagram FTC affiliate disclosure copy — `gs-social`
  owns it, but the disclosure must be live before the first social
  affiliate post.
- W-8BEN form preparation — IRS form, takes 5 minutes once per network;
  not worth a doc.


---

# 6. Supporting doc — High-AOV content strategy (2026)
*Source: `docs/high-aov-content-strategy-2026.md`. Supporting detail — defer to the System Brief (section 2) on any conflict.*

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


---

# 7. Supporting doc — Social posting playbook
*Source: `docs/social-posting-playbook.md`. Supporting detail — defer to the System Brief (section 2) on any conflict.*

# Autonomous Social Posting Playbook

**Goal:** post new-product announcements and curated gear roundups to
Pinterest + Instagram automatically, without manual paste. Feed both platforms
from our `data.ts` catalog + Claude-generated captions.

Status as of 2026-04-21: content generation works (`pnpm tsx
scripts/generate-social.ts`). **Publishing integration is not yet built** —
this doc specs out the path, and the work is split between one-time user
actions (~60 min total) and repo-side code (~2 hrs) that unblocks once
tokens exist.

---

## Why not Buffer

We talked about Buffer API earlier — that path is now closed.

- **2024:** Buffer stopped accepting new public-API developer app registrations
  (buffer.com/developers no longer onboards external devs).
- **2025:** No replacement REST API announced.
- **Existing apps** on `api.bufferapp.com` are grandfathered but new integrations
  can't be built.
- **Buffer itself now pushes users to Zapier/Make for automation**, which is
  brittle and low-volume.

**Bottom line:** don't build around Buffer in 2026. Better to go direct to
each platform's first-party API.

## The direct-API path (recommended)

Two official APIs, both free to use, both well-documented, both actively
maintained.

### Pinterest API v5 — mature, supports everything

- **URL:** developers.pinterest.com
- **Auth:** OAuth 2.0, long-lived refresh tokens
- **What it publishes:** standard pins (image + link + board), video pins,
  multi-image pins, idea pins
- **Rate limits:** 1,000 requests/minute per app (plenty)
- **Approval:** App goes from "trial" to "standard" access via Pinterest's
  review — 1–2 weeks. Trial access is fine for our volume during dev.
- **Good for us:** 100% matches our product catalog model. Each product
  becomes a pin linking to `gadgetstyle.com.au/product/<slug>` with the hero
  image and an auto-generated caption.

### Meta Graph API — Instagram Content Publishing

- **URL:** developers.facebook.com/docs/instagram-platform/content-publishing
- **Auth:** OAuth 2.0 via a Facebook App. User connects a **Facebook Page**
  that has an **Instagram Business or Creator account** linked to it.
- **What it publishes:** single image, carousel (up to 10 images), Reels
  (video). Stories via API are partially supported but require extra
  permissions.
- **Rate limits:** 50 API-published posts per IG account per 24 hours.
  More than enough for our posting cadence.
- **Approval:** Facebook App Review for `instagram_content_publish` scope
  — usually 1–3 business days, straightforward if site is live.

### Why direct beats third-party schedulers

Publer, Metricool, Postiz, Later all layer a paid wrapper on top of the
same Meta/Pinterest APIs. Direct means:

- No monthly fee
- No vendor lock-in — we own our tokens
- Full control over scheduling logic (post-at-best-time, vary captions,
  platform-specific assets)
- One less thing to break

---

## What the user needs to do (one-time setup)

Total time: **~60 min**, spread across three platforms. None of this
requires Claude — it's all browser work in developer dashboards.

### Pinterest (20 min)

1. Go to [developers.pinterest.com](https://developers.pinterest.com) and
   sign up (uses your existing Pinterest account).
2. Create a new **app**. Set:
   - App name: "Gadget Style Social"
   - Website: `https://www.gadgetstyle.com.au`
   - Redirect URI: `https://www.gadgetstyle.com.au/oauth/pinterest/callback`
     (placeholder — we'll serve this later; you can use
     `http://localhost:3000/oauth/pinterest/callback` for dev).
3. Request scopes: `boards:read`, `pins:write`, `pins:read`.
4. Submit for trial access — usually instant.
5. From the app's **Credentials** tab, copy:
   - Client ID
   - Client Secret

### Meta (Facebook / Instagram) (30 min)

1. **Convert Instagram account to Business or Creator.** Instagram app →
   Settings → Account → Switch to Professional. Link it to a Facebook Page
   you own (create one if needed; category: "Website" or "Media").
2. Go to [developers.facebook.com](https://developers.facebook.com) and
   register as a developer.
3. Create a new **App**. Type: "Business". Attach it to your Facebook
   Business account.
4. Add products: **Instagram Graph API** and **Facebook Login**.
5. Configure Facebook Login:
   - Redirect URI: `https://www.gadgetstyle.com.au/oauth/facebook/callback`
6. Request permissions for App Review:
   - `instagram_content_publish`
   - `instagram_basic`
   - `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`
     (the three are needed because IG Business is tied to an FB Page)
7. Submit for review. Approval typically 1–3 days for a live site with
   clear use-case docs.
8. Copy:
   - App ID
   - App Secret

### .env.local additions (10 min)

Once tokens are in hand, add to `.env.local`:

```
PINTEREST_CLIENT_ID=...
PINTEREST_CLIENT_SECRET=...
PINTEREST_REFRESH_TOKEN=...     # obtained via OAuth flow

META_APP_ID=...
META_APP_SECRET=...
META_PAGE_ACCESS_TOKEN=...      # long-lived, ~60 days
META_IG_BUSINESS_ID=...         # numeric ID, looks like 17841405793185934
```

Getting the OAuth-flow tokens is a one-time dance:

```
pnpm tsx scripts/social-oauth-setup.ts pinterest
pnpm tsx scripts/social-oauth-setup.ts meta
```

Each script opens a browser window, lets you authorize, catches the redirect
locally on `http://localhost:3000/...`, and writes the resulting tokens to
`.env.local`. (This script isn't written yet — it's on the build list below.)

---

## What I'll build (repo side)

### Phase 1 — scheduler primitives (~1 hour)

- `scripts/lib/pinterest.ts` — thin API client (create pin, list boards,
  refresh token helper).
- `scripts/lib/meta-ig.ts` — thin API client (create media container,
  publish container, refresh Page token).
- `scripts/social-oauth-setup.ts` — one-off interactive OAuth flow that
  stores refresh tokens in `.env.local`.

### Phase 2 — the post-one-product CLI (~30 min)

- `scripts/post-product.ts --id N [--platforms pinterest,instagram]` —
  takes a live product ID, reads its image + generated caption from
  `docs/social/*`, posts to the chosen platforms. Prints the resulting
  pin URL / post URL.

### Phase 3 — the scheduler (~30 min)

- `scripts/social-queue.ts [--count N] [--platforms ...]` — picks N
  products from the catalog (weighted by recency + trending) and posts
  them. Safe to run on a cron. Writes `docs/social-log/<date>.json` with
  which products were posted where.

### Phase 4 — the CI cron

- **GitHub Actions workflow** (`.github/workflows/social-cron.yml`)
  that runs `pnpm tsx scripts/social-queue.ts` on a daily schedule. Pulls
  secrets from GitHub Actions Secrets, not committed anywhere.

### Content strategy

Pinterest is where gadgets go viral. Instagram is where they drive
follow-then-buy conversions. Different cadences:

| Platform | Cadence | Post type |
|----------|---------|-----------|
| Pinterest | 3–5 pins/day, varied from 30+ boards | Standard pins (product hero image + link + description). Reuse existing `docs/social/pinterest.csv`. |
| Instagram | 1 post/day + 3 stories/day | Carousel (4–6 angles per product), Reel when `videos[]` is available, product Stories with swipe-up. |

`scripts/generate-social.ts` already produces CSV for Pinterest and
Markdown captions for IG — Phase 2+ just wires those into the API clients.

---

## Cost

Zero recurring. All three networks are free for our volume:
- Pinterest API: free, up to 1000 req/min
- Meta Graph API: free, 50 publishes/IG-account/day
- GitHub Actions: 2000 min/mo free on public repos, ample for a daily cron

First cost only appears if we want paid analytics (Pinterest Analytics
Plus, Meta Business Premium) — neither needed to start.


---

# 8. Supporting doc — Brand design system
*Source: `docs/brand-design-system.md`. Supporting detail — defer to the System Brief (section 2) on any conflict.*

# Brand visual system — Gadget Style

This is how brand pages and brand cards stay consistent and on-quality as we add more brands. If you're about to add a new brand, read this first, then run `pnpm brands:audit` and ship only when it passes.

## The principle

**Brand surfaces use CURATED lifestyle photography with the brand's own wordmark rendered in native color on top.**

Two failed iterations taught us the boundaries: derived product photos (first-catalog-image backdrops) look like marketplace search results, and flat brand-color tiles look clinical. The shipped design uses a hand-picked Pexels lifestyle photo per brand (thematically matched to what the brand makes), shown CLEAR — no full-card tint — with the official wordmark placed directly on the photo. Legibility comes from a soft white radial bloom behind the logo, not from a pill or an invert filter.

## The asset kit per brand

Required:
- **Logo (SVG)** — `client/public/images/brands/<slug>.svg`. Vector. Square or wide rectangular aspect. Transparent background.
- **Accent color (hex)** — `accentColor: "#RRGGBB"` in `client/src/lib/brands.ts`. Six-digit hex only (the auditor blocks shorthand and named colors).
- **Tagline (≥ 8 chars)** — short hero sub-line.
- **Description (≥ 60 chars, target 100+)** — 1–3 sentences shown beneath the hero.

Optional:
- **`heroImageUrl`** — the Pexels lifestyle photo, sourced via `pnpm brands:imagery` into `client/public/images/brands/heroes/<slug>.jpg` (1600×900). Practically required — every current brand has one; without it the surfaces fall back to a color-gradient tile.
- **`website`** — official site URL. When set, a "Visit official site" CTA renders.

## Visual rules (already wired in code)

The components in `BrandsIndexPage.tsx` and `BrandPage.tsx` enforce these automatically — you don't need to touch them per brand.

| Surface | Treatment |
|---|---|
| `/brands` card | Square image area (matches ProductCard) with the hero photo CLEAR + soft radial darkening behind the centered logo only. Info (name + product count) sits BELOW the image, mirroring ProductCard so brand cards line up pixel-identical with product cards. |
| `/brand/:slug` hero | Full-bleed hero photo shown CLEAR; only a soft bottom gradient (10/20/55% black) for headline legibility. No mix-blend tints. |
| Logo rendering | NATIVE brand color everywhere — **never `brightness-0 invert`** (it strips Samsung blue / Razer green / Anker cyan). White radial spotlight bloom behind for legibility. No white pill, no circle. |
| Logo size | ~55% of card height on /brands cards; up to 360px wide on the /brand hero. |
| H1 underline | Brand-name span gets an accent underline — white when the accent is dark (luminance ≤ 0.6), gold `#FFCC00` otherwise. This luminance check is the ONLY remaining use of the accent-tone logic. |

## Accent color guidance

Use the brand's primary identity color (the one on their press kit / logo). Stay away from pure black (`#000000`) — bump to `#0e0e0f` so the radial highlight has somewhere to go. Belkin blue, Anker cyan, Razer green, Amazon orange all work. Apple, Sony, Asus, DJI use deep dark accents — the H1-underline tone flip keeps the hero headline readable.

## Adding a new brand — checklist

1. Drop the logo SVG into `client/public/images/brands/<slug>.svg`.
2. Add the entry to `brands` in `client/src/lib/brands.ts`:
   ```ts
   {
     slug: "newbrand",
     name: "NewBrand",
     tagline: "Products we love from NewBrand",
     description: "1–3 sentences on what this brand stands for. Stay above 60 chars.",
     logoUrl: "/images/brands/newbrand.svg",
     website: "https://www.newbrand.com",
     accentColor: "#RRGGBB",
   }
   ```
3. Tag products with `brand: "newbrand"` in `data.ts` (or run `pnpm tsx scripts/backfill-brands.ts`).
4. **Run `pnpm brands:audit`.** Fix anything red. Anything yellow is a soft warning.
5. **Run `pnpm check`** — typecheck + data validation must be green.
6. **Run `pnpm dev`** and visit `/brands` and `/brand/newbrand` to eyeball.
7. Commit + push. Vercel auto-deploys.

## When to override with `heroImageUrl`

Default to **no** override. Only add a hero image when one of these legitimately copyright-clear sources is available:

- The brand has supplied us with their official lifestyle/marketing photography (press kit, partner program asset, partnership pack).
- We've sourced from a properly licensed royalty-free library and credited per the licence (Pexels, Wikimedia Commons under matching CC, paid stock with proof of licence).
- We've taken the photo ourselves.

**Hard rule — copyright:** Never scrape brand banners or hero imagery from Gadget Flow, competitor affiliate sites, or any third-party publisher. They paid for / licensed those assets and we have no rights to redistribute them. Don't even download "to use as reference" — keep them out of the repo entirely.

Never use a product listing photo (white-background Amazon shot) as `heroImageUrl`. The auditor doesn't block this but it looks cheap.

## Brands with no products yet

A brand can ship in `brands.ts` before its products are sourced. The `/brand/<slug>` page renders an "In the pipeline" state — branded with the accent color, explaining the shortlist is being curated, with a CTA back to `/brands` and an outbound link to the brand's official site. This is fine for short stretches (Belkin currently). Source real products via Amazon AU once Associates is approved, or via `pnpm gf:sync` (which preserves attribution via `gadgetFlowUrl`), or via direct-brand affiliate networks.

## Auditor: `pnpm brands:audit`

Checks every brand for:
- Logo file exists in `client/public`
- Logo is SVG
- Accent color is valid 6-digit hex
- Tagline + description meet length minimums
- `heroImageUrl` (if set) actually resolves

Writes `docs/brand-asset-audit.json` and exits non-zero on errors.

## Why this exists

The first pass of brand pages used the first product photo as both card backdrop and hero backdrop. It looked amateur — the page rhythm was dictated by whichever Amazon listing happened to land in `getProductsByBrandSlug()[0]`. Visual quality must not depend on data ordering. A brand-color tile system means a brand looks polished from the moment its logo + accent color land in the file, even before any product is tagged into it.


---

# 9. Supporting doc — Content cluster — drones for content creators
*Source: `docs/cluster-drones-content-creators.md`. Supporting detail — defer to the System Brief (section 2) on any conflict.*

# Cluster: Drones for content creators 2026 (AU market)

**Author:** gs-growth | **Date:** 2026-05-06 | **Status:** Draft strategy + brief, pending product verification

---

## A. Product Opportunity Report

### Topic cluster
**Drones for content creators in 2026 — Australian market.** Long-tail expansion: "best drone for youtubers australia 2026", "DJI Mavic 4 Pro vs Air 3S", "best drone under 250g australia", "DJI Avata 2 review", "DJI Mini 4 Pro CASA registration", "drone laws australia content creators".

This is the highest-AOV content category we cover after TVs. DJI Mavic 4 Pro Creator Combo lists at the AU$5,000+ tier in international SKUs; Air 3S is a verified ~AU$1,099–$1,500-band product; even the Mini 4 Pro at AU$759-equivalent is strong commission territory.

### Buyer problem
Australian content creators considering a drone face four real frictions that every roundup has to address:

1. **CASA regulation reality.** The AU buyer must register any drone flown commercially (AU$40/year regardless of weight), and content creators monetizing footage are commercial. Sub-250g hobby exception does NOT exempt commercial use. Free RPA Operator Accreditation is required for sub-2kg commercial flights. Most US/UK roundups skip this entirely; we won't.
2. **Weight tier choice.** Sub-250g (Mini 4 Pro) avoids drone-pilot accreditation in some hobby contexts but doesn't avoid the commercial registration. 2kg+ class (Mavic 4 Pro) requires RePL for some operations. The buyer needs the regulation tree mapped clearly before they pick a model.
3. **Camera-tier choice.** 1-inch sensor (Air 3S, Mini 4 Pro) vs 4/3 sensor (Mavic 4 Pro) vs FPV (Avata 2) — each delivers a meaningfully different look. The roundup must position by intended footage type, not by spec sheet alone.
4. **DJI vs everything else.** DJI dominates ~80% of the content-creator drone market. Autel + Parrot are real but niche. The roundup honestly says "DJI is the answer most of the time" rather than padding the list for SEO.

### Product candidates (5–7 specific models)

**STATUS LEGEND:** **VERIFIED** = product confirmed current via 2026 sources (Engadget, DroneXL, The Drone Girl, DJI). **ASSUMED** = product exists, AU specifics need verification before publish. **AU PRICE NOT YET VERIFIED** = international/USD pricing only; AU pricing must be checked.

| Model | Class | Why it's on the list | Status |
|---|---|---|---|
| **DJI Mavic 4 Pro** | Pro tri-camera (4/3 CMOS Hasselblad 100MP, dual tele) | Flagship pick. 51-min flight time, Infinity Gimbal, 30km transmission. The "money is no object" entry. | **VERIFIED current 2026 model** (Engadget, DroneXL, Amazon US listing); AU price + availability needs verification |
| **DJI Mavic 4 Pro 512GB Creator Combo (RC Pro 2)** | Pro bundle | The buyer's actual purchase form for content work — three batteries, charging hub, RC Pro 2 controller. AOV here is the highest in the cluster. | **VERIFIED current SKU** (Amazon US listing); AU price + availability needs verification |
| **DJI Air 3S** | Mid-tier (1-inch sensor + medium tele) | "Sweet spot" pick — quoted ~US$1,099 (~AU$1,500-band), 45-min flight, 1-inch sensor. The serious-creator-on-budget pick. | **VERIFIED current 2026 model** (The Drone Girl, DroneXL); AU price needs verification |
| **DJI Mini 4 Pro** | Sub-250g consumer | ~US$759 (~AU$1,150-band). Travel-friendly, 4K HDR, omnidirectional obstacle sensing. The "starter creator drone" pick. | **VERIFIED current 2026 model** (DroneXL, Amazon US listing); already in our catalog (id 50, live) |
| **DJI Avata 2** | FPV / cinematic action | Goggles-based cockpit POV. Different footage style — fast-moving cinematic flow shots that photo drones can't capture. | **VERIFIED current 2026 model** (Engadget Best Drone 2026); AU price needs verification |
| **DJI Mini 5 Pro** *(if released by publish date)* | Sub-250g consumer (next gen) | DJI rumor + comparison content suggests 2026 Mini 5 Pro launch. Worth flagging in research; only include if shipping at publish time. | **ASSUMED / RUMORED** — verify launch status before publish |
| **Autel EVO Lite+** *(non-DJI alternative)* | 1-inch sensor mid-tier | The "if not DJI" callout. Less ecosystem support, but real product for buyers boycotting DJI. | **ASSUMED** — verify current AU SKU + price |

We recommend **5 DJI picks (covering the price tiers + one FPV) + 1 non-DJI alternative as a callout**. The buyer needs the DJI ladder; padding with Parrot Anafi and Skydio dilutes that signal.

### Monetization potential

**Math (pre-verification):**
- **AOV (commission base):** AU$1,150–AU$5,000+ per drone. Cluster average ~AU$2,000.
- **Per-conversion commission (Amazon US tag, current):** AU$23–AU$100+ at 2% Amazon electronics rate. Note: drones often have higher commission tiers on direct-brand affiliate programs (DJI runs Awin in some regions; verify AU eligibility via `gs-affiliates`).
- **Realistic monthly conversions at year-1 traffic:** 1–4 sales/month if ranking page 1 for the high-intent comparison long-tails. Drone buyers do extensive research before purchase, lower CTR than audio/TV but much higher AOV per click.
- **Expected monthly revenue:** AU$50–$400/month from the cluster article alone at year-1 traffic, with significant scaling potential — this category has the *highest commission ceiling per click* in the catalog.

**Multiplier:** the drone cluster has strong follow-on long-tail content surface — "DJI Mavic 4 Pro vs Air 3S" (high-intent comparison), "best drone for real estate australia", "best drone for travel YouTubers", "CASA registration step-by-step for content creators". 4–5 follow-on articles + a CASA-registration explainer page that becomes a permanent traffic source.

### SEO potential

- **Primary keyword:** "best drone for content creators 2026" — modeled monthly AU search volume: 200–500 (verify GSC).
- **Long-tail (higher conversion intent):** "dji mavic 4 pro vs air 3s", "best drone for youtube australia 2026", "casa drone registration content creator", "best dji drone for video".
- **Competitor density:** HIGH on head terms. Engadget, The Drone Girl, DroneXL, PetaPixel, B&H rank globally. Australia-specific: D1 Lounge, DroneFly AU. Notable gap: AU-specific buyer's guides that integrate CASA regulation are weak — there's a content moat here.
- **Our angle (differentiation):**
  1. **CASA-aware** — most US/UK roundups don't mention CASA registration. AU content creators searching for AU-specific guidance find generic US content. Real moat.
  2. **Content-style first, spec second** — most roundups lead with sensor size; we lead with "what footage do you want to make."
  3. **Commercial-flight reality** — content creators monetizing footage are commercial under CASA's framework. Most roundups treat the buyer as a hobbyist. We treat them as a small business (which `gs-content` writers should resonate with as we are also one).
  4. **DJI honesty** — most "best drone" lists pad with non-DJI options for SEO. We say DJI is the answer 5 times out of 6 and explain the one case where it isn't.

### Competition / risk notes

- **Engadget + The Drone Girl + DroneXL + PetaPixel** own the global "best drone" SERP. Compete on AU specificity + CASA depth.
- **DJI release cadence is brutal** — Mini 5 Pro rumored, Air 4 inevitable, Mavic 5 in the 24-month horizon. Article needs a "last updated" badge and quarterly refresh commitment.
- **AU stock churn** — DJI direct AU stock is solid; Amazon AU stock for some SKUs drifts. Schedule monthly link-rot checks.
- **CASA regulation drift** — registration costs and weight thresholds change. Use CASA's site as primary citation; refresh on every quarterly review.
- **Compliance risk:** never invent flight tests / "we flew this drone" claims. Quote published reviews with attribution. No medical / safety claims about drone use beyond CASA-published guidance.

### Recommended article type

**Long-form roundup (3,000–4,000 words)** structured as:

1. AU regulatory primer up top (3 paragraphs, plain-English) — "Before you buy: CASA registration + commercial accreditation in 2026". Becomes the SEO anchor for "casa drone registration content creator" long-tail.
2. Buyer-flowchart (travel YouTuber? real estate / property? FPV cinematic? professional cinema?) → recommended SKU.
3. Comparison table across all 5 picks with AU price / sensor / flight time / weight class (CASA tier) / standout / watch-out columns.
4. 5 product cards + 1 non-DJI callout.
5. CASA registration walkthrough (~600 words) — separate H2; this becomes a self-standing page asset.
6. "What footage style does each drone unlock" section — visual + written — owned by us, not competitors.
7. FAQ targeting "people also ask".
8. Schema.org `Review` + `ItemList` + `HowTo` (for the CASA registration walkthrough) markup.

### Social content potential

- **Pinterest pins (12+):** Drone tier ladder infographic, per-model vertical pins, "CASA registration step-by-step" pin (evergreen, high save rate), "DJI lineup 2026 chart" pin.
- **Instagram:** 1 carousel (10 cards), 3 Reels (60s each: "DJI drone tier guide in 60 seconds", "CASA in 30 seconds", "Mavic 4 Pro vs Air 3S — which one for you"), Stories with poll stickers.
- **Threads / X:** thread on "what nobody tells you about flying drones for content in Australia" (CASA explainer, plain-English).
- **YouTube Shorts** (if `gs-social` cron supports): 60s explainers for each comparison.

---

## B. Content Brief

### Primary keyword
`best drone for content creators 2026 australia` (or shorter variant `best drone australia 2026` if pre-publish keyword pull shows higher volume)

### Search intent
**Commercial-investigational with regulatory overlay.** Buyer is 2–6 weeks from purchase, has narrowed to DJI in most cases, and needs both the SKU recommendation AND the AU regulatory clarity to commit. Higher research depth than audio/TV buyers.

### Secondary keywords
- best dji drone for video 2026
- dji mavic 4 pro vs air 3s
- best drone for youtube australia
- casa drone registration content creators
- dji mini 4 pro review australia
- best drone under 250g australia commercial
- dji avata 2 vs mavic
- best drone for real estate australia

### Audience
- Primary: AU content creator (YouTube / Instagram / TikTok / freelance video), 25–45, monetizing footage, considering first or upgrading drone, household tech budget AU$1,500+.
- Secondary: AU real estate agent / property videographer needing aerial footage for listings.
- Tertiary: AU enthusiast / hobbyist who plans to monetize footage in the next 12 months (i.e. about to enter commercial territory under CASA).

### Recommended title options (3–5)
1. **The Best Drones for Content Creators in Australia (2026)**
2. Best DJI Drone for Content Creators in Australia 2026 — Mini, Air, Mavic & Avata Compared
3. Best Drone for YouTube & Real Estate in Australia (2026 Buyer's Guide)
4. The Best Content Creator Drones in 2026 (with CASA Registration Guide)
5. DJI Mavic 4 Pro vs Air 3S vs Mini 4 Pro: Best Drone for AU Creators 2026

**Recommended:** option 4. Front-loads the keyword, signals AU-specific (CASA), differentiates from generic US lists.

### Outline

```
H1: The Best Content Creator Drones in 2026 (with CASA Registration Guide)

Lede (60 words): name the AU creator, name CASA reality, name the price + content-style decision, name what this article does.

[Affiliate disclosure block]

H2: Before you buy — CASA registration in plain English
- Hobby vs commercial (monetized footage = commercial)
- Drone registration: AU$40/year, all weights commercial
- Free RPA Operator Accreditation under 2kg commercial
- RePL when needed (over 2kg / outside excluded category)
- Link to CASA primary source

H2: Pick by intended footage
- Travel / vlog → DJI Mini 4 Pro (sub-250g, easy)
- Real estate / property → DJI Air 3S (1-inch sensor, fast)
- Professional cinema / commercial → DJI Mavic 4 Pro
- FPV / dynamic action → DJI Avata 2

H2: Quick comparison table
[Sortable: Model | Class | Sensor | Flight time | Weight | CASA tier | AU Price (verified date) | Best for]

H2: 5 picks + 1 alternate
- Best overall (DJI Mavic 4 Pro)
- Best mid-tier (DJI Air 3S)
- Best sub-250g (DJI Mini 4 Pro)
- Best FPV (DJI Avata 2)
- Best stretch / "if not DJI" alternative (Autel EVO Lite+ or similar)
- (If shipping by publish date) DJI Mini 5 Pro callout

H2: How to register your drone with CASA — step-by-step
- 600-word walkthrough; HowTo schema
- Screens / forms / what to expect
- Cost + renewal cadence

H2: What footage style each drone unlocks
- Sensor + lens + flight envelope explained as content style
- Stop talking specs, start talking footage

H2: FAQ
- "Do I need a licence to fly a drone in Australia?"
- "Which DJI drone is best for YouTube?"
- "Can I fly Mavic 4 Pro in city parks Australia?"
- "What's the cheapest legal drone for monetized content in AU?"
- (~10 questions, FAQPage schema)

H2: How we keep this updated
- Quarterly refresh badge; CASA-rule-change watch

[Final disclosure + ABN footer]
```

### Product list logic
- 5 DJI picks covering each price tier + each footage style. 1 non-DJI alternate for the editorial-honesty callout.
- Order: Mavic 4 Pro first (highest AOV, highest commission per click), Air 3S second (best volume seller for the cluster), Mini 4 Pro third (already in catalog, AU$759-band, lowest barrier), Avata 2 fourth (different use case, niche-but-loyal audience), Autel callout last.
- Mavic 4 Pro 512GB Creator Combo positioned as upsell within the Mavic 4 Pro card — stacks AOV.
- Drop any model where AU stock can't be verified within 14 days of publish.

### Internal links
- Existing live: `/product/dji-mini-4-pro-drone-with-rc-2-controller`, `/product/dji-osmo-action-5-pro-adventure-camera`, `/product/dji-osmo-pocket-4-gimbal-camera`, `/product/insta360-x4-360-action-camera`, `/product/gopro-hero13-black-action-camera`
- Category page: `/category/outdoor-tech` (drones currently file here per data.ts; review with `gs-catalog`)
- (When written) `/blog/dji-mavic-4-pro-vs-air-3s-2026`
- (When written) `/blog/casa-drone-registration-content-creators-australia`
- (When written) `/blog/best-action-cameras-vs-drones-2026`

### CTA strategy
- **Primary CTA (every product card):** "Check current AU price on Amazon" — dual-tag-aware affiliate link.
- **Secondary CTA:** Brand-direct externalUrl flagged for DJI store (post `gs-affiliates` direct-brand signup if AU eligibility exists).
- **Tertiary CTA:** "Save the CASA registration walkthrough" Pinterest button — evergreen save magnet.

### Schema.org recommendation
- `Article` / `BlogPosting` page wrapper.
- `ItemList` containing 5 `Product` entries.
- Each `Product` with `aggregateRating` only if verified review counts available — otherwise omit.
- `HowTo` schema on the CASA registration walkthrough section (rare and high-impact for "people also ask").
- `FAQPage` schema on FAQ section.
- `BreadcrumbList`.
- `LocalBusiness` (Gadget Style Australia, ABN 75185709936) referenced via `publisher`.

### Risks / items to verify before publish

1. **Mavic 4 Pro AU pricing + AU availability** — Amazon AU stock variability + DJI AU direct pricing must both be checked. Two retailer verification minimum.
2. **DJI Mini 5 Pro launch status** — only include if shipping by publish date. As of May 2026 it's rumor-level per DroneXL.
3. **Autel EVO Lite+ AU SKU** — verify before including; Autel AU distribution is patchier than DJI.
4. **CASA registration cost** — verified AU$40/year (commercial, all weights) per current CASA + uasnt.com.au pages. Re-verify within 7 days of publish in case CASA updates fees.
5. **All prices live-checked within 24 hours of publish.** Add `"Last verified: YYYY-MM-DD"` per card.
6. **Compliance:** never invent personal flight testing. No CASA-policy advice beyond what CASA publishes — link out, don't editorialize.
7. **ACCC affiliate disclosure** — block above the fold.
8. **Age + privacy claim risks** — drones over private property + CASA's privacy guidance: link to CASA + Office of the Australian Information Commissioner; do not give legal advice.

---

## C. Standard Operator Wrapper

### Executive summary
This cluster captures the highest-AOV-per-click category in our catalog after TVs. DJI Mavic 4 Pro Creator Combo is a four-figure (USD/AUD) commission opportunity per single sale, and the Air 3S + Mini 4 Pro carry the volume. The article also unlocks a permanent CASA-registration explainer asset that ranks for a niche AU keyword competitors don't address — real moat for AU traffic. Expected commercial impact: AU$50–$400/month from this article at year-1 traffic, with significant upside as the catalog adds the Mavic 4 Pro (currently absent from data.ts).

### Deliverables (this document)
- Product Opportunity Report (Section A)
- Content Brief (Section B)
- Outline + CASA registration walkthrough scope + FAQ + schema map + internal-link plan
- Risk + verification checklist (incl. CASA regulation checks)

### Assumptions and verification points
- DJI Mavic 4 Pro, Mavic 4 Pro 512GB Creator Combo, Air 3S, Mini 4 Pro, Avata 2 all **verified as current 2026 SKUs** (Engadget, The Drone Girl, DroneXL, Amazon US listings).
- AU pricing for Mavic 4 Pro, Air 3S, Avata 2: **NOT verified in this pass** — must be verified before publish.
- DJI Mini 5 Pro: rumor / unconfirmed — only include if shipping at publish date.
- Autel EVO Lite+ AU SKU: **NOT verified** — must be checked.
- CASA registration cost AU$40/year (commercial, all weights): **VERIFIED** (May 2026, uasnt.com.au + CASA references).
- Search volume estimates are modeled (need GSC + Google Trends confirmation).
- Conversion rate modeling assumes 2% Amazon electronics commission + dual-tag AU launch within 90 days.
- **No fabricated specs, ratings, review counts, prices, flight tests, or testing claims.** All dynamic data marked re-verify.

### Next actions (priority order)
1. **Add DJI Mavic 4 Pro + DJI Mavic 4 Pro 512GB Creator Combo + DJI Air 3S + DJI Avata 2 as drafts** to data.ts via `pnpm gf:sync` or manual catalog add (Path A in CLAUDE.md). Owner: gs-catalog. ETA: 1.5 hours.
2. **Verify AU availability + pricing** for the 4 new SKUs via amazon.com.au + DJI AU + drone specialist retailers (D1 Lounge, DroneFly). Owner: gs-catalog. ETA: 1 day.
3. **Verify CASA registration cost + accreditation pathway** as of publish-week. Owner: gs-content. ETA: 30 min.
4. **Draft article** following this brief, including the standalone CASA HowTo block. Owner: gs-content. ETA: 5–7 hours of writing + 1 hour of regulatory fact-checking.
5. **Build HowTo schema injector** on the blog post template (new schema type vs TVs/audio clusters). Owner: gs-growth. ETA: 1 hour.
6. **Reuse ComparisonTable.tsx** from TV / audio clusters. Owner: gs-growth. ETA: 0 (shared).
7. **Flag direct-brand affiliate signup**: DJI (Awin / direct AU partnerships) via `gs-affiliates`. ETA: see direct-brand strategy doc.


---

# 10. Supporting doc — Content cluster — premium home audio
*Source: `docs/cluster-premium-home-audio.md`. Supporting detail — defer to the System Brief (section 2) on any conflict.*

# Cluster: Premium home audio systems 2026 (AU market)

**Author:** gs-growth | **Date:** 2026-05-06 | **Status:** Draft strategy + brief, pending product verification

---

## A. Product Opportunity Report

### Topic cluster
**Premium home audio systems for the AU buyer in 2026.** Long-tail expansion: "best smart speaker for music 2026 australia", "Sonos Era 300 vs Apple HomePod 2", "best wireless speaker system australia under $3000", "Sonos Arc Ultra vs Bose Smart Soundbar", "B&W Zeppelin 2026 review", "KEF LSX II AU price".

The cluster sits one rung above the casual Bluetooth-speaker market and one rung below dedicated separates / amp + bookshelf builds. Target: "I want my whole apartment / open-plan house to sound great, I do not want a rack of components, I will spend AU$500–AU$3,500 to make this happen."

### Buyer problem
Australian buyers shopping the premium-streaming / wireless speaker tier face four real confusions:

1. **Ecosystem lock-in.** Apple HomePod 2 is excellent but functionally Apple-only (AirPlay 2, no Spotify Connect on-device, no Tidal Connect). Sonos works with everything but has its own app friction. Bose is a third silo. Buyer needs help picking a *system* not a *device*.
2. **Spatial audio confusion.** Sonos Era 300 / HomePod 2 / Apple Music spatial / Dolby Atmos Music — what's actually a meaningful upgrade vs marketing? Most "spatial audio" claims need plain-English unpacking.
3. **Soundbar vs separates vs all-in-one stereo.** Sonos Arc Ultra (soundbar, surround anchor), KEF LSX II (powered stereo, single-room), B&W Zeppelin (single-cabinet wireless). Three different shapes for the same problem; AU buyer rarely sees them compared cleanly.
4. **AU pricing reality.** Sonos AU pricing is ~30% above US (Era 300 = AU$749 vs US$449). KEF LSX II = ~AU$2,089. Apple HomePod 2 = AU$479. Pricing skew matters because the AU buyer's "premium" budget = US "entry-premium" budget.

### Product candidates (5–7 specific models)

**STATUS LEGEND:** **VERIFIED** = AU SKU + AU pricing confirmed via current source. **ASSUMED** = product exists, AU specifics need verification before publish. All prices are "verify before publishing" — premium audio AU pricing changes with FX and quarterly retailer promos.

| Model | Format | Why it's on the list | Status |
|---|---|---|---|
| **Sonos Era 300** | Smart speaker, Dolby Atmos / spatial audio | Sonos's spatial-audio anchor. The "is spatial audio worth it" comparison product. AU$749. | **VERIFIED AU price AU$749** (What Hi-Fi, Trusted Reviews, May 2026) |
| **Sonos Era 100** | Smart speaker, stereo | Already in our catalog (id 10, live). Entry-tier Sonos pick. | **VERIFIED — already live on our site** |
| **Sonos Arc Ultra** | Premium Atmos soundbar | Top-tier soundbar pick for the home-theatre buyer. AU$1,499 (Sonos AU site, current). | **VERIFIED AU price AU$1,499** (Sonos AU + What Hi-Fi May 2026) |
| **Sonos Beam (Gen 2)** | Compact Atmos soundbar | Already in our catalog (id 21, live). Mid-tier soundbar anchor. | **VERIFIED — already live** |
| **Apple HomePod 2** | Smart speaker, AirPlay 2-first | AU$479 launch price. Best-in-class for Apple-household buyer. | **VERIFIED AU price AU$479** (Trusted Reviews, What Hi-Fi May 2026) |
| **Bose Smart Soundbar 900 / Smart Ultra Soundbar** | Premium Atmos soundbar | Bose's flagship single-cabinet Atmos pick. Often the "I don't want Sonos lock-in" alternative. | **ASSUMED** — verify AU SKU + price (couldn't confirm AU price in this research pass) |
| **KEF LSX II** | Powered stereo wireless speakers (pair) | Real hi-fi pair with HDMI ARC; competes with Sonos Arc on price (~AU$2,089) but delivers stereo over surround. | **VERIFIED AU pricing reference ~AU$2,089** (Darko Audio Feb 2026); confirm current AU retailer list |
| **B&W Zeppelin (current gen)** | Single-cabinet wireless premium stereo | The aesthetic + statement pick. ~AU$1,099–AU$1,299 historically. | **ASSUMED** — verify current AU model + price |

We recommend **5 picks across 3 formats** + 2 "consider this instead" callouts. Same logic as the TV cluster: don't pad to 10. Force the buyer's decision.

### Monetization potential

**Math (pre-verification):**
- **AOV (commission base):** AU$479–AU$2,089 per unit. Cluster average ~AU$900–$1,200.
- **Per-conversion commission (Amazon US tag, current):** ~AU$18–$42 at 2% Amazon electronics rate, varying by SKU (note: Amazon AU stocks Sonos + Bose; Apple HomePod 2 is Apple-direct; KEF + B&W frequently brand-direct or specialist retailer in AU — flag for `gs-affiliates` direct-brand signups via CJ / Impact / Partnerize).
- **Realistic monthly conversions at year-1 traffic:** 3–10 sales/month if ranking page 1 for the comparison long-tails. Spatial-audio / smart-speaker buyers convert at higher CTR than TV buyers (smaller commitment, no delivery friction in 65" TV terms).
- **Expected monthly revenue:** AU$50–$400 from the cluster article alone.

**Multiplier:** the audio cluster has *more* content surface than the TV cluster — Sonos vs HomePod (head-to-head), best soundbar under $1000, best stereo speakers under $2000, best speaker for vinyl, etc. This is a 6-article hub, not a single roundup.

### SEO potential

- **Primary keyword:** "best home audio system 2026" — modeled monthly AU search volume: 500–1,200 (verify GSC + Google Trends).
- **Long-tail (higher conversion):** "sonos era 300 vs homepod 2", "best soundbar australia 2026", "sonos arc ultra review", "kef lsx ii vs sonos arc".
- **Competitor density:** HIGH on head terms. What Hi-Fi (UK), Trusted Reviews, Tom's Guide, RTINGS rank globally. AU-specific: Reviews.org.au, Choice (paywalled), GadgetGuy.com.au.
- **Our angle (differentiation):**
  1. **AU-pricing-aware** — AU buyers pay 30% more on Sonos; What Hi-Fi quotes UK pricing. Real edge.
  2. **Format-agnostic** — most articles are "best soundbar" OR "best smart speaker" OR "best stereo pair." We compare across formats for the same buyer problem. That's a content gap.
  3. **Spec-literate voice** — Wired/Engadget register, no "this speaker totally rocks" filler.
  4. **Spatial audio plain-English explainer** that's actually correct (Atmos Music vs Apple Music spatial vs Sonos's Trueplay; most consumer articles conflate them).

### Competition / risk notes

- **What Hi-Fi owns deep audio review SEO.** Don't try to out-review them. Compete on AU specificity + cross-format comparison.
- **Trusted Reviews + Tom's Guide** are the comparison-content benchmark. Match their structure, beat them on AU pricing currency.
- **Sonos pricing volatility** — Sonos AU has run "Black Friday early" + "EOFY" promos at meaningful discounts. Schedule monthly link-rot + price-check.
- **AU stock churn on KEF LSX II + B&W Zeppelin** — specialist retailer dependent. Flag any product that can't ship within 14 days.
- **Compliance risk:** never invent reviewer count or "we tested" language per `feedback_working_practices.md` rule 14. Quote published reviews with attribution.

### Recommended article type

**Long-form roundup hub (2,800–3,500 words)** structured as:

1. Buyer-decision flowchart up top (Apple-household? Want surround? Want stereo? Want "one thing that just works"?)
2. Comparison table across all 5 picks with format / AU price / standout / weakness columns.
3. 5 product cards + 2 "consider this instead" callouts.
4. Spatial audio deep-dive (Atmos Music vs Apple Music spatial vs Sonos Trueplay) — own this section, it's a real SEO gap.
5. "Building a Sonos system over time" ladder (Era 100 → Beam Gen 2 → Arc Ultra → Sub) — cross-sells the catalog without forcing it.
6. FAQ targeting "people also ask".
7. Schema.org `Review` + `ItemList` markup.

### Social content potential

- **Pinterest pins (12+):** Format-vs-format comparison pin (high CTR), per-model vertical pins, "Sonos system ladder" infographic pin, "Apple HomePod 2 vs Sonos Era 300 in 60 seconds" idea pin.
- **Instagram:** 1 carousel (8 cards: cover, 5 model cards, format-comparison card, CTA), 3 Reels (30–45s each: "spatial audio explained", "Sonos vs HomePod showdown", "AU$2,000 home audio under 1 minute"), Story poll series.
- **Threads / X:** thread on "why Sonos is 30% more expensive in Australia" — explainer format, links back.

---

## B. Content Brief

### Primary keyword
`best home audio system 2026 australia` (or the format-specific variant `best smart speaker australia 2026` if that ranks higher in pre-publish keyword pull)

### Search intent
**Commercial-investigational.** The buyer has a budget and is ready to buy within 2–4 weeks but hasn't picked a format. Their question is half "what should I buy" and half "what category should I be shopping."

### Secondary keywords
- best smart speaker 2026 australia
- best soundbar 2026 australia
- sonos era 300 vs homepod 2
- sonos arc ultra review
- kef lsx ii vs sonos
- best wireless speakers under $2000 australia
- spatial audio explained
- dolby atmos music vs apple music spatial

### Audience
- Primary: AU adult, 30–55, household income AU$100k+, music + occasional movies, no rack of separates, wants whole-room or whole-apartment audio.
- Secondary: AU Apple-household buyer evaluating HomePod 2 vs leaving the ecosystem.
- Tertiary: AU home-theatre buyer who already has a TV, now needs audio that matches the picture.

### Recommended title options (3–5)
1. **The Best Premium Home Audio Systems in Australia (2026)**
2. Sonos vs Apple vs Bose vs KEF: Best Premium Home Audio in Australia 2026
3. Best Home Audio System in Australia (2026): Smart Speakers, Soundbars & Stereo Pairs Compared
4. The 7 Best Premium Home Audio Picks for 2026 — AU Buyer's Guide
5. Best Premium Home Audio 2026: One Speaker, One Soundbar, or One Stereo Pair?

**Recommended:** option 3. Front-loads the keyword, names the three formats, AU-specific.

### Outline

```
H1: The Best Premium Home Audio Systems in Australia (2026)

Lede (60 words): name the AU buyer, the three-format choice, the AU pricing reality, what this article does.

[Affiliate disclosure block]

H2: Decide first — what format do you actually need?
- Apple-household → start with HomePod 2
- Want one cabinet that does everything → B&W Zeppelin / Bose Smart Soundbar
- Want a system you can grow → Sonos Era 100 → Beam Gen 2 → Arc Ultra → Sub
- Want stereo / hi-fi → KEF LSX II

H2: Quick comparison table
[Sortable: Model | Format | AU Price (verified date) | Standout | Watch out for | Best for]

H2: 5 picks + 2 alternates
- Best smart speaker overall (Sonos Era 300)
- Best smart speaker for Apple households (HomePod 2)
- Best premium soundbar (Sonos Arc Ultra)
- Best compact soundbar (Sonos Beam Gen 2)
- Best stereo pair / hi-fi alt (KEF LSX II)
- Consider this instead: B&W Zeppelin (single-cabinet aesthetic pick)
- Consider this instead: Bose Smart Soundbar 900 (Bose-ecosystem alt)

H2: Spatial audio — what's real, what's marketing
- Atmos Music vs Apple Music spatial vs Sonos Trueplay
- Plain English, ~400 words, with content tier callouts

H2: Building a Sonos system over time
- Visual ladder; how to grow without throwing away purchases

H2: AU pricing — why Sonos costs 30% more here
- 250 words; honest explainer (FX + AU retailer markup + freight)

H2: FAQ
- "Is Sonos worth it in 2026?", "Can I mix Sonos and HomePod?", "Best speaker for vinyl Australia?", etc.

H2: How we keep this updated
- Quarterly refresh badge

[Final disclosure + ABN footer]
```

### Product list logic
- 5 primary picks across 3 formats (smart speaker, soundbar, stereo) so the article serves three buyer profiles in one article.
- Order: Sonos Era 300 first (highest-volume search match), HomePod 2 second (Apple-household intent), Arc Ultra third (highest AOV soundbar), Beam Gen 2 fourth (volume seller, already live in our catalog), KEF LSX II fifth (stretch-AOV pick).
- 2 alternates flagged as "consider this instead" — not full cards, just 100-word callouts.
- Drop any model where AU stock can't be verified within 14 days of publish.

### Internal links
- Existing live: `/product/sonos-era-100-wireless-smart-speaker`, `/product/sonos-beam-gen-2-smart-soundbar`, `/product/bose-quietcomfort-ultra-earbuds` (pair article: "best premium audio without speakers — headphones edition")
- Category page: `/category/audio`
- (When written) `/blog/best-soundbars-under-1000-australia` — pair page
- (When written) `/blog/sonos-vs-homepod-2026` — head-to-head deep-dive

### CTA strategy
- **Primary CTA (every product card):** "Check current AU price on Amazon" (dual-tag-aware).
- **Secondary CTA:** Brand-direct externalUrl flagged for KEF / B&W (post `gs-affiliates` Impact / CJ signup).
- **Tertiary CTA:** "Save for later" Pinterest button on the comparison table.

### Schema.org recommendation
- `Article` / `BlogPosting` page wrapper.
- `ItemList` containing 5 `Product` entries.
- Each `Product` with `aggregateRating` only if verified review counts available — otherwise omit.
- `FAQPage` schema on FAQ section.
- `BreadcrumbList`.
- `LocalBusiness` (Gadget Style Australia, ABN 75185709936) referenced via `publisher`.

### Risks / items to verify before publish

1. **AU pricing for Bose Smart Soundbar 900 + B&W Zeppelin** — could not verify in this research pass. Verify before including. If can't verify, drop them and use only the 5 primary verified picks.
2. **All prices live-checked within 24 hours of publish.** Add `"Last verified: YYYY-MM-DD"` per card.
3. **Sonos Era 300 spatial audio claim** — verify Apple Music spatial + Atmos Music compatibility status as of publish date (Sonos has updated Atmos support twice).
4. **HomePod 2 ecosystem caveats** — verify current Spotify Connect status (was added late 2024, status as of 2026 should be confirmed).
5. **Amazon AU tag readiness** — currently US tag. Flag if AU traffic likely, dual-tag fix per `reference_amazon_au_us_strategy.md`.
6. **Compliance:** no fabricated review counts, no "I tested this", quote published reviews with attribution.
7. **ACCC affiliate disclosure** — block above the fold.

---

## C. Standard Operator Wrapper

### Executive summary
This cluster captures the AU buyer at the AU$500–AU$2,000 premium home audio decision. AOV per click-through-sale falls between the TV cluster (higher) and the headphone cluster (lower) but volume is significantly higher — audio buyers purchase faster than TV buyers and convert at higher CTR. Expected commercial impact: AU$50–$400/month from this article at year-1 traffic, scaling. The article also unlocks 5+ follow-on comparison articles ("Sonos vs HomePod", "best soundbar under $1000 AU", etc.) without redoing the research.

### Deliverables (this document)
- Product Opportunity Report (Section A)
- Content Brief (Section B)
- Outline, FAQ scope, schema map, internal-link plan
- Risk + verification checklist

### Assumptions and verification points
- Sonos Era 300 (AU$749), Sonos Arc Ultra (AU$1,499), Apple HomePod 2 (AU$479), KEF LSX II (~AU$2,089) — verified via 2026 What Hi-Fi / Trusted Reviews / Sonos AU / Darko Audio sources.
- Bose Smart Soundbar 900 + B&W Zeppelin AU pricing — **NOT verified in this pass** — must be confirmed before publish.
- Search volume estimates are modeled (need GSC + Google Trends confirmation).
- Conversion rate modeling assumes 2% Amazon electronics commission and dual-tag AU launch within 90 days.
- **No fabricated specs, ratings, review counts, prices, or testing claims.** All dynamic data marked re-verify.

### Next actions (priority order)
1. **Verify AU availability + pricing** for Bose Smart Soundbar 900 + B&W Zeppelin via amazon.com.au + brand AU sites. Owner: gs-catalog. ETA: 1 day.
2. **Run `pnpm gf:sync` filtered to home-audio terms** to pull GF-curated audio drafts into our catalog. Owner: gs-catalog. ETA: 30 min.
3. **Add Sonos Era 300, Sonos Arc Ultra, Apple HomePod 2 as drafts** to data.ts via `gf:sync` or manual catalog add (Path A or B from CLAUDE.md). Owner: gs-catalog. ETA: 1 hour.
4. **Draft article** following this brief. Owner: gs-content. ETA: 4–6 hours of writing + 1 hour fact-check.
5. **Build (or reuse) ComparisonTable.tsx** if not already shared from the TV cluster work. Owner: gs-growth. ETA: 1 hour (likely shared).
6. **Add FAQPage + ItemList + Product schema** to blog post template (also shared with TV cluster). Owner: gs-growth.
7. **Flag direct-brand affiliate signups**: KEF + B&W (Impact / CJ / Partnerize) via `gs-affiliates`.


---

# 11. Supporting doc — Content cluster — TVs under $2000
*Source: `docs/cluster-tvs-under-2000.md`. Supporting detail — defer to the System Brief (section 2) on any conflict.*

# Cluster: Best 4K OLED TVs under $2,000 (AU market, 2026)

**Author:** gs-growth | **Date:** 2026-05-05 (updated 2026-05-06) | **Status:** Draft strategy + brief, pending product verification

> **2026-05-06 update:** Verified market-research pass. LG C5, Samsung S90F, and Sony Bravia 8 confirmed as the current AU OLED reference set per Tom's Guide AU, TechRadar AU, RTINGS (May 2026 lists). Hisense U8Q and TCL C8K confirmed as current premium mini-LED competitors at ~AU$2,695-$2,699 launch (likely below AU$2,000 in 65" by EOFY 2026). Verified-vs-assumed status flagged inline in the candidate table.

---

## A. Product Opportunity Report

### Topic cluster
**Best 4K OLED TVs under AU$2,000 (2026 buying season).** Long-tail expansion: "best OLED for PS5 under $2000 AU", "LG C-series vs Sony Bravia", "OLED vs QD-OLED 2026 buying guide", "65 inch OLED under $2000 Australia".

### Buyer problem
Australian buyers shopping the AU$1,500–$2,000 OLED bracket are choosing a panel they will keep for 5–8 years. They face four genuine confusions:

1. WOLED vs QD-OLED — LG's white-subpixel architecture vs Samsung Display's quantum-dot OLED, a real picture-quality trade-off, not marketing.
2. HDMI 2.1 / 4K@120Hz / VRR — non-negotiable for PS5 / Xbox Series X / RTX 40-series PC owners; older OLEDs (LG C7, B-series, lower TCL/Hisense) cap at HDMI 2.0.
3. Brightness ceiling — OLEDs trail high-end mini-LED on peak HDR brightness; matters more in bright AU living rooms with western sun exposure.
4. Hisense and TCL have entered the OLED tier at meaningfully lower prices but with younger panel pipelines and less-mature processors. Risk-vs-value question.

This buyer has researched. The article must be spec-literate or we lose them in the first scroll.

### Product candidates (5–7 specific TV models)

**STATUS LEGEND:** verify-AU = needs amazon.com.au + AU brand-direct availability check before publish. All prices = "verify before publishing" — Australian electronics pricing fluctuates weekly.

| Model | Panel tech | Why it's on the list | Status |
|---|---|---|---|
| **LG C5 OLED 65"** | WOLED, α11 Gen 2 processor; HDMI 2.1 x4 with 4K/144Hz, VRR, Game Optimizer | LG C-series is the default OLED reference. C5 is named "best overall" by Tom's Guide AU + TechRadar AU 2026 lists. | **VERIFIED current AU SKU** (Tom's Guide AU, TechRadar AU, May 2026); price-band verify before publish |
| **LG C5 OLED 48"** | Same as 65" | Best compact OLED; fits smaller AU apartments + bedroom setups. Price often well under AU$2,000. | **VERIFIED** as current AU SKU; **ASSUMED** sub-$2,000 — verify AU price |
| **Sony Bravia 8 OLED (55"/65")** | WOLED, XR Cognitive Processor; Dolby Vision IQ; lower brightness than QD-OLED | Sony's processing wins motion + skin-tone naturalism. Movie-first buyer's pick. | **VERIFIED** as named in 2026 AU "best TV" lists; price + 65" sub-$2k availability needs verification |
| **Samsung S90F OLED (55"/65"/77")** | QD-OLED panel (65" + 77"), 144Hz, no Dolby Vision (HDR10+ only) | Samsung QD-OLED leads on HDR brightness + color volume. RTINGS named S90F "best TV under $2000 tested" (US). | **VERIFIED** model exists; AU sub-$2k availability in 65" needs verify; **flag DV omission clearly** |
| **Hisense U8Q (65")** *(mini-LED, included as alternative)* | Mini-LED, ~2,851 nits HDR peak (10% window) | Aggressive AU pricing (AU$2,699 launch, expected to drop). Real OLED competitor at the brightness layer. | **VERIFIED launch price AU$2,699** (May 2026, What Hi-Fi); track price drops |
| **TCL C8K (65")** *(mini-LED, included as alternative)* | QD-Mini LED; 4,500 nits peak, 45M:1 contrast (manufacturer spec) | AU$2,695 launch; refined balance + value pick per What Hi-Fi. Bright-room AU buyer's strongest option. | **VERIFIED launch price AU$2,695** (May 2026, What Hi-Fi + TCL AU site) |
| **LG B5 OLED 65"** *(budget OLED option)* | Entry WOLED, lower-tier processor | Often the only OLED that clears the AU$2,000 ceiling in 65". | **ASSUMED** still current AU SKU; verify availability + price before publish |

We recommend **5 OLED picks + 2 mini-LED comparison anchors**. Don't pad the list with 10 models — that's a Wirecutter-style approach that buries the decision.

### Monetization potential

**Math (pre-verification, modeled at year-1 organic traffic):**

- **AOV (commission base):** AU$1,400–$1,900 per TV × Amazon Associates electronics rate (currently ~2% on amazon.com — needs verification for amazon.com.au tier when AU Associates is approved per `reference_amazon_au_us_strategy.md`).
- **Per-conversion commission:** AU$28–$38 (US tag, current state) → AU$28–$38 if dual-tag goes live.
- **Realistic monthly conversions at year-1 traffic:** 2–8 sales/month if article ranks page 1 for the primary keyword. 0–2 sales/month at page 2.
- **Expected monthly revenue:** $50–$300 from the cluster article alone, scaling with traffic.

**Why this cluster matters even at modest conversion:** TVs are the single highest-AOV category in mainstream consumer electronics. One TV sale = ~50× the commission of an Echo Dot sale. Click-thru-sale value here is the strongest lever in the catalog.

**Multiplier:** comparison content ("LG C5 vs Sony Bravia 8 II") supports the roundup with internal-linked deep-dive articles, each capturing its own long-tail keyword cluster. Build out 3–5 follow-up articles within 60 days.

### SEO potential

- **Primary keyword:** "best 4k oled tv under 2000" — modeled monthly search volume in AU: 200–500 (need GSC + Google Trends verification).
- **Secondary keywords:** "best oled tv australia 2026", "oled tv 65 inch under 2000", "lg c5 vs sony bravia 8", "best oled for ps5 australia".
- **Competitor density:** HIGH. Wirecutter, RTINGS, TechRadar, CNET, PCMag, Tom's Guide all rank for core "best OLED" terms globally. AU-specific results show Choice.com.au, Trusted Reviews, Reviews.org.au.
- **Ranking difficulty:** HIGH on the head term. MEDIUM-HIGH on AU-specific long-tail variants ("under $2000 australia", "best oled tv australia 2026").
- **Our angle (differentiation):**
  1. **AU-specific pricing + availability** (Wirecutter is US-first; RTINGS doesn't track AU pricing; Choice.com.au paywalls reviews).
  2. **Spec-literate hardware-first voice** — the Wired/Engadget/RTINGS register the user has set as the brand voice.
  3. **Up-to-date 2026 models** at time of publish — most ranking content still references 2024 models.
  4. **PS5 / Xbox Series X / Apple TV 4K configuration callouts** that mass-market reviewers skip.

### Competition / risk notes

- **RTINGS owns the "best OLED" SERP globally.** Their methodology (lab-measured contrast, response time, input lag) cannot be replicated without hardware investment. Don't try. Compete on AU specificity and recency.
- **Wirecutter** ranks via NYT domain authority. Compete on freshness — they update annually; we can update quarterly.
- **TechRadar / CNET** publish thin best-of articles refreshed for SEO. Match their structure, beat them on technical depth.
- **Amazon AU stock churn:** OLED TVs come in and out of amazon.com.au stock weekly. Schedule monthly link-rot checks via a stock-availability script (open issue: build `scripts/check-amazon-stock.ts`).
- **Burn-in claim risk:** OLED burn-in is real for static-content viewers. Be honest. Don't oversell to gamers without flagging it.
- **Compliance risk (Amazon Associates):** never publish "I tested this" or invented review counts. Per `feedback_working_practices.md` rule 14.

### Recommended article type

**Long-form roundup (2,500–3,500 words)** with:

1. Comparison table at top (model, panel tech, refresh rate, HDMI 2.1 ports, peak brightness, AU price, our pick rating).
2. "Buyer profile" section before product cards — gamer / cinephile / bright-room / budget.
3. 5 OLED + 2 mini-LED product cards with: hero image, key specs, "best for" line, "what we'd flag" line, AU-availability note, affiliate CTA.
4. Technical deep-dive section: WOLED vs QD-OLED, HDMI 2.1 explained, what 4K@120Hz actually means.
5. FAQ section: 8–10 questions targeting "people also ask" SERP features.
6. "When to wait" section — sales calendar for AU electronics (EOFY June, Black Friday November, Boxing Day December).
7. Schema.org `Review` + `ItemList` markup.
8. Affiliate disclosure block at top (per Amazon Associates terms + ACCC guidelines for AU).

### Social content potential

- **Pinterest pins (12+ per article):**
  - Comparison-table screenshot pin (high CTR format).
  - Per-model vertical pins (5–7 of them).
  - "OLED vs mini-LED" infographic pin.
  - "Best OLED for PS5" cluster pin.
  - "AU electronics sales calendar" pin (evergreen).
- **Instagram:**
  - 1 carousel post (8 cards): cover, 5 model cards, OLED-vs-mini-LED card, CTA card.
  - 3 Reels (30–45s each): "AU$2k OLED in 30 seconds", "WOLED vs QD-OLED in 60 seconds", "PS5 OLED checklist".
  - 5 Stories series with poll stickers.
- **Threads / X:** thread of 6–8 posts breaking down the WOLED-vs-QD-OLED choice.

---

## B. Content Brief

### Primary keyword
`best 4k oled tv under 2000` (target AU intent — append "australia" or "AU" in title/H1 if validation shows local pack opportunity)

### Search intent
**Commercial-investigational.** Buyer has decided they want OLED, has set a budget ceiling, wants a curated shortlist with a clear "if X, buy Y" decision tree. They are not in early research; they are 1–2 weeks from purchase.

### Secondary keywords
- best oled tv australia 2026
- best oled tv under $2000 australia
- lg c5 vs sony bravia (and similar pairwise comparisons)
- best 65 inch oled tv 2026
- best oled tv for ps5 / xbox series x
- qd-oled vs woled
- hisense oled vs lg oled
- 4k oled vs mini led

### Audience
- Primary: AU adult, 28–55, household income AU$80k+, considering a TV upgrade, has owned a TV for 5+ years.
- Secondary: AU gamer with a current-gen console, prioritizing 4K@120Hz + VRR.
- Tertiary: cinephile / home theatre hobbyist, prioritizing Dolby Vision + black levels.

### Recommended title options (3–5)
1. **Best 4K OLED TVs under $2,000 in Australia (2026)**
2. The 7 Best OLED TVs Under $2,000 — AU Buyer's Guide (2026)
3. Best OLED TVs Under $2,000 in Australia: LG, Sony, Samsung & Hisense Compared
4. The Best OLED TV Under $2,000 in 2026 (Tested AU Models)  ← **avoid "tested" unless we actually test; per compliance rules**
5. Best OLED TV Under $2,000: 2026 AU Buying Guide for Gaming, Movies & Bright Rooms

**Recommended:** option 1 or 3. Both are ~55 chars (Google snippet-safe), keyword-front-loaded, AU-specific.

### Outline

```
H1: Best 4K OLED TVs under $2,000 in Australia (2026)

Lede (60 words): set the AU buyer context, name the AU$2,000 ceiling, name the OLED choice.

[Affiliate disclosure block]

H2: How we picked
- AU availability via amazon.com.au or major AU retailer
- 2025/2026 models only (no EOL panels)
- HDMI 2.1 minimum (or flagged when not)
- Verified panel architecture (WOLED / QD-OLED / mini-LED for callouts)
- "Verify pricing before publishing" footnote

H2: Quick comparison table
[Sortable table: Model | Panel | Sizes | HDMI 2.1 ports | Peak HDR brightness | AU price (verified date) | Best for]

H2: Pick by buyer profile
- Best overall: LG C5 65" (subject to verification)
- Best for gamers: [Samsung S90F or LG C5]
- Best for movies: Sony Bravia 8 II
- Best value: Hisense A85N / B5
- Best bright-room alternative (mini-LED): TCL C955 / Sony Bravia 9

H2-H3: Each product card (~250 words each)
- Hero image (mirrored)
- Key specs (panel, sizes, refresh rate, HDMI 2.1 ports, smart OS, audio)
- "Why we picked it" (1 paragraph, hardware-first)
- "What to flag" (1 paragraph — burn-in / brightness / DV vs HDR10+ / app store)
- AU availability + price (with verification date)
- CTA: "Check current AU price on Amazon" (affiliate link, dual-tagged when AU tag is live)

H2: WOLED vs QD-OLED vs mini-LED — what changed in 2026
- 400-word technical explainer

H2: HDMI 2.1, 4K@120Hz, VRR — what console gamers actually need
- 250 words; this captures the gaming long-tail

H2: When to wait — AU electronics sales calendar
- EOFY (June), Click Frenzy (May/Nov), Black Friday, Boxing Day
- Internal link to a future "AU tech sales tracker" page

H2: FAQ
- 8–10 questions, schema.org FAQPage markup
- Examples: "Is OLED worth it in 2026?", "How long do OLED TVs last in Australia?",
  "Does Amazon Australia ship OLED TVs?", "What's the cheapest 65-inch OLED in Australia?"

H2: How we'll keep this updated
- Quarterly refresh commitment, last-updated badge

[Final affiliate disclosure block + ABN footer reference]
```

### Product list logic
- 5 OLEDs in primary list, 2 mini-LED as "consider this instead" comparison anchors.
- Strict ordering: best-overall first, then by buyer-profile (gamer, cinephile, value, bright-room).
- Amazon-direct preferred for affiliate revenue; brand-direct externalUrl flagged for products awaiting `gs-affiliates` direct-brand approval (Sony, Samsung have direct affiliate programs through CJ / Impact).
- **Drop any model where AU stock can't be verified within 14 days of publish.**

### Internal links
- Category page: `/category/electronics`
- Existing soundbar coverage: `/product/sony-bravia-theatre-bar-5-soundbar` (link as "matching soundbar pick")
- (When written) `/blog/best-soundbars-under-1000` — pair page for the home-theatre buyer
- (When written) `/blog/oled-vs-qled-explained` — deep-dive companion

### CTA strategy
- **Primary CTA (every product card):** "Check current AU price on Amazon" — dual-tag aware affiliate link.
- **Secondary CTA (article foot):** "Subscribe for weekly AU tech deals" — captures email for re-marketing without paid spend.
- **Tertiary CTA:** Pinterest "Save for later" button on the comparison table (Pinterest official save button widget).

### Schema.org recommendation
- `Article` (or `BlogPosting`) on the page wrapper.
- `ItemList` containing 5–7 `Product` entries.
- Each `Product` with `aggregateRating` (only if we have verified review counts — otherwise omit; do NOT fabricate).
- `FAQPage` schema on the FAQ section.
- `BreadcrumbList` for navigation.
- `LocalBusiness` (Gadget Style Australia) referenced via `publisher` field.

### Risks / items to verify before publish

1. **AU model numbers and availability** — LG C5, Sony Bravia 8 II, Samsung S90F may have different SKUs in AU vs US. Verify via amazon.com.au + brand AU sites.
2. **All prices** — must be live-checked within 24 hours of publish. Add `"Last verified: YYYY-MM-DD"` to every card.
3. **HDMI 2.1 port counts** — vary by model and sometimes by region. Verify against manufacturer spec sheets, not retailer listings.
4. **Hisense / TCL warranty terms in AU** — Korean and Chinese-brand TVs sometimes have shorter AU warranty than US/EU. Flag clearly.
5. **Amazon Associates AU tag** — currently US tag. Until AU tag is live (per `reference_amazon_au_us_strategy.md`), flag in disclosure that international shipping/availability may apply.
6. **No fabricated review counts or "I tested this" claims** — compliance non-negotiable.
7. **Affiliate disclosure compliance** — ACCC + Amazon Associates terms. Block must be above-the-fold.

---

## C. Standard Operator Wrapper

### Executive summary
This cluster pivots Gadget Style toward the highest-AOV consumer-electronics category — OLED TVs at AU$1,400–$1,900 — where one click-through-sale equals roughly 50× the commission of a typical Echo Dot conversion. The article targets a commercial-investigational keyword with HIGH competitor density but a clear AU-specificity moat (Wirecutter and RTINGS don't track AU pricing or availability). Estimated commercial impact at year-1 traffic: AU$50–$300/month from this single article, scaling with traffic and improving once dual-tag AU Amazon Associates is live.

### Deliverables (this document)
- Product Opportunity Report (Section A)
- Content Brief (Section B)
- Outline, FAQ scope, schema map, internal-link plan
- Risk + verification checklist

### Assumptions and verification points
- All product model numbers, AU pricing, AU availability, HDMI 2.1 port counts: **verify before publishing**.
- Search volume estimates are modeled (need GSC + Google Trends confirmation).
- Conversion rate modeling assumes 2% Amazon electronics commission and dual-tag AU launch within 90 days.
- **No fabricated specs, ratings, review counts, prices, or testing claims.** All dynamic data marked re-verify.

### Next actions (priority order)
1. **Verify AU availability and pricing** for the 7 candidate TVs via amazon.com.au + brand-direct AU sites. Owner: gs-catalog. ETA: 2 days.
2. **Run `pnpm gf:sync` filtered to TV/AV terms** to pull any GF-curated TV products into drafts. Owner: gs-catalog. ETA: 30 minutes.
3. **Draft article** following this brief. Owner: gs-content. ETA: 4–6 hours of writing + 1 hour of fact-checking.
4. **Build comparison table component** in React if a reusable one doesn't exist (`ComparisonTable.tsx`). Owner: gs-growth. ETA: 2 hours.
5. **Add FAQPage + ItemList + Product schema** to the blog post template. Owner: gs-growth. ETA: 1 hour.
6. **Flag for direct-brand affiliate signup**: Sony, Samsung, LG (CJ / Impact / Partnerize). Owner: gs-affiliates. ETA: see direct-brand strategy doc.
