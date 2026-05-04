/**
 * Meta Graph API — Instagram Content Publishing client.
 * Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing
 *
 * Auth: OAuth 2.0 via a Facebook App. The access token type you need is a
 * **long-lived Page Access Token** (~60 days). User must:
 *   1. Convert their Instagram account to Business/Creator.
 *   2. Link it to a Facebook Page they own.
 *   3. Authorize your FB App for the scopes:
 *        instagram_content_publish
 *        instagram_basic
 *        pages_show_list
 *        pages_read_engagement
 *        pages_manage_posts
 *   4. Exchange the short-lived user token for a long-lived Page token and
 *      store it in .env.local (scripts/social-oauth-setup.ts meta does this).
 *
 * Required env:
 *   META_PAGE_ACCESS_TOKEN    — long-lived Page token, ~60 day TTL
 *   META_IG_BUSINESS_ID       — numeric IG Business account ID
 *
 * Page tokens with the correct scopes are "self-refreshing" in the sense
 * that you can extend them via another `fb_exchange_token` call before the
 * 60-day expiry. For a site that posts daily, you effectively never rotate
 * — just set a calendar reminder every 50 days to re-run the OAuth flow.
 *
 * Publishing flow (Meta requires a 2-step "container" pattern):
 *   1. POST /{ig-user-id}/media with the image or video URL → returns container_id
 *   2. POST /{ig-user-id}/media_publish with creation_id=container_id → publishes
 *
 * For carousels, step 1 creates child containers first, then a parent carousel
 * container. Step 2 is the same.
 */

const GRAPH = "https://graph.facebook.com/v19.0";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v)
    throw new Error(
      `Missing env ${name}. Run \`pnpm tsx scripts/social-oauth-setup.ts meta\` to set up.`,
    );
  return v;
}

async function api<T>(
  path: string,
  params: Record<string, string | number> = {},
  method: "GET" | "POST" = "GET",
): Promise<T> {
  const token = requireEnv("META_PAGE_ACCESS_TOKEN");
  const url = new URL(`${GRAPH}${path}`);
  const body: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (method === "GET") url.searchParams.set(k, String(v));
    else body[k] = String(v);
  }
  url.searchParams.set("access_token", token);

  const res = await fetch(url, {
    method,
    ...(method === "POST"
      ? {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ ...body, access_token: token }).toString(),
        }
      : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meta Graph API ${res.status} ${path}: ${text}`);
  }
  return (await res.json()) as T;
}

// ---- Public API ----

/**
 * Verify the configured token + IG business ID are valid. Returns the
 * IG username on success so the caller can log what account it's posting to.
 */
export async function verifyAuth(): Promise<{ id: string; username: string }> {
  const igId = requireEnv("META_IG_BUSINESS_ID");
  return await api<{ id: string; username: string }>(`/${igId}`, {
    fields: "id,username",
  });
}

export interface SinglePostInput {
  imageUrl: string; // must be public HTTPS JPEG/PNG under 8MB
  caption: string; // max 2200 chars; first 125 visible before "more"
}

/**
 * Publish a single-image feed post. Returns the media ID.
 */
export async function publishSingle(input: SinglePostInput): Promise<{ id: string }> {
  const igId = requireEnv("META_IG_BUSINESS_ID");

  // Step 1: create media container
  const container = await api<{ id: string }>(
    `/${igId}/media`,
    {
      image_url: input.imageUrl,
      caption: input.caption.slice(0, 2200),
    },
    "POST",
  );

  // Step 2: wait a beat for Meta to download + process (usually ~2s)
  await new Promise((r) => setTimeout(r, 3000));

  // Step 3: publish
  return await api<{ id: string }>(
    `/${igId}/media_publish`,
    { creation_id: container.id },
    "POST",
  );
}

export interface CarouselPostInput {
  imageUrls: string[]; // 2–10 images
  caption: string;
}

/**
 * Publish a carousel post (2–10 images). Each image needs its own child
 * container, then one parent carousel container that references them.
 */
export async function publishCarousel(input: CarouselPostInput): Promise<{ id: string }> {
  if (input.imageUrls.length < 2 || input.imageUrls.length > 10) {
    throw new Error("Carousel requires 2–10 images");
  }
  const igId = requireEnv("META_IG_BUSINESS_ID");

  // Step 1: create one child container per image
  const childIds: string[] = [];
  for (const url of input.imageUrls) {
    const child = await api<{ id: string }>(
      `/${igId}/media`,
      { image_url: url, is_carousel_item: "true" },
      "POST",
    );
    childIds.push(child.id);
  }

  // Step 2: create carousel parent
  const parent = await api<{ id: string }>(
    `/${igId}/media`,
    {
      media_type: "CAROUSEL",
      children: childIds.join(","),
      caption: input.caption.slice(0, 2200),
    },
    "POST",
  );

  // Step 3: wait for processing
  await new Promise((r) => setTimeout(r, 5000));

  // Step 4: publish
  return await api<{ id: string }>(
    `/${igId}/media_publish`,
    { creation_id: parent.id },
    "POST",
  );
}

export interface ReelPostInput {
  videoUrl: string; // public HTTPS MP4, H.264, up to 100MB, max 90s
  caption: string;
  coverUrl?: string; // optional cover image
}

/**
 * Publish a Reel. Meta requires polling the container status before publish
 * because video encoding takes 10–60s.
 */
export async function publishReel(input: ReelPostInput): Promise<{ id: string }> {
  const igId = requireEnv("META_IG_BUSINESS_ID");

  const params: Record<string, string> = {
    media_type: "REELS",
    video_url: input.videoUrl,
    caption: input.caption.slice(0, 2200),
  };
  if (input.coverUrl) params.cover_url = input.coverUrl;

  const container = await api<{ id: string }>(`/${igId}/media`, params, "POST");

  // Poll container status up to 2 minutes
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const status = await api<{ status_code: string }>(`/${container.id}`, {
      fields: "status_code",
    });
    if (status.status_code === "FINISHED") break;
    if (status.status_code === "ERROR")
      throw new Error(`Reel processing failed on ${container.id}`);
    await new Promise((r) => setTimeout(r, 5000));
  }

  return await api<{ id: string }>(
    `/${igId}/media_publish`,
    { creation_id: container.id },
    "POST",
  );
}
