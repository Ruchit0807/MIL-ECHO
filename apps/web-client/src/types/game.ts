export type CardType = 'FACTUAL' | 'OPINION' | 'PREJUDICE';
export type Community = 'Red Community' | 'Blue Community';
export type AICopilotMode = 'Socratic Guidance' | 'Auto-Audit Mode';
export type TurnPhase = 'DRAW' | 'INSPECT' | 'ACTION';
export type GameStatus = 'LOBBY' | 'PLAYING' | 'INDIVIDUAL_VICTORY' | 'GLOBAL_DEFEAT';

export interface ScenarioCard {
  id: string;
  headline: string;
  fake_headline?: string;
  category: string;
  card_type: CardType;
  is_misinformation: boolean;
  clout_reward: number;
  resilience_penalty: number;
  resilience_reward: number;
  media_url?: string;
  source?: string;
  community_target?: Community;
  cred_impact: number;
  chaos_impact: number;
  attached_prejudice_tag?: string;
}

export interface Player {
  id: string;
  name: string;
  is_host: boolean;
  community: Community;
  cred_score: number;
  opinion_counter: number;
  prejudice_counter: number;
  hand: ScenarioCard[];
  badges: string[];
  is_ai?: boolean;
}

export interface RoomConfig {
  room_code: string;
  max_players: number;
  starting_chaos: number;
  ai_copilot_mode: AICopilotMode;
}

export interface LogEntry {
  id: string;
  time: string;
  text: string;
  type: 'FACTUAL' | 'OPINION' | 'PREJUDICE' | 'SYSTEM';
}

export interface Room {
  config: RoomConfig;
  status: GameStatus;
  chaos_level: number;
  players: Player[];
  active_player_index: number;
  turn_phase: TurnPhase;
  active_card: ScenarioCard | null;
  deck: ScenarioCard[];
  discard_pile: ScenarioCard[];
  winner_player_id: string | null;
  action_logs: LogEntry[];
}
