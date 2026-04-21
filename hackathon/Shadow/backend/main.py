import asyncio
import json
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from osint.hibp import check_hibp
from osint.sherlock import check_sherlock
from osint.trufflehog import check_trufflehog
from osint.email_identity import lookup_email_identity
from osint.schemas import ScanRequest, ScanResult

app = FastAPI(title="ShadowSelf OSINT Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "healthy"}


async def scan_generator(email: str, username: str, repo_url: str):
    """SSE stream of scan results. Runs 4 phases."""

    yield f"data: {json.dumps({'type': 'status', 'message': 'Starting OSINT scan...', 'progress': 0})}\n\n"

    # ── Phase 0: Email identity lookup (GitHub, Gravatar, Keybase) ───────────
    email_identity = {"confirmed_accounts": [], "confirmed_count": 0}
    try:
        yield f"data: {json.dumps({'type': 'status', 'message': 'Resolving email to known accounts...', 'progress': 5})}\n\n"
        email_identity = await lookup_email_identity(email)
        count = email_identity.get("confirmed_count", 0)
        yield f"data: {json.dumps({'type': 'email_identity', 'data': email_identity})}\n\n"
        if count > 0:
            platforms = ", ".join(a["platform"] for a in email_identity["confirmed_accounts"])
            yield f"data: {json.dumps({'type': 'status', 'message': f'Email confirmed on {count} platform(s): {platforms}', 'progress': 15})}\n\n"
        else:
            yield f"data: {json.dumps({'type': 'status', 'message': 'No direct email-to-account links found', 'progress': 15})}\n\n"
    except Exception as e:
        print(f"Email identity error: {e}")
        yield f"data: {json.dumps({'type': 'warning', 'message': f'Email identity lookup skipped: {str(e)}'})}\n\n"

    # Build a map: platform → set of confirmed usernames (for marking verified later)
    confirmed_handles: dict[str, set] = {}
    for acct in email_identity.get("confirmed_accounts", []):
        platform = acct["platform"]
        confirmed_handles.setdefault(platform, set()).add(acct["username"].lower())

    # ── Phase 1: Breach check (XposedOrNot) ──────────────────────────────────
    hibp_results = {"total_breaches": 0, "credentials_exposed": [], "breaches": []}
    try:
        yield f"data: {json.dumps({'type': 'status', 'message': 'Checking breach databases...', 'progress': 20})}\n\n"
        hibp_results = await check_hibp(email)
    except Exception as e:
        print(f"HIBP phase error: {e}")
        yield f"data: {json.dumps({'type': 'warning', 'message': f'Breach check skipped: {str(e)}'})}\n\n"
    yield f"data: {json.dumps({'type': 'hibp', 'data': hibp_results})}\n\n"

    # ── Phase 2: Social profile search (username-based + email-verified merge) ─
    sherlock_results = {"usernames": [], "platforms_checked": 0, "platforms_found": 0, "profiles": []}
    try:
        usernames = [u.strip() for u in username.split(",") if u.strip()]
        username_list = ", ".join(f"@{u}" for u in usernames)
        yield f"data: {json.dumps({'type': 'status', 'message': f'Searching social media for {username_list}...', 'progress': 40})}\n\n"

        all_profiles = []
        total_checked = 0

        # Add email-confirmed accounts directly (they are already verified)
        seen_keys = set()
        for acct in email_identity.get("confirmed_accounts", []):
            key = (acct["platform"], acct["url"])
            if key not in seen_keys:
                seen_keys.add(key)
                all_profiles.append({
                    "username": acct["username"],
                    "platform": acct["platform"],
                    "url": acct["url"],
                    "found": True,
                    "verified": True,          # ← confirmed via email
                    "avatar_url": acct.get("avatar_url"),
                })

        # Username-based search
        for uname in usernames:
            result = await check_sherlock(uname)
            total_checked = max(total_checked, result.get("platforms_checked", 0))
            for p in result.get("profiles", []):
                key = (p["platform"], p["url"])
                if key in seen_keys:
                    continue  # already have this one from email lookup
                seen_keys.add(key)

                # Mark as verified if this platform+username was confirmed via email
                platform_confirmed = confirmed_handles.get(p["platform"], set())
                is_verified = p["username"].lower() in platform_confirmed

                all_profiles.append({
                    **p,
                    "verified": is_verified,
                })

        sherlock_results = {
            "usernames": usernames,
            "platforms_checked": total_checked,
            "platforms_found": len(all_profiles),
            "profiles": all_profiles,
        }
    except Exception as e:
        print(f"Sherlock phase error: {e}")
        yield f"data: {json.dumps({'type': 'warning', 'message': f'Social scan skipped: {str(e)}'})}\n\n"
    yield f"data: {json.dumps({'type': 'sherlock', 'data': sherlock_results})}\n\n"

    # ── Phase 3: Repository secrets scan ─────────────────────────────────────
    trufflehog_results = {"repo_url": "", "secrets_found": 0, "secrets": []}
    try:
        yield f"data: {json.dumps({'type': 'status', 'message': 'Scanning repository for secrets...', 'progress': 75})}\n\n"
        trufflehog_results = (
            await check_trufflehog(repo_url)
            if repo_url
            else {"repo_url": "", "secrets_found": 0, "secrets": [], "files_scanned": 0}
        )
    except Exception as e:
        print(f"TruffleHog phase error: {e}")
        yield f"data: {json.dumps({'type': 'warning', 'message': f'Repo scan skipped: {str(e)}'})}\n\n"
    yield f"data: {json.dumps({'type': 'trufflehog', 'data': trufflehog_results})}\n\n"

    # ── Done ──────────────────────────────────────────────────────────────────
    yield f"data: {json.dumps({'type': 'status', 'message': 'Scan complete', 'progress': 100})}\n\n"


@app.post("/scan")
async def scan(request: ScanRequest):
    if not request.email:
        raise HTTPException(status_code=400, detail="Email is required")
    if not request.username:
        raise HTTPException(status_code=400, detail="At least one username is required")

    return StreamingResponse(
        scan_generator(request.email, request.username, request.repo_url or ""),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


class VerifyUrlRequest(BaseModel):
    url: str


# Map of hostname fragments → platform display name
PLATFORM_HOSTS = {
    "instagram.com":   "Instagram",
    "linkedin.com":    "LinkedIn",
    "github.com":      "GitHub",
    "twitter.com":     "Twitter/X",
    "x.com":           "Twitter/X",
    "tiktok.com":      "TikTok",
    "youtube.com":     "YouTube",
    "reddit.com":      "Reddit",
    "leetcode.com":    "LeetCode",
    "codechef.com":    "CodeChef",
    "medium.com":      "Medium",
    "pinterest.com":   "Pinterest",
    "soundcloud.com":  "SoundCloud",
    "keybase.io":      "Keybase",
}


def detect_platform(url: str) -> tuple[str, str]:
    """Return (platform_name, username) from a profile URL."""
    from urllib.parse import urlparse
    try:
        parsed = urlparse(url.strip())
        host = parsed.netloc.lstrip("www.")
        platform = next((v for k, v in PLATFORM_HOSTS.items() if host.endswith(k)), host)

        # Extract username from path
        parts = [p for p in parsed.path.strip("/").split("/") if p]
        username = ""
        if parts:
            last = parts[-1].lstrip("@")
            # Skip known non-username path segments
            if last not in ("in", "u", "user", "people", "users", "@"):
                username = last
            elif len(parts) >= 2:
                username = parts[-2].lstrip("@")
        return platform, username
    except Exception:
        return "Unknown", ""


@app.post("/verify-profile-url")
async def verify_profile_url(request: VerifyUrlRequest):
    """
    Check whether a user-supplied profile URL is reachable.
    For platforms that block server-side requests (LinkedIn returns 999,
    Twitter/X returns 403, TikTok uses Cloudflare), we validate URL structure
    instead of making an HTTP request — the user is asserting it's their account.
    """
    from urllib.parse import urlparse

    url = request.url.strip()

    if not url.startswith(("http://", "https://")):
        return {"valid": False, "reason": "URL must start with https://"}

    platform, username = detect_platform(url)

    # ── Platforms that block ALL bot HTTP requests ────────────────────────────
    # Validated by URL pattern only, not by HTTP check.
    BOT_BLOCKED = {
        "LinkedIn": {
            "host": "linkedin.com",
            "required_prefix": "/in/",   # must have /in/<slug>
        },
        "Twitter/X": {
            "host_variants": ["twitter.com", "x.com"],
            "required_prefix": "/",
        },
        "TikTok": {
            "host": "tiktok.com",
            "required_prefix": "/@",
        },
        "Instagram": {
            "host": "instagram.com",
            "required_prefix": "/",
        },
    }

    if platform in BOT_BLOCKED:
        cfg = BOT_BLOCKED[platform]
        try:
            parsed = urlparse(url)
            host = parsed.netloc.lstrip("www.")
            hosts = cfg.get("host_variants", [cfg.get("host", "")])
            if not any(host.endswith(h) for h in hosts):
                return {"valid": False, "reason": f"URL doesn't look like a {platform} profile"}

            prefix = cfg["required_prefix"]
            slug = parsed.path.lstrip("/").lstrip("@")
            if prefix != "/" and not parsed.path.startswith(prefix):
                return {"valid": False, "reason": f"URL doesn't look like a {platform} profile URL"}

            slug = parsed.path[len(prefix):].strip("/").lstrip("@") if prefix != "/" else slug
            if len(slug) < 1:
                return {"valid": False, "reason": f"Couldn't extract a username from this {platform} URL"}

            return {"valid": True, "platform": platform, "username": slug, "url": url, "verified_by": "url_format"}
        except Exception as ex:
            return {"valid": False, "reason": str(ex)}

    # ── HTTP check for all other platforms ────────────────────────────────────
    import aiohttp
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            )
        }
        timeout = aiohttp.ClientTimeout(total=8)
        async with aiohttp.ClientSession(headers=headers, timeout=timeout) as session:
            async with session.get(url, allow_redirects=True, ssl=False) as resp:
                if resp.status in (200, 301, 302):
                    return {
                        "valid": True,
                        "status_code": resp.status,
                        "platform": platform,
                        "username": username,
                        "url": url,
                    }
                else:
                    return {
                        "valid": False,
                        "reason": f"Profile returned HTTP {resp.status}",
                        "status_code": resp.status,
                    }
    except aiohttp.ClientError as e:
        return {"valid": False, "reason": f"Could not reach URL: {str(e)}"}
    except Exception as e:
        return {"valid": False, "reason": str(e)}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

