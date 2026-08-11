import os
import time
import asyncio
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv()

from services.socratic_engine import audit_card_logic, chat_socratic_logic
import services.game_engine
from services.db import init_db, save_room, load_room, delete_room

app = FastAPI(
    title="MIL ECHO AI Socratic Engine Microservice",
    description="FastAPI Backend providing Mistral AI + Tavily Socratic Prebunking Analysis for media cards.",
    version="1.0.0"
)

# Enable CORS for Next.js web client and Chrome extension origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()

# Room Game States & WebSockets Coordination
class SQLiteRoomsRegistry:
    def __getitem__(self, key: str) -> Dict[str, Any]:
        room = load_room(key)
        if room is None:
            raise KeyError(key)
        return room

    def __setitem__(self, key: str, value: Dict[str, Any]):
        save_room(key, value)

    def __contains__(self, key: str) -> bool:
        return load_room(key) is not None

    def get(self, key: str, default=None) -> Any:
        room = load_room(key)
        return room if room is not None else default

    def pop(self, key: str, default=None) -> Any:
        room = load_room(key)
        if room is not None:
            delete_room(key)
            return room
        return default

ROOMS_REGISTRY = SQLiteRoomsRegistry()
ROOMS_LOCK = asyncio.Lock()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
    async def connect(self, room_code: str, websocket: WebSocket):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = []
        self.active_connections[room_code].append(websocket)
        
    def disconnect(self, room_code: str, websocket: WebSocket):
        if room_code in self.active_connections:
            if websocket in self.active_connections[room_code]:
                self.active_connections[room_code].remove(websocket)
            if not self.active_connections[room_code]:
                del self.active_connections[room_code]
                
    async def broadcast_to_room(self, room_code: str, message: dict):
        if room_code in self.active_connections:
            for connection in self.active_connections[room_code]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

async def trigger_bot_play_loop(room_code: str):
    await asyncio.sleep(1.5)  # Natural delay to simulate bot thinking
    async with ROOMS_LOCK:
        if room_code not in ROOMS_REGISTRY:
            return
        room = ROOMS_REGISTRY[room_code]
        if room["status"] not in ["PLAYING"]:
            return
            
        active_player = room["players"][room["active_player_index"]]
        if not active_player.get("is_ai"):
            return
            
        # Play bot turn
        room = services.game_engine.auto_play_bot_turn(room)
        ROOMS_REGISTRY[room_code] = room
        
    # Broadcast update
    await manager.broadcast_to_room(room_code, {
        "type": "state_update",
        "room": room
    })
    
    # Check if the next turn is also a bot
    active_player = room["players"][room["active_player_index"]]
    if active_player.get("is_ai") and room["status"] == "PLAYING":
        asyncio.create_task(trigger_bot_play_loop(room_code))

def check_and_trigger_bot(room_code: str):
    if room_code not in ROOMS_REGISTRY:
        return
    room = ROOMS_REGISTRY[room_code]
    if room["status"] == "PLAYING":
        active_player = room["players"][room["active_player_index"]]
        if active_player.get("is_ai") and room["turn_phase"] == "DRAW":
            asyncio.create_task(trigger_bot_play_loop(room_code))

class CreateRoomRequest(BaseModel):
    host_name: str
    max_players: int = 4
    starting_chaos: int = 10
    ai_copilot_mode: str = "Socratic Guidance"

@app.post("/api/v1/rooms")
async def create_room_endpoint(payload: CreateRoomRequest):
    async with ROOMS_LOCK:
        code = services.game_engine.generate_room_code()
        while code in ROOMS_REGISTRY:
            code = services.game_engine.generate_room_code()
            
        config = {
            "room_code": code,
            "max_players": payload.max_players,
            "starting_chaos": payload.starting_chaos,
            "ai_copilot_mode": payload.ai_copilot_mode
        }
        room = services.game_engine.create_initial_room(payload.host_name, config)
        ROOMS_REGISTRY[code] = room
        return {"room_code": code, "room": room}

@app.get("/api/v1/rooms/{room_code}")
async def get_room_endpoint(room_code: str):
    if room_code not in ROOMS_REGISTRY:
        raise HTTPException(status_code=404, detail="Room not found")
    return ROOMS_REGISTRY[room_code]

@app.websocket("/ws/room/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    await manager.connect(room_code, websocket)
    
    # Send current room state on initial connection if it exists
    if room_code in ROOMS_REGISTRY:
        try:
            await websocket.send_json({
                "type": "state_update",
                "room": ROOMS_REGISTRY[room_code]
            })
        except Exception:
            pass
            
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            payload = data.get("payload", {})
            
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue
            
            async with ROOMS_LOCK:
                if room_code not in ROOMS_REGISTRY:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Room {room_code} not found."
                    })
                    continue
                    
                room = ROOMS_REGISTRY[room_code]
                
                # Active player turn validation for state-modifying actions
                if msg_type in ["draw_card", "pass_card", "keep_card", "discard_card"]:
                    active_player = room["players"][room["active_player_index"]]
                    if payload.get("player_id") != active_player["id"]:
                        await websocket.send_json({
                            "type": "error",
                            "message": "It is not your turn to play!"
                        })
                        continue
                
                if msg_type == "join_lobby":
                    username = payload.get("username", "Anonymous Player")
                    exists_player = next((p for p in room["players"] if p["name"].lower() == username.strip().lower()), None)
                    if exists_player:
                        await websocket.send_json({
                            "type": "join_success",
                            "player_id": exists_player["id"],
                            "username": exists_player["name"]
                        })
                    else:
                        if len(room["players"]) >= room["config"]["max_players"]:
                            await websocket.send_json({
                                "type": "error",
                                "message": "Room lobby is already full."
                            })
                            continue
                        
                        timestamp_ms = int(time.time() * 1000)
                        new_player = {
                            "id": f"player-{timestamp_ms}",
                            "name": username.strip(),
                            "is_host": False,
                            "community": "Blue Community" if len(room["players"]) % 2 != 0 else "Red Community",
                            "cred_score": 0,
                            "opinion_counter": 0,
                            "prejudice_counter": 0,
                            "hand": [],
                            "badges": []
                        }
                        room["players"].append(new_player)
                        room["action_logs"].insert(0, {
                            "id": f"log-{timestamp_ms}-join",
                            "time": "Just now",
                            "text": f"Player {new_player['name']} joined the lobby.",
                            "type": "SYSTEM"
                        })
                        await websocket.send_json({
                            "type": "join_success",
                            "player_id": new_player["id"],
                            "username": new_player["name"]
                        })
                        
                elif msg_type == "start_game":
                    room = services.game_engine.start_game_session(room)
                    
                elif msg_type == "draw_card":
                    if room.get("active_card") is None:
                        room = services.game_engine.draw_card_for_active_player(room)
                    
                elif msg_type == "pass_card":
                    target_id = payload.get("target_player_id")
                    room = services.game_engine.process_pass_action(room, target_id)
                    
                elif msg_type == "keep_card":
                    room = services.game_engine.process_keep_action(room)
                    
                elif msg_type == "discard_card":
                    room = services.game_engine.process_discard_action(room)
                    
                elif msg_type == "flag_card":
                    card_id = payload.get("card_id")
                    accuser_id = payload.get("accuser_id")
                    sender_id = payload.get("sender_id")
                    room = services.game_engine.process_flag_misinfo(room, card_id, accuser_id, sender_id)
                    
                elif msg_type == "cascade_card":
                    card_id = payload.get("card_id")
                    player_id = payload.get("player_id")
                    room = services.game_engine.process_cascade_power_move(room, player_id, card_id)
                    
                ROOMS_REGISTRY[room_code] = room
                check_and_trigger_bot(room_code)
                
            await manager.broadcast_to_room(room_code, {
                "type": "state_update",
                "room": room
            })
            
    except WebSocketDisconnect:
        manager.disconnect(room_code, websocket)


class AuditCardRequest(BaseModel):
    headline: str = Field(..., description="Card headline or post title to audit")
    media_url: Optional[str] = Field(default="", description="URL of accompanying image or video media")
    content: Optional[str] = Field(default="", description="Text content or context snippet")

class AuditCardResponse(BaseModel):
    creator_analysis: str = Field(..., description="Analysis of who created and funded this content")
    emotional_triggers: List[str] = Field(..., description="List of psychological manipulation triggers")
    socratic_question: str = Field(..., description="Reflective Socratic prompt to guide user verification")
    resilience_score_impact: int = Field(default=15, description="Resilience score reward for pausing & auditing")
    clout_score_risk: str = Field(default="High", description="Virality and disinformation clout risk rating")

class ChatRequest(BaseModel):
    user_query: str = Field(..., description="Question or message from user")
    headline: Optional[str] = Field(default="", description="Current news headline context")
    context: Optional[str] = Field(default="", description="Additional background or card context")

class ChatResponse(BaseModel):
    response: str = Field(..., description="Socratic Coach response string")
    provider: str = Field(default="Mistral AI (mistral-small-2603) + Tavily Web Search")

@app.get("/")
async def root():
    return {
        "service": "MIL ECHO AI Socratic Engine",
        "primary_model": os.getenv("MISTRAL_MODEL", "mistral-small-2603"),
        "status": "online",
        "endpoints": ["/health", "/api/v1/audit-card", "/api/v1/chat"]
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "primary_ai_provider": "Mistral AI",
        "mistral_api_configured": bool(os.getenv("MISTRAL_API_KEY")),
        "mistral_model": os.getenv("MISTRAL_MODEL", "mistral-small-2603"),
        "tavily_search_configured": bool(os.getenv("TAVILY_API_KEY"))
    }

@app.post("/api/v1/audit-card", response_model=AuditCardResponse)
async def audit_card(payload: AuditCardRequest):
    if not payload.headline or not payload.headline.strip():
        raise HTTPException(status_code=400, detail="Headline field cannot be empty.")
        
    try:
        result = await audit_card_logic(
            headline=payload.headline,
            media_url=payload.media_url or "",
            content=payload.content or ""
        )
        return AuditCardResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Socratic analysis failed: {str(e)}")

@app.post("/api/v1/chat", response_model=ChatResponse)
async def socratic_chat(payload: ChatRequest):
    if not payload.user_query or not payload.user_query.strip():
        raise HTTPException(status_code=400, detail="User query cannot be empty.")
        
    try:
        response_text = await chat_socratic_logic(
            user_query=payload.user_query,
            headline=payload.headline or "",
            context=payload.context or ""
        )
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Socratic Coach chat failed: {str(e)}")

@app.get("/api/v1/export-pdf")
async def export_pdf():
    from fastapi.responses import FileResponse
    pdf_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "packages", "pdf-generator", "output", "viral_spiral_offline_deck.pdf"
    )
    if not os.path.exists(pdf_path):
        try:
            import sys
            generator_dir = os.path.join(os.path.dirname(__file__), "..", "..", "packages", "pdf-generator")
            sys.path.insert(0, generator_dir)
            from generate_deck import generate_pdf_deck
            generate_pdf_deck()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
            
    if os.path.exists(pdf_path):
        return FileResponse(pdf_path, media_type="application/pdf", filename="viral_spiral_offline_deck.pdf")
    raise HTTPException(status_code=404, detail="Offline deck PDF not found.")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
