import aiohttp
import asyncio
import hashlib
from typing import Dict, Any, List


async def lookup_email_identity(email: str) -> Dict[str, Any]:
    """
    Try to find social accounts directly linked to an email address.
    Returns confirmed platform handles and metadata.

    Methods used:
    - GitHub search API (finds users with that public email)
    - Gravatar (MD5 hash lookup — confirms email is registered)
    - Hunter.io-style email guessing (domain-based, free)
    """
    confirmed: List[Dict[str, Any]] = []
    email_lower = email.strip().lower()
    email_md5 = hashlib.md5(email_lower.encode()).hexdigest()

    headers = {
        "User-Agent": "ShadowSelf-OSINT",
        "Accept": "application/json",
    }

    timeout = aiohttp.ClientTimeout(total=10)
    async with aiohttp.ClientSession(headers=headers, timeout=timeout) as session:

        # ── 1. GitHub: search users by email ──────────────────────────────────
        try:
            gh_url = f"https://api.github.com/search/users?q={email_lower}+in:email"
            async with session.get(gh_url) as resp:
                if resp.status == 200:
                    data = await resp.json(content_type=None)
                    for item in data.get("items", [])[:5]:
                        login = item.get("login", "")
                        confirmed.append({
                            "platform": "GitHub",
                            "username": login,
                            "url": f"https://github.com/{login}",
                            "verified": True,
                            "method": "email_search",
                            "avatar_url": item.get("avatar_url"),
                        })
        except Exception as e:
            print(f"GitHub email lookup error: {e}")

        # ── 2. Gravatar: MD5 hash of email ────────────────────────────────────
        try:
            gravatar_url = f"https://www.gravatar.com/avatar/{email_md5}?d=404&s=80"
            async with session.get(gravatar_url, allow_redirects=False) as resp:
                if resp.status == 200:
                    # Fetch profile JSON
                    profile_url = f"https://en.gravatar.com/{email_md5}.json"
                    async with session.get(profile_url) as profile_resp:
                        display_name = email_lower.split("@")[0]
                        profile_link = f"https://gravatar.com/{email_md5}"
                        if profile_resp.status == 200:
                            pdata = await profile_resp.json(content_type=None)
                            entry = pdata.get("entry", [{}])[0]
                            display_name = (
                                entry.get("displayName")
                                or entry.get("preferredUsername")
                                or display_name
                            )
                            profile_link = entry.get("profileUrl", profile_link)

                        confirmed.append({
                            "platform": "Gravatar",
                            "username": display_name,
                            "url": profile_link,
                            "avatar_url": f"https://www.gravatar.com/avatar/{email_md5}?s=80",
                            "verified": True,
                            "method": "email_hash",
                        })
        except Exception as e:
            print(f"Gravatar lookup error: {e}")

        # ── 3. Keybase: email-based lookup ────────────────────────────────────
        try:
            kb_url = f"https://keybase.io/_/api/1.0/user/lookup.json?email={email_lower}"
            async with session.get(kb_url) as resp:
                if resp.status == 200:
                    data = await resp.json(content_type=None)
                    them = data.get("them")
                    if them and isinstance(them, list) and len(them) > 0:
                        user = them[0]
                        kb_username = user.get("basics", {}).get("username", "")
                        if kb_username:
                            confirmed.append({
                                "platform": "Keybase",
                                "username": kb_username,
                                "url": f"https://keybase.io/{kb_username}",
                                "verified": True,
                                "method": "email_search",
                            })
        except Exception as e:
            print(f"Keybase email lookup error: {e}")

        # ── 4. LinkedIn: guess from email local-part ──────────────────────────
        # e.g. john.doe@gmail.com → tries /in/john-doe, /in/johndoe, /in/doe-john
        # LinkedIn returns 200 for existing profiles (with auth wall) and 404 for missing.
        try:
            local = email_lower.split("@")[0]
            # Build candidate slugs from the local part
            parts = [p for p in local.replace("_", ".").replace("-", ".").split(".") if p]
            li_candidates: list[str] = []
            if len(parts) >= 2:
                li_candidates.append(f"{parts[0]}-{parts[1]}")    # john-doe
                li_candidates.append(f"{parts[0]}{parts[1]}")      # johndoe
                li_candidates.append(f"{parts[1]}-{parts[0]}")    # doe-john
            li_candidates.append(local)                            # raw local part

            li_headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                ),
            }
            for slug in li_candidates:
                li_url = f"https://www.linkedin.com/in/{slug}/"
                try:
                    async with session.get(
                        li_url,
                        headers=li_headers,
                        allow_redirects=True,
                        timeout=aiohttp.ClientTimeout(total=6),
                    ) as li_resp:
                        if li_resp.status == 200:
                            confirmed.append({
                                "platform": "LinkedIn",
                                "username": slug,
                                "url": li_url,
                                "verified": True,
                                "method": "email_name_guess",
                            })
                            break  # found one — stop trying
                except Exception:
                    continue
        except Exception as e:
            print(f"LinkedIn name lookup error: {e}")

    return {
        "email": email,
        "email_md5": email_md5,
        "confirmed_accounts": confirmed,
        "confirmed_count": len(confirmed),
    }
