import React from 'react';
import { Flame, ShieldAlert, Award, Zap } from 'lucide-react';

interface ScoreBoardProps {
  cloutScore: number;
  resilienceScore: number;
  cardsAuditedCount: number;
  streakCount: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  cloutScore,
  resilienceScore,
  cardsAuditedCount,
  streakCount,
}) => {
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
