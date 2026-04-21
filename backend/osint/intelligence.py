import os
import json
from typing import Dict, Any, List
from openai import AsyncOpenAI

async def analyze_target_intelligence(scan_data: Dict[str, Any]) -> str:
    """
    Uses OpenRouter (Grok/GPT models) to generate a 3-step predictive attack vector.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return "Intelligence analysis skipped: OPENROUTER_API_KEY not found."

    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )

    # Prepare a condensed version of the scan data for the LLM
    context = {
        "email": scan_data.get("email"),
        "breaches": [b["name"] for b in scan_data.get("breaches", [])[:5]],
        "social_platforms": [p["platform"] for p in scan_data.get("social_profiles", []) if p["found"]],
        "exposed_secrets": [s["type"] for s in scan_data.get("secrets", [])],
        "exposure_score": scan_data.get("exposure_score", {}).get("score")
    }

    prompt = f"""
    You are an expert Cyber-Intelligence Analyst (Red Team). 
    Analyze the following OSINT data and generate a 3-step 'Most Likely Attack Scenario' in plain English.
    
    DATA:
    {json.dumps(context, indent=2)}

    FORMAT:
    Return exactly 3 bullet points. Each point should explain a logical step an attacker would take based on THIS SPECIFIC DATA.
    Example: 
    1. Attacker uses the leaked email from the [Breach Name] to attempt social engineering.
    2. ...
    3. ...
    
    Keep it concise and professional.
    """

    try:
        response = await client.chat.completions.create(
            model="google/gemini-2.0-flash-001", # Changed to a high-availability model
            messages=[
                {"role": "system", "content": "You are a professional security intelligence auditor."},
                {"role": "user", "content": prompt}
            ],
            extra_headers={
                "HTTP-Referer": "https://shadowself.osint", 
                "X-Title": "ShadowSelf OSINT",
            }
        )
        return response.choices[0].message.content or "No analysis generated."
    except Exception as e:
        print(f"Intelligence API Error: {str(e)}")
        return f"AI Analysis failed: {str(e)}"

async def analyze_password_risk(base_password: str, mutations: list):
    """Uses LLM to evaluate the security of password mutations."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return {"error": "API Key missing", "summary": "Audit offline."}

    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
    )

    mutation_list = "\n".join([f"- {m['value']} ({m['type']})" for m in mutations])
    
    prompt = f"""
    You are a professional password cracking specialist. 
    Evaluate the following password mutations derived from the base: "{base_password}".
    
    Mutations:
    {mutation_list}
    
    Return a JSON object with the following structure:
    {{
        "global_risk": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
        "summary": "A 1-sentence assessment of the pattern's exploitability.",
        "evaluations": [
            {{
                "value": "mutation_value",
                "ai_score": 0-100,
                "reasoning": "Brief explanation of why it's risky or secure"
            }}
        ]
    }}
    Be realistic. Common leetspeak and simple suffixes (2024, 123) should be rated as highly vulnerable (high ai_score).
    Return ONLY pure JSON.
    """

    try:
        response = await client.chat.completions.create(
            model="google/gemini-2.0-flash-001",
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content
        # Clean potential markdown from response
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)
    except Exception as e:
        print(f"Password AI Audit failed: {e}")
        return {"error": str(e), "summary": "Analysis failed."}
