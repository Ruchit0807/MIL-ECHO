import json
import logging
import os
import re
from typing import Dict, List, Any
import httpx

logger = logging.getLogger("socratic_engine")
logger.setLevel(logging.INFO)

SYSTEM_PROMPT = """You are the MIL ECHO Socratic AI Coach, an expert in Media and Information Literacy (MIL) and the 3C2B Framework (Creator, Content, Context, Bias, Business/Behavior).
Your role is NEVER to declare absolute binary "True" or "False", but to guide youth through reflective Socratic questioning, uncovering emotional manipulation triggers, publisher motivations, and deepfake/misinformation risks.

When auditing a news card or headline, return ONLY a valid JSON object matching this schema:
{
  "creator_analysis": "string detailing publisher motivations, funding sources, or cognitive bias targets",
  "emotional_triggers": ["array of 1-3 manipulation triggers e.g., Outrage, Urgency, Tribal Polarization, Sensationalism, Fear"],
  "socratic_question": "string containing 1 reflective Socratic question to guide independent primary-source verification",
  "resilience_score_impact": 15,
  "clout_score_risk": "High"
}
Do NOT include markdown formatting, code blocks, or extraneous text outside the raw JSON object.
"""

CHAT_SYSTEM_PROMPT = """You are the MIL ECHO Socratic AI Coach. You help youth build critical thinking and media literacy skills.
Answer user questions about news, misinformation, creator bias, or deepfakes in a warm, encouraging, Socratic style. Ask 1 guiding follow-up question that encourages the user to think independently instead of handing them binary answers. Keep answers under 3-4 sentences.
"""

async def search_tavily(query: str) -> str:
    """Searches Tavily API for web search verification context."""
    tavily_key = os.getenv("TAVILY_API_KEY", "").strip()
    if not tavily_key or tavily_key.startswith("your_"):
        return ""
        
    try:
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": tavily_key,
            "query": query,
            "search_depth": "basic",
            "max_results": 3
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                snippets = [f"- Source [{r.get('title', '')}]: {r.get('content', '')}" for r in results]
                return "\n".join(snippets)
    except Exception as e:
        logger.warning(f"Tavily search API error: {e}")
    return ""

def generate_fallback_analysis(headline: str, content: str = "") -> Dict[str, Any]:
    text = (headline + " " + content).lower()
    
    triggers: List[str] = []
    if any(w in text for w in ["shocking", "banned", "secret", "exposed", "disgusting", "outrage", "corrupt", "spit"]):
        triggers.append("Outrage")
    if any(w in text for w in ["now", "urgent", "breaking", "beware", "warning", "epidemic", "pandemic"]):
        triggers.append("Urgency")
    if any(w in text for w in ["them", "others", "group", "cartel", "gang", "community", "cult"]):
        triggers.append("Tribal Polarization")
    if not triggers:
        triggers = ["Sensationalism", "Urgency"]
        
    return {
        "creator_analysis": f"Content appears click-optimized to maximize viral engagement surrounding '{headline[:45]}...'. Often published to exploit cognitive bias and drive traffic.",
        "emotional_triggers": triggers,
        "socratic_question": "Before sharing this headline, what 1 primary source or independent document would you check to verify these claims?",
        "resilience_score_impact": 15,
        "clout_score_risk": "High" if ("Outrage" in triggers or "Urgency" in triggers) else "Medium"
    }

async def audit_card_logic(headline: str, media_url: str = "", content: str = "") -> Dict[str, Any]:
    mistral_key = os.getenv("MISTRAL_API_KEY", "").strip()
    mistral_model = os.getenv("MISTRAL_MODEL", "mistral-small-2603").strip()
    
    # Tavily Web Search Context
    web_context = await search_tavily(headline)
    context_text = f"\nWeb Search Fact-Check Snippets:\n{web_context}" if web_context else ""

    # Primary AI Provider: Mistral AI (mistral-small-2603)
    if mistral_key and not mistral_key.startswith("your_"):
        try:
            prompt = f"Headline to Audit: {headline}\nMedia URL: {media_url}\nContent Snippet: {content}{context_text}"
            url = "https://api.mistral.ai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {mistral_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": mistral_model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
                "response_format": {"type": "json_object"}
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data["choices"][0]["message"]["content"]
                    clean_json = re.sub(r"^```json\s*", "", raw_text.strip())
                    clean_json = re.sub(r"\s*```$", "", clean_json)
                    parsed = json.loads(clean_json)
                    return {
                        "creator_analysis": parsed.get("creator_analysis", ""),
                        "emotional_triggers": parsed.get("emotional_triggers", ["Outrage"]),
                        "socratic_question": parsed.get("socratic_question", "What primary source verifies this claim?"),
                        "resilience_score_impact": int(parsed.get("resilience_score_impact", 15)),
                        "clout_score_risk": str(parsed.get("clout_score_risk", "High"))
                    }
                else:
                    logger.warning(f"Mistral API error status {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.warning(f"Mistral API error: {e}. Falling back to Gemini / Socratic fallback engine.")

    # Fallback Provider: Gemini API
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    if gemini_key and not gemini_key.startswith("your_"):
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nHeadline: {headline}\nMedia URL: {media_url}\nContent Snippet: {content}{context_text}"
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    clean_json = re.sub(r"^```json\s*", "", raw_text.strip())
                    clean_json = re.sub(r"\s*```$", "", clean_json)
                    parsed = json.loads(clean_json)
                    return {
                        "creator_analysis": parsed.get("creator_analysis", ""),
                        "emotional_triggers": parsed.get("emotional_triggers", ["Outrage"]),
                        "socratic_question": parsed.get("socratic_question", "What primary source verifies this claim?"),
                        "resilience_score_impact": int(parsed.get("resilience_score_impact", 15)),
                        "clout_score_risk": str(parsed.get("clout_score_risk", "High"))
                    }
        except Exception as e:
            logger.warning(f"Gemini API error: {e}")

    return generate_fallback_analysis(headline, content)

async def chat_socratic_logic(user_query: str, headline: str = "", context: str = "") -> str:
    mistral_key = os.getenv("MISTRAL_API_KEY", "").strip()
    mistral_model = os.getenv("MISTRAL_MODEL", "mistral-small-2603").strip()
    
    web_context = await search_tavily(user_query)
    web_str = f"\nWeb Search Reference Snippets:\n{web_context}" if web_context else ""

    if mistral_key and not mistral_key.startswith("your_"):
        try:
            prompt = f"User Question: {user_query}\nCurrent Headline Context: {headline}\nAdditional Details: {context}{web_str}"
            url = "https://api.mistral.ai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {mistral_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": mistral_model,
                "messages": [
                    {"role": "system", "content": CHAT_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.4
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.warning(f"Mistral Chat API error: {e}")

    return "How can we corroborate this claim with an independent primary source?"
