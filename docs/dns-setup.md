# DNS Setup — Connect www.gadgetstyle.com to Vercel

The site is live at `gadget-style.vercel.app`. To make
**www.gadgetstyle.com** point to it, you need to add two DNS records at
your domain registrar (where you bought `gadgetstyle.com`).

This is a one-time, ~5-minute task.

---

## DNS records to add

Add **both** of these at your registrar's DNS panel:

### Record 1 — root/apex domain (`gadgetstyle.com`)

| Field | Value |
|-------|-------|
| **Type** | `A` |
| **Name / Host** | `@` (or leave blank, depends on registrar) |
| **Value / Points to** | `216.198.79.1` |
| **TTL** | Default / 3600 (1 hour) |

This makes `gadgetstyle.com` resolve to Vercel. Vercel auto-redirects (HTTP
307) the apex domain to `www.gadgetstyle.com`.

### Record 2 — www subdomain (`www.gadgetstyle.com`)

| Field | Value |
|-------|-------|
| **Type** | `CNAME` |
| **Name / Host** | `www` |
| **Value / Points to** | `c540a0c198c26fda.vercel-dns-017.com.` |
| **TTL** | Default / 3600 (1 hour) |

> ⚠️ Some registrars don't accept the trailing dot — drop it if so.

This makes `www.gadgetstyle.com` resolve to Vercel's CDN, which serves the
site.

---

## Registrar-specific quick guides

The exact UI varies by registrar. Find yours below.

### Cloudflare
1. Log in → pick the `gadgetstyle.com` zone
2. **DNS → Records → Add record**
3. First record: Type `A`, Name `gadgetstyle.com` (or `@`), IPv4 `216.198.79.1`, **Proxy status: DNS only** (orange cloud OFF — IMPORTANT, otherwise SSL breaks)
4. Second record: Type `CNAME`, Name `www`, Target `c540a0c198c26fda.vercel-dns-017.com`, **Proxy: DNS only**
5. Save

### Namecheap
1. Log in → Domain List → **Manage** next to `gadgetstyle.com`
2. **Advanced DNS** tab
3. Click **ADD NEW RECORD**
4. First: A Record, Host `@`, Value `216.198.79.1`, TTL Automatic
5. Second: CNAME Record, Host `www`, Value `c540a0c198c26fda.vercel-dns-017.com.`, TTL Automatic
6. Save (the green checkmark)

### GoDaddy
1. My Products → DNS next to `gadgetstyle.com`
2. **Add New Record**
3. First: Type `A`, Name `@`, Value `216.198.79.1`, TTL 1 Hour
4. Second: Type `CNAME`, Name `www`, Value `c540a0c198c26fda.vercel-dns-017.com.`, TTL 1 Hour
5. Save

### Crazy Domains (popular in AU)
1. Log in → Manage Domain → `gadgetstyle.com`
2. **DNS Configuration** → Edit
3. Under **A Records**: add Host `@`, Value `216.198.79.1`
4. Under **CNAME Records**: add Host `www`, Points to `c540a0c198c26fda.vercel-dns-017.com.`
5. Save

### Google Domains / Squarespace Domains
(Google Domains migrated to Squarespace in mid-2024.)
1. Log in → DNS for `gadgetstyle.com`
2. **Custom records** section
3. First: Type `A`, Host `@`, Required `216.198.79.1`
4. Second: Type `CNAME`, Host `www`, Data `c540a0c198c26fda.vercel-dns-017.com.`
5. Save

---

## Verifying it worked

DNS propagation typically takes **5–60 minutes**, sometimes longer up to 24h.

**Check progress:**
1. Go back to Vercel: **Settings → Domains** in the gadget-style project
2. Click **Refresh** next to each domain. When ready, the warning badge
   changes to "Valid Configuration" and the site becomes accessible at
   `https://www.gadgetstyle.com`.
3. Vercel auto-issues a Let's Encrypt SSL cert at this point (no manual steps).

**Or check from a terminal:**
```bash
nslookup www.gadgetstyle.com 8.8.8.8
nslookup gadgetstyle.com 8.8.8.8
```
The CNAME / A record results should match the Vercel values.

**Or use a DNS checker:** https://dnschecker.org/#A/gadgetstyle.com

---

## What to expect when DNS is live

- `https://www.gadgetstyle.com` — serves the site
- `https://gadgetstyle.com` — 307 redirect to www
- `http://www.gadgetstyle.com` — auto-upgraded to HTTPS by Vercel
- `gadget-style.vercel.app` — still works (continues as the Vercel-internal alias)

---

## Post-DNS tasks (do these once www is resolving)

1. **Update Pinterest profile website field** (`https://www.gadgetstyle.com`) — Pinterest may have it stuck on `http://` until the site is reachable on HTTPS. Re-save once it is.
2. **Update Instagram website field** (mobile app only — IG blocks website edit on desktop): `https://www.gadgetstyle.com`
3. **Verify Pinterest pin click-throughs** by visiting one of your pins and confirming it lands on a real product page.
4. **Add `www.gadgetstyle.com` to Google Search Console** for SEO indexing.
5. **Run `pnpm social:queue --pinterest 1 --ig 0 --dry-run`** to verify a pin would compose correctly with the new domain.
