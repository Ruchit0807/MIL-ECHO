import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import defaultCardsData from '../lib/cards_database.json';
import { Room, Player, ScenarioCard, AICopilotMode, LogEntry, CardType } from '../types/game';
import {
  generateRoomCode,
  createInitialRoom,
  fillBotPlayers,
  startGameSession,
  drawCardForActivePlayer,
  processPassAction,
  processKeepAction,
  processDiscardAction,
  processFlagMisinfo,
  processCascadePowerMove
} from '../lib/game_engine';
import { HowToPlayModal } from '../components/HowToPlayModal';
import { soundFx } from '../lib/sound_effects';

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';


interface AuditResult {
  creator_analysis: string;
  emotional_triggers: string[];
  socratic_question: string;
  resilience_score_impact: number;
  clout_score_risk: string;
}

const getCardHint = (card: ScenarioCard): string => {
  if (card.trigger) {
    return `Hint: Psychological trigger is "${card.trigger}". Creator motivation: "${card.ai_analysis?.creator || 'Conspiracy/Scam Ring'}". Source: "${card.source || 'Social Media'}".`;
  }
  if (card.card_type === 'FACTUAL') {
    return `Hint: Check the source: "${card.source}". It represents a verified registry or official bureau. The information style is neutral and direct, and there are no deepfake neural signals.`;
  } else if (card.card_type === 'OPINION') {
    return `Hint: This card is categorized under "${card.category}". It expresses a personal commentary or subjective belief, which has a neutral impact on the Chaos meter.`;
  } else { // PREJUDICE
    if (card.deepfake_signals && card.deepfake_signals.length > 0) {
      return `Hint: Under the hood, this card contains synthetic artifacts: "${card.deepfake_signals[0]}".`;
    }
    if (card.fake_headline) {
      return `Hint: This post has a viral polarization variant targeting the "${card.community_target}". It will drain Chaos if passed.`;
    }
    return `Hint: The source is "${card.source}". It features highly sensationalized hooks intended to bait clickthroughs.`;
  }
};

export default function Home() {
  // Room & Game Engine State
  const [room, setRoom] = useState<Room | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED'>('DISCONNECTED');
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const intentionalCloseRef = useRef<boolean>(false);

  const getWsUrl = (httpUrl: string) => {
    let url;
    if (httpUrl.startsWith('http')) {
      url = new URL(httpUrl);
    } else {
      if (typeof window !== 'undefined') {
        url = new URL(httpUrl, window.location.href);
      } else {
        return 'ws://localhost:8000';
      }
    }
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsStr = url.toString();
    if (wsStr.endsWith('/')) {
      wsStr = wsStr.slice(0, -1);
    }
    return wsStr;
  };

  const connectWebSocket = (roomCode: string, onConnect?: (ws: WebSocket) => void) => {
    intentionalCloseRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = getWsUrl(AI_SERVICE_URL) + `/ws/room/${roomCode}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`Connected to WebSocket room: ${roomCode}`);
      setWsStatus('CONNECTED');

      // Heartbeat ping interval (every 5 seconds)
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 5000);

      if (onConnect) {
        onConnect(ws);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'state_update') {
          setRoom(data.room);
        } else if (data.type === 'join_success') {
          setMyPlayerId(data.player_id);
          setMyUsername(data.username);
        } else if (data.type === 'pong') {
          // Heartbeat response
        } else if (data.type === 'error') {
          alert(`Game Error: ${data.message}`);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('Room WebSocket closed.');
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      if (!intentionalCloseRef.current) {
        setWsStatus('RECONNECTING');
        reconnectTimerRef.current = setTimeout(() => {
          console.log(`Attempting automatic WebSocket reconnection to room: ${roomCode}...`);
          connectWebSocket(roomCode);
        }, 1500);
      } else {
        setWsStatus('DISCONNECTED');
      }
    };

    ws.onerror = (err) => {
      console.error('Room WebSocket error:', err);
    };

    socketRef.current = ws;
  };

  const handleExitRoom = () => {
    intentionalCloseRef.current = true;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setRoom(null);
    setWsStatus('DISCONNECTED');
  };

  const sendWsMessage = (msgObj: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msgObj));
      return true;
    } else {
      console.warn('WebSocket not open. Attempting automatic reconnection...');
      setWsStatus('RECONNECTING');
      if (room) {
        connectWebSocket(room.config.room_code, (ws) => {
          ws.send(JSON.stringify(msgObj));
        });
      }
      return false;
    }
  };

  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Modal Dialog States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isExtensionInboxOpen, setIsExtensionInboxOpen] = useState<boolean>(false);
  const [isPassConfirmOpen, setIsPassConfirmOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.isMuted());

  const handleToggleMute = () => {
    const mutedState = soundFx.toggleMute();
    setIsMuted(mutedState);
    if (!mutedState) {
      soundFx.playCardDraw();
    }
  };



  // Form Inputs
  const [hostNameInput, setHostNameInput] = useState<string>('Agent Alpha');
  const [maxPlayersInput, setMaxPlayersInput] = useState<number>(4);
  const [startingChaosInput, setStartingChaosInput] = useState<number>(10);
  const [aiCopilotModeInput, setAiCopilotModeInput] = useState<AICopilotMode>('Socratic Guidance');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [joinUsernameInput, setJoinUsernameInput] = useState<string>('Player 2');

  // Pass Action Target Selection
  const [selectedTargetPlayerId, setSelectedTargetPlayerId] = useState<string>('');

  // Local Session Player States
  const [myPlayerId, setMyPlayerId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('mil_echo_player_id');
    }
    return null;
  });
  const [myUsername, setMyUsername] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('mil_echo_username') || '';
    }
    return '';
  });

  // Accordion Checklist & AI Audit State
  const [openAccordion, setOpenAccordion] = useState<'content' | 'creator' | 'bias' | null>('content');
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState<boolean>(false);
  const [playerGuess, setPlayerGuess] = useState<CardType | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Socratic Chat & Extension Inbox State
  const [capturedCards, setCapturedCards] = useState<ScenarioCard[]>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Welcome agent to MIL ECHO. I am your Socratic AI Copilot. Inspect news cards before passing to verify creator intent and prevent global CHAOS.'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Load Extension Inbox cards
  useEffect(() => {
    try {
      const stored = localStorage.getItem('viral_spiral_extension_deck');
      if (stored) {
        setCapturedCards(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read extension deck:', e);
    }
  }, []);



  // Save Local Player Session on change
  useEffect(() => {
    if (myPlayerId) {
      sessionStorage.setItem('mil_echo_player_id', myPlayerId);
    } else {
      sessionStorage.removeItem('mil_echo_player_id');
    }
  }, [myPlayerId]);

  useEffect(() => {
    if (myUsername) {
      sessionStorage.setItem('mil_echo_username', myUsername);
    } else {
      sessionStorage.removeItem('mil_echo_username');
    }
  }, [myUsername]);

  // Auto-recover myPlayerId from room state if lost on reconnect or tab sync
  useEffect(() => {
    if (room && !myPlayerId && room.players && room.players.length > 0) {
      const match = room.players.find(p => p.name.toLowerCase() === myUsername.trim().toLowerCase());
      if (match) {
        setMyPlayerId(match.id);
      } else if (room.players[0].is_host) {
        setMyPlayerId(room.players[0].id);
      }
    }
  }, [room, myPlayerId, myUsername]);

  // Update target player selector when room players change
  useEffect(() => {
    if (room && room.players.length > 1) {
      const activePlayer = room.players[room.active_player_index];
      const otherPlayer = room.players.find(p => p.id !== activePlayer.id);
      if (otherPlayer) {
        setSelectedTargetPlayerId(otherPlayer.id);
      }
    }
  }, [room?.active_player_index, room?.players.length]);

  // Reset guess states when active card changes
  useEffect(() => {
    setPlayerGuess(null);
    setShowHint(false);
  }, [room?.active_card?.id]);

  // Action: Create Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${AI_SERVICE_URL}/api/v1/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host_name: hostNameInput,
          max_players: maxPlayersInput,
          starting_chaos: startingChaosInput,
          ai_copilot_mode: aiCopilotModeInput
        })
      });
      if (!resp.ok) {
        throw new Error('Failed to create room on backend');
      }
      const data = await resp.json();
      const code = data.room_code;
      setRoom(data.room);
      if (data.room && data.room.players && data.room.players.length > 0) {
        const hostPlayer = data.room.players[0];
        setMyPlayerId(hostPlayer.id);
        setMyUsername(hostPlayer.name);
      }
      setIsCreateModalOpen(false);
      connectWebSocket(code);
    } catch (err) {
      console.warn('Backend server unavailable, initializing client-side game room session:', err);
      const code = generateRoomCode();
      const config = {
        room_code: code,
        max_players: maxPlayersInput,
        starting_chaos: startingChaosInput,
        ai_copilot_mode: aiCopilotModeInput
      };
      const initialRoom = createInitialRoom(hostNameInput, config, defaultCardsData as ScenarioCard[]);
      const roomWithBots = fillBotPlayers(initialRoom);
      setRoom(roomWithBots);
      if (roomWithBots.players && roomWithBots.players.length > 0) {
        setMyPlayerId(roomWithBots.players[0].id);
        setMyUsername(roomWithBots.players[0].name);
      }
      setIsCreateModalOpen(false);
    }
  };

  // Action: Join Room
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCodeInput.trim();
    if (!code) return;

    connectWebSocket(code, (ws) => {
      ws.send(JSON.stringify({
        type: 'join_lobby',
        payload: { username: joinUsernameInput }
      }));
      setIsJoinModalOpen(false);
    });
  };

  // Action: Start Game Session
  const handleStartGame = () => {
    soundFx.playVictoryFanfare();
    const sent = sendWsMessage({ type: 'start_game' });
    if (!sent) {
      setRoom(prev => prev ? startGameSession(prev) : null);
    }
  };

  // Action: Draw Card
  const handleDrawCard = () => {
    soundFx.playCardDraw();
    const sent = sendWsMessage({
      type: 'draw_card',
      payload: { player_id: myPlayerId }
    });
    if (!sent) {
      setRoom(prev => prev ? drawCardForActivePlayer(prev) : null);
    }
    setAuditData(null);
  };

  // Action: Socratic AI Audit
  const handleRunAudit = async () => {
    if (!room || !room.active_card) return;
    soundFx.playAuditScan();
    setIsLoadingAudit(true);
    setAuditData(null);
    setOpenAccordion('content');

    const card = room.active_card;
    const headline = card.fake_headline || card.headline;
    const content = card.attached_prejudice_tag || card.consequence || "";

    if (card.ai_analysis) {
      setAuditData({
        creator_analysis: `Creator: ${card.ai_analysis.creator}. Context: ${card.ai_analysis.context}. Bias: ${card.ai_analysis.bias}. Monetization/Business: ${card.ai_analysis.business}.`,
        emotional_triggers: card.trigger ? card.trigger.split('+').map(t => t.trim()) : ['Outrage', 'Urgency'],
        socratic_question: `Reflective Question: How does this claim leverage '${card.trigger || 'fear'}' to trigger behavior (${card.expected_behavior || 'sharing'})? What primary source proves or disproves this?`,
        resilience_score_impact: 15,
        clout_score_risk: 'High'
      });
      setIsLoadingAudit(false);
      return;
    }

    try {
      const resp = await fetch(`${AI_SERVICE_URL}/api/v1/audit-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          media_url: card.media_url || card.image || "",
          content
        })
      });
      if (resp.ok) {
        const data: AuditResult = await resp.json();
        setAuditData(data);
      } else {
        throw new Error("Backend audit API failed");
      }
    } catch (e) {
      console.warn("Audit error:", e);
      const fallback: AuditResult = {
        creator_analysis: `Content regarding "${headline.slice(0, 30)}..." is click-optimized to provoke emotional outrage between communities.`,
        emotional_triggers: ['Outrage', 'Polarization', 'Urgency'],
        socratic_question: 'Before sharing this headline, what independent source or primary document would you check to verify these claims?',
        resilience_score_impact: 15,
        clout_score_risk: 'High'
      };
      setAuditData(fallback);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  // Action: Pass Card Trigger (Opens Confirmation Modal)
  const handlePassCard = () => {
    if (!room || !room.active_card || !selectedTargetPlayerId) return;
    setIsPassConfirmOpen(true);
  };

  // Action: Confirm Pass Execution
  const handleConfirmPassCard = () => {
    setIsPassConfirmOpen(false);
    if (!room || !room.active_card || !selectedTargetPlayerId) return;
    soundFx.playFlagSuccess();
    const sent = sendWsMessage({
      type: 'pass_card',
      payload: {
        target_player_id: selectedTargetPlayerId,
        player_id: myPlayerId
      }
    });
    if (!sent && selectedTargetPlayerId) {
      setRoom(prev => prev ? processPassAction(prev, selectedTargetPlayerId) : null);
    }
  };

  // Action: Keep Card in Hand
  const handleKeepCard = () => {
    if (!room || !room.active_card) return;
    soundFx.playCardDraw();
    const sent = sendWsMessage({
      type: 'keep_card',
      payload: { player_id: myPlayerId }
    });
    if (!sent) {
      setRoom(prev => prev ? processKeepAction(prev) : null);
    }
  };

  // Action: Discard/Mute Card
  const handleDiscardCard = () => {
    if (!room || !room.active_card) return;
    soundFx.playChaosWarning();
    const sent = sendWsMessage({
      type: 'discard_card',
      payload: { player_id: myPlayerId }
    });
    if (!sent) {
      setRoom(prev => prev ? processDiscardAction(prev) : null);
    }
  };

  // Action: Flag Misinformation
  const handleFlagMisinformation = (card: ScenarioCard, senderId: string) => {
    if (!room || !myPlayerId) return;
    soundFx.playFlagSuccess();
    const sent = sendWsMessage({
      type: 'flag_card',
      payload: {
        card_id: card.id,
        accuser_id: myPlayerId,
        sender_id: senderId
      }
    });
    if (!sent) {
      setRoom(prev => prev ? processFlagMisinfo(prev, card, myPlayerId, senderId) : null);
    }
  };

  // Action: Trigger Cascade Power Move
  const handleCascadePowerMove = (card: ScenarioCard) => {
    if (!room || !myPlayerId) return;
    soundFx.playChaosWarning();
    const sent = sendWsMessage({
      type: 'cascade_card',
      payload: {
        card_id: card.id,
        player_id: myPlayerId
      }
    });
    if (!sent) {
      setRoom(prev => prev ? processCascadePowerMove(prev, card) : null);
    }
  };


  // Socratic Chat Input Submission
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    const currentHeadline = room?.active_card ? (room.active_card.fake_headline || room.active_card.headline) : '';

    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_query: userMsg,
          headline: currentHeadline,
          context: 'MIL ECHO Socratic AI Coach Session'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { sender: 'ai', text: data.response }]);
      } else {
        throw new Error('Chat API non-200');
      }
    } catch (err) {
      console.warn('AI Service Chat fallback.');
      let aiResponse = 'How can we corroborate this claim with an independent primary source?';
      const lower = userMsg.toLowerCase();
      if (lower.includes('who') || lower.includes('creator')) {
        aiResponse = 'To evaluate the creator, ask: What does the publisher gain by distributing this? Who funded it?';
      } else if (lower.includes('true') || lower.includes('fake') || lower.includes('bias')) {
        aiResponse = 'Instead of seeking absolute binary truth, explore: What emotional triggers are being leveraged to bias your judgment?';
      }
      setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }
  };

  const activePlayer = room ? room.players[room.active_player_index] : null;
  const myPlayer = room && myPlayerId ? room.players.find(p => p.id === myPlayerId) : null;

  return (
    <>
      <Head>
        <title>MIL ECHO — AI-Powered Multiplayer MIL Game</title>
        <meta name="description" content="MIL ECHO - Building Media & Information Literacy skills through multiplayer card gameplay." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="dark bg-background grid-bg text-on-background font-body-md min-h-screen flex flex-col selection:bg-neo-mint selection:text-neo-black">
        
        {/* Navigation Top Bar */}
        <nav className="sticky top-0 w-full z-50 flex justify-between items-center px-6 lg:px-margin-desktop h-20 border-b-4 border-neo-black bg-surface-container shadow-[0px_6px_0px_0px_#000]">
          <div className="flex items-center gap-4 relative">
            <h1 className="font-display-xl text-3xl lg:text-4xl text-neo-mint italic tracking-tighter cursor-pointer" onClick={handleExitRoom} style={{ textShadow: '3px 3px 0 #000' }}>
              MIL ECHO
            </h1>
            <span className="hidden sm:inline-flex items-center px-3 py-1 bg-neo-coral text-neo-black font-label-mono text-xs font-black neu-border shadow-[2px_2px_0_#000]">
              UNESCO YOUTH MIL 2026
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleMute}
              className={`px-3 py-2 font-label-mono text-xs font-bold neu-btn flex items-center gap-2 ${
                isMuted ? 'bg-neo-black text-neo-coral' : 'bg-neo-mint text-neo-black'
              }`}
              title={isMuted ? 'Unmute Audio Sound Effects' : 'Mute Audio Sound Effects'}
            >
              <span className="material-symbols-outlined text-base font-bold">
                {isMuted ? 'volume_off' : 'volume_up'}
              </span>
              {isMuted ? 'MUTED' : 'SOUND FX'}
            </button>

            <button
              onClick={() => {
                soundFx.playCardDraw();
                setIsHowToPlayOpen(true);
              }}
              className="px-4 py-2 bg-neo-lavender text-neo-black font-label-mono text-xs font-bold neu-btn flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base font-bold">help_outline</span>
              HOW TO PLAY &amp; AI GUIDE
            </button>


            <button
              onClick={() => setIsExtensionInboxOpen(true)}
              className="hidden md:flex px-4 py-2 bg-neo-mint text-neo-black font-label-mono text-xs font-bold neu-btn items-center gap-2"
            >
              <span className="material-symbols-outlined text-base font-bold">inbox</span>
              EXTENSION INBOX ({capturedCards.length})
            </button>
            {room && (
              <button
                onClick={handleExitRoom}
                className="px-3 py-2 bg-neo-black text-neo-coral font-label-mono text-xs font-bold neu-btn"
              >
                LEAVE ROOM
              </button>
            )}
          </div>
        </nav>

        {/* MAIN BODY AREA */}
        {!room ? (
          /* HOMEPAGE LANDING LOBBY (When No Active Room) */
          <main className="flex-1 w-full max-w-7xl mx-auto p-6 flex flex-col gap-8 justify-center items-center my-auto">
            
            {/* Hero Header */}
            <div className="text-center flex flex-col items-center gap-4 max-w-3xl">
              <div className="bg-neo-coral text-neo-black font-label-mono text-xs font-black uppercase px-4 py-1 neu-border shadow-[4px_4px_0_#000] rotate-[-2deg]">
                ⚡ MULTIPLAYER PREBUNKING ARENA
              </div>
              <h2 className="font-display-xl text-5xl lg:text-7xl text-neo-mint uppercase tracking-tight font-black" style={{ textShadow: '4px 4px 0 #000' }}>
                NAVIGATE STREAMS. BUILD CRED. PREVENT CHAOS.
              </h2>
              <p className="font-body-md text-on-surface-variant text-base lg:text-lg leading-relaxed">
                Welcome to <strong>MIL ECHO</strong>. Inspect online news cards, pass authentic content to build your <strong>CRED</strong> score (+1), and stop unverified prejudice from driving the global <strong>CHAOS</strong> meter to zero!
              </p>
            </div>

            {/* Main Action Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-4">
              
              {/* CREATE ROOM CARD */}
              <div className="crt-screen border-neo-mint p-8 flex flex-col justify-between gap-6 hover:scale-[1.02] transition-transform">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="material-symbols-outlined text-neo-mint text-4xl font-bold">add_circle</span>
                    <span className="bg-neo-black text-neo-mint font-label-mono text-xs font-black px-2 py-1 neu-border">HOST MODE</span>
                  </div>
                  <h3 className="font-headline-lg text-2xl text-on-background uppercase font-black">CREATE ROOM</h3>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    Generate a unique 6-digit room code, configure player capacity (2-6), set starting Chaos level, and select AI Copilot mode.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full bg-neo-mint text-neo-black py-4 px-6 font-headline-lg text-lg font-black neu-btn hover:bg-[#a3e635] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl font-bold">sports_esports</span>
                  CREATE NEW ROOM
                </button>
              </div>

              {/* JOIN ROOM CARD */}
              <div className="crt-screen border-neo-coral p-8 flex flex-col justify-between gap-6 hover:scale-[1.02] transition-transform">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="material-symbols-outlined text-neo-coral text-4xl font-bold">login</span>
                    <span className="bg-neo-black text-neo-coral font-label-mono text-xs font-black px-2 py-1 neu-border">PLAYER MODE</span>
                  </div>
                  <h3 className="font-headline-lg text-2xl text-on-background uppercase font-black">JOIN ROOM</h3>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    Enter an active 6-digit session code and custom username to join an existing lobby with friends or simulated agents.
                  </p>
                </div>
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="w-full bg-neo-coral text-neo-black py-4 px-6 font-headline-lg text-lg font-black neu-btn hover:bg-[#fb7185] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl font-bold">key</span>
                  JOIN WITH ROOM CODE
                </button>
              </div>

            </div>

            {/* Player HUD Preview Footer */}
            <div className="w-full max-w-4xl bg-surface-container neu-border p-6 shadow-[6px_6px_0_#000] flex flex-wrap justify-between items-center gap-4 mt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 neu-border bg-neo-lavender flex items-center justify-center font-bold text-neo-black">
                  <span className="material-symbols-outlined text-3xl">badge</span>
                </div>
                <div>
                  <div className="font-label-mono text-xs text-neo-lavender font-bold uppercase">PLAYER PREVIEW BADGE</div>
                  <div className="font-headline-lg text-lg text-on-background font-black">AGENT INITIATE • RED COMMUNITY</div>
                </div>
              </div>
              <div className="flex items-center gap-6 font-label-mono text-xs">
                <div className="bg-surface-container-lowest neu-border p-2 text-neo-mint font-bold">TARGET CRED: 10</div>
                <div className="bg-surface-container-lowest neu-border p-2 text-neo-coral font-bold">STARTING CHAOS: 10</div>
              </div>
            </div>

          </main>
        ) : (
          /* ACTIVE ROOM & GAME ARENA VIEW */
          <main className="flex-1 w-full max-w-full flex flex-col lg:flex-row gap-6 p-6 bg-background overflow-hidden lg:h-[calc(100vh-80px-56px)]">
            
            {/* LEFT COLUMN: Players HUD & Global Chaos Meter */}
            <aside className="w-full lg:w-1/4 flex flex-col gap-6 overflow-y-auto pr-2 pb-8 h-full">
              
              {/* Room Status & Code Header */}
              <div className="bg-surface-container border-4 border-neo-black p-4 shadow-[6px_6px_0_#000] flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-label-mono text-xs text-neo-mint font-black bg-neo-black px-2 py-0.5 neu-border">
                    ROOM #{room.config.room_code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-label-mono text-[9px] px-1.5 py-0.5 font-black neu-border ${
                      wsStatus === 'CONNECTED' ? 'bg-neo-mint text-neo-black' : wsStatus === 'RECONNECTING' ? 'bg-neo-lavender text-neo-black animate-pulse' : 'bg-neo-coral text-neo-black'
                    }`}>
                      {wsStatus === 'CONNECTED' && '🟢 LIVE'}
                      {wsStatus === 'RECONNECTING' && '🟡 RECONNECTING...'}
                      {wsStatus === 'DISCONNECTED' && '🔴 DISCONNECTED'}
                    </span>
                    <span className="font-label-mono text-[10px] text-neo-coral font-bold">
                      {room.status === 'LOBBY' ? 'LOBBY' : 'LIVE ARENA'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-on-surface-variant">Capacity: {room.players.length}/{room.config.max_players} Players</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(room.config.room_code)}
                    className="text-[10px] font-label-mono bg-neo-lavender text-neo-black px-2 py-0.5 neu-btn font-bold"
                  >
                    COPY CODE
                  </button>
                </div>
                {room.status === 'LOBBY' && (
                  <button
                    onClick={handleStartGame}
                    className="w-full bg-neo-mint text-neo-black py-2 text-xs font-headline-lg font-black neu-btn mt-1"
                  >
                    START MULTIPLAYER SESSION
                  </button>
                )}
              </div>

              {/* Global CHAOS Meter */}
              <div className="crt-screen border-neo-coral p-5 flex flex-col gap-3 relative">
                <div className="flex justify-between items-center z-10">
                  <h2 className="font-label-mono text-xs text-neo-coral uppercase tracking-wider font-black bg-neo-black px-2 py-1 inline-block neu-border">
                    GLOBAL CHAOS METER
                  </h2>
                  <span className="material-symbols-outlined text-neo-coral text-2xl animate-pulse">
                    warning
                  </span>
                </div>
                <div className="bg-[#020617] neu-border p-3 mt-1 flex justify-between items-center z-10">
                  <span className="font-label-mono text-xs text-on-surface-variant font-bold">SYSTEM INTEGRITY:</span>
                  <div className="font-score-display text-4xl text-neo-coral tracking-widest lcd-text">
                    {room.chaos_level}/10
                  </div>
                </div>
                <div className="w-full h-5 neu-border bg-surface-container-highest overflow-hidden flex z-10">
                  <div
                    className={`h-full border-r-4 border-neo-black transition-all duration-300 ${
                      room.chaos_level <= 3 ? 'bg-error animate-pulse' : room.chaos_level <= 6 ? 'bg-neo-coral' : 'bg-neo-mint'
                    }`}
                    style={{ width: `${(room.chaos_level / room.config.starting_chaos) * 100}%` }}
                  ></div>
                </div>
                <div className="font-label-mono text-[10px] text-neo-coral text-right font-bold uppercase z-10">
                  {room.chaos_level <= 3 ? '⚠️ CRITICAL: ECHO CHAMBER COLLAPSE NEAR' : 'CHAOS CONTROLLED'}
                </div>
              </div>

              {/* Connected Players HUD Grid */}
              <div className="flex flex-col gap-3">
                <h3 className="font-headline-lg text-sm text-neo-lavender uppercase border-b-4 border-neo-lavender pb-1 font-black">
                  CONNECTED PLAYERS
                </h3>
                {room.players.map((p, idx) => {
                  const isActive = room.status === 'PLAYING' && idx === room.active_player_index;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 border-4 border-neo-black shadow-[4px_4px_0_#000] flex justify-between items-center transition-colors ${
                        isActive ? 'bg-neo-mint/20 border-neo-mint' : 'bg-surface-container'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-on-background">{p.name}</span>
                          {p.is_host && <span className="text-[9px] bg-neo-coral text-neo-black font-black px-1 neu-border">HOST</span>}
                          {isActive && <span className="text-[9px] bg-neo-mint text-neo-black font-black px-1 neu-border animate-pulse">TURN</span>}
                        </div>
                        <span className="font-label-mono text-[10px] text-on-surface-variant">
                          {p.community} • Hand: {p.hand.length} cards
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-label-mono text-xs font-bold text-neo-mint bg-neo-black px-2 py-0.5 neu-border">
                          CRED: {p.cred_score}/10
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </aside>

            {/* CENTER COLUMN: Active Arena & Turn Controller */}
            <section className="w-full lg:w-2/4 flex flex-col gap-6 overflow-y-auto pr-2 pb-8 h-full">
              
              {/* Victory / Defeat Overlay Screens */}
              {room.status === 'INDIVIDUAL_VICTORY' && (
                <div className="bg-neo-mint text-neo-black border-4 border-neo-black p-6 shadow-[8px_8px_0_#000] flex flex-col items-center gap-4 text-center">
                  <span className="material-symbols-outlined text-6xl">emoji_events</span>
                  <h2 className="font-display-xl text-3xl uppercase font-black">INDIVIDUAL VICTORY!</h2>
                  <p className="font-body-md text-sm">
                    Player <strong>{room.players.find(p => p.id === room.winner_player_id)?.name}</strong> reached 10 CRED while preserving global network integrity!
                  </p>
                  <button onClick={handleExitRoom} className="bg-neo-black text-neo-mint px-6 py-3 neu-btn text-sm font-black">
                    RETURN TO HOMEPAGE LOBBY
                  </button>
                </div>
              )}

              {room.status === 'GLOBAL_DEFEAT' && (
                <div className="bg-error-container text-on-error-container border-4 border-neo-black p-6 shadow-[8px_8px_0_#000] flex flex-col items-center gap-4 text-center">
                  <span className="material-symbols-outlined text-6xl text-neo-coral animate-bounce">explosion</span>
                  <h2 className="font-display-xl text-3xl uppercase font-black text-neo-coral">💥 GLOBAL DEFEAT!</h2>
                  <p className="font-body-md text-sm text-on-background">
                    The CHAOS meter reached 0! Polarization and unverified echo chambers collapsed the network. <strong>ALL PLAYERS LOSE!</strong>
                  </p>
                  <button onClick={handleExitRoom} className="bg-neo-black text-neo-coral px-6 py-3 neu-btn text-sm font-black">
                    TRY AGAIN IN NEW ROOM
                  </button>
                </div>
              )}

              {/* Turn Control Header Banner */}
              <div className="bg-surface-container border-4 border-neo-black p-4 shadow-[6px_6px_0_#000] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-neo-mint text-2xl">published_with_changes</span>
                  <div>
                    <span className="font-label-mono text-xs text-neo-mint font-bold uppercase">CURRENT TURN PHASE</span>
                    <h3 className="font-headline-lg text-lg font-black text-on-background uppercase">
                      {room.turn_phase === 'DRAW' && '1. DRAW PHASE — PULL CARD'}
                      {room.turn_phase === 'INSPECT' && '2. INSPECTION PHASE — EVALUATE SOURCE'}
                      {room.turn_phase === 'ACTION' && '3. ACTION PHASE — PASS, KEEP OR DISCARD'}
                    </h3>
                  </div>
                </div>
                <div className="text-right font-label-mono text-xs font-bold text-neo-lavender">
                  ACTIVE: {activePlayer?.name}
                </div>
              </div>

              {/* ACTIVE SCENARIO CARD */}
              {room.active_card ? (
                <div className="bg-surface-container-low border-4 border-neo-black shadow-[10px_10px_0px_0px_#000] p-0 flex flex-col relative group">
                  
                  {/* Card Category Header */}
                  <div className={`p-3 border-b-4 border-neo-black flex justify-between items-center font-black font-label-mono text-xs ${
                    !playerGuess
                      ? 'bg-neo-black text-neo-lavender'
                      : room.active_card.card_type === 'PREJUDICE'
                      ? 'bg-neo-coral text-neo-black'
                      : room.active_card.card_type === 'FACTUAL'
                      ? 'bg-neo-mint text-neo-black'
                      : 'bg-neo-lavender text-neo-black'
                  }`}>
                    <span>
                      {!playerGuess && '❓ UNSPECIFIED NEWS CARD (Guess the type!)'}
                      {playerGuess && room.active_card.card_type === 'PREJUDICE' && '🔴 PREJUDICE / MISINFO (-1 CHAOS)'}
                      {playerGuess && room.active_card.card_type === 'FACTUAL' && '🟢 FACTUAL VERIFIED NEWS (+1 CHAOS)'}
                      {playerGuess && room.active_card.card_type === 'OPINION' && '🟡 OPINION / BAIT (NEUTRAL)'}
                    </span>
                    <span className="bg-neo-black text-on-background px-2 py-0.5 neu-border text-[10px]">
                      {room.active_card.category.toUpperCase()}
                    </span>
                  </div>

                  {/* Media Preview */}
                  {(room.active_card.image || room.active_card.media_url) && (
                    <div className="relative w-full aspect-video border-b-4 border-neo-black overflow-hidden bg-surface-dim">
                      <img
                        className="w-full h-full object-cover grayscale contrast-125 brightness-75 group-hover:grayscale-0 transition-all duration-500 hover:scale-105"
                        src={room.active_card.image || room.active_card.media_url}
                        alt={room.active_card.headline}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute top-4 left-4 w-4 h-4 border-t-4 border-l-4 border-neo-mint"></div>
                      <div className="absolute top-4 right-4 w-4 h-4 border-t-4 border-r-4 border-neo-mint"></div>
                      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-4 border-l-4 border-neo-mint"></div>
                      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-4 border-r-4 border-neo-mint"></div>
                      {room.active_card.year && (
                        <span className="absolute bottom-3 right-3 bg-neo-black text-neo-mint font-label-mono text-[10px] font-bold px-2 py-0.5 neu-border">
                          {room.active_card.year} CASE
                        </span>
                      )}
                    </div>
                  )}

                  {/* Scenario Content */}
                  <div className="p-6 bg-surface-container flex flex-col gap-4">
                    <h3 className="font-display-xl text-xl lg:text-2xl text-on-background leading-tight font-black">
                      "{room.active_card.fake_headline || room.active_card.headline}"
                    </h3>
                    <div className="font-body-md text-on-background text-xs leading-relaxed bg-surface-container-highest p-4 neu-border flex flex-col gap-2">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span>Source Attribution: <strong>{room.active_card.source || 'Social Media Feed'}</strong></span>
                        {room.active_card.type && (
                          <span className="bg-neo-coral text-neo-black font-label-mono font-black text-[10px] uppercase px-2 py-0.5 neu-border">
                            {room.active_card.type}
                          </span>
                        )}
                      </div>
                      {room.active_card.real_impact && (
                        <div className="mt-1 font-label-mono text-[11px] text-neo-mint bg-neo-black p-2 neu-border border-l-4 border-l-neo-mint leading-relaxed">
                          <strong>💥 Real-World Impact:</strong> {room.active_card.real_impact}
                        </div>
                      )}
                    </div>

                    {/* Guessing Widget */}
                    {!playerGuess ? (
                      <div className="p-4 bg-surface-container-lowest border-4 border-neo-black shadow-[4px_4px_0_#000] flex flex-col gap-3 my-2">
                        <div className="flex justify-between items-center">
                          <span className="font-label-mono text-xs text-neo-lavender font-bold">🕵️ GUESS THE CONTENT TYPE:</span>
                          <button
                            onClick={() => {
                              soundFx.playAuditScan();
                              setShowHint(!showHint);
                            }}
                            className="text-[10px] font-label-mono bg-neo-lavender text-neo-black px-2 py-0.5 neu-btn font-bold"
                          >
                            {showHint ? '❌ HIDE HINT' : '💡 SHOW HINT'}
                          </button>
                        </div>

                        {showHint && (
                          <div className="font-label-mono text-xs p-3 bg-neo-black text-neo-mint border-l-4 border-neo-mint leading-relaxed">
                            {getCardHint(room.active_card)}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPlayerGuess('FACTUAL');
                              if (room.active_card?.card_type === 'FACTUAL') {
                                soundFx.playFlagSuccess();
                              } else {
                                soundFx.playChaosWarning();
                              }
                            }}
                            className="flex-1 bg-neo-mint text-neo-black py-2 text-xs font-headline-lg font-black neu-btn"
                          >
                            🟢 FACTUAL
                          </button>
                          <button
                            onClick={() => {
                              setPlayerGuess('OPINION');
                              if (room.active_card?.card_type === 'OPINION') {
                                soundFx.playFlagSuccess();
                              } else {
                                soundFx.playChaosWarning();
                              }
                            }}
                            className="flex-1 bg-neo-lavender text-neo-black py-2 text-xs font-headline-lg font-black neu-btn"
                          >
                            🟡 OPINION
                          </button>
                          <button
                            onClick={() => {
                              setPlayerGuess('PREJUDICE');
                              if (room.active_card?.card_type === 'PREJUDICE') {
                                soundFx.playFlagSuccess();
                              } else {
                                soundFx.playChaosWarning();
                              }
                            }}
                            className="flex-1 bg-neo-coral text-neo-black py-2 text-xs font-headline-lg font-black neu-btn"
                          >
                            🔴 PREJUDICE
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-surface-container-lowest border-4 border-neo-black shadow-[4px_4px_0_#000] flex flex-col gap-2 my-2">
                        <div className="flex justify-between items-center">
                          <span className="font-label-mono text-xs text-on-surface-variant font-bold">YOUR GUESS RESULT:</span>
                          <button
                            onClick={() => setPlayerGuess(null)}
                            className="text-[9px] font-label-mono text-neo-coral hover:underline"
                          >
                            RESET GUESS
                          </button>
                        </div>
                        <div className={`p-3 neu-border font-label-mono text-xs font-bold ${
                          playerGuess === room.active_card?.card_type 
                            ? 'bg-neo-mint/20 border-neo-mint text-neo-mint' 
                            : 'bg-neo-coral/20 border-neo-coral text-neo-coral'
                        }`}>
                          {playerGuess === room.active_card?.card_type ? (
                            <span>🎉 CORRECT! This card is indeed {room.active_card?.card_type}. (+1 CRED/CHAOS logic applies on pass/flag)</span>
                          ) : (
                            <span>❌ INCORRECT. You guessed {playerGuess}, but this card is actually {room.active_card?.card_type}.</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTION PHASE BUTTONS */}
                  {myPlayerId !== activePlayer?.id ? (
                    <div className="p-4 bg-surface-container-lowest border-t-4 border-neo-black flex items-center justify-center text-center">
                      <span className="font-headline-lg text-sm text-neo-mint font-black animate-pulse">
                        ⏳ WAITING FOR {activePlayer?.name.toUpperCase()} TO MAKE A MOVE...
                      </span>
                    </div>
                  ) : (
                    <>
                      {room.turn_phase === 'INSPECT' && (
                        <div className="p-4 bg-surface-container-lowest border-t-4 border-neo-black flex gap-4">
                          <button
                            onClick={handleRunAudit}
                            className="flex-1 bg-neo-mint text-neo-black py-3 font-headline-lg font-black neu-btn flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-xl">manage_search</span>
                            RUN SOCRATIC AI INSPECTOR
                          </button>
                          <button
                            onClick={() => setRoom({ ...room, turn_phase: 'ACTION' })}
                            className="bg-neo-lavender text-neo-black py-3 px-6 font-headline-lg font-black neu-btn"
                          >
                            PROCEED TO ACTION →
                          </button>
                        </div>
                      )}

                      {room.turn_phase === 'ACTION' && (
                        <div className="p-4 bg-surface-container-lowest border-t-4 border-neo-black flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <label className="text-xs font-bold font-label-mono text-neo-mint">Select Target Player to Pass:</label>
                            <select
                              value={selectedTargetPlayerId}
                              onChange={(e) => setSelectedTargetPlayerId(e.target.value)}
                              className="bg-surface-container neu-border p-2 font-label-mono text-xs text-on-background font-bold"
                            >
                              {room.players.filter(p => p.id !== activePlayer?.id).map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.community})</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-wrap gap-4 justify-between items-center">
                            <button
                              onClick={handlePassCard}
                              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-neo-mint text-neo-black py-3 px-4 font-headline-lg text-base neu-btn hover:bg-[#a3e635] font-black"
                            >
                              <span className="material-symbols-outlined text-xl font-bold">send</span> PASS (+1 CRED)
                            </button>
                            <button
                              onClick={handleKeepCard}
                              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-neo-lavender text-neo-black py-3 px-4 font-headline-lg text-base neu-btn hover:bg-[#c084fc] font-black"
                            >
                              <span className="material-symbols-outlined text-xl font-bold">inventory_2</span> KEEP IN HAND
                            </button>
                            <button
                              onClick={handleDiscardCard}
                              className="flex-none flex items-center justify-center p-3 bg-neo-coral text-neo-black neu-btn hover:bg-[#fb7185]"
                              title="Discard / Mute Card"
                            >
                              <span className="material-symbols-outlined text-xl font-bold">delete_sweep</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                </div>
              ) : (
                /* DRAW PHASE CONTAINER */
                <div className="border-4 border-neo-black bg-surface-container neu-shadow p-8 flex flex-col items-center justify-center gap-6 text-center min-h-[300px]">
                  <span className="material-symbols-outlined text-6xl text-neo-mint animate-bounce">style</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-headline-lg text-2xl text-on-background uppercase font-black">
                      {activePlayer?.name}'s Turn
                    </h3>
                    <p className="font-body-md text-xs text-on-surface-variant max-w-md">
                      {myPlayerId === activePlayer?.id
                        ? 'Draw a card from the public news stream deck to evaluate its authenticity and circulate it across the network.'
                        : `Waiting for ${activePlayer?.name} to draw a news card from the stream deck.`}
                    </p>
                  </div>
                  {myPlayerId === activePlayer?.id ? (
                    <button
                      onClick={handleDrawCard}
                      className="bg-neo-mint text-neo-black py-4 px-8 font-headline-lg text-lg font-black neu-btn flex items-center gap-2 hover:bg-[#a3e635]"
                    >
                      <span className="material-symbols-outlined text-2xl">download</span>
                      DRAW NEWS CARD FROM DECK
                    </button>
                  ) : (
                    <div className="bg-neo-black text-neo-mint py-3 px-6 font-label-mono text-xs font-bold neu-border uppercase animate-pulse">
                      ⏳ WAITING FOR {activePlayer?.name.toUpperCase()}'S MOVE
                    </div>
                  )}
                </div>
              )}

              {/* PLAYER HAND & SPECIAL POWER MOVES PANEL */}
              {myPlayer && myPlayer.hand.length > 0 && (
                <div className="bg-surface-container border-4 border-neo-black p-4 shadow-[6px_6px_0_#000] flex flex-col gap-3">
                  <h4 className="font-headline-lg text-sm text-neo-mint uppercase font-black flex justify-between items-center">
                    <span>YOUR CARDS IN HAND ({myPlayer.hand.length})</span>
                    <span className="text-[10px] font-label-mono text-neo-coral">SPECIAL POWER MOVES UNLOCKED</span>
                  </h4>
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                    {myPlayer.hand.map((c, i) => (
                      <div key={i} className="bg-surface-container-lowest neu-border p-3 flex justify-between items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-on-background">"{c.headline.slice(0, 36)}..."</span>
                          <span className="text-[10px] font-label-mono text-neo-mint">{c.card_type} • {c.category}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCascadePowerMove(c)}
                            className="text-[10px] bg-neo-coral text-neo-black font-label-mono font-black px-2 py-1 neu-btn"
                            title="Viral Spiral Cascade: Broadcast to ALL players simultaneously"
                          >
                            CASCADE (ALL)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </section>

            {/* RIGHT COLUMN: AI Audit Engine & Socratic Coach */}
            <aside className="w-full lg:w-1/4 flex flex-col gap-6 overflow-y-auto pr-2 pb-8 h-full">
              <div className="bg-surface-container-high border-4 border-neo-black shadow-[10px_10px_0px_0px_#000] flex flex-col h-full relative">
                
                {/* Header */}
                <div className="p-4 border-b-4 border-neo-black bg-neo-lavender flex items-center gap-3">
                  <span className="material-symbols-outlined text-neo-black text-3xl font-bold">smart_toy</span>
                  <h2 className="font-headline-lg text-xl uppercase font-black text-neo-black m-0 leading-none">
                    AI AUDIT ENGINE
                  </h2>
                </div>

                {/* 3C2B Checklist Accordion */}
                <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 bg-background min-h-[260px]">
                  
                  {/* Accordion Item 1: Content Analysis */}
                  <div className="border-4 border-neo-black shadow-[4px_4px_0_#000] bg-surface-container-low">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === 'content' ? null : 'content')}
                      className="w-full p-4 flex justify-between items-center bg-surface-container hover:bg-surface-container-highest transition-colors font-headline-lg text-sm border-b-4 border-neo-black font-black"
                    >
                      <span className="text-neo-mint font-bold tracking-wide">1. CONTENT &amp; TRIGGERS</span>
                      <span className="material-symbols-outlined text-xl font-bold">
                        {openAccordion === 'content' ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {openAccordion === 'content' && (
                      <div className="p-4 bg-surface-container-lowest font-body-md text-xs flex flex-col gap-4 text-on-background">
                        {isLoadingAudit ? (
                          <div className="py-6 text-center font-label-mono text-xs animate-pulse text-neo-mint font-bold">
                            AUDITING MEDIA CONTENT...
                          </div>
                        ) : auditData ? (
                          <>
                            <div className="flex items-center justify-between border-b-4 border-neo-black pb-2 border-dashed">
                              <span className="font-bold">Emotional Triggers:</span>
                              <div className="flex gap-1 flex-wrap justify-end">
                                {auditData.emotional_triggers.map((t, idx) => (
                                  <span key={idx} className="text-neo-coral font-black font-label-mono bg-neo-black px-2 py-0.5 text-[10px] neu-border">
                                    {t.toUpperCase()}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <p className="text-xs font-label-mono p-3 bg-[#0f172a] neu-border border-l-8 border-l-neo-coral text-neo-coral leading-relaxed">
                              <strong>Coach Question:</strong> "{auditData.socratic_question}"
                            </p>

                            {room.active_card?.trigger && (
                              <div className="flex flex-col gap-2 p-3 bg-surface-container neu-border font-label-mono text-[11px]">
                                <div className="font-black text-neo-mint border-b border-neo-mint/30 pb-1 uppercase">
                                  ⚡ ABC Model (Behavioral Chain):
                                </div>
                                <div><strong>Trigger:</strong> {room.active_card.trigger}</div>
                                <div><strong>Target Behavior:</strong> {room.active_card.expected_behavior}</div>
                                <div><strong>Consequence:</strong> {room.active_card.consequence}</div>
                              </div>
                            )}

                            {room.active_card?.ai_analysis && (
                              <div className="flex flex-col gap-1.5 p-3 bg-surface-container neu-border font-label-mono text-[11px]">
                                <div className="font-black text-neo-lavender border-b border-neo-lavender/30 pb-1 uppercase">
                                  🤖 3C2B Framework Analysis:
                                </div>
                                <div><strong>Creator:</strong> {room.active_card.ai_analysis.creator}</div>
                                <div><strong>Content:</strong> {room.active_card.ai_analysis.content}</div>
                                <div><strong>Context:</strong> {room.active_card.ai_analysis.context}</div>
                                <div><strong>Bias:</strong> {room.active_card.ai_analysis.bias}</div>
                                <div><strong>Business:</strong> {room.active_card.ai_analysis.business}</div>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-xs font-label-mono text-on-surface-variant font-bold">
                            Click "RUN SOCRATIC AI INSPECTOR" during Inspection Phase to evaluate triggers.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Accordion Item 2: Socratic Dialogue Chat */}
                  <div className="border-4 border-neo-black shadow-[4px_4px_0_#000] bg-surface-container-low flex flex-col">
                    <div className="p-4 bg-surface-container font-headline-lg text-sm border-b-4 border-neo-black font-black text-on-background flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm font-bold">forum</span>
                        SOCRATIC DIALOGUE
                      </span>
                    </div>
                    <div className="p-3 bg-surface-container-lowest font-label-mono text-xs flex flex-col gap-3 max-h-[200px] overflow-y-auto">
                      {chatHistory.map((chat, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col p-2.5 neu-border ${
                            chat.sender === 'user'
                              ? 'bg-neo-mint/10 border-neo-mint/35 self-end ml-6 shadow-[2px_2px_0px_0px_#bef264]'
                              : 'bg-surface-container border-neo-lavender/35 self-start mr-6 shadow-[2px_2px_0px_0px_#d8b4fe]'
                          } max-w-[90%]`}
                        >
                          <span className={`text-[10px] font-black tracking-wider uppercase mb-1 ${
                            chat.sender === 'user' ? 'text-neo-mint' : 'text-neo-lavender'
                          }`}>
                            {chat.sender === 'user' ? '▶ USER_SESSION' : '⚡ SOCRATIC_COACH'}
                          </span>
                          <p className="text-xs text-on-background leading-relaxed font-semibold">
                            {chat.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChat} className="p-4 border-t-4 border-neo-black bg-surface-container mt-auto">
                  <div className="relative flex items-center">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="w-full bg-surface-container-lowest neu-border p-4 pr-12 font-label-mono text-xs text-on-background placeholder:text-on-surface-variant/50 focus:border-neo-mint focus:ring-0 focus:outline-none shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.8)] font-bold"
                      placeholder="Ask AI Coach a question..."
                      type="text"
                    />
                    <button type="submit" className="absolute right-3 text-neo-mint hover:text-neo-lavender transition-colors drop-shadow-[2px_2px_0_#000]">
                      <span className="material-symbols-outlined text-3xl font-bold">send</span>
                    </button>
                  </div>
                </form>
              </div>
            </aside>

          </main>
        )}

        {/* Footer */}
        <footer className="mt-auto w-full flex justify-between items-center px-6 lg:px-margin-desktop py-3 border-t-4 border-neo-black bg-surface-container-highest shadow-[0px_-6px_0px_0px_#000] relative z-10">
          <div className="font-label-mono text-xs text-neo-lavender font-black uppercase tracking-wider bg-neo-black px-3 py-1 neu-border">
            © 2026 MIL ECHO — PREBUNKING PROTOCOL ACTIVE
          </div>
          <div className="flex items-center gap-6 font-headline-lg text-sm">
            <button
              onClick={() => window.open('/api/v1/export-pdf', '_blank')}
              className="text-neo-mint bg-neo-black py-1.5 px-4 font-black neu-btn hover:bg-neo-mint hover:text-neo-black flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base font-bold">download</span> EXPORT PDF
            </button>
            <a className="text-on-background hover:text-neo-coral transition-colors font-bold uppercase cursor-pointer" onClick={() => setIsRulesModalOpen(true)}>RULES</a>
          </div>
        </footer>

        {/* MODAL: CREATE ROOM */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container border-4 border-neo-black shadow-[10px_10px_0_#000] p-6 max-w-md w-full flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b-4 border-neo-black">
                <h3 className="text-xl font-bold uppercase text-neo-mint font-headline-lg">CREATE NEW ROOM</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-on-surface hover:text-neo-coral font-bold">[CLOSE]</button>
              </div>
              <form onSubmit={handleCreateRoom} className="flex flex-col gap-4 font-label-mono text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-neo-lavender">Host Username:</label>
                  <input
                    value={hostNameInput}
                    onChange={(e) => setHostNameInput(e.target.value)}
                    className="bg-surface-container-lowest neu-border p-3 text-on-background font-bold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-neo-lavender">Max Players (2 to 6):</label>
                  <select
                    value={maxPlayersInput}
                    onChange={(e) => setMaxPlayersInput(Number(e.target.value))}
                    className="bg-surface-container-lowest neu-border p-3 text-on-background font-bold"
                  >
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players (Recommended)</option>
                    <option value={5}>5 Players</option>
                    <option value={6}>6 Players</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-neo-lavender">Starting Chaos Level:</label>
                  <select
                    value={startingChaosInput}
                    onChange={(e) => setStartingChaosInput(Number(e.target.value))}
                    className="bg-surface-container-lowest neu-border p-3 text-on-background font-bold"
                  >
                    <option value={5}>5 (High Challenge)</option>
                    <option value={10}>10 (Standard Default)</option>
                    <option value={15}>15 (Extended Play)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-neo-lavender">AI Copilot Mode:</label>
                  <select
                    value={aiCopilotModeInput}
                    onChange={(e) => setAiCopilotModeInput(e.target.value as AICopilotMode)}
                    className="bg-surface-container-lowest neu-border p-3 text-on-background font-bold"
                  >
                    <option value="Socratic Guidance">Socratic Guidance (Interactive prompts)</option>
                    <option value="Auto-Audit Mode">Auto-Audit Mode</option>
                  </select>
                </div>
                <button type="submit" className="bg-neo-mint text-neo-black py-4 font-headline-lg text-lg font-black neu-btn mt-2">
                  GENERATE 6-DIGIT ROOM CODE
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: JOIN ROOM */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container border-4 border-neo-black shadow-[10px_10px_0_#000] p-6 max-w-md w-full flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b-4 border-neo-black">
                <h3 className="text-xl font-bold uppercase text-neo-coral font-headline-lg">JOIN SESSION LOBBY</h3>
                <button onClick={() => setIsJoinModalOpen(false)} className="text-on-surface hover:text-neo-coral font-bold">[CLOSE]</button>
              </div>
              <form onSubmit={handleJoinRoom} className="flex flex-col gap-4 font-label-mono text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-neo-coral">6-Digit Room Code:</label>
                  <input
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="e.g. 849201"
                    maxLength={6}
                    className="bg-surface-container-lowest neu-border p-3 text-on-background font-bold text-center tracking-widest text-lg"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-neo-coral">Your Username:</label>
                  <input
                    value={joinUsernameInput}
                    onChange={(e) => setJoinUsernameInput(e.target.value)}
                    className="bg-surface-container-lowest neu-border p-3 text-on-background font-bold"
                    required
                  />
                </div>
                <button type="submit" className="bg-neo-coral text-neo-black py-4 font-headline-lg text-lg font-black neu-btn mt-2">
                  ENTER ROOM SESSION
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: RULES & AI GUIDE */}
        {isRulesModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container border-4 border-neo-black shadow-[10px_10px_0_#000] p-6 max-w-2xl w-full flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b-4 border-neo-black">
                <h3 className="text-2xl font-bold uppercase text-neo-mint font-headline-lg">MIL ECHO — RULES &amp; AI GUIDE</h3>
                <button onClick={() => setIsRulesModalOpen(false)} className="text-on-surface hover:text-neo-coral font-bold">[CLOSE]</button>
              </div>
              <div className="flex flex-col gap-4 font-body-md text-xs text-on-background leading-relaxed">
                <div className="bg-surface-container-lowest neu-border p-4">
                  <h4 className="font-headline-lg text-base text-neo-mint font-black mb-1">🎯 VICTORY &amp; DEFEAT CONDITIONS</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Individual Victory:</strong> First player to reach <strong>10 CRED</strong> wins—provided global CHAOS remains above 0.</li>
                    <li><strong>Global Defeat:</strong> If the <strong>CHAOS meter drops from 10 down to 0</strong>, all players lose immediately!</li>
                  </ul>
                </div>
                <div className="bg-surface-container-lowest neu-border p-4">
                  <h4 className="font-headline-lg text-base text-neo-coral font-black mb-1">🎴 CARD TAXONOMY</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>🟢 <strong>FACTUAL (Verified News):</strong> +1 CRED when passed to another player. Restores +1 CHAOS.</li>
                    <li>🟡 <strong>OPINION / BAIT:</strong> +1 CRED when passed. Neutral impact on CHAOS.</li>
                    <li>🔴 <strong>PREJUDICE / ECHO (Misinfo):</strong> +1 CRED when passed, but drains <strong>-1 CHAOS</strong> from the global meter!</li>
                  </ul>
                </div>
                <div className="bg-surface-container-lowest neu-border p-4">
                  <h4 className="font-headline-lg text-base text-neo-lavender font-black mb-1">⚡ SPECIAL POWER MOVES</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Cancel Move (±2 Opinion):</strong> Initiate player cancellation vote.</li>
                    <li><strong>Manufacture Fake News (±2..3 Prejudice):</strong> Attach prejudice tags to clean cards in hand.</li>
                    <li><strong>Viral Spiral Cascade (±4..5 Prejudice):</strong> Broadcast 1 card to ALL players simultaneously!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: PASS CONFIRMATION */}
        {isPassConfirmOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container border-4 border-neo-black shadow-[10px_10px_0_#000] p-6 max-w-md w-full flex flex-col gap-4 text-center">
              <div className="flex justify-between items-center pb-2 border-b-4 border-neo-black">
                <h3 className="text-xl font-black uppercase text-neo-coral font-headline-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl">help_outline</span>
                  Think again. Are you sure?
                </h3>
                <button onClick={() => setIsPassConfirmOpen(false)} className="text-on-surface hover:text-neo-coral font-bold">[CLOSE]</button>
              </div>

              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed text-left">
                Before circulating this news card across the network, pause to verify if creator motives or sensationalized hooks might drain the global <strong>CHAOS</strong> meter!
              </p>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleConfirmPassCard}
                  className="flex-1 bg-neo-mint text-neo-black py-3 px-4 font-headline-lg text-sm font-black neu-btn hover:bg-[#a3e635] flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-lg font-bold">send</span>
                  Yes, Share
                </button>
                <button
                  onClick={() => setIsPassConfirmOpen(false)}
                  className="flex-1 bg-neo-coral text-neo-black py-3 px-4 font-headline-lg text-sm font-black neu-btn hover:bg-[#fb7185] flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-lg font-bold">manage_search</span>
                  Hmm, Let me check
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: HOW TO PLAY & GAME RULES */}
        <HowToPlayModal
          isOpen={isHowToPlayOpen}
          onClose={() => setIsHowToPlayOpen(false)}
        />

      </div>
    </>

  );
}
