import React from 'react';
import { Flame, ShieldAlert, Award, Zap, Users, ShieldCheck, AlertTriangle, Crown, UserCheck } from 'lucide-react';
import { Player, Room } from '../types/game';

interface ScoreBoardProps {
  room?: Room | null;
  cloutScore?: number;
  resilienceScore?: number;
  cardsAuditedCount?: number;
  streakCount?: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  room,
  cloutScore = 0,
  resilienceScore = 100,
  cardsAuditedCount = 0,
  streakCount = 0,
}) => {
  if (room) {
    const activePlayer = room.players[room.active_player_index];
    const chaosPct = Math.min(100, Math.max(0, (room.chaos_level / room.config.starting_chaos) * 100));

    return (
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderRadius: '20px',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.95) 100%)'
        }}
      >
        {/* Top CHAOS & Status Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Multiplayer Room: <span style={{ color: '#00f2fe' }}>#{room.config.room_code}</span>
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#00f2fe" /> Players & Truth Network
            </h3>
          </div>

          {/* CHAOS Level Meter */}
          <div style={{ minWidth: '180px', flex: 1, maxWidth: '280px', background: 'rgba(255, 0, 127, 0.08)', border: '1px solid rgba(255, 0, 127, 0.3)', padding: '10px 14px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#ff4d94', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={14} /> CHAOS METER
              </span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: room.chaos_level <= 3 ? '#ff007f' : '#00ffaa' }}>
                {room.chaos_level} / {room.config.starting_chaos}
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${chaosPct}%`,
                  height: '100%',
                  background: chaosPct <= 30 ? 'linear-gradient(90deg, #ff007f, #ff4d94)' : 'linear-gradient(90deg, #00ffaa, #00f2fe)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
          {room.players.map((player, idx) => {
            const isActive = idx === room.active_player_index;
            const isWinner = room.winner_player_id === player.id;

            return (
              <div
                key={player.id}
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(79, 172, 254, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isActive ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '12px',
                  position: 'relative',
                  boxShadow: isActive ? '0 0 15px rgba(0, 242, 254, 0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', top: '-8px', right: '12px', background: '#00f2fe', color: '#000', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    Active Turn
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {isWinner ? (
                    <Crown size={16} color="#ffb400" />
                  ) : (
                    <UserCheck size={16} color={player.community === 'Red Community' ? '#ff4d94' : '#00f2fe'} />
                  )}
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {player.name} {player.is_ai ? '(AI)' : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>CRED Score:</span>
                  <span style={{ fontWeight: 800, color: '#00ffaa' }}>{player.cred_score} pts</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px', color: 'var(--text-muted)' }}>
                  <span>Hand Cards:</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{player.hand.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback single-player view
  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      {/* Clout Score Card */}
      <div style={{ background: 'rgba(255, 0, 127, 0.08)', border: '1px solid rgba(255, 0, 127, 0.25)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={16} color="#ff007f" /> Clout Score
          </span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#ff007f' }}>{cloutScore}</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, cloutScore)}%`, height: '100%', background: 'linear-gradient(90deg, #ff007f, #ffb703)', transition: 'width 0.3s ease' }}></div>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Risks viral polarization if unverified</p>
      </div>

      {/* Resilience Score Card */}
      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} color="#10b981" /> Resilience Score
          </span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>{resilienceScore}%</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, resilienceScore)}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #00f2fe)', transition: 'width 0.3s ease' }}></div>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>3C2B Critical Thinking Index</p>
      </div>

      {/* Stats Counter */}
      <div style={{ background: 'rgba(157, 78, 225, 0.08)', border: '1px solid rgba(157, 78, 225, 0.25)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#9d4edd', fontWeight: 800, fontSize: '18px' }}>
            <Zap size={16} /> {streakCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Audit Streak</div>
        </div>
        <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#00f2fe', fontWeight: 800, fontSize: '18px' }}>
            <Award size={16} /> {cardsAuditedCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Audited Cards</div>
        </div>
      </div>
    </div>
  );
};
