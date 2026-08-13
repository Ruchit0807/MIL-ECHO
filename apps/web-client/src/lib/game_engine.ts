import { Room, RoomConfig, Player, ScenarioCard, Community, LogEntry } from '../types/game';
import defaultCardsData from './cards_database.json';

export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createInitialRoom(
  hostName: string,
  config: RoomConfig,
  initialCards: ScenarioCard[]
): Room {
  const hostPlayer: Player = {
    id: `player-host-${Date.now()}`,
    name: hostName.trim() || 'Host Agent',
    is_host: true,
    community: 'Red Community',
    cred_score: 0,
    opinion_counter: 0,
    prejudice_counter: 0,
    hand: [],
    badges: ['HOST_BADGE', 'MIL_INITIATE']
  };

  const defaultLogs: LogEntry[] = [
    {
      id: `log-${Date.now()}-1`,
      time: 'Just now',
      text: `Room ${config.room_code} created by ${hostPlayer.name}. Chaos level set to ${config.starting_chaos}.`,
      type: 'SYSTEM'
    }
  ];

  return {
    config,
    status: 'LOBBY',
    chaos_level: config.starting_chaos,
    players: [hostPlayer],
    active_player_index: 0,
    turn_phase: 'DRAW',
    active_card: null,
    deck: shuffleDeck([...initialCards]),
    discard_pile: [],
    winner_player_id: null,
    action_logs: defaultLogs
  };
}

export function fillBotPlayers(room: Room): Room {
  const botsNeeded = room.config.max_players - room.players.length;
  if (botsNeeded <= 0) return room;

  const botNames = ['EchoBot Alpha', 'Vanguard Cyber', 'Socratic Node', 'Lumina Agent', 'Pulse Runner'];
  const updatedPlayers = [...room.players];

  for (let i = 0; i < botsNeeded; i++) {
    const community: Community = (updatedPlayers.length % 2 === 0) ? 'Red Community' : 'Blue Community';
    const botPlayer: Player = {
      id: `bot-${Date.now()}-${i}`,
      name: botNames[i % botNames.length],
      is_host: false,
      community,
      cred_score: 0,
      opinion_counter: 0,
      prejudice_counter: 0,
      hand: [],
      badges: ['SIMULATED_BOT'],
      is_ai: true
    };
    updatedPlayers.push(botPlayer);
  }

  return {
    ...room,
    players: updatedPlayers,
    action_logs: [
      {
        id: `log-${Date.now()}-bots`,
        time: 'Just now',
        text: `Automated agents joined to fill ${room.config.max_players}-player lobby.`,
        type: 'SYSTEM'
      },
      ...room.action_logs
    ]
  };
}

export function startGameSession(room: Room): Room {
  const filledRoom = fillBotPlayers(room);
  return {
    ...filledRoom,
    status: 'PLAYING',
    active_player_index: 0,
    turn_phase: 'DRAW',
    active_card: null,
    action_logs: [
      {
        id: `log-${Date.now()}-start`,
        time: 'Just now',
        text: '🎮 MIL ECHO Game Session Started! Pass news, build CRED, and protect the CHAOS meter.',
        type: 'SYSTEM'
      },
      ...filledRoom.action_logs
    ]
  };
}

export function drawCardForActivePlayer(room: Room): Room {
  let deck = [...room.deck];
  let discardPile = [...room.discard_pile];

  if (deck.length === 0) {
    if (discardPile.length > 0) {
      deck = shuffleDeck([...discardPile]);
      discardPile = [];
    } else {
      deck = shuffleDeck([...(defaultCardsData as ScenarioCard[])]);
    }
  }

  const [drawnCard, ...remainingDeck] = deck;
  const activePlayer = room.players[room.active_player_index];

  return {
    ...room,
    deck: remainingDeck,
    discard_pile: discardPile,
    active_card: drawnCard,
    turn_phase: 'INSPECT',
    action_logs: [
      {
        id: `log-${Date.now()}-draw`,
        time: 'Just now',
        text: `${activePlayer.name} drew card: "${drawnCard.headline.slice(0, 32)}..."`,
        type: drawnCard.card_type === 'PREJUDICE' ? 'PREJUDICE' : drawnCard.card_type === 'FACTUAL' ? 'FACTUAL' : 'OPINION'
      },
      ...room.action_logs
    ]
  };
}

export function processPassAction(room: Room, targetPlayerId: string): Room {
  if (!room.active_card) return room;

  const activePlayer = room.players[room.active_player_index];
  const targetPlayer = room.players.find(p => p.id === targetPlayerId);
  if (!targetPlayer) return room;

  const card = room.active_card;
  let newChaosLevel = room.chaos_level;
  let newStatus = room.status;
  let winnerId = room.winner_player_id;

  // CRED Impact: +1 CRED for circulating card across network
  const updatedCred = activePlayer.cred_score + 1;

  // CHAOS Impact: Decreases on PREJUDICE/Misinformation, never increases/restores
  if (card.card_type === 'PREJUDICE' || card.is_misinformation) {
    newChaosLevel = Math.max(0, newChaosLevel - 1);
  }

  // Update Players
  const updatedPlayers = room.players.map(p => {
    if (p.id === activePlayer.id) {
      return {
        ...p,
        cred_score: updatedCred,
        opinion_counter: card.card_type === 'OPINION' ? p.opinion_counter + 1 : p.opinion_counter,
        prejudice_counter: card.card_type === 'PREJUDICE' ? p.prejudice_counter + 1 : p.prejudice_counter
      };
    }
    if (p.id === targetPlayer.id) {
      return {
        ...p,
        hand: [card, ...p.hand]
      };
    }
    return p;
  });

  // Check Endgame Victory & Defeat Rules
  if (newChaosLevel <= 0) {
    newStatus = 'GLOBAL_DEFEAT';
  } else if (updatedCred >= 10) {
    newStatus = 'INDIVIDUAL_VICTORY';
    winnerId = activePlayer.id;
  }

  const nextIndex = (room.active_player_index + 1) % room.players.length;

  return {
    ...room,
    chaos_level: newChaosLevel,
    status: newStatus,
    winner_player_id: winnerId,
    players: updatedPlayers,
    active_card: null,
    active_player_index: nextIndex,
    turn_phase: 'DRAW',
    action_logs: [
      {
        id: `log-${Date.now()}-pass`,
        time: 'Just now',
        text: `${activePlayer.name} passed card to ${targetPlayer.name} (+1 CRED). CHAOS level: ${newChaosLevel}`,
        type: card.card_type === 'PREJUDICE' ? 'PREJUDICE' : 'FACTUAL'
      },
      ...room.action_logs
    ]
  };
}

export function processKeepAction(room: Room): Room {
  if (!room.active_card) return room;

  const activePlayer = room.players[room.active_player_index];
  const card = room.active_card;

  const updatedPlayers = room.players.map(p => {
    if (p.id === activePlayer.id) {
      return {
        ...p,
        hand: [card, ...p.hand]
      };
    }
    return p;
  });

  const nextIndex = (room.active_player_index + 1) % room.players.length;

  return {
    ...room,
    players: updatedPlayers,
    active_card: null,
    active_player_index: nextIndex,
    turn_phase: 'DRAW',
    action_logs: [
      {
        id: `log-${Date.now()}-keep`,
        time: 'Just now',
        text: `${activePlayer.name} kept card in hand for strategic triggers.`,
        type: 'OPINION'
      },
      ...room.action_logs
    ]
  };
}

export function processDiscardAction(room: Room): Room {
  if (!room.active_card) return room;

  const activePlayer = room.players[room.active_player_index];
  const card = room.active_card;

  const nextIndex = (room.active_player_index + 1) % room.players.length;

  return {
    ...room,
    discard_pile: [card, ...room.discard_pile],
    active_card: null,
    active_player_index: nextIndex,
    turn_phase: 'DRAW',
    action_logs: [
      {
        id: `log-${Date.now()}-discard`,
        time: 'Just now',
        text: `${activePlayer.name} muted and discarded card to prevent potential bias spread.`,
        type: 'SYSTEM'
      },
      ...room.action_logs
    ]
  };
}

export function processFlagMisinfo(
  room: Room,
  card: ScenarioCard,
  accuserPlayerId: string,
  senderPlayerId: string
): Room {
  const accuser = room.players.find(p => p.id === accuserPlayerId);
  const sender = room.players.find(p => p.id === senderPlayerId);
  if (!accuser || !sender) return room;

  const isCorrect = card.is_misinformation || card.card_type === 'PREJUDICE';

  const updatedPlayers = room.players.map(p => {
    if (isCorrect) {
      // Correct flag: Sender loses 1 CRED
      if (p.id === sender.id) return { ...p, cred_score: Math.max(0, p.cred_score - 1) };
    } else {
      // Incorrect flag penalty: Accuser loses 1 CRED
      if (p.id === accuser.id) return { ...p, cred_score: Math.max(0, p.cred_score - 1) };
    }
    return p;
  });

  return {
    ...room,
    players: updatedPlayers,
    action_logs: [
      {
        id: `log-${Date.now()}-flag`,
        time: 'Just now',
        text: isCorrect
          ? `🎯 Correct Flag! ${accuser.name} caught fake card sent by ${sender.name} (-1 CRED to sender).`
          : `⚠️ False Accusation Penalty! ${accuser.name} incorrectly flagged clean card (-1 CRED to accuser).`,
        type: isCorrect ? 'FACTUAL' : 'PREJUDICE'
      },
      ...room.action_logs
    ]
  };
}

export function processCascadePowerMove(room: Room, card: ScenarioCard): Room {
  const activePlayer = room.players[room.active_player_index];

  // Distribute card copy to ALL other players
  const updatedPlayers = room.players.map(p => {
    if (p.id !== activePlayer.id) {
      return { ...p, hand: [card, ...p.hand] };
    }
    return { ...p, hand: p.hand.filter(c => c.id !== card.id) };
  });

  return {
    ...room,
    players: updatedPlayers,
    action_logs: [
      {
        id: `log-${Date.now()}-cascade`,
        time: 'Just now',
        text: `⚡ MEGA CASCADE! ${activePlayer.name} broadcasted card to ALL players simultaneously!`,
        type: 'PREJUDICE'
      },
      ...room.action_logs
    ]
  };
}

export function shuffleDeck(deck: ScenarioCard[]): ScenarioCard[] {
  const shuffled = [...deck];
  for (let pass = 0; pass < 3; pass++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }
  return shuffled;
}
