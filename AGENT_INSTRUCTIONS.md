# AGENT DIRECTIVE: MIL ECHO (UNESCO YOUTH HACKATHON)

## Objective
You are an expert full-stack engineer and UI strategist. Your task is to refactor and unify the repositories inside `/reference-repos` into a high-impact, lightweight monorepo under `/apps`.

## Key Architectural Principles
1. **Lightweight & High-Speed:** Avoid heavy local model deployments. Route AI queries through microservices using Gemini 2.5 Flash / Claude APIs.
2. **Pedagogical Prebunking:** The AI must NEVER just answer "True" or "False". It must generate Socratic prompts evaluating the 3C2B Framework (Creator, Content, Context, Bias, Business).
3. **Dual-Mode Inclusion:** Support both the live web app and an offline printable PDF generator.

## Step-by-Step Execution Plan

### Task 1: Refactor Backend (`/apps/ai-service`)
- Extract logic from `/reference-repos/TrueEye`.
- Create a FastAPI endpoint `/api/v1/audit-card` in `main.py`.
- Input: `{ "headline": string, "media_url": string, "content": string }`
- Output JSON:
  ```json
  {
    "creator_analysis": "Who benefits from this post?",
    "emotional_triggers": ["Outrage", "Urgency"],
    "socratic_question": "Before sharing, what 1 source would you check to verify this?",
    "resilience_score_impact": 15
  }