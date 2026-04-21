import aiohttp
import os
from typing import List

async def scrape_emails_for_domain(domain: str) -> List[str]:
    """
    Retrieves employee emails for a given domain.
    Uses Hunter.io if HUNTER_API_KEY is present, otherwise falls back to a demo dataset.
    """
    api_key = os.getenv("HUNTER_API_KEY")
    
    if api_key:
        return await fetch_hunter_emails(domain, api_key)
    else:
        # Demo data for hackathon presentation
        return [
            f"ceo@{domain}",
            f"cto@{domain}",
            f"dev@{domain}",
            f"hr@{domain}",
            f"admin@{domain}"
        ]

async def fetch_hunter_emails(domain: str, api_key: str) -> List[str]:
    url = f"https://api.hunter.io/v2/domain-search?domain={domain}&api_key={api_key}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    emails = [e.get("value") for e in data.get("data", {}).get("emails", [])]
                    return emails
                else:
                    print(f"Hunter API failed: {resp.status}")
                    return []
    except Exception as e:
        print(f"Error calling Hunter API: {str(e)}")
        return []
