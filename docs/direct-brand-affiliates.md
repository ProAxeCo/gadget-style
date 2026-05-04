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
