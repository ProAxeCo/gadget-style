/**
 * Meta Graph API — Facebook Page posting client.
 * Docs: https://developers.facebook.com/docs/pages/access-tokens
 *       https://developers.facebook.com/docs/graph-api/reference/page/feed
 *       https://developers.facebook.com/docs/graph-api/reference/page/photos
 *
 * Auth: long-lived **Page Access Token** with at minimum `pages_manage_posts`
 * + `pages_read_engagement`. The same token used by `meta-ig.ts` works here
 * — it's the FB Page's token, not an IG Business token.
 *
 * Required env:
 *   META_PAGE_ACCESS_TOKEN    — long-lived Page token, ~60 day TTL
 *   META_FB_PAGE_ID           — numeric FB Page ID
 *
 * Optional env (only used by verifyPage's debug_token call):
 *   META_APP_ID + META_APP_SECRET
 *
 * Posting flow (single call, not the IG two-step container pattern):
 *   - Text-with-link feed post: POST /{page-id}/feed { message, link?, published? }
 *   - Photo post:               POST /{page-id}/photos { url, caption, published? }
 *     (Meta fetches the image from `url`. Captures BOTH photo id and the
 *      composed parent post id — the post id is what shows in /feed and is
 *      the right thing to delete.)
 *   - Delete:                   DELETE /{post-id}
 *
 * Notes:
 *   - `published=false` creates an unpublished_post — invisible on the Page
 *     wall, useful for smoke testing. Must be deleted explicitly.
 *   - Photo posts created with `published=false` return both `id` (photo) and
 *     `post_id` (the feed item). Deleting `post_id` removes both.
 */

const GRAPH = "https://graph.facebook.com/v19.0";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v)
    throw new Error(
      `Missing env ${name}. Set it in .env.local (see reference_meta_tokens_status.md for the OAuth flow).`,
    );
  return v;
}

async function api<T>(
  path: string,
  params: Record<string, string> = {},
  method: "GET" | "POST" | "DELETE" = "GET",
): Promise<T> {
  const token = requireEnv("META_PAGE_ACCESS_TOKEN");
  const url = new URL(`${GRAPH}${path}`);
  if (method === "GET" || method === "DELETE") {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    url.searchParams.set("access_token", token);
    const res = await fetch(url, { method });
    const text = await res.text();
    if (!res.ok) throw new Error(`Meta Graph ${method} ${path} → ${res.status}: ${text}`);
    return JSON.parse(text) as T;
  }
  // POST
  const body = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(`${GRAPH}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Meta Graph POST ${path} → ${res.status}: ${text}`);
  return JSON.parse(text) as T;
}

// ---- Public API ----

export interface PageVerifyResult {
  id: string;
  isValid: boolean;
  type: string;
  scopes: string[];
  expiresAt: number;
  dataAccessExpiresAt: number;
}

/**
 * Verify the configured Page token. If META_APP_ID + META_APP_SECRET are
 * available, runs the full debug_token check. Otherwise falls back to a
 * cheap GET /{page-id} call.
 */
export async function verifyPage(): Promise<PageVerifyResult> {
  const pageId = requireEnv("META_FB_PAGE_ID");
  const token = requireEnv("META_PAGE_ACCESS_TOKEN");
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (appId && appSecret) {
    interface DebugTokenResp {
      data: {
        is_valid: boolean;
        type: string;
        profile_id?: string;
        expires_at: number;
        data_access_expires_at: number;
        scopes: string[];
      };
    }
    const url = new URL(`${GRAPH}/debug_token`);
    url.searchParams.set("input_token", token);
    url.searchParams.set("access_token", `${appId}|${appSecret}`);
    const res = await fetch(url);
    const text = await res.text();
    if (!res.ok) throw new Error(`debug_token → ${res.status}: ${text}`);
    const dt = JSON.parse(text) as DebugTokenResp;
    if (dt.data.profile_id && dt.data.profile_id !== pageId) {
      throw new Error(
        `Token profile_id=${dt.data.profile_id} does not match META_FB_PAGE_ID=${pageId}`,
      );
    }
    return {
      id: pageId,
      isValid: dt.data.is_valid,
      type: dt.data.type,
      scopes: dt.data.scopes ?? [],
      expiresAt: dt.data.expires_at,
      dataAccessExpiresAt: dt.data.data_access_expires_at,
    };
  }

  // Fallback: just confirm the Page is reachable with the token.
  const page = await api<{ id: string; name?: string }>(`/${pageId}`, {
    fields: "id,name",
  });
  return {
    id: page.id,
    isValid: true,
    type: "PAGE",
    scopes: [],
    expiresAt: 0,
    dataAccessExpiresAt: 0,
  };
}

export interface FeedPostInput {
  message: string;
  link?: string;
  published?: boolean; // default true
}

/**
 * Publish (or draft) a text/link feed post. Returns the post id.
 */
export async function publishFeedPost(
  input: FeedPostInput,
): Promise<{ id: string }> {
  const pageId = requireEnv("META_FB_PAGE_ID");
  const params: Record<string, string> = {
    message: input.message,
    published: String(input.published ?? true),
  };
  if (input.link) params.link = input.link;
  return await api<{ id: string }>(`/${pageId}/feed`, params, "POST");
}

export interface PhotoPostInput {
  url: string; // public HTTPS image URL — Meta fetches it
  caption: string;
  published?: boolean; // default true
}

/**
 * Publish (or draft) a photo post. Captures BOTH the photo id and the
 * composed parent post id (the latter is what shows on the Page wall and is
 * the right id to pass to deletePost).
 */
export async function publishPhoto(
  input: PhotoPostInput,
): Promise<{ id: string; post_id: string }> {
  const pageId = requireEnv("META_FB_PAGE_ID");
  return await api<{ id: string; post_id: string }>(
    `/${pageId}/photos`,
    {
      url: input.url,
      caption: input.caption,
      published: String(input.published ?? true),
    },
    "POST",
  );
}

/**
 * Delete a Page post (or unpublished post) by id.
 */
export async function deletePost(postId: string): Promise<void> {
  const res = await api<{ success: boolean }>(`/${postId}`, {}, "DELETE");
  if (!res.success) throw new Error(`Delete ${postId} returned success=false`);
}
