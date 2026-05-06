# Day 1 — Affiliate Signup Execution Sheet

**Target date:** the morning after this plan lands. Plan for **3.5–4 hours**
of focused work in a single sitting (no meetings, coffee within reach).

**Scope:** Amazon AU Associates + the 6 brand networks (Impact, Partnerize,
ShareASale, CJ, Awin, Rakuten) + ~27 priority brand applications inside
those networks.

**Out of scope:** writing code, building scripts, modifying `data.ts`. Today
is purely network-side signups + applications.

---

## Tip box — have these ready before starting

Open these in tabs / a sticky note so every form is paste-not-retype:

| Field | Value |
|-------|-------|
| Site URL | `https://www.gadgetstyle.com.au` |
| Business name | Gadget Style Australia |
| Legal owner | Constantinos Tsekouras |
| ABN | 75185709936 |
| Business address | Level 2, 450 St Kilda Road, Melbourne VIC 3004, Australia |
| Contact email | contsekouras@gmail.com |
| Phone | +61 414651195 |
| Niche | Consumer Electronics / Gadget Reviews |
| Tax form | W-8BEN (AU resident, individual) — claim AU/US tax-treaty rate |
| Tax ID | ABN; W-8BEN does not require US TIN for AU residents under treaty |
| Payout | PayPal `contsekouras@gmail.com` (default), or AU EFT if PayPal unsupported |
| Site description block | see "Site description (paste verbatim)" in `affiliate-signup-checklist.md` lines 38–49 |

Also have these documents open in tabs:
- `docs/affiliate-signup-checklist.md` — master detail per network
- `docs/amazon-au-application-pack.md` — full Amazon AU pack
- `docs/dual-tag-implementation.md` — context (no action today)
- `docs/affiliate-tracking-templates.csv` — fill-as-you-go progress sheet

**Pre-flight check (3 min):** before opening any signup form, run from
the `gadget-style/` repo:

```
pnpm check:data
```

If validator fails, stop and fix data first — Amazon AU and CJ both
crawl the site on application and will reject if it 500s or has obvious
bugs.

---

## Hour 1 (45 min) — Top-priority signups in parallel tabs

Open these 4 tabs and fill them in parallel — same data goes into each,
just in slightly different field orders.

### 0. Amazon AU Associates  (priority ★)

- **URL:** https://affiliate-program.amazon.com.au/
- **Time:** ~10 min
- **Fill:**
  - Account holder name → Constantinos Tsekouras
  - Address → Level 2, 450 St Kilda Road, Melbourne VIC 3004, AU
  - Phone → +61 414651195
  - Business name → Gadget Style Australia
  - ABN → 75185709936
  - Website → `https://www.gadgetstyle.com.au`
  - Preferred Store ID → `gadgetstyle-22`
    (fallback: `gadgetstyleau-22` if the first is taken)
  - Niche → Consumer Electronics / Gadget Reviews
  - Site description → paste the block from `affiliate-signup-checklist.md`
- **Approval timeline:** 1–3 business days
- **While waiting:** continue Hours 1–4 below; the AU tag is independent
  of the brand-network signups

### 1. Impact

- **URL:** https://app.impact.com/campaign-mediapartner-signup/
- **Time:** ~10 min
- **Fill:**
  - Account type → Individual / Sole Trader
  - Country → Australia
  - Promotional model → Content / Reviews
  - Site URL → `https://www.gadgetstyle.com.au`
  - Business name → Gadget Style Australia
  - Address → Level 2, 450 St Kilda Road, Melbourne VIC 3004, AU
  - ABN → 75185709936
  - Tax form → W-8BEN, claim AU treaty 0% withholding on royalties
  - Payout → PayPal `contsekouras@gmail.com`
- **Approval:** 1–3 business days for the network. Brand applications
  inside are filled in Hour 3.

### 2. Partnerize

- **URL:** https://www.partnerize.com/en/partners/register
- **Time:** ~10 min
- **Fill:** same fields as Impact. Publisher type → "Content Site / Review"
- **Approval:** 1–3 business days for the network. Brand applications
  inside are filled in Hour 3 (some premium brands like Dell take 1–2
  weeks for brand-level approval).

### 3. ShareASale (now an Awin company, but still has a separate publisher portal)

- **URL:** https://www.shareasale.com/newSignUp.cfm
- **Time:** ~10 min
- **Fill:** same fields. ShareASale checks site URL on signup — site is
  live with 219 products, passes.
- **Set payment threshold to $100** (default $50) to reduce admin
- **Approval:** Same-day to 2 days. Brand applications are usually
  instant or <24h.

**End of Hour 1 checkpoint:** 4 confirmation emails should be in your
inbox. Do NOT wait for approvals — proceed to Hour 2.

---

## Hour 2 (60 min) — Slower / stricter networks

### 4. CJ Affiliate

- **URL:** https://www.cj.com/publisher-sign-up
- **Time:** ~15 min (longer form, manual review)
- **Fill:**
  - Account type → Individual (sole trader, ABN as tax ID)
  - Promotional method → Content / Niche Site
  - Website → `https://www.gadgetstyle.com.au`
  - Business name → Gadget Style Australia
  - Address → Level 2, 450 St Kilda Road, Melbourne VIC 3004, AU
  - Tax form → W-8BEN
- **Approval:** 2–5 business days (strictest of the six). They
  manually crawl the site — pre-flight `pnpm check:data` is essential.

### 5. Awin

- **URL:** https://www.awin.com/us/publishers/join-awin
- **Time:** ~15 min (includes $1 USD verification fee)
- **Fill:** same as the others. Plus:
  - **Verification fee:** $1 USD via card. Refunded with first payout.
    Have a card ready.
- **Approval:** Same-day to 2 days
- **While in the dashboard,** check for "Mass Connect" / "auto-approve"
  filter under Programmes — opt in if available.

### 6. Rakuten Advertising

- **URL:** https://rakutenadvertising.com/join
- **Time:** ~15 min
- **Fill:** same as the others
- **Approval:** 3–7 business days (slowest of the six)
- **Lower priority than the others** — 0 matching live products today.
  Worth doing for future-proofing only.

### Time-buffer activity (15 min)

While the networks are processing the signup forms, take this time to:
- Open `docs/affiliate-tracking-templates.csv` and verify the 6
  network rows + 27 brand rows are pre-populated
- Update the `application_status` column for each network to "submitted"
  with today's date

**End of Hour 2 checkpoint:** 7 network applications submitted (Amazon
AU + 6 brand networks). Email inbox should have 7 confirmation receipts.

---

## Hour 3 (60 min) — Apply to the 27 brand programs

This phase only works for networks that approved you in Hour 1
(potentially Impact, Partnerize, ShareASale — same-day approvals).
For CJ / Awin / Rakuten the brand apps wait until those networks
approve (1–7 days).

**Strategy:** start with whichever of Impact / Partnerize / ShareASale
approved first. If none have approved yet by Hour 3, **switch the time
to** "Hour 3 alternative" below and come back to brand apps tomorrow
or the day after.

### Inside Impact (10 brand applications, ~3 min each)

Marketplace → search each brand → "Apply to program":

| # | Brand | Search term | Live product IDs |
|---|-------|-------------|------------------|
| 1 | Samsung | "Samsung US" | #131, #133 |
| 2 | Sony | "Sony Electronics" | #149 |
| 3 | DJI | "DJI" | #130 |
| 4 | Bose | "Bose" | future |
| 5 | JBL | "JBL" | future |
| 6 | Shark | "Shark / Ninja" | future |
| 7 | Denon | "Denon" or "D+M / Masimo" | #129 |
| 8 | Corsair | "Corsair" | #138, #256 |
| 9 | MSI | "MSI" | #140 |
| 10 | TESSAN | "TESSAN" | #150, #151 |

Per-brand fill: site URL, monthly traffic ("<1,000 unique, growing"),
promotional methods ("SEO + editorial + social"), agree to brand
terms, submit. Most auto-approve; Samsung / Sony / DJI may take 5–10
business days.

### Inside Partnerize (6 applications, ~3 min each)

Brands tab → search each → Apply:

| # | Brand | Live product IDs |
|---|-------|------------------|
| 11 | GoPro | #127 (draft) |
| 12 | Dell | #145 |
| 13 | Lenovo | future |
| 14 | HP | future |
| 15 | Microsoft Store | future |
| 16 | Dyson | future |

### Inside ShareASale (5 applications, ~3 min each)

Merchants → search → "Apply to Merchant":

| # | Brand | Live product IDs | Notes |
|---|-------|------------------|-------|
| 17 | Keychron | #146 | usually instant approval |
| 18 | NuPhy | #141 | usually instant |
| 19 | Soundboks | #255 | check both ShareASale + Awin |
| 20 | 8BitDo | #137 | if missing on ShareASale, fall back to 8bitdo.com contact form |
| 21 | Vastnaut | #142 | small brand — likely no program; direct email fallback |

### Hour 3 alternative — if no networks approved yet

Spend the hour on:
- W-8BEN form practice (download the IRS PDF, fill once, save copy for
  paste into network forms once they ask)
- Add `Day 1 affiliate-signup` row to a personal tracker (Notion / a
  text file) so you can check approvals tomorrow morning at 9am
- Confirm `pnpm check:data` is still green (catches anything that
  crept into the validator overnight)

### Pending until network approvals land (CJ + Awin + Rakuten)

These brand apps are queued for whenever those networks approve:

| # | Brand | Network | Live product IDs |
|---|-------|---------|------------------|
| 22 | ASUS | CJ | #148 |
| 23 | Logitech | CJ | future |
| 24 | Lenovo (CJ variant) | CJ | future |
| 25 | Philips | Awin | future |
| 26 | Huawei | Awin | #132 (draft) |
| 27 | Xiaomi | Awin | future |

**End of Hour 3 checkpoint:** 21 brand applications submitted via the
3 fast-approving networks (or, if no fast approvals, 0 — defer to Hour
3 alternative). The remaining 6 brand apps (CJ + Awin) are queued
mentally; you'll come back to them when those networks approve.

---

## Hour 4 (60 min) — Tracking infrastructure

### 4.1 (20 min) Update `docs/affiliate-tracking-templates.csv`

Open the CSV. For each network you submitted today:
- Set `application_status` → `submitted`
- Set today's date in the date column
- Leave `tracking_link_template` empty until approval lands

For each brand you submitted:
- Same — `application_status` = submitted, today's date

### 4.2 (15 min) Set up a personal "approval inbox" filter

Most affiliate networks send approval emails from predictable senders:
- Amazon → `associates@amazon.com.au`
- Impact → `noreply@impact.com`
- Partnerize → `noreply@partnerize.com`
- ShareASale → `noreply@shareasale.com`
- CJ → `cjpublisher-no-reply@cj.com`
- Awin → `noreply@awin.com`
- Rakuten → `noreply@rakuten.com`

In Gmail, create a filter: `from:(amazon.com.au OR impact.com OR
partnerize.com OR shareasale.com OR cj.com OR awin.com OR rakuten.com)
subject:(approved OR welcome OR application)` → label `affiliate-approvals`,
mark as starred, never archive.

This way every approval lands in one easy-to-scan filter view.

### 4.3 (15 min) Pilot product picks (think-ahead)

When the first approvals land, you'll wire one product per network as a
pilot before bulk-wrapping. Decide picks now so it's a 5-min job later:

| Network | Pilot product | Why |
|---------|---------------|-----|
| Amazon AU | Whichever is the highest-AOV item with a confirmed AU listing | Tests dual-tag end-to-end + qualifying-sale clock |
| Impact | #149 Sony BRAVIA Soundbar (~$400) | High AOV; Sony Electronics is reliable in Impact |
| Partnerize | #145 Dell Pro 5 Micro (~$800) | Highest AOV in the catalog after Amazon |
| ShareASale | #146 Keychron K2 | Instant-approve, easy validation |
| CJ | #148 ASUS Zenbook A14 (~$1,200) | Pilot only after CJ + ASUS both approve |
| Awin | #132 Huawei (draft) | Low priority; pilot only if Huawei approves |

Save these to a side note — when the approval emails land tomorrow you
can fast-track the pilot tests instead of re-deciding.

### 4.4 (10 min) Write the social affiliate disclosure

FTC + each network's TOS require disclosure on every social post that
contains an affiliate link. Pick one short variant per platform and
save it for `gs-social` to enforce:

- **Pinterest pin description footer:** `#ad — affiliate link`
- **Instagram caption footer:** `Affiliate link — we may earn a small
  commission. Site: gadgetstyle.com.au`
- **In-product-page disclosure** (already live in footer per Amazon ToS;
  verify still there after any future template changes)

---

## After-approvals checklist (run when each network approves)

For every approval email that lands over the next 1–7 days:

1. **Click the dashboard link in the approval email** → log in.
2. **Find the tracking-link template:**
   - Impact: Brands → click brand → "Create Link" → copy the
     `https://goto.impact.com/c/...` template
   - Partnerize: Brand dashboard → "Tracking Links" → DeepLink generator
   - ShareASale: Merchants → click merchant → "Get a Link" → "Create
     Custom Link"
   - CJ: Account → Links → Deep Link Generator
   - Awin: Toolbox → Link Builder
   - Rakuten: Links → Deep Link Generator
   - Amazon AU: any product page on amazon.com.au → "SiteStripe" toolbar
     → copy short link (note: SiteStripe needs the AU Associates account
     active in your browser session)
3. **Paste the template into `docs/affiliate-tracking-templates.csv`**
   under the matching row's `tracking_link_template` column. Use
   `__DEST__` as a placeholder for the destination URL and `__SLUG__`
   for the product slug (e.g.
   `https://goto.impact.com/c/12345/67890?u1=__SLUG__&dest=__DEST__`).
4. **Update `application_status` to `approved`** + today's date in
   `approved_date`.
5. **Pilot test the link from an incognito window** — should redirect
   through the network domain (`goto.impact.com` etc.) and arrive at
   the brand site with tracking parameters intact.
6. **Open the network's reporting dashboard within 5 minutes** — your
   test click should show up as a click event (not a sale).
7. **When you have 3+ approvals in `affiliate-tracking-templates.csv`
   with non-empty templates** — that's the trigger to build
   `scripts/apply-affiliate-wrappers.ts` (spec already exists in
   `affiliate-signup-checklist.md` lines 248–294).

---

## Notes / risks for tomorrow

- **CJ Affiliate has the strictest review.** If CJ rejects, the most
  common reason is "site too thin" — counter is "we have 219 live
  products" + "site is the AU equivalent of Gadget Flow". Re-apply with
  a brief cover note in the optional comments field.
- **Impact's Samsung program** sometimes auto-rejects new publishers
  with "<1,000 unique visitors". If that happens, re-apply in 90 days
  once Search Console shows growth.
- **W-8BEN: claim treaty rate** (Article 12 — Royalties) for 0%
  withholding. Don't leave it blank — networks default to 30%
  withholding if you don't claim treaty rate.
- **Don't sign up for Skimlinks / Sovrn / VigLink** — they take 25%
  rev share and create attribution conflicts. See
  `affiliate-signup-checklist.md` "Skimlinks / Sovrn check" section.

---

## Day 1 close-out — what success looks like

By end of day:
- [ ] 1 Amazon AU Associates application submitted
- [ ] 6 brand-network applications submitted (Impact / Partnerize /
      ShareASale / CJ / Awin / Rakuten)
- [ ] 21 brand-program applications submitted inside fast-approving
      networks (or 6 if you skipped Hour 3 due to no fast approvals)
- [ ] 6 remaining brand-program apps queued for when CJ / Awin land
- [ ] `docs/affiliate-tracking-templates.csv` reflects all submissions
- [ ] Gmail filter set up to surface approval emails

**Total Day 1 work:** ~3.5–4 hours.
**Total work to first revenue (Day 1 + per-approval wiring + pilot):
~6 hours over 1–2 weeks.**
