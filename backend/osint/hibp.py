import aiohttp
import asyncio
from typing import List, Dict, Any


async def check_hibp(email: str) -> Dict[str, Any]:
    """
    Check XposedOrNot API for email breaches (free, no API key required).
    Returns breach information in the same format as the original HIBP integration.
    API docs: https://api.xposedornot.com/
    """
    breaches = []
    credentials_exposed = set()

    timeout = aiohttp.ClientTimeout(total=15)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        headers = {
            'User-Agent': 'ShadowSelf-OSINT',
            'Accept': 'application/json',
        }

        try:
            async with session.get(
                f'https://api.xposedornot.com/v1/breach-analytics?email={email}',
                headers=headers,
                ssl=False,
            ) as resp:

                if resp.status == 200:
                    raw = await resp.json(content_type=None)

                    # XposedOrNot structure:
                    # {
                    #   "BreachMetrics": { ... },
                    #   "ExposedBreaches": {
                    #     "breaches_details": [
                    #       { "breach": "Adobe", "domain": "adobe.com",
                    #         "industry": "...", "logo": "...",
                    #         "passwordrisk": "...", "references": "...",
                    #         "xposed_data": "Emails;Passwords",
                    #         "xposed_date": "2013-10-04", "xposed_records": 152000000 }
                    #     ]
                    #   },
                    #   "ExposedMetrics": { ... }
                    # }
                    exposed_breaches = raw.get("ExposedBreaches", {})
                    breach_details = exposed_breaches.get("breaches_details", [])

                    for b in breach_details:
                        # Convert pipe/semicolon-separated exposed data into a list
                        raw_data = b.get("xposed_data", "")
                        data_list = [
                            d.strip()
                            for d in raw_data.replace(";", ",").split(",")
                            if d.strip()
                        ]
                        credentials_exposed.update(data_list)

                        breaches.append({
                            "name": b.get("breach", "Unknown"),
                            "title": b.get("breach", "Unknown"),
                            "description": (
                                f"Domain: {b.get('domain', 'N/A')} | "
                                f"Industry: {b.get('industry', 'N/A')} | "
                                f"Records exposed: {b.get('xposed_records', 'N/A'):,}"
                                if isinstance(b.get('xposed_records'), int)
                                else f"Domain: {b.get('domain', 'N/A')} | Industry: {b.get('industry', 'N/A')}"
                            ),
                            "breached_data": data_list,
                            "breach_date": b.get("xposed_date", ""),
                            "severity": determine_severity(data_list),
                        })

                elif resp.status == 404:
                    # No breaches found — great news!
                    pass
                elif resp.status == 400:
                    print(f"XposedOrNot: bad request for email {email}")
                elif resp.status == 429:
                    print("XposedOrNot: rate limited")
                else:
                    print(f"XposedOrNot API returned status {resp.status}")

        except asyncio.TimeoutError:
            print("XposedOrNot check timed out")
        except Exception as e:
            print(f"Error checking XposedOrNot: {str(e)}")

    return {
        "total_breaches": len(breaches),
        "credentials_exposed": list(credentials_exposed),
        "breaches": breaches,
    }


def determine_severity(data_classes: List[str]) -> str:
    """Determine severity based on exposed data types"""
    high_severity = {"Passwords", "Password", "Credit Cards", "Financial", "SSN", "Private keys"}
    medium_severity = {"Emails", "Email addresses", "Usernames", "Phone numbers", "IP addresses"}

    exposed = {d.lower() for d in data_classes}
    high_lower = {h.lower() for h in high_severity}
    medium_lower = {m.lower() for m in medium_severity}

    if exposed & high_lower:
        return "high"
    elif exposed & medium_lower:
        return "medium"
    else:
        return "low"
