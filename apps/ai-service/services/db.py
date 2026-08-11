import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "mil_echo.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rooms (
            room_code TEXT PRIMARY KEY,
            state TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_room(room_code: str, state: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    state_json = json.dumps(state)
    cursor.execute("""
        INSERT INTO rooms (room_code, state, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(room_code) DO UPDATE SET
            state = excluded.state,
            updated_at = CURRENT_TIMESTAMP
    """, (room_code, state_json))
    conn.commit()
    conn.close()

def load_room(room_code: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT state FROM rooms WHERE room_code = ?", (room_code,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row[0])
    return None

def delete_room(room_code: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM rooms WHERE room_code = ?", (room_code,))
    conn.commit()
    conn.close()
