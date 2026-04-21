import re
from typing import List, Dict

def generate_password_mutations(base: str) -> List[Dict[str, str]]:
    """
    Generates common mutations of a password and scores their risk.
    """
    if not base or len(base) < 1:
        return []

    mutations = []
    
    # 1. Original
    mutations.append({"value": base, "type": "Original", "risk": "Low"})

    # 2. Leet-speak (Moderate)
    leet_map = {'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7'}
    leet_val = base.lower()
    for char, substitute in leet_map.items():
        leet_val = leet_val.replace(char, substitute)
    if leet_val != base.lower():
        mutations.append({"value": leet_val, "type": "Leet-speak", "risk": "Medium"})

    # 3. Appended Years/Sequences (High Risk)
    common_appends = ["123", "2024", "2023", "!", "1", "!!"]
    for app in common_appends:
        mutations.append({"value": f"{base}{app}", "type": "Suffix Append", "risk": "High"})

    # 4. Case Rotation (Medium)
    if len(base) > 1:
        rotated = "".join([c.upper() if i % 2 == 0 else c.lower() for i, c in enumerate(base)])
        mutations.append({"value": rotated, "type": "Case Rotation", "risk": "Medium"})

    # 5. Reverse (Low/Medium)
    mutations.append({"value": base[::-1], "type": "Reversed", "risk": "Medium"})

    # Simple Complexity Scorer
    for m in mutations:
        m["difficulty"] = calculate_entropy_score(m["value"])
        
    return mutations[:25] # Limit results

def calculate_entropy_score(val: str) -> str:
    """Calculates a pseudo-entropy score for brute-force time estimation."""
    if len(val) < 8: return "seconds"
    has_upper = any(c.isupper() for c in val)
    has_lower = any(c.islower() for c in val)
    has_digit = any(c.isdigit() for c in val)
    has_special = bool(re.search(r"[!@#$%^&*(),.?\":{}|<>]", val))
    
    types = sum([has_upper, has_lower, has_digit, has_special])
    
    if len(val) >= 12 and types >= 3: return "years"
    if len(val) >= 10 and types >= 2: return "months"
    if len(val) >= 8 and types >= 1: return "days"
    return "hours"
