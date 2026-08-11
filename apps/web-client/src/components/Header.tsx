import React, { useState } from 'react';
import { ShieldCheck, Cpu, Chrome, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '../lib/sound_effects';

interface HeaderProps {
  onOpenExtensionDeck: () => void;
  onOpenHowToPlay: () => void;
  extensionCardCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExtensionDeck,
  onOpenHowToPlay,
  extensionCardCount,
}) => {
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());

  const handleToggleMute = () => {
    const mutedState = soundFx.toggleMute();
    setIsMuted(mutedState);
    if (!mutedState) {
      soundFx.playCardDraw();
    }
  };

  return (
    <header className="glass-panel" style={{ margin: '16px 24px 0 24px', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ background: 'linear-gradient(135deg, #00f2fe 0%, #9d4edd 100%)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={28} color="#000" />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #00f2fe, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MIL ECHO <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-purple)', WebkitTextFillColor: 'initial', background: 'rgba(157, 78, 225, 0.2)', padding: '2px 8px', borderRadius: '6px' }}>VIRAL SPIRAL</span>
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} color="#00f2fe" /> 3C2B Socratic AI Prebunking Arena (UNESCO Youth Hackathon)
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Sound FX Toggle Button */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          style={{
            background: isMuted ? 'rgba(255, 0, 127, 0.15)' : 'rgba(0, 242, 254, 0.12)',
            border: isMuted ? '1px solid rgba(255, 0, 127, 0.3)' : '1px solid rgba(0, 242, 254, 0.3)',
            color: isMuted ? '#ff4d94' : '#00f2fe',
            padding: '8px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {isMuted ? 'Muted' : 'Sound FX'}
        </button>

        {/* How to Play Guide Button */}
        <button
          onClick={() => {
            soundFx.playCardDraw();
            onOpenHowToPlay();
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(79, 172, 254, 0.2) 100%)',
            border: '1px solid #00f2fe',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 12px rgba(0, 242, 254, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <HelpCircle size={16} color="#00f2fe" />
          🎮 How to Play (Guide)
        </button>

        {/* Extension Inbox Button */}
        <button
          onClick={() => {
            soundFx.playCardDraw();
            onOpenExtensionDeck();
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Chrome size={16} color="#00f2fe" />
          Extension Inbox ({extensionCardCount})
        </button>

        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          AI Service Connected
        </div>
      </div>
    </header>
  );
};
