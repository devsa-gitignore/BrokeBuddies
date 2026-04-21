import asyncio
import json
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
from osint.breaches import check_hibp
from osint.sherlock import check_sherlock
from osint.trufflehog import check_trufflehog
from osint.email_identity import lookup_email_identity
from osint.scraper import scrape_emails_for_domain
from osint.webhooks import send_webhook_alert
from osint.intelligence import analyze_target_intelligence, analyze_password_risk
from osint.mutator import generate_password_mutations
from osint.schemas import ScanRequest, ScanResult, ExposureScore, BreachInfo, SocialProfile, Secret
import datetime

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


async def run_full_osint_scan(email: str, username: str, repo_url: str = "") -> dict:
    """Performs a full OSINT pipeline scan for a single target and returns the raw results."""
    
    # 1. Email Identity
    email_identity = await lookup_email_identity(email)
    confirmed_handles: dict[str, set] = {}
    for acct in email_identity.get("confirmed_accounts", []):
        platform = acct["platform"]
        confirmed_handles.setdefault(platform, set()).add(acct["username"].lower())

    # 2. Breach Check
    hibp_results = await check_hibp(email)

    # 3. Sherlock
    usernames = [u.strip() for u in username.split(",") if u.strip()]
    all_profiles = []
    seen_keys = set()
    
    # Add confirmed from email
    for acct in email_identity.get("confirmed_accounts", []):
        key = (acct["platform"], acct["url"])
        if key not in seen_keys:
            seen_keys.add(key)
            all_profiles.append({
                "username": acct["username"],
                "platform": acct["platform"],
                "url": acct["url"],
                "found": True,
                "verified": True,
                "avatar_url": acct.get("avatar_url"),
            })

    # Username hunt
    for uname in usernames:
        result = await check_sherlock(uname)
        for p in result.get("profiles", []):
            key = (p["platform"], p["url"])
            if key in seen_keys: continue
            seen_keys.add(key)
            platform_confirmed = confirmed_handles.get(p["platform"], set())
            is_verified = p["username"].lower() in platform_confirmed
            all_profiles.append({**p, "verified": is_verified})

    # 4. Trufflehog
    trufflehog_results = await check_trufflehog(repo_url) if repo_url else {"secrets": [], "secrets_found": 0}

    # Calculate Score
    # 1. Breaches (Capped at 40 pts)
    breach_points = 0
    for b in hibp_results.get("breaches", []):
        bp = 2 # Base points for being in a breach
        data_types = [d.lower() for d in b.get("breached_data", [])]
        if any(x in data_types for x in ["passwords", "credentials", "hashes"]):
            bp += 15
        elif any(x in data_types for x in ["email addresses", "usernames"]):
            bp += 2
        if any(x in data_types for x in ["phone numbers", "physical addresses", "dates of birth"]):
            bp += 5
        breach_points += bp
    
    # 2. Secrets (Capped at 40 pts)
    secret_points = 0
    for s in trufflehog_results.get("secrets", []):
        sev = s.get("severity", "low").lower()
        if sev in ["high", "critical"]:
            secret_points += 25
        elif sev == "medium":
            secret_points += 10
        else:
            secret_points += 5
            
    # 3. Profiles (Capped at 20 pts)
    profile_points = 0
    for p in all_profiles:
        if p.get("verified"):
            profile_points += 5
        else:
            profile_points += 1
            
    total_score = min(breach_points, 40) + min(secret_points, 40) + min(profile_points, 20)
    
    return {
        "email": email,
        "username": username,
        "breaches": hibp_results.get("breaches", []),
        "social_profiles": all_profiles,
        "secrets": trufflehog_results.get("secrets", []),
        "exposure_score": {
            "total_breaches": len(hibp_results.get("breaches", [])),
            "total_credentials_exposed": len(hibp_results.get("credentials_exposed", [])),
            "platforms_found": len(all_profiles),
            "secrets_found": trufflehog_results.get("secrets_found", 0),
            "score": min(int(total_score), 100)
        },
        "timestamp": datetime.datetime.now().isoformat()
    }


async def scan_generator(email: str, username: str, repo_url: str):
    """SSE stream version of the scan for the single-user UI."""
    yield f"data: {json.dumps({'type': 'status', 'message': 'Starting OSINT scan...', 'progress': 0})}\n\n"
    
    # We'll run it in phases here to maintain the "live" feel for the single scan
    # but reuse the logic components. 
    # For brevity in this refactor, I'll keep the granular yields for the single scanner.
    
    # [PHASE 0]
    yield f"data: {json.dumps({'type': 'status', 'message': 'Resolving identity...', 'progress': 10})}\n\n"
    res = await run_full_osint_scan(email, username, repo_url)
    
    # Broadcast results in blocks for the specific UI expectations
    yield f"data: {json.dumps({'type': 'hibp', 'data': {'breaches': res['breaches'], 'total_breaches': len(res['breaches'])}})}\n\n"
    yield f"data: {json.dumps({'type': 'sherlock', 'data': {'profiles': res['social_profiles'], 'platforms_found': len(res['social_profiles'])}})}\n\n"
    yield f"data: {json.dumps({'type': 'trufflehog', 'data': {'secrets': res['secrets'], 'secrets_found': len(res['secrets'])}})}\n\n"
    yield f"data: {json.dumps({'type': 'status', 'message': 'Scan complete', 'progress': 100})}\n\n"


class DomainScanRequest(BaseModel):
    domain: str
    webhook_url: Optional[str] = None

async def domain_scan_generator(domain: str, webhook_url: Optional[str] = None):
    """SSE stream for domain-wide scanning."""
    yield f"data: {json.dumps({'type': 'status', 'message': f'Initiating domain-wide scan for {domain}...', 'progress': 5})}\n\n"
    
    # 1. Scrape Emails
    emails = await scrape_emails_for_domain(domain)
    yield f"data: {json.dumps({'type': 'status', 'message': f'Found {len(emails)} employees associated with {domain}', 'progress': 20})}\n\n"
    yield f"data: {json.dumps({'type': 'emails_found', 'count': len(emails), 'emails': emails})}\n\n"
    
    # 2. Run Batch Scans (Sequential for rate limit safety, but can be concurrent)
    all_results = []
    for i, email in enumerate(emails):
        progress = 20 + int((i / len(emails)) * 70)
        yield f"data: {json.dumps({'type': 'status', 'message': f'Analyzing exposure for {email}...', 'progress': progress})}\n\n"
        
        try:
            # We use the email prefix as a guess for the username
            username_guess = email.split("@")[0]
            result = await run_full_osint_scan(email, username_guess)
            all_results.append(result)
            
            # 3. Webhook Dispatch for Critical Hits
            if webhook_url:
                score = result['exposure_score']['score']
                if score >= 50 or result['secrets']:
                    await send_webhook_alert(webhook_url, email, result)

            # Send intermediate result for real-time leaderboard updates
            yield f"data: {json.dumps({'type': 'scan_result', 'data': result})}\n\n"
        except Exception as e:
            print(f"Error scanning {email}: {e}")
            yield f"data: {json.dumps({'type': 'warning', 'message': f'Skipped {email}: {str(e)}'})}\n\n"

    # 3. Final Ranking
    ranked = sorted(all_results, key=lambda x: x['exposure_score']['score'], reverse=True)
    yield f"data: {json.dumps({'type': 'status', 'message': 'Domain analysis complete', 'progress': 100})}\n\n"
    yield f"data: {json.dumps({'type': 'final_report', 'ranked_employees': ranked})}\n\n"


@app.post("/scan-domain")
async def scan_domain(request: DomainScanRequest):
    if not request.domain:
        raise HTTPException(status_code=400, detail="Domain is required")
    
    return StreamingResponse(
        domain_scan_generator(request.domain, request.webhook_url),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


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

class MutateRequest(BaseModel):
    password: str

@app.post("/mutate-password")
async def mutate_password(request: MutateRequest):
    if not request.password:
        return {"mutations": []}
    return {"mutations": generate_password_mutations(request.password)}

@app.post("/analyze-threats")
async def analyze_threats(scan_result: dict):
    analysis = await analyze_target_intelligence(scan_result)
    return {"analysis": analysis}

class PasswordAuditRequest(BaseModel):
    password: str
    mutations: list

@app.post("/analyze-password-risk")
async def analyze_password_audit(request: PasswordAuditRequest):
    analysis = await analyze_password_risk(request.password, request.mutations)
    return analysis


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

