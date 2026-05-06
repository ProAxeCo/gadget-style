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
