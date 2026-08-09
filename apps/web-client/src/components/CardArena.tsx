import React, { useState } from 'react';
import { Rocket, Search, ShieldX, ChevronRight, ChevronLeft, RefreshCw, AlertCircle } from 'lucide-react';

export interface ScenarioCard {
  id: string;
  headline: string;
  fake_headline?: string;
  category: string;
  is_misinformation: boolean;
  clout_reward: number;
  resilience_penalty: number;
  resilience_reward: number;
  media_url?: string;
  source?: string;
}

interface CardArenaProps {
  currentCard: ScenarioCard;
  onShareForClout: (card: ScenarioCard) => void;
  onPauseAndAudit: (card: ScenarioCard) => void;
  onFlagMisinformation: (card: ScenarioCard) => void;
  onNextCard: () => void;
  onPrevCard: () => void;
  currentIndex: number;
  totalCards: number;
}

export const CardArena: React.FC<CardArenaProps> = ({
  currentCard,
  onShareForClout,
  onPauseAndAudit,
  onFlagMisinformation,
  onNextCard,
  onPrevCard,
  currentIndex,
  totalCards,
}) => {
  const [showFakeVariant, setShowFakeVariant] = useState(false);

  const displayHeadline = showFakeVariant && currentCard.fake_headline
    ? currentCard.fake_headline
    : currentCard.headline;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
      {/* Top Deck Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
          Scenario Card <span style={{ color: 'var(--accent-cyan)' }}>#{currentIndex + 1}</span> of {totalCards}
        </span>

        {currentCard.fake_headline && (
          <button
            onClick={() => setShowFakeVariant(!showFakeVariant)}
            style={{
              background: showFakeVariant ? 'rgba(255, 0, 127, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              border: showFakeVariant ? '1px solid #ff007f' : '1px solid rgba(255, 255, 255, 0.1)',
              color: showFakeVariant ? '#ff75b5' : 'var(--text-muted)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={12} />
            {showFakeVariant ? 'Showing Viral Polarization Variant' : 'Toggle Polarization Edit'}
          </button>
        )}
      </div>

      {/* Main Game Card */}
      <div
        className="glass-panel glow-border"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          background: 'linear-gradient(180deg, rgba(18, 24, 41, 0.9) 0%, rgba(10, 14, 26, 0.95) 100%)',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Category Chip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ background: 'rgba(0, 242, 254, 0.12)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
            🏷️ {currentCard.category}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Source: {currentCard.source || 'Viral Spiral Deck'}
          </span>
        </div>

        {/* Media Preview Image */}
        {currentCard.media_url && (
          <div style={{ borderRadius: '12px', overflow: 'hidden', maxHeight: '240px', border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative' }}>
            <img
              src={currentCard.media_url}
              alt={currentCard.headline}
              style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
            />
            {showFakeVariant && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ff007f', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                VIRAL POLARIZATION VARIANT
              </div>
            )}
          </div>
        )}

        {/* Headline & Content */}
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, lineHeight: '1.4', color: '#fff', letterSpacing: '-0.3px' }}>
            "{displayHeadline}"
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.6' }}>
            This post is currently trending across social feeds. What is your editorial choice?
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '10px' }}>
          <button
            onClick={() => onShareForClout(currentCard)}
            className="btn-primary"
            style={{ justifyContent: 'center' }}
          >
            <Rocket size={18} />
            Share for Clout
          </button>

          <button
            onClick={() => onPauseAndAudit(currentCard)}
            className="btn-audit"
            style={{ justifyContent: 'center' }}
          >
            <Search size={18} />
            Pause & Audit
          </button>

          <button
            onClick={() => onFlagMisinformation(currentCard)}
            className="btn-flag"
            style={{ justifyContent: 'center' }}
          >
            <ShieldX size={18} />
            Flag Misinformation
          </button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
        <button
          onClick={onPrevCard}
          disabled={currentIndex === 0}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: currentIndex === 0 ? 'rgba(255, 255, 255, 0.2)' : '#fff',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ChevronLeft size={16} /> Previous Card
        </button>

        <button
          onClick={onNextCard}
          disabled={currentIndex === totalCards - 1}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: currentIndex === totalCards - 1 ? 'rgba(255, 255, 255, 0.2)' : '#fff',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: currentIndex === totalCards - 1 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Next Card <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
