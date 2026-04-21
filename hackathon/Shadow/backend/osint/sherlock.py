import aiohttp
import asyncio
from typing import List, Dict, Any


# Per-platform detection — each platform needs a different strategy
# to avoid false positives (many return HTTP 200 even for missing users)
SITES_TO_CHECK = {
    "GitHub": {
        "url": "https://github.com/{}",
        "profile_url": "https://github.com/{}",
        "method": "status",
        "found_status": 200,
        "not_found_status": 404,
    },
    "Reddit": {
        "url": "https://www.reddit.com/user/{}/about.json",
        "profile_url": "https://www.reddit.com/u/{}",
        "method": "status",
        "found_status": 200,
        "not_found_status": 404,
    },
    "Instagram": {
        "url": "https://www.instagram.com/{}/",
        "profile_url": "https://www.instagram.com/{}/",
        "method": "body",
        "found_status": 200,
        "not_found_text": "Sorry, this page isn't available",
    },
    "LinkedIn": {
        "url": "https://www.linkedin.com/in/{}/",
        "profile_url": "https://www.linkedin.com/in/{}/",
        "method": "status",
        "found_status": 200,
        "not_found_status": 404,
    },
    "YouTube": {
        "url": "https://www.youtube.com/@{}",
        "profile_url": "https://www.youtube.com/@{}",
        "method": "status",
        "found_status": 200,
        "not_found_status": 404,
    },
    "Pinterest": {
        "url": "https://www.pinterest.com/{}/",
        "profile_url": "https://www.pinterest.com/{}/",
        "method": "status",
        "found_status": 200,
        "not_found_status": 404,
    },
    "SoundCloud": {
        "url": "https://soundcloud.com/{}",
        "profile_url": "https://soundcloud.com/{}",
        "method": "status",
        "found_status": 200,
        "not_found_status": 404,
    },
    "Keybase": {
        "url": "https://keybase.io/{}",
        "profile_url": "https://keybase.io/{}",
        "method": "status",
        "found_status": 200,
        "not_found_status": 404,
    },
    "Medium": {
        "url": "https://medium.com/@{}",
        "profile_url": "https://medium.com/@{}",
        "method": "status",
        "found_status": 200,
        "not_found_status": 404,
    },
    "LeetCode": {
        "url": "https://leetcode.com/graphql",
        "profile_url": "https://leetcode.com/{}/",
        "method": "leetcode",
    },
    "CodeChef": {
        "url": "https://www.codechef.com/users/{}",
        "profile_url": "https://www.codechef.com/users/{}",
        "method": "body",
        "found_status": 200,
        "not_found_text": "User not found",
    },
}


async def check_site(
    session: aiohttp.ClientSession,
    username: str,
    platform: str,
    config: dict,
) -> Dict[str, Any]:
    """Check if a username exists on a platform using the per-platform strategy."""
    target_url = config["url"].format(username)
    profile_url = config["profile_url"].format(username)
    method = config.get("method", "status")

    result = {
        "username": username,
        "platform": platform,
        "url": profile_url,
        "found": False,
    }

    try:
        if method == "leetcode":
            # LeetCode requires a GraphQL POST
            query = {"query": f'{{matchedUser(username: "{username}"){{username}}}}'}
            async with session.post(
                config["url"],
                json=query,
                headers={"Content-Type": "application/json", "Referer": "https://leetcode.com"},
                timeout=aiohttp.ClientTimeout(total=8),
            ) as resp:
                if resp.status == 200:
                    data = await resp.json(content_type=None)
                    matched = data.get("data", {}).get("matchedUser")
                    result["found"] = matched is not None
            return result

        async with session.get(
            target_url,
            allow_redirects=True,
            timeout=aiohttp.ClientTimeout(total=8),
        ) as resp:

            if method == "status":
                result["found"] = (resp.status == config.get("found_status", 200))

            elif method == "body":
                if resp.status != config.get("found_status", 200):
                    result["found"] = False
                else:
                    text = await resp.text(errors="ignore")
                    not_found_text = config.get("not_found_text", "")
                    result["found"] = not_found_text.lower() not in text.lower()

            elif method == "body_json":
                try:
                    data = await resp.json(content_type=None)
                    if data is None:
                        result["found"] = False
                    else:
                        result["found"] = config.get("found_key", "id") in data
                except Exception:
                    result["found"] = False

    except asyncio.TimeoutError:
        result["error"] = "Timeout"
    except Exception as e:
        result["error"] = str(e)

    return result


async def check_sherlock(username: str) -> Dict[str, Any]:
    """
    Check social media platforms for a username.
    Uses per-platform detection logic to minimise false positives.
    """
    profiles_found = []
    profiles_checked = 0

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-US,en;q=0.9",
    }

    async with aiohttp.ClientSession(
        headers=headers,
        timeout=aiohttp.ClientTimeout(total=20),
    ) as session:
        tasks = [
            check_site(session, username, platform, config)
            for platform, config in SITES_TO_CHECK.items()
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if isinstance(result, dict):
                profiles_checked += 1
                if result.get("found"):
                    profiles_found.append({
                        "username": result["username"],
                        "platform": result["platform"],
                        "url": result["url"],
                        "found": True,
                    })

    return {
        "username": username,
        "platforms_checked": profiles_checked,
        "platforms_found": len(profiles_found),
        "profiles": profiles_found,
    }
