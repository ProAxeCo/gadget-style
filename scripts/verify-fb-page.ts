/**
 * One-off: verify FB Page posting capability via Graph API.
 * DRY-RUN ONLY — uses published=false and immediately deletes the test post.
 *
 * Steps:
 *   1. debug_token — confirm token validity, type, scopes.
 *   2. GET /{page-id}/posts — confirm READ works.
 *   3. POST /{page-id}/feed with published=false — confirm WRITE works.
 *   4. DELETE /{post-id} — clean up so the Page is unchanged.
 *
 * Run: pnpm tsx scripts/verify-fb-page.ts
 */

const GRAPH = "https://graph.facebook.com/v19.0";

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = req("META_PAGE_ACCESS_TOKEN");
  const url = new URL(`${GRAPH}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("access_token", token);
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${text}`);
  return JSON.parse(text) as T;
}

async function post<T>(path: string, params: Record<string, string>): Promise<T> {
  const token = req("META_PAGE_ACCESS_TOKEN");
  const body = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(`${GRAPH}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${text}`);
  return JSON.parse(text) as T;
}

async function del<T>(path: string): Promise<T> {
  const token = req("META_PAGE_ACCESS_TOKEN");
  const url = new URL(`${GRAPH}${path}`);
  url.searchParams.set("access_token", token);
  const res = await fetch(url, { method: "DELETE" });
  const text = await res.text();
  if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}: ${text}`);
  return JSON.parse(text) as T;
}

interface DebugTokenResp {
  data: {
    is_valid: boolean;
    type: string;
    app_id: string;
    profile_id?: string;
    expires_at: number;
    data_access_expires_at: number;
    scopes: string[];
  };
}

interface PostsResp {
  data: Array<{ id: string; message?: string; created_time: string }>;
}

interface CreatePostResp { id: string; }
interface DeleteResp { success: boolean; }

async function main() {
  const pageId = req("META_FB_PAGE_ID");
  const appId = req("META_APP_ID");
  const appSecret = req("META_APP_SECRET");
  const token = req("META_PAGE_ACCESS_TOKEN");

  const results: Record<string, unknown> = {};

  // 1. debug_token
  console.log("Step 1: debug_token …");
  const dt = await get<DebugTokenResp>("/debug_token", {
    input_token: token,
    access_token: `${appId}|${appSecret}`,
  });
  results.tokenValid = dt.data.is_valid;
  results.tokenType = dt.data.type;
  results.tokenAppId = dt.data.app_id;
  results.tokenProfileId = dt.data.profile_id;
  results.tokenExpiresAt = dt.data.expires_at;
  results.tokenDataAccessExpiresAt = dt.data.data_access_expires_at;
  results.scopesCount = dt.data.scopes?.length ?? 0;
  console.log(`  is_valid=${dt.data.is_valid} type=${dt.data.type} profile_id=${dt.data.profile_id}`);

  if (!dt.data.is_valid) {
    console.error("Token is NOT valid. Aborting.");
    process.exit(1);
  }
  if (dt.data.profile_id !== pageId) {
    console.error(`Token profile_id=${dt.data.profile_id} does not match META_FB_PAGE_ID=${pageId}`);
    process.exit(1);
  }

  // 2. READ recent posts
  console.log("Step 2: GET /{page-id}/posts …");
  const posts = await get<PostsResp>(`/${pageId}/posts`, { limit: "5", fields: "id,message,created_time" });
  results.readPostsOk = true;
  results.recentPostCount = posts.data?.length ?? 0;
  console.log(`  retrieved ${posts.data?.length ?? 0} recent post(s).`);

  // 3. WRITE — published=false
  console.log("Step 3: POST /{page-id}/feed with published=false …");
  const testMessage = `[DRY-RUN] Gadget Style internal connectivity test ${new Date().toISOString()}. This will be deleted within seconds.`;
  let createdPostId: string | undefined;
  try {
    const created = await post<CreatePostResp>(`/${pageId}/feed`, {
      message: testMessage,
      published: "false",
    });
    createdPostId = created.id;
    results.writePostOk = true;
    results.createdPostId = created.id;
    console.log(`  created (unpublished) post id=${created.id}`);
  } catch (err) {
    results.writePostOk = false;
    results.writeError = (err as Error).message;
    console.error(`  WRITE failed: ${(err as Error).message}`);
  }

  // 4. DELETE — only if create succeeded
  if (createdPostId) {
    console.log("Step 4: DELETE /{post-id} …");
    try {
      const d = await del<DeleteResp>(`/${createdPostId}`);
      results.deletePostOk = d.success === true;
      console.log(`  delete success=${d.success}`);
    } catch (err) {
      results.deletePostOk = false;
      results.deleteError = (err as Error).message;
      console.error(`  DELETE failed: ${(err as Error).message}`);
      console.error(`  ⚠ Manual cleanup may be needed for post ${createdPostId}`);
    }
  }

  console.log("\n--- SUMMARY ---");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
