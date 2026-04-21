import aiohttp
import json
from typing import Dict, Any, List

async def send_webhook_alert(webhook_url: str, employee_email: str, findings: Dict[str, Any]):
    """
    Sends a rich security alert to Slack or Discord webhooks.
    Automatically detects the platform based on the URL.
    """
    if not webhook_url:
        return

    is_discord = "discord.com" in webhook_url
    
    # Extract critical findings
    breaches = findings.get("breaches", [])
    secrets = findings.get("secrets", [])
    exposure_score = findings.get("exposure_score", {}).get("score", 0)
    
    if is_discord:
        payload = format_discord_payload(employee_email, breaches, secrets, exposure_score)
    else:
        payload = format_slack_payload(employee_email, breaches, secrets, exposure_score)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(webhook_url, json=payload) as resp:
                if resp.status not in [200, 204]:
                    print(f"Webhook failed with status {resp.status}: {await resp.text()}")
    except Exception as e:
        print(f"Error sending webhook: {str(e)}")

def format_discord_payload(email: str, breaches: List[Any], secrets: List[Any], score: int):
    color = 0xFF3333 if score >= 80 else (0xFF6B35 if score >= 50 else 0x00FF41)
    
    embed = {
        "title": "🚨 ShadowSelf: Critical Identity Leak Detected",
        "description": f"Employee Identity Monitoring Alert for **{email}**",
        "color": color,
        "fields": [
            {"name": "Exposure Score", "value": f"**{score}/100**", "inline": True},
            {"name": "New Breaches", "value": str(len(breaches)), "inline": True},
            {"name": "Exposed Secrets", "value": str(len(secrets)), "inline": True},
        ],
        "footer": {"text": "ShadowSelf Enterprise Monitoring v1.0"},
        "timestamp": None # Discord auto-stamps if null usually
    }
    
    if secrets:
        secret_list = "\n".join([f"• {s['type']} in `{s['file']}`" for s in secrets[:3]])
        embed["fields"].append({"name": "Critical Secrets Found", "value": secret_list})
        
    return {"embeds": [embed]}

def format_slack_payload(email: str, breaches: List[Any], secrets: List[Any], score: int):
    status_emoji = "🔴" if score >= 80 else ("🟠" if score >= 50 else "🟢")
    
    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": f"{status_emoji} ShadowSelf Identity Alert"}
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Employee:* {email}\n*Exposure Score:* `{score}/100`"
            }
        },
        {
            "type": "divider"
        }
    ]
    
    if secrets:
        secret_text = "\n".join([f"• *{s['type']}* in `{s['file']}`" for s in secrets[:3]])
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*Exposed Secrets Detected:*\n{secret_text}"}
        })
        
    return {"blocks": blocks}
