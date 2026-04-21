import aiohttp
import asyncio
import re
from typing import List, Set
from urllib.parse import quote

# Common email patterns to "guess" if scraping fails
COMMON_PREFIXES = [
    "admin", "info", "contact", "support", "dev", "tech", "hr",
    "careers", "help", "hello", "sales", "marketing", "billing"
]

async def scrape_emails_for_domain(domain: str) -> List[str]:
    """
    Find emails associated with a domain using public OSINT sources.
    Uses GitHub search and common pattern guessing as a baseline.
    """
    emails: Set[str] = set()
    domain = domain.strip().lower().replace("@", "")
    
    # ── 1. GitHub Code Search ────────────────────────────────────────────────
    # Finding emails in commits/code is highly effective for technical domains
    try:
        github_emails = await _search_github_for_domain_emails(domain)
        emails.update(github_emails)
    except Exception as e:
        print(f"GitHub domain search error: {e}")

    # ── 2. Skymem / Public OSINT Directories (Simulated/Heuristic) ───────────
    # In a real tool, we might use theHarvester or a specific API here.
    # For this hackathon, we'll also include common business patterns.
    for prefix in COMMON_PREFIXES:
        emails.add(f"{prefix}@{domain}")

    # ── 3. Simple Search Result Parsing (Mock/Heuristic) ─────────────────────
    # If this were a full-scale scraper, we'd use a search engine API like SerpAPI
    # or scrape Bing/DuckDuckGo results for the domain pattern.
    
    # Filter for valid domain and length
    final_list = [e for e in emails if e.endswith(f"@{domain}") and len(e) > 5]
    
    # Limit to top 15 for the demo to prevent extreme rate limiting
    return sorted(list(final_list))[:15]

async def _search_github_for_domain_emails(domain: str) -> List[str]:
    """Search GitHub for potential emails matching the domain."""
    found = []
    query = f'"{domain}"'
    url = f"https://api.github.com/search/code?q={quote(query)}"
    
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "ShadowSelf-OSINT-Scraper"
    }

    async with aiohttp.ClientSession(headers=headers) as session:
        try:
            async with session.get(url) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    # We can't easily parse content without extra requests, 
                    # but we can look for clues or use the commits search which is better for emails.
                    pass
                
            # Commits search is often better for finding emails in metadata
            commit_url = f"https://api.github.com/search/commits?q={quote(domain)}"
            async with session.get(commit_url, headers={**headers, "Accept": "application/vnd.github.cloak-preview"}) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    for item in data.get("items", []):
                        author_email = item.get("commit", {}).get("author", {}).get("email", "")
                        if domain in author_email:
                            found.append(author_email)
                        committer_email = item.get("commit", {}).get("committer", {}).get("email", "")
                        if domain in committer_email:
                            found.append(committer_email)
        except Exception as e:
            print(f"Sub-request to GitHub failed: {e}")
            
    return found
