"""Delete all old FB Page posts; idempotent (skips already-deleted)."""
import json
import os
import sys
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone

PAGE_ID = os.environ["META_FB_PAGE_ID"]
TOKEN = os.environ["META_PAGE_ACCESS_TOKEN"]

with open("docs/social-cleanup-log/.tmp/fb_posts_initial.json", encoding="utf-8") as f:
    initial = json.load(f)

posts = initial.get("data", [])

deleted = []
skipped = []
failed = []

for p in posts:
    post_id = p["id"]
    url = f"https://graph.facebook.com/v19.0/{post_id}?access_token={urllib.parse.quote(TOKEN)}"
    req = urllib.request.Request(url, method="DELETE")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            try:
                parsed = json.loads(body)
            except Exception:
                parsed = {"raw": body}
            if parsed.get("success") is True:
                print(f"DELETED  {post_id}  ({p.get('created_time','?')})")
                deleted.append({"id": post_id, "created_time": p.get("created_time"), "message": p.get("message")})
            else:
                print(f"UNEXPECTED  {post_id}  -> {parsed}")
                failed.append({"id": post_id, "response": parsed})
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = {"raw": body, "status": e.code}
        err = parsed.get("error", {})
        # Common idempotent skip cases: object already gone (code 100 / subcode 33) or unsupported
        msg_lower = str(err.get("message", "")).lower()
        if e.code in (404,) or "does not exist" in msg_lower or "cannot be loaded" in msg_lower:
            print(f"SKIPPED (already gone)  {post_id}")
            skipped.append({"id": post_id, "reason": err.get("message")})
        else:
            print(f"FAILED  {post_id}  -> http={e.code} err={err}")
            failed.append({"id": post_id, "http_status": e.code, "error": err})
    except Exception as e:
        print(f"FAILED (exception)  {post_id}  -> {e}")
        failed.append({"id": post_id, "exception": str(e)})

audit = {
    "page_id": PAGE_ID,
    "run_at": datetime.now(timezone.utc).isoformat(),
    "summary": {
        "posts_seen": len(posts),
        "deleted": len(deleted),
        "skipped_already_gone": len(skipped),
        "failed": len(failed),
    },
    "deleted_posts": deleted,
    "skipped_posts": skipped,
    "failed_posts": failed,
    "all_post_ids_at_run_start": [p["id"] for p in posts],
}

out_path = "docs/social-cleanup-log/fb-page-2026-05-05.json"
# If audit log already exists, merge so re-runs append, not overwrite
existing = None
if os.path.exists(out_path):
    try:
        with open(out_path, encoding="utf-8") as f:
            existing = json.load(f)
    except Exception:
        existing = None

if existing and isinstance(existing, dict) and "runs" in existing:
    existing["runs"].append(audit)
    final = existing
elif existing and isinstance(existing, dict):
    final = {"page_id": PAGE_ID, "runs": [existing, audit]}
else:
    final = {"page_id": PAGE_ID, "runs": [audit]}

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(final, f, indent=2)

print(f"\nAudit log written: {out_path}")
print(f"Summary: deleted={len(deleted)}, skipped={len(skipped)}, failed={len(failed)}")

if failed:
    sys.exit(1)
