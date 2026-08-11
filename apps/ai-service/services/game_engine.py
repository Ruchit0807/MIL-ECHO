import os
import json
import random
import time
from typing import Dict, List, Any, Optional

CARDS_DB_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "web-client", "src", "lib", "cards_database.json"
)

def load_default_cards() -> List[Dict[str, Any]]:
    try:
        if os.path.exists(CARDS_DB_PATH):
            with open(CARDS_DB_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading cards database: {e}")
    
    # Fallback cards in case paths fail
    return [
        {
            "id": "card-001",
            "headline": "City Metro project inaugurated by Mayor Neal: 'A new age for our city'",
            "fake_headline": "City Metro project inaugurated by Mayor Neal: 'A new age for (other community) only'",
            "category": "Infrastructure & Politics",
            "card_type": "PREJUDICE",
            "is_misinformation": True,
            "clout_reward": 25,
            "resilience_penalty": 15,
            "resilience_reward": 15,
            "community_target": "Blue Community",
            "cred_impact": 1,
            "chaos_impact": -1,
            "source": "City Press Bureau (Verified)"
        },
        {
            "id": "card-002",
            "headline": "Heroic Cat saves family of 5 from plague-ridden neighborhood rat",
            "fake_headline": "Cat saves family of 5 from (other community) trained plague-ridden attack rat!",
            "category": "Sensational Pet News",
            "card_type": "PREJUDICE",
            "is_misinformation": True,
            "clout_reward": 35,
            "resilience_penalty": 20,
            "resilience_reward": 20,
            "community_target": "Red Community",
            "cred_impact": 1,
            "chaos_impact": -1,
            "source": "Local News Desk"
        }
    ]

def shuffle_deck(deck: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    shuffled = list(deck)
    random.shuffle(shuffled)
    return shuffled

def generate_room_code() -> str:
    return str(random.randint(100000, 999999))

def create_initial_room(host_name: str, config: Dict[str, Any]) -> Dict[str, Any]:
    timestamp_ms = int(time.time() * 1000)
    
    host_player = {
        "id": f"player-host-{timestamp_ms}",
        "name": host_name.strip() if host_name.strip() else "Host Agent",
        "is_host": True,
        "community": "Red Community",
        "cred_score": 0,
        "opinion_counter": 0,
        "prejudice_counter": 0,
        "hand": [],
        "badges": ["HOST_BADGE", "MIL_INITIATE"]
    }
    
    default_logs = [
        {
            "id": f"log-{timestamp_ms}-1",
            "time": "Just now",
            "text": f"Room {config['room_code']} created by {host_player['name']}. Chaos level set to {config['starting_chaos']}.",
            "type": "SYSTEM"
        }
    ]
    
    cards = load_default_cards()
    deck = shuffle_deck(cards)
    
    return {
        "config": {
            "room_code": config["room_code"],
            "max_players": int(config.get("max_players", 4)),
            "starting_chaos": int(config.get("starting_chaos", 10)),
            "ai_copilot_mode": config.get("ai_copilot_mode", "Socratic Guidance")
        },
        "status": "LOBBY",
        "chaos_level": int(config.get("starting_chaos", 10)),
        "players": [host_player],
        "active_player_index": 0,
        "turn_phase": "DRAW",
        "active_card": None,
        "deck": deck,
        "discard_pile": [],
        "winner_player_id": None,
        "action_logs": default_logs
    }

def fill_bot_players(room: Dict[str, Any]) -> Dict[str, Any]:
    bots_needed = room["config"]["max_players"] - len(room["players"])
    if bots_needed <= 0:
        return room
        
    bot_names = ["EchoBot Alpha", "Vanguard Cyber", "Socratic Node", "Lumina Agent", "Pulse Runner"]
    updated_players = list(room["players"])
    timestamp_ms = int(time.time() * 1000)
    
    for i in range(bots_needed):
        community = "Red Community" if len(updated_players) % 2 == 0 else "Blue Community"
        bot_player = {
            "id": f"bot-{timestamp_ms}-{i}",
            "name": bot_names[i % len(bot_names)],
            "is_host": False,
            "community": community,
            "cred_score": 0,
            "opinion_counter": 0,
            "prejudice_counter": 0,
            "hand": [],
            "badges": ["SIMULATED_BOT"],
            "is_ai": True
        }
        updated_players.append(bot_player)
        
    updated_logs = [
        {
            "id": f"log-{timestamp_ms}-bots",
            "time": "Just now",
            "text": f"Automated agents joined to fill {room['config']['max_players']}-player lobby.",
            "type": "SYSTEM"
        }
    ] + room["action_logs"]
    
    room["players"] = updated_players
    room["action_logs"] = updated_logs
    return room

def start_game_session(room: Dict[str, Any]) -> Dict[str, Any]:
    filled_room = fill_bot_players(room)
    timestamp_ms = int(time.time() * 1000)
    
    filled_room["status"] = "PLAYING"
    filled_room["active_player_index"] = 0
    filled_room["turn_phase"] = "DRAW"
    filled_room["active_card"] = None
    filled_room["action_logs"] = [
        {
            "id": f"log-{timestamp_ms}-start",
            "time": "Just now",
            "text": "🎮 MIL ECHO Game Session Started! Pass news, build CRED, and protect the CHAOS meter.",
            "type": "SYSTEM"
        }
    ] + filled_room["action_logs"]
    
    return filled_room

def draw_card_for_active_player(room: Dict[str, Any]) -> Dict[str, Any]:
    if len(room["deck"]) == 0:
        if len(room["discard_pile"]) > 0:
            # Reshuffle discard into deck
            room["deck"] = shuffle_deck(room["discard_pile"])
            room["discard_pile"] = []
        
        # If deck is still empty (cards are in player hands), reload default cards
        if len(room["deck"]) == 0:
            cards = load_default_cards()
            room["deck"] = shuffle_deck(cards)
        
    drawn_card = room["deck"].pop(0)
    active_player = room["players"][room["active_player_index"]]
    timestamp_ms = int(time.time() * 1000)
    
    card_log_type = "PREJUDICE" if drawn_card["card_type"] == "PREJUDICE" else ("FACTUAL" if drawn_card["card_type"] == "FACTUAL" else "OPINION")
    
    room["active_card"] = drawn_card
    room["turn_phase"] = "INSPECT"
    room["action_logs"] = [
        {
            "id": f"log-{timestamp_ms}-draw",
            "time": "Just now",
            "text": f"{active_player['name']} drew card: \"{drawn_card['headline'][:32]}...\"",
            "type": card_log_type
        }
    ] + room["action_logs"]
    
    return room

def process_pass_action(room: Dict[str, Any], target_player_id: str) -> Dict[str, Any]:
    if not room.get("active_card"):
        return room
        
    active_player = room["players"][room["active_player_index"]]
    target_player = next((p for p in room["players"] if p["id"] == target_player_id), None)
    if not target_player:
        return room
        
    card = room["active_card"]
    new_chaos_level = room["chaos_level"]
    new_status = room["status"]
    winner_id = room["winner_player_id"]
    timestamp_ms = int(time.time() * 1000)
    
    # CRED Impact
    updated_cred = active_player["cred_score"] + 1
    
    # CHAOS Impact
    if card["card_type"] == "PREJUDICE" or card.get("is_misinformation", False):
        new_chaos_level = max(0, new_chaos_level - 1)
    elif card["card_type"] == "FACTUAL":
        new_chaos_level = min(room["config"]["starting_chaos"], new_chaos_level + 1)
        
    # Update players
    for p in room["players"]:
        if p["id"] == active_player["id"]:
            p["cred_score"] = updated_cred
            if card["card_type"] == "OPINION":
                p["opinion_counter"] += 1
            elif card["card_type"] == "PREJUDICE":
                p["prejudice_counter"] += 1
        elif p["id"] == target_player["id"]:
            p["hand"].insert(0, card)
            
    # Check victory conditions
    if new_chaos_level <= 0:
        new_status = "GLOBAL_DEFEAT"
    elif updated_cred >= 10:
        new_status = "INDIVIDUAL_VICTORY"
        winner_id = active_player["id"]
        
    next_index = (room["active_player_index"] + 1) % len(room["players"])
    
    card_log_type = "PREJUDICE" if card["card_type"] == "PREJUDICE" else "FACTUAL"
    
    room["chaos_level"] = new_chaos_level
    room["status"] = new_status
    room["winner_player_id"] = winner_id
    room["active_card"] = None
    room["active_player_index"] = next_index
    room["turn_phase"] = "DRAW"
    room["action_logs"] = [
        {
            "id": f"log-{timestamp_ms}-pass",
            "time": "Just now",
            "text": f"{active_player['name']} passed card to {target_player['name']} (+1 CRED). CHAOS level: {new_chaos_level}",
            "type": card_log_type
        }
    ] + room["action_logs"]
    
    return room

def process_keep_action(room: Dict[str, Any]) -> Dict[str, Any]:
    if not room.get("active_card"):
        return room
        
    active_player = room["players"][room["active_player_index"]]
    card = room["active_card"]
    timestamp_ms = int(time.time() * 1000)
    
    for p in room["players"]:
        if p["id"] == active_player["id"]:
            p["hand"].insert(0, card)
            
    next_index = (room["active_player_index"] + 1) % len(room["players"])
    
    room["active_card"] = None
    room["active_player_index"] = next_index
    room["turn_phase"] = "DRAW"
    room["action_logs"] = [
        {
            "id": f"log-{timestamp_ms}-keep",
            "time": "Just now",
            "text": f"{active_player['name']} kept card in hand for strategic triggers.",
            "type": "OPINION"
        }
    ] + room["action_logs"]
    
    return room

def process_discard_action(room: Dict[str, Any]) -> Dict[str, Any]:
    if not room.get("active_card"):
        return room
        
    active_player = room["players"][room["active_player_index"]]
    card = room["active_card"]
    timestamp_ms = int(time.time() * 1000)
    
    room["discard_pile"].insert(0, card)
    next_index = (room["active_player_index"] + 1) % len(room["players"])
    
    room["active_card"] = None
    room["active_player_index"] = next_index
    room["turn_phase"] = "DRAW"
    room["action_logs"] = [
        {
            "id": f"log-{timestamp_ms}-discard",
            "time": "Just now",
            "text": f"{active_player['name']} muted and discarded card to prevent potential bias spread.",
            "type": "SYSTEM"
        }
    ] + room["action_logs"]
    
    return room

def process_flag_misinfo(room: Dict[str, Any], card_id: str, accuser_player_id: str, sender_player_id: str) -> Dict[str, Any]:
    accuser = next((p for p in room["players"] if p["id"] == accuser_player_id), None)
    sender = next((p for p in room["players"] if p["id"] == sender_player_id), None)
    if not accuser or not sender:
        return room
        
    # Find card in sender's hand to verify its parameters
    card = next((c for c in sender["hand"] if c["id"] == card_id), None)
    if not card:
        return room
        
    is_correct = card.get("is_misinformation", False) or card.get("card_type") == "PREJUDICE"
    timestamp_ms = int(time.time() * 1000)
    
    for p in room["players"]:
        if is_correct:
            if p["id"] == sender["id"]:
                p["cred_score"] = max(0, p["cred_score"] - 1)
                # Remove card from hand
                p["hand"] = [c for c in p["hand"] if c["id"] != card_id]
                room["discard_pile"].insert(0, card)
        else:
            if p["id"] == accuser["id"]:
                p["cred_score"] = max(0, p["cred_score"] - 1)
                
    room["action_logs"] = [
        {
            "id": f"log-{timestamp_ms}-flag",
            "time": "Just now",
            "text": f"🎯 Correct Flag! {accuser['name']} caught fake card sent by {sender['name']} (-1 CRED to sender)." if is_correct
                    else f"⚠️ False Accusation Penalty! {accuser['name']} incorrectly flagged clean card (-1 CRED to accuser).",
            "type": "FACTUAL" if is_correct else "PREJUDICE"
        }
    ] + room["action_logs"]
    
    return room

def process_cascade_power_move(room: Dict[str, Any], player_id: str, card_id: str) -> Dict[str, Any]:
    player = next((p for p in room["players"] if p["id"] == player_id), None)
    if not player:
        return room
        
    # Find card in player's hand
    card = next((c for c in player["hand"] if c["id"] == card_id), None)
    if not card:
        return room
        
    timestamp_ms = int(time.time() * 1000)
    
    for p in room["players"]:
        if p["id"] != player["id"]:
            p["hand"].insert(0, card)
        else:
            p["hand"] = [c for c in p["hand"] if c["id"] != card_id]
            
    room["action_logs"] = [
        {
            "id": f"log-{timestamp_ms}-cascade",
            "time": "Just now",
            "text": f"⚡ VIRAL SPIRAL CASCADE! {player['name']} broadcasted card to ALL players simultaneously!",
            "type": "PREJUDICE"
        }
    ] + room["action_logs"]
    
    return room

def auto_play_bot_turn(room: Dict[str, Any]) -> Dict[str, Any]:
    active_player = room["players"][room["active_player_index"]]
    if not active_player.get("is_ai"):
        return room

    timestamp_ms = int(time.time() * 1000)

    # 1. DRAW Phase
    if room["turn_phase"] == "DRAW":
        room = draw_card_for_active_player(room)
        return room

    # 2. INSPECT Phase
    elif room["turn_phase"] == "INSPECT":
        room["turn_phase"] = "ACTION"
        return room

    # 3. ACTION Phase
    elif room["turn_phase"] == "ACTION":
        card = room.get("active_card")
        if not card:
            room["turn_phase"] = "DRAW"
            return room
            
        r = random.random()
        other_players = [p for p in room["players"] if p["id"] != active_player["id"]]
        target_player = random.choice(other_players) if other_players else None

        if card["card_type"] == "FACTUAL":
            if r < 0.8 and target_player:
                room = process_pass_action(room, target_player["id"])
            else:
                room = process_keep_action(room)
        elif card["card_type"] == "OPINION":
            if r < 0.5 and target_player:
                room = process_pass_action(room, target_player["id"])
            else:
                room = process_keep_action(room)
        else: # PREJUDICE
            if r < 0.7:
                room = process_discard_action(room)
            elif target_player:
                room = process_pass_action(room, target_player["id"])
            else:
                room = process_discard_action(room)
                
        return room

    return room
