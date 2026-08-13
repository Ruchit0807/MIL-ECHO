# 🛡️ MIL ECHO — AI-Powered Multiplayer Media & Information Literacy Game

[![Live App](https://img.shields.io/badge/Live%20App-mil--echo--app.vercel.app-00F5D4?style=for-the-badge&logo=vercel&logoColor=black)](https://mil-echo.vercel.app/)
[![API Health](https://img.shields.io/badge/API%20Status-Online%20(Render)-0070F3?style=for-the-badge&logo=render&logoColor=white)](https://mil-echo.onrender.com/health)
[![License](https://img.shields.io/badge/License-MIT-FF007A?style=for-the-badge)](LICENSE)
[![Hackathon](https://img.shields.io/badge/UNESCO-Youth%20Hackathon%202026-7B2CBF?style=for-the-badge)](https://github.com/Ruchit0807/MIL-ECHO)

> **NAVIGATE STREAMS. BUILD CRED. PREVENT CHAOS.**  
> An interactive multiplayer card game empowering youth to build Media and Information Literacy (MIL) skills. Inspect online news cards, pass authentic content to build your CRED score (+1), and stop unverified prejudice from driving the global CHAOS meter to zero!

---

## 🌟 Highlights & Key Features

- 🎮 **Real-Time Multiplayer Lobby & Game Engine**: Connect with friends or simulated AI agents in 2–6 player lobbies synchronized atomically over WebSockets.
- 🧠 **Socratic AI Prebunking Coach**: Powered by **Mistral AI (`mistral-small-2603`)** with **Gemini 2.5 Flash** fallback & **Tavily Web Search**. Evaluates headlines using the **3C2B Framework** (Creator, Content, Context, Bias, Business/Behavior). *Never hands out binary "True/False" answers — guides users with reflective questions.*
- 🎨 **Neo-Brutalist High-Impact UI**: Vibrant, responsive interface built with Next.js, Framer Motion, and Tailwind CSS.
- 🧩 **Browser Extension Companion**: Capture suspicious headlines directly while browsing the web and push them into your in-game Extension Inbox deck.
- 🖨️ **Dual-Mode Inclusion (Printable Offline Deck)**: Includes a Python PDF Generator (`packages/pdf-generator`) to export printable card decks for offline classroom sessions in low-connectivity regions.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Frontend_Client["Frontend Client (Vercel)"]
        UI["Next.js 14 React Web App"] <-->|WebSockets / REST| WS_C["WS Connection Manager"]
        UI <--> LocalDeck["Extension Deck / LocalStorage"]
    end

    subgraph Backend_Microservice["Backend Microservice (Render)"]
        WS_C <-->|/ws/room/{code}| FastAPI["FastAPI Server main.py"]
        FastAPI <--> Engine["Python Game Engine"]
        FastAPI <--> SocEngine["Socratic AI Engine"]
    end

    subgraph External_AI["External AI Services"]
        SocEngine <-->|Primary LLM| Mistral["Mistral AI API mistral-small-2603"]
        SocEngine <-->|Fallback LLM| Gemini["Google Gemini 2.5 Flash"]
        SocEngine <-->|Fact Context| Tavily["Tavily Search API"]
    end
```

---

## 📂 Project Structure

```
mil-echo-root/
├── apps/
│   ├── web-client/            # Next.js 14 Web Frontend (React 18, TypeScript, Tailwind)
│   │   ├── src/
│   │   │   ├── components/    # ScoreBoard, CardArena, Drawers, Modals
│   │   │   ├── pages/         # Game App (index.tsx, _app.tsx)
│   │   │   ├── lib/           # Cards database & client engine
│   │   │   └── types/         # TypeScript definitions
│   │   └── package.json
│   ├── ai-service/            # FastAPI Python 3.11 Microservice
│   │   ├── main.py            # FastAPI server & WebSocket Manager
│   │   ├── requirements.txt   # Python dependencies
│   │   └── services/          # Socratic engine & Game engine logic
│   └── browser-extension/     # Manifest V3 Chrome Extension
├── packages/
│   └── pdf-generator/         # ReportLab script for printable offline PDF decks
├── .env.example               # Environment variables template
├── .gitignore
└── README.md
```

---

## 🚀 Live Services & Deployment Links

| Component | Platform | URL / Link | Status |
| :--- | :--- | :--- | :--- |
| **Web Application** | Vercel | [https://mil-echo-app.vercel.app](https://mil-echo-app.vercel.app) | 🟢 Live |
| **AI Microservice** | Render | [https://mil-echo.onrender.com](https://mil-echo.onrender.com) | 🟢 Live |
| **API Health Check** | Render | [https://mil-echo.onrender.com/health](https://mil-echo.onrender.com/health) | 🟢 Healthy |
| **GitHub Repository** | GitHub | [https://github.com/Ruchit0807/MIL-ECHO](https://github.com/Ruchit0807/MIL-ECHO) | 🐙 Public |

---

## 🛠️ Local Development Quickstart

### Prerequisites
- **Node.js**: v18+ and `npm`
- **Python**: v3.11+

### 1. Clone the Repository
```bash
git clone https://github.com/Ruchit0807/MIL-ECHO.git
cd MIL-ECHO
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your API keys in `.env`:
```env
PORT=8000
GEMINI_API_KEY=your_gemini_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-small-2603
TAVILY_API_KEY=your_tavily_api_key_here

NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_APP_MODE=hybrid
```

### 3. Run the Backend (`ai-service`)
```bash
cd apps/ai-service
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python main.py
```
*Backend runs on `http://localhost:8000`.*

### 4. Run the Frontend (`web-client`)
Open a new terminal:
```bash
cd apps/web-client
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 📡 API Reference

### Health Check
`GET /health`
```json
{
  "status": "healthy",
  "primary_ai_provider": "Mistral AI",
  "mistral_api_configured": true,
  "mistral_model": "mistral-small-2603",
  "tavily_search_configured": true
}
```

### Socratic AI Card Audit
`POST /api/v1/audit-card`
```json
// Request
{
  "headline": "City Metro project inaugurated by Mayor Neal",
  "media_url": "",
  "content": "Category: Infrastructure"
}

// Response
{
  "creator_analysis": "Content appears click-optimized to maximize viral engagement...",
  "emotional_triggers": ["Outrage", "Urgency"],
  "socratic_question": "What 1 primary source would you check to verify this claim?",
  "resilience_score_impact": 15,
  "clout_score_risk": "High"
}
```

### Create Multiplayer Room
`POST /api/v1/rooms`
```json
// Request
{
  "host_name": "Agent Alpha",
  "max_players": 4,
  "starting_chaos": 10,
  "ai_copilot_mode": "Socratic Guidance"
}
```

### Real-Time WebSocket Channel
`WS /ws/room/{room_code}`
- Handles room join events, card draws, passes, keep/discard moves, misinformation flagging, and viral spiral cascade power moves.

---

## 📜 License & Credits

Distributed under the **MIT License**. Built for the **UNESCO Youth Hackathon 2026** by full-stack engineers and UI strategists committed to media literacy and combating online disinformation.
