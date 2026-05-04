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
