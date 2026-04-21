import aiohttp
import asyncio
import re
import base64
from typing import List, Dict, Any
from urllib.parse import urlparse


# Secret patterns to scan for
SECRET_PATTERNS = {
    "AWS Access Key":    r"(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}",
    "AWS Secret Key":    r"(?i)aws.{0,20}secret.{0,20}['\"][0-9a-zA-Z/+]{40}['\"]",
    "Azure Client Secret": r"(?i)azure.{0,20}secret.{0,20}['\"][a-zA-Z0-9_\-\.~]{30,40}['\"]",
    "Azure Storage Key": r"(?i)AccountKey=[a-zA-Z0-9+\/]{86}==",
    "GCP Service Account": r'"type":\s*"service_account"',
    "Google API Key":    r"AIza[0-9A-Za-z\-_]{35}",
    "Google OAuth":      r"[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com",
    "GitHub Token":      r"gh[p|o|u|s|r]_[A-Za-z0-9_]{36,255}",
    "GitLab Token":      r"glpat-[a-zA-Z0-9\-=_]{20}",
    "Slack Token":       r"xox[baprs]-[0-9A-Za-z\-]{10,48}",
    "Stripe Secret Key": r"sk_(live|test)_[A-Za-z0-9]{24,99}",
    "Stripe Public Key": r"pk_(live|test)_[A-Za-z0-9]{24,99}",
    "Private Key":       r"-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY",
    "Database URL":      r"(postgres|postgresql|mysql|mongodb(\+srv)?|redis)://[^\s\"'<>]+",
    "Heroku API Key":    r"(?i)heroku.{0,20}['\"][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}['\"]",
    "OpenAI API Key":    r"sk-[a-zA-Z0-9]{20,48}|sk-proj-[a-zA-Z0-9_-]{20,}",
    "Twilio API Key":    r"SK[a-z0-9]{32}",
    "SendGrid API Key":  r"SG\.[a-zA-Z0-9_\-\.]{66}",
    "DigitalOcean Token": r"dop_v1_[a-f0-9]{64}",
    "Generic API Key":   r"(?i)(api[_\-]?key|apikey|api[_\-]?secret|token)['\"]?\s*[:=]\s*['\"]?[A-Za-z0-9\-_]{20,}",
    "Password in Code":  r"(?i)(password|passwd|pwd)\s*[:=]\s*['\"][^'\"\s]{8,}['\"]",
}

# Text file extensions to scan
SCANNABLE_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx", ".env", ".yml", ".yaml",
    ".json", ".sh", ".bash", ".rb", ".go", ".java", ".php",
    ".toml", ".ini", ".cfg", ".conf", ".txt", ".md", ".xml",
    ".tf", ".pem", ".key", ".properties", ".pub", ".envrc"
}

# High-value filenames (checked first)
HIGH_VALUE_NAMES = {
    ".env", ".env.local", ".env.production", ".env.staging", ".env.development",
    "config.py", "settings.py", "secrets.py", "credentials.py",
    "config.js", "config.ts", "config.json",
    "docker-compose.yml", "docker-compose.yaml",
    ".travis.yml", "Jenkinsfile", "Makefile",
    "terraform.tfvars", ".tfvars", "secrets.yaml", "credentials.json",
}


def parse_github_repo(repo_url: str):
    """Extract owner and repo name from a GitHub URL."""
    try:
        parsed = urlparse(repo_url.strip())
        parts = [p for p in parsed.path.split("/") if p]
        if len(parts) >= 2:
            return parts[0], parts[1].replace(".git", "")
    except Exception:
        pass
    return None, None


def scan_text_for_secrets(content: str, filename: str) -> List[Dict[str, Any]]:
    """Regex-scan file content for exposed secrets."""
    found = []
    lines = content.splitlines()

    for pattern_name, pattern in SECRET_PATTERNS.items():
        for line_num, line in enumerate(lines, start=1):
            match = re.search(pattern, line)
            if match:
                matched_val = match.group(0)
                # Mask middle characters for safety
                if len(matched_val) > 12:
                    masked = matched_val[:6] + "*" * min(len(matched_val) - 10, 20) + matched_val[-4:]
                else:
                    masked = matched_val[:3] + "***"

                severity = "high" if any(k in pattern_name for k in [
                    "AWS", "Private Key", "GitHub", "Stripe", "Heroku", "Google", "Azure", "GCP", "OpenAI", "DigitalOcean", "GitLab"
                ]) else "medium"

                found.append({
                    "type": pattern_name,
                    "value": masked,
                    "line": line_num,
                    "file": filename,
                    "severity": severity,
                })
                break  # one match per pattern per file is enough
    return found


async def fetch_github_file(
    session: aiohttp.ClientSession,
    owner: str,
    repo: str,
    file_path: str,
) -> str | None:
    """Fetch a single file's decoded text content via the GitHub Contents API."""
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}"
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=8)) as resp:
            if resp.status == 200:
                data = await resp.json(content_type=None)
                if isinstance(data, dict) and data.get("encoding") == "base64":
                    raw = base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
                    return raw
    except Exception:
        pass
    return None


def file_priority(path: str) -> int:
    """Lower = scanned first. High-value names first, then scannable extensions, rest last."""
    filename = path.split("/")[-1]
    if filename in HIGH_VALUE_NAMES or path in HIGH_VALUE_NAMES:
        return 0
    ext = "." + path.rsplit(".", 1)[-1] if "." in path else ""
    if ext in SCANNABLE_EXTENSIONS:
        return 1
    return 2


async def check_trufflehog(repo_url: str) -> Dict[str, Any]:
    """
    Scan a public GitHub repository for exposed secrets.
    Uses the GitHub Contents API (no auth required, 60 req/hour).
    Prioritises high-risk files (.env, config, CI/CD) and scans up to 100 text files.
    """
    if not repo_url or not repo_url.strip():
        return {"repo_url": repo_url, "secrets_found": 0, "secrets": [], "files_scanned": 0}

    owner, repo = parse_github_repo(repo_url)
    if not owner or not repo:
        return {
            "repo_url": repo_url,
            "secrets_found": 0,
            "secrets": [],
            "error": "Could not parse GitHub URL. Expected: https://github.com/owner/repo",
        }

    secrets_found: List[Dict[str, Any]] = []
    scanned_files: List[str] = []

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "ShadowSelf-OSINT",
    }

    async with aiohttp.ClientSession(headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as session:

        # Step 1: Fetch the full file tree
        try:
            tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1"
            async with session.get(tree_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 404:
                    return {
                        "repo_url": repo_url,
                        "secrets_found": 0,
                        "secrets": [],
                        "error": "Repository not found or is private",
                    }
                elif resp.status != 200:
                    return {
                        "repo_url": repo_url,
                        "secrets_found": 0,
                        "secrets": [],
                        "error": f"GitHub API returned {resp.status}",
                    }
                tree_data = await resp.json(content_type=None)
                all_blobs = [
                    item["path"]
                    for item in tree_data.get("tree", [])
                    if item.get("type") == "blob"
                ]
        except asyncio.TimeoutError:
            return {"repo_url": repo_url, "secrets_found": 0, "secrets": [], "error": "Timed out fetching repo tree"}
        except Exception as e:
            return {"repo_url": repo_url, "secrets_found": 0, "secrets": [], "error": str(e)}

        # Step 2: Sort by priority, cap at 100 scannable files
        scannable = sorted(
            [f for f in all_blobs if file_priority(f) < 2],
            key=file_priority,
        )[:100]

        # Step 3: Fetch & scan in batches of 10
        batch_size = 10
        for i in range(0, len(scannable), batch_size):
            batch = scannable[i:i + batch_size]
            contents = await asyncio.gather(
                *[fetch_github_file(session, owner, repo, f) for f in batch],
                return_exceptions=True,
            )
            for file_path, content in zip(batch, contents):
                if isinstance(content, str):
                    scanned_files.append(file_path)
                    secrets_found.extend(scan_text_for_secrets(content, file_path))

            if len(secrets_found) >= 50:
                break  # enough evidence, stop early

    return {
        "repo_url": repo_url,
        "secrets_found": len(secrets_found),
        "secrets": secrets_found,
        "files_scanned": len(scanned_files),
    }
