/**
 * Interactive OAuth setup for Pinterest + Meta (Instagram) publishing.
 *
 * One-time flow: opens the user's default browser to the platform authorize
 * URL, receives the redirect locally on http://127.0.0.1:47501/callback,
 * exchanges the code for a long-lived refresh token, and writes the tokens
 * to .env.local.
 *
 * Usage:
 *   pnpm tsx scripts/social-oauth-setup.ts pinterest
 *   pnpm tsx scripts/social-oauth-setup.ts meta
 *
 * Before running:
 *   - Pinterest: your app at developers.pinterest.com must have redirect URI
 *     `http://127.0.0.1:47501/callback` whitelisted in app settings
 *     (add it alongside your production redirect URI).
 *   - Meta: your FB App must have `http://127.0.0.1:47501/callback` added as
 *     a valid OAuth redirect URI under Facebook Login → Settings.
 *
 * Required env (before running):
 *   PINTEREST_CLIENT_ID
 *   PINTEREST_CLIENT_SECRET
 *   META_APP_ID
 *   META_APP_SECRET
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const ENV_PATH = join(REPO_ROOT, ".env.local");

const CALLBACK_PORT = 47501;
const CALLBACK_URL = `http://127.0.0.1:${CALLBACK_PORT}/callback`;

// --- .env.local helpers ---

function loadEnv(): Record<string, string> {
  if (!existsSync(ENV_PATH)) return {};
  const text = readFileSync(ENV_PATH, "utf8");
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

function upsertEnv(updates: Record<string, string>): void {
  const existing = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  const keys = new Set(Object.keys(updates));
  const lines = existing.split(/\r?\n/);
  const kept: string[] = [];
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)=/);
    if (m && keys.has(m[1])) continue;
    kept.push(line);
  }
  while (kept.length > 0 && kept[kept.length - 1] === "") kept.pop();
  for (const [k, v] of Object.entries(updates)) kept.push(`${k}=${v}`);
  writeFileSync(ENV_PATH, kept.join("\n") + "\n");
}

// --- Browser open (cross-platform) ---

function openBrowser(url: string): void {
  const platform = process.platform;
  const cmd =
    platform === "win32" ? "cmd" : platform === "darwin" ? "open" : "xdg-open";
  const args = platform === "win32" ? ["/c", "start", "", url] : [url];
  spawn(cmd, args, { detached: true, stdio: "ignore" }).unref();
}

// --- Callback server ---

interface CallbackResult {
  code?: string;
  error?: string;
  state?: string;
}

function waitForCallback(expectedState: string): Promise<CallbackResult> {
  return new Promise((resolve) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url ?? "/", `http://localhost:${CALLBACK_PORT}`);
      if (url.pathname !== "/callback") {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const code = url.searchParams.get("code") ?? undefined;
      const error = url.searchParams.get("error") ?? undefined;
      const state = url.searchParams.get("state") ?? undefined;
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        `<html><body style="font-family: sans-serif; padding: 2em; text-align: center;">
          <h2>${error ? "❌ Authorization failed" : "✅ Authorization received"}</h2>
          <p>${error ?? "You can close this tab and return to the terminal."}</p>
        </body></html>`,
      );
      server.close();
      resolve({ code, error, state });
    });
    server.listen(CALLBACK_PORT, "127.0.0.1");
  });
}

function randomState(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// --- Pinterest flow ---

async function setupPinterest(env: Record<string, string>): Promise<void> {
  const clientId = env.PINTEREST_CLIENT_ID;
  const clientSecret = env.PINTEREST_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing PINTEREST_CLIENT_ID / PINTEREST_CLIENT_SECRET in .env.local. " +
        "Copy these from your Pinterest dev app at developers.pinterest.com/apps.",
    );
  }

  const scope = "boards:read,pins:read,pins:write";
  const state = randomState();
  const authUrl =
    `https://www.pinterest.com/oauth/?` +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: CALLBACK_URL,
      response_type: "code",
      scope,
      state,
    }).toString();

  console.log(
    "\n■ Pinterest OAuth — opening browser for authorization...",
  );
  console.log(
    `  If the browser doesn't open, visit this URL manually:\n  ${authUrl}\n`,
  );
  console.log(
    `  Make sure your Pinterest app has this exact redirect URI whitelisted:\n  ${CALLBACK_URL}\n`,
  );

  const waiting = waitForCallback(state);
  openBrowser(authUrl);

  const result = await waiting;
  if (result.error || !result.code)
    throw new Error(`Pinterest auth failed: ${result.error ?? "no code"}`);
  if (result.state !== state) throw new Error("State mismatch — possible CSRF");

  console.log(`  ✓ received authorization code (len=${result.code.length})`);

  // Exchange code for access_token + refresh_token
  const tokenRes = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: result.code,
      redirect_uri: CALLBACK_URL,
    }),
  });
  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    throw new Error(`Pinterest token exchange failed: ${tokenRes.status} ${txt}`);
  }
  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_token_expires_in?: number;
    scope: string;
  };
  console.log(`  ✓ access token (expires in ${tokens.expires_in}s)`);
  console.log(
    `  ✓ refresh token (expires in ${tokens.refresh_token_expires_in ?? "?"}s)`,
  );

  upsertEnv({ PINTEREST_REFRESH_TOKEN: tokens.refresh_token });
  console.log("  ✓ wrote PINTEREST_REFRESH_TOKEN to .env.local");
}

// --- Meta (IG) flow ---

async function setupMeta(env: Record<string, string>): Promise<void> {
  const appId = env.META_APP_ID;
  const appSecret = env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error(
      "Missing META_APP_ID / META_APP_SECRET in .env.local. " +
        "Copy these from your FB app at developers.facebook.com/apps.",
    );
  }

  // Scopes needed to publish to Instagram via the linked FB Page:
  //   pages_show_list, pages_read_engagement, pages_manage_posts,
  //   instagram_basic, instagram_content_publish
  const scopes = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "instagram_basic",
    "instagram_content_publish",
  ].join(",");
  const state = randomState();
  const authUrl =
    `https://www.facebook.com/v19.0/dialog/oauth?` +
    new URLSearchParams({
      client_id: appId,
      redirect_uri: CALLBACK_URL,
      scope: scopes,
      response_type: "code",
      state,
    }).toString();

  console.log(
    "\n■ Meta OAuth — opening browser for authorization...",
  );
  console.log(
    `  If the browser doesn't open, visit this URL manually:\n  ${authUrl}\n`,
  );
  console.log(
    `  Make sure your FB app has this redirect URI whitelisted under\n  Facebook Login → Settings → Valid OAuth Redirect URIs:\n  ${CALLBACK_URL}\n`,
  );

  const waiting = waitForCallback(state);
  openBrowser(authUrl);
  const result = await waiting;
  if (result.error || !result.code)
    throw new Error(`Meta auth failed: ${result.error ?? "no code"}`);
  if (result.state !== state) throw new Error("State mismatch — possible CSRF");

  console.log(`  ✓ received authorization code (len=${result.code.length})`);

  // 1. Exchange code for short-lived user token
  const shortRes = await fetch(
    "https://graph.facebook.com/v19.0/oauth/access_token?" +
      new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: CALLBACK_URL,
        code: result.code,
      }),
  );
  if (!shortRes.ok)
    throw new Error(
      `short-token exchange failed: ${shortRes.status} ${await shortRes.text()}`,
    );
  const shortToken = (await shortRes.json()) as { access_token: string; expires_in?: number };

  // 2. Upgrade short-lived user token to long-lived user token (~60 days)
  const longRes = await fetch(
    "https://graph.facebook.com/v19.0/oauth/access_token?" +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortToken.access_token,
      }),
  );
  if (!longRes.ok)
    throw new Error(
      `long-token exchange failed: ${longRes.status} ${await longRes.text()}`,
    );
  const longToken = (await longRes.json()) as { access_token: string; expires_in?: number };
  console.log(`  ✓ long-lived user token (expires in ${longToken.expires_in}s)`);

  // 3. Get the user's Pages — we need the Page token, not the user token
  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${longToken.access_token}`,
  );
  if (!pagesRes.ok)
    throw new Error(
      `/me/accounts failed: ${pagesRes.status} ${await pagesRes.text()}`,
    );
  const pagesData = (await pagesRes.json()) as {
    data: Array<{ id: string; name: string; access_token: string; instagram_business_account?: { id: string } }>;
  };

  if (pagesData.data.length === 0) {
    throw new Error(
      "No Facebook Pages found for this account. Create a Facebook Page, link your Instagram Business account to it, and try again.",
    );
  }

  console.log(`  ✓ found ${pagesData.data.length} Page(s):`);
  for (const p of pagesData.data) console.log(`      - ${p.name} (id=${p.id})`);

  // 4. Find the Page with an Instagram Business account linked.
  const pageWithIG = pagesData.data.find((p) => p.instagram_business_account);
  if (!pageWithIG || !pageWithIG.instagram_business_account) {
    throw new Error(
      "None of your Pages have an Instagram Business account linked. " +
        "In the Instagram app: Settings → Account → Linked Accounts → Facebook, " +
        "and ensure you've converted to Business/Creator and linked to a Page you own.",
    );
  }

  const igId = pageWithIG.instagram_business_account.id;
  console.log(
    `  ✓ IG Business id=${igId} linked to Page "${pageWithIG.name}"`,
  );

  // 5. Persist the Page Access Token + IG id
  upsertEnv({
    META_PAGE_ACCESS_TOKEN: pageWithIG.access_token,
    META_IG_BUSINESS_ID: igId,
  });
  console.log(
    "  ✓ wrote META_PAGE_ACCESS_TOKEN + META_IG_BUSINESS_ID to .env.local",
  );
  console.log(
    "\n  NOTE: Page tokens last ~60 days. Re-run this script every 50 days to refresh.",
  );
}

// --- Main ---

async function main(): Promise<void> {
  const target = process.argv[2];
  if (!target || !["pinterest", "meta"].includes(target)) {
    console.error(
      "Usage: pnpm tsx scripts/social-oauth-setup.ts <pinterest|meta>",
    );
    process.exit(1);
  }

  const env = { ...process.env, ...loadEnv() } as Record<string, string>;

  try {
    if (target === "pinterest") await setupPinterest(env);
    else await setupMeta(env);
    console.log("\n■ Done. Token(s) saved. Test with a publish script next.\n");
  } catch (e) {
    console.error(`\nERROR: ${e instanceof Error ? e.message : e}\n`);
    process.exit(1);
  }
}

await main();
