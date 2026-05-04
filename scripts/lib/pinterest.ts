/**
 * Pinterest API v5 client.
 * Docs: https://developers.pinterest.com/docs/api/v5/
 *
 * Auth: OAuth 2.0. You need:
 *   1. An app registered at developers.pinterest.com with redirect URI set
 *      to http://localhost:3000/oauth/pinterest/callback (for dev) or
 *      https://www.gadgetstyle.com/oauth/pinterest/callback (prod).
 *   2. A refresh_token obtained via the one-off OAuth flow
 *      (scripts/social-oauth-setup.ts pinterest).
 *
 * Required env:
 *   PINTEREST_CLIENT_ID
 *   PINTEREST_CLIENT_SECRET
 *   PINTEREST_REFRESH_TOKEN
 *
 * Access tokens last 30 days; refresh tokens last 1 year. Code below
 * exchanges the refresh token for an access token on each process start,
 * so long-running scripts stay within the 30-day window naturally.
 */

const BASE = "https://api.pinterest.com/v5";

interface OAuthExchangeResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PINTEREST_CLIENT_ID;
  const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
  const refreshToken = process.env.PINTEREST_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Pinterest env vars. Run `pnpm tsx scripts/social-oauth-setup.ts pinterest` to set up.",
    );
  }
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${BASE}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinterest OAuth refresh failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as OAuthExchangeResponse;
  return data.access_token;
}

let cachedToken: { token: string; until: number } | null = null;

async function token(): Promise<string> {
  if (cachedToken && cachedToken.until > Date.now() + 60_000) return cachedToken.token;
  const t = await getAccessToken();
  // Cache for 29 days conservatively.
  cachedToken = { token: t, until: Date.now() + 29 * 24 * 60 * 60 * 1000 };
  return t;
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const t = await token();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinterest API ${res.status} ${path}: ${text}`);
  }
  return (await res.json()) as T;
}

// ---- Public API ----

export interface PinterestBoard {
  id: string;
  name: string;
  description: string | null;
  privacy: "PUBLIC" | "PROTECTED" | "SECRET";
}

export async function listBoards(): Promise<PinterestBoard[]> {
  const r = await api<{ items: PinterestBoard[] }>("/boards?page_size=100");
  return r.items;
}

export interface CreatePinInput {
  boardId: string;
  title: string; // max 100 chars
  description: string; // max 500 chars
  link: string; // destination URL
  imageUrl: string; // public HTTPS URL, must be ≥ 600px in longest side
  altText?: string; // a11y text, max 500 chars
}

export interface PinterestPin {
  id: string;
  url: string;
  board_id: string;
  created_at: string;
}

/**
 * Create a standard pin (image + link). For video or multi-image pins,
 * Pinterest requires a separate media upload flow — not wired here yet.
 */
export async function createPin(input: CreatePinInput): Promise<PinterestPin> {
  const body = {
    board_id: input.boardId,
    title: input.title.slice(0, 100),
    description: input.description.slice(0, 500),
    link: input.link,
    media_source: {
      source_type: "image_url",
      url: input.imageUrl,
    },
    alt_text: (input.altText ?? input.title).slice(0, 500),
  };
  return await api<PinterestPin>("/pins", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
