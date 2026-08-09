import React from 'react';
import { X, Chrome, Play, Trash2 } from 'lucide-react';
import { ScenarioCard } from './CardArena';

interface CapturedDeckDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  capturedCards: ScenarioCard[];
  onLoadCapturedCard: (card: ScenarioCard) => void;
  onClearCapturedDeck: () => void;
}

export const CapturedDeckDrawer: React.FC<CapturedDeckDrawerProps> = ({
  isOpen,
  onClose,
  capturedCards,
  onLoadCapturedCard,
  onClearCapturedDeck,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-panel" style={{ right: 'auto', left: 0, borderRight: '1px solid rgba(0, 242, 254, 0.3)', borderLeft: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <Chrome size={20} color="#000" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Extension Inbox</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>1-Click Scraped Web Cards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={24} />
          </button>
        </div>

        {capturedCards.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Chrome size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>No Extension Cards Captured Yet</p>
            <p style={{ fontSize: '12px', marginTop: '6px', lineHeight: '1.5' }}>
              Highlight text on any webpage, right-click, and select <strong>"Send to Viral Spiral Deck"</strong> to capture live headlines!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Captured Headlines ({capturedCards.length})
              </span>
              <button
                onClick={onClearCapturedDeck}
                style={{ background: 'transparent', border: 'none', color: '#ff007f', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={12} /> Clear All
              </button>
            </div>

            {capturedCards.map((card) => (
              <div
                key={card.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(0, 242, 254, 0.2)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  🌐 WEB CAPTURE • {card.category || 'Live Web Page'}
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: '1.4' }}>
                  "{card.headline}"
                </h4>
                <button
                  onClick={() => {
                    onLoadCapturedCard(card);
                    onClose();
                  }}
                  className="btn-primary"
                  style={{ padding: '8px 14px', fontSize: '12px', justifyContent: 'center', marginTop: '4px' }}
                >
                  <Play size={14} /> Load Into Arena
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
