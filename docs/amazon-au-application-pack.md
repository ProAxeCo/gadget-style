# Amazon Australia Associates — Application Pack

**Status:** Ready to execute. Owner: user (Constantinos). Apply at
https://affiliate-program.amazon.com.au.

This is the highest-leverage affiliate signup remaining for Gadget Style.
Site is `.com.au`, audience is AU-targeted, but our current Amazon tag
`gadgetstyle01-20` is the US program — every AU visitor click currently
either earns FX-converted US-rate commission or (when amazon.com auto-
redirects to amazon.com.au) earns **$0** because the redirect strips our
tag. Amazon AU Associates closes that leak.

---

## A. Executive summary

**What this enables.** Gives Gadget Style an Australian Amazon Associates
tag (typically `gadgetstyle-22` or similar) so AU visitors can be
linked through to amazon.com.au with proper attribution, while US/RoW
traffic continues to land on amazon.com via the existing tag
`gadgetstyle01-20`.

**Why it matters.** Two compounding revenue leaks today:
1. AU visitors click US-program links → either get FX-converted lower
   commission, or amazon.com auto-redirects to amazon.com.au and **strips
   the affiliate tag entirely** (zero commission).
2. 14 of 25 recent T&T draft products return "Cannot ship to your
   selected delivery location" for AU shoppers, so the visitor bounces
   without buying anything. With an AU tag we can route AU traffic to
   the equivalent amazon.com.au listing where shipping works.

**Commercial impact.** Conservative: lifts AU-traffic conversion rate by
roughly 30-60% on shippable products and converts the previously-zero
"unshippable to AU" cohort to non-zero. At current pre-traffic stage the
absolute dollars are small ($0-50/month for first 90 days), but every
qualifying sale also resets the **180-day account-closure clock** —
without an AU tag we can't build that history.

**Status as of writing.** No application submitted. Site is live with
219 products and a footer affiliate disclosure. Privacy Policy must be
verified live before submitting (see Pre-flight below).

---

## B. Deliverables

### B.1 Pre-flight (verify before applying)

Amazon AU rejects applications where the site fails any of these on
their first crawl. Confirm each before opening the application form:

| Check | How to verify | Pass criteria |
|-------|---------------|---------------|
| Site live and reachable | Browse https://www.gadgetstyle.com.au from incognito | Loads in < 5s, all images render |
| Affiliate disclosure visible | Scroll site footer + open any product page | Disclosure text contains the words "Amazon Associates" and "earn from qualifying purchases" — Amazon's exact required wording |
| Privacy policy page exists | Click footer link to /privacy (or equivalent) | Live page, mentions cookies + affiliate links + how data is used |
| About / Contact page exists | Click footer About + Contact | Live pages with the registered business name "Gadget Style Australia" and ABN 75185709936 |
| At least 10 original product pages | Browse to /product/<slug> on 5+ random products | Each shows unique editorial copy, not auto-generated boilerplate |
| No broken Amazon links | Run `pnpm check:data` | Validator passes (zero errors) |
| Site is not a coupon/cashback/lead-gen site | N/A — confirmed editorial review site | We're a curated review site, fits the allowed publisher type |

If the affiliate disclosure or privacy policy doesn't include the exact
required language, fix that first — Amazon's reviewer will check on
their first crawl, and a rejection burns the application slot for at
least 30 days.

### B.2 Application form — exact field-by-field values

Open https://affiliate-program.amazon.com.au and click "Sign up". You
will need to be signed in to (or create) an Amazon.com.au shopper
account first — this is separate from any US Amazon account. **Use the
same email** as the existing US Associates account
(`contsekouras@gmail.com`) so reporting consolidates in one identity.

#### Step 1 — Account information

| Field | Value to enter |
|-------|----------------|
| Payee name | `CONSTANTINOS TSEKOURAS` |
| Address line 1 | `Level 2, 450 St Kilda Road` |
| Address line 2 | (leave blank) |
| City | `Melbourne` |
| State / Territory | `VIC` |
| Postcode | `3004` |
| Country | `Australia` |
| Phone | `+61 414651195` |
| Business / individual | **Individual** (you are a sole trader; ABN does not change this for Amazon's purposes) |

Do **not** use the residential address (16 Cypress Way) or the High
Street address. Per user preference, every external-facing form gets the
St Kilda Road address.

#### Step 2 — Website / mobile app information

| Field | Value to enter |
|-------|----------------|
| Website URL #1 | `https://www.gadgetstyle.com.au` |
| Add additional websites? | No (skip) |
| Mobile apps? | No (skip) |

#### Step 3 — Profile

| Field | Value to enter |
|-------|----------------|
| Preferred Associates Store ID | `gadgetstyle-22` (this is your *requested* tag — Amazon may auto-suffix it; the actual issued tag appears after approval) |
| What is your website / app about? | Paste the **Site description** below |
| Topics covered | "Consumer electronics, gadgets, smart home, audio, computing, mobile, photography, gaming, emerging tech" |
| Amazon topics that fit best | Tick: **Electronics, Computers, Mobile Phones, Camera & Photo, Video Games, Home & Kitchen** (limit usually 6) |
| Type of website | "Content / Editorial / Review" |

##### Site description (paste verbatim — ~140 words)

> Gadget Style Australia is a curated consumer-electronics editorial
> site covering the most interesting gadgets launching globally — smart
> home, audio, computing, mobile, photography, gaming, and emerging
> tech. Every product is hand-picked and written up with enthusiast-
> voice descriptions, full spec tables, image galleries, and direct buy
> links. The catalog currently spans 200+ products across 25+
> categories, growing weekly via a structured ingestion pipeline modeled
> on Gadget Flow. Editorial focus is on premium, high-AOV gadgets where
> a buyer benefits from comparison and curation rather than commodity
> accessories. Audience: tech enthusiasts and gift-shoppers, primarily
> in Australia, reached via SEO, Pinterest, and Instagram. Revenue
> model: Amazon Associates (US and AU programs) plus direct-brand
> affiliate networks for non-Amazon products. Operated by Gadget Style
> Australia (ABN 75185709936) from Melbourne, Victoria.

(Word count: ~140. If the form caps at 100 words, drop the last two
sentences.)

#### Step 4 — Traffic and monetisation

| Field | Value to enter |
|-------|----------------|
| How do you drive traffic to your site? | Tick: **Search Engine Optimization (SEO), Social Networks, Email** |
| Approx. traffic mix | SEO ~50%, Pinterest ~25%, Instagram ~25% (write in free text if asked) |
| How do you build links / refer visitors to Amazon? | "Editorial product reviews, comparison articles, curated gift guides, seasonal buyer's guides. Amazon links sit on individual product pages and within long-form articles, marked with affiliate disclosure." |
| How many unique visitors per month? | "Less than 500 — newly launched (May 2026), growing" |
| Primary purpose of the website | "Editorial content / product reviews" |
| How did you hear about us? | "Online search" |
| Expected commission per month (first 90 days) | "$0 - $50 AUD" (be conservative; Amazon does not penalise low forecasts but flags wildly inflated ones) |

Be honest about traffic. Amazon AU is more lenient than CJ on small
sites because they want long-tail publishers in the program — a small,
clean editorial site with real content gets approved.

#### Step 5 — Verification

Amazon sends a 4-digit PIN by SMS or voice call to `+61 414651195`.
Enter the PIN. This step is instant.

#### Step 6 — Operating Agreement

Read and accept the Amazon Associates Programme Operating Agreement
(AU). The agreement is unilateral; there's nothing to negotiate. Note
the key obligations (these match the existing US program but are worth
re-reading):

- Display the affiliate disclosure on every page that contains an
  Amazon link.
- Do not state Amazon prices on your own site (prices change; only
  Amazon's live price is authoritative).
- Do not buy via your own affiliate links.
- Do not use affiliate links in offline materials, paid search bidding
  on Amazon trademarks, or email-list buys.
- 180-day inactivity rule: at least one qualifying sale every 180 days
  or the account is closed (you can re-apply, but you lose history).

### B.3 Tax interview — do this immediately after approval

Amazon AU pushes you straight to the Tax Information Interview after
the Operating Agreement. **The form for AU sole traders paying out in
AUD is NOT W-8BEN.** W-8BEN applies when a non-US person is paid by a
US payer for US-sourced income. Amazon AU pays from an Australian
entity, so the tax interview is the **Amazon AU domestic tax form**,
not an IRS form.

| Field | Value to enter |
|-------|----------------|
| Are you a U.S. person or business? | **No** |
| Country of citizenship / tax residence | `Australia` |
| Do you have an Australian Business Number (ABN)? | **Yes** |
| ABN | `75185709936` |
| Business name registered to ABN | `Gadget Style Australia` |
| Are you registered for GST? | **Probably No** for first 12 months. GST registration is only mandatory once turnover exceeds $75,000 / year. Confirm with accountant if unsure. If No, Amazon withholds nothing GST-wise. If Yes, Amazon adds GST to the commission and you remit it. |
| TFN (Tax File Number) | Enter only if Amazon explicitly requests it. AU sole traders typically use ABN; TFN is optional unless ABN is missing. |
| Confirm name + signature | `Constantinos Tsekouras` (digital signature) |

**Verification point:** the exact tax form name on Amazon AU may have
changed since this pack was written. If the screen says "W-8BEN" you
are on the US payee path by mistake — go back and re-confirm "tax
residence: Australia" earlier in the flow. Amazon US Associates already
has your W-8BEN on file from `gadgetstyle01-20`; that one is unrelated
to the AU program.

### B.4 Payment setup

Amazon AU pays by direct deposit to an Australian bank account.

| Field | Value |
|-------|-------|
| Payment method | **Direct Deposit (electronic transfer)** |
| Account name | (your AU bank account holder name — must match `CONSTANTINOS TSEKOURAS`) |
| BSB | (6-digit Australian BSB — get from your bank) |
| Account number | (your bank account number) |
| Payment threshold | **$10 AUD** (Amazon AU's minimum). Lower = faster first payout = faster proof you're a real publisher. |
| Currency | AUD |

PayPal is **not** offered by Amazon AU as of the last public docs
review — direct deposit only. Cheque is offered but slow and has fees.

**Verification point:** the user's existing AU bank account is unknown
to me. Confirm at signup which AU bank account to use. Don't use the
joint account / personal account if there's a separate business account
for the ABN.

### B.5 After approval — find your tag

Approval is typically instant-to-3-business-days for Amazon AU (faster
than the US program because the AU market is smaller and Amazon
actively wants long-tail publishers).

After the approval email lands:

1. Sign in to https://affiliate-program.amazon.com.au.
2. Top-right dropdown → "Manage Your Tracking IDs" (or click your
   Associate ID near the top of the dashboard).
3. Your **primary tracking ID** appears — typically formatted
   `gadgetstyle-22` or similar. Amazon may auto-suffix the requested
   ID; the actual assigned tag is what counts.
4. (Optional but recommended) create a second tracking ID for tracking
   social-media-driven traffic separately — e.g. `gadgetstyl0d-22` for
   Pinterest, `gadgetstyl0e-22` for Instagram. This lets you measure
   per-channel ROI in the Amazon dashboard. Up to 100 tracking IDs are
   free.
5. Record the assigned primary tag in `.env.local`:
   ```
   AMAZON_AU_TAG=gadgetstyle-22
   AMAZON_US_TAG=gadgetstyle01-20
   ```
6. **Do NOT yet bulk-rewrite all `data.ts` URLs.** The dual-tag spec
   (`docs/dual-tag-implementation-spec.md`) handles geo-aware rewriting
   so you don't lose US-traffic attribution. Wait for that
   implementation before touching live data.

### B.6 The 180-day sunset clock

Amazon AU (and US) closes any Associates account that goes 180 days
without a single qualifying sale. Closure means:

- Your tag stops earning, even if you re-activate later.
- You can re-apply, but you lose your link history and any potentially-
  pending commissions.
- Re-application is treated as a new account; another tax interview,
  another approval cycle.

**Mitigation plan during the first 180 days:**

1. Once approved, get at least one tracking link live on the site
   immediately (the dual-tag implementation handles this).
2. Pin one or two AU-shippable, high-AOV products on Pinterest with
   the AU tag in the destination URL.
3. Buy nothing through your own link (against TOS), but encourage
   genuine purchases via social posts to AU-targeted audiences.
4. If by Day 120 there's still no qualifying sale, run a sponsored
   Pinterest pin to AU users on a $20-50 budget — the click-to-buy
   conversion of a single Bose / Sony / Apple product at AU AOV will
   typically cover the spend and reset the clock.

Track day-of-approval in a calendar reminder; the 180-day clock starts
that date.

### B.7 Application timeline expectations

| Stage | Expected duration |
|-------|-------------------|
| Form completion (with this pack open) | 15-20 min |
| Tax interview | 5 min |
| Bank details | 5 min |
| Initial automated approval (most accounts) | Instant — you get a tag immediately |
| Manual review (some accounts) | 1-3 business days |
| First qualifying sale → first payout | Variable; threshold $10 AUD |
| 180-day inactivity warning email | ~Day 150 |
| Account closure if no sale | Day 180 |

If you're not approved instantly, you'll see "Your application is
under review" — that's normal, no action needed. Amazon emails the
decision.

---

## C. Assumptions and verification points

1. **Tax form name.** Assumes Amazon AU uses an internal AU tax form
   (not W-8BEN) for AU sole traders being paid in AUD by Amazon
   Australia's local entity. If the signup screen shows "W-8BEN"
   verify you didn't accidentally select US tax residence — go back
   and check.
2. **Tag format.** Assumes Amazon AU issues `-22` suffixed tags for new
   AU sign-ups (current 2026 convention). The actual issued tag may
   differ; whatever Amazon assigns is the value to put in
   `AMAZON_AU_TAG`.
3. **Affiliate disclosure wording.** Assumes the site footer already
   contains Amazon's required wording ("As an Amazon Associate we
   earn from qualifying purchases"). Verify in incognito before
   applying — if missing, fix first or expect rejection.
4. **Privacy policy live.** Verify https://www.gadgetstyle.com.au
   has a working `/privacy` (or equivalent) link in the footer that
   loads a real policy page, not a 404 or placeholder.
5. **Existing US Associates account is in good standing.** Amazon AU
   and US are separate programs but Amazon's risk system can flag a
   new application if the linked email's US account is suspended or
   has open violations. Confirm `gadgetstyle01-20` shows "Active" on
   https://affiliate-program.amazon.com before applying for AU.
6. **GST status.** Assumes the user is **not** GST-registered in the
   first 12 months (turnover < $75k threshold). If already registered,
   answer Yes on the tax interview — Amazon then adds GST on top of
   commission and the user remits via BAS.
7. **Phone-verification SIM is reachable.** `+61 414651195` must be
   able to receive the SMS PIN at the moment of signup. Already
   verified by Meta dev portal so should work.
8. **Address consistency.** If the user has used the residential
   address (Cypress Way) on any prior Amazon-related signup, that
   doesn't conflict — Amazon doesn't cross-check addresses across
   different Associates accounts. Use the St Kilda Road address as
   instructed.

---

## D. Next actions

Owned by **user** unless noted. Numbered in execution order.

1. **(user, 5 min) Pre-flight check.** Open
   https://www.gadgetstyle.com.au incognito, verify footer affiliate
   disclosure contains the required Amazon wording, verify
   `/privacy` and `/about` load, verify a few random product pages
   show unique copy. Fix anything missing before step 2.
2. **(user, 25 min) Apply.** Open
   https://affiliate-program.amazon.com.au, sign in with
   `contsekouras@gmail.com`, work through Section B.2 of this doc
   field-by-field. Save the assigned tag when approved.
3. **(user, 10 min) Tax interview + bank details.** Sections B.3 and
   B.4. Have BSB + account number ready.
4. **(user, 1 min) Calendar reminder.** Set a reminder for Day 150
   ("Amazon AU 180-day clock — confirm at least one sale, else run
   pinned promo"). The clock starts on the approval date.
5. **(user → agent handoff) Drop the assigned tag into chat.** Once
   approved, paste the AU tag (e.g. `gadgetstyle-22`) into the next
   session so `gs-affiliates` can implement the dual-tag system per
   `docs/dual-tag-implementation-spec.md`.
6. **(agent, after step 5) Implement dual-tag.** ~90 min of code +
   validator + test work, gated on the AU tag being known. See the
   companion spec.
7. **(agent, after step 6) Cross-walk the 14 unshippable-to-AU
   drafts.** For each of #273, #274, #276, #277, #278, #279, #280,
   #281, #284, #286, #287, #290, #294, #297 — search amazon.com.au
   for the same product, capture the AU ASIN if it exists, store as
   `asinAu` alongside `asin`. Owned by `gs-catalog`, not
   `gs-affiliates`, but called out here because it's the natural
   downstream task once the AU tag is live.
