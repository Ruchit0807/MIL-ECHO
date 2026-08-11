import React, { useState } from 'react';
import { Rocket, Search, ShieldX, ChevronRight, ChevronLeft, RefreshCw, Radio, Video, FileText, Cpu, Play, Pause, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ScenarioCard } from '../types/game';
import { soundFx } from '../lib/sound_effects';

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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showForensicScan, setShowForensicScan] = useState(false);

  const displayHeadline = showFakeVariant && currentCard.fake_headline
    ? currentCard.fake_headline
    : currentCard.headline;

  const mediaType = currentCard.media_type || (currentCard.audio_url ? 'audio' : currentCard.video_url ? 'video' : 'image');

  const handleToggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    soundFx.playAuditScan();
  };

  const handleRunForensicScan = () => {
    setShowForensicScan(!showForensicScan);
    soundFx.playAuditScan();
  };

  const handleShareClick = () => {
    soundFx.playFlagSuccess();
    onShareForClout(currentCard);
  };

  const handleAuditClick = () => {
    soundFx.playAuditScan();
    onPauseAndAudit(currentCard);
  };

  const handleFlagClick = () => {
    soundFx.playFlagSuccess();
    onFlagMisinformation(currentCard);
  };

  const handleNextClick = () => {
    soundFx.playCardDraw();
    setShowForensicScan(false);
    onNextCard();
  };

  const handlePrevClick = () => {
    soundFx.playCardDraw();
    setShowForensicScan(false);
    onPrevCard();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '740px', margin: '0 auto', width: '100%' }}>
      {/* Top Deck Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
          Scenario Card <span style={{ color: 'var(--accent-cyan)' }}>#{currentIndex + 1}</span> of {totalCards}
        </span>

        {currentCard.fake_headline && (
          <button
            onClick={() => {
              setShowFakeVariant(!showFakeVariant);
              soundFx.playCardDraw();
            }}
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
          background: 'linear-gradient(180deg, rgba(18, 24, 41, 0.95) 0%, rgba(10, 14, 26, 0.98) 100%)',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Category & Deepfake Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(0, 242, 254, 0.12)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
              🏷️ {currentCard.category}
            </span>

            {mediaType !== 'image' && (
              <span style={{ background: 'rgba(123, 44, 191, 0.25)', border: '1px solid rgba(123, 44, 191, 0.6)', color: '#d8b4fe', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                {mediaType === 'audio' && <Radio size={12} color="#00f2fe" />}
                {mediaType === 'video' && <Video size={12} color="#ff007f" />}
                {mediaType === 'article' && <FileText size={12} color="#ffb400" />}
                DEEPFAKE {mediaType.toUpperCase()}
              </span>
            )}
          </div>

          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Source: {currentCard.source || 'Viral Deck'}
          </span>
        </div>

        {/* MEDIA DISPLAY WRAPPERS */}

        {/* 1. IMAGE MEDIA */}
        {mediaType === 'image' && currentCard.media_url && (
          <div style={{ borderRadius: '14px', overflow: 'hidden', maxHeight: '240px', border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative' }}>
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

        {/* 2. AUDIO DEEPFAKE PLAYER */}
        {mediaType === 'audio' && (
          <div style={{ background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(123, 44, 191, 0.15) 100%)', border: '1px solid rgba(0, 242, 254, 0.3)', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handleToggleAudio}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#000',
                    boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)'
                  }}
                >
                  {isPlayingAudio ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
                </button>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Radio size={16} color="#00f2fe" /> AI Voice Clone Recording
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Synthesized 24kHz Spectral Audio File
                  </span>
                </div>
              </div>

              {currentCard.audio_url && (
                <audio
                  controls
                  src={currentCard.audio_url}
                  style={{ display: 'none' }}
                />
              )}
            </div>

            {/* Audio Waveform Animation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '36px', background: 'rgba(0, 0, 0, 0.3)', padding: '0 12px', borderRadius: '10px' }}>
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: isPlayingAudio ? `${Math.floor(Math.sin(i * 0.5 + Date.now()) * 12 + 18)}px` : `${(i % 5) * 4 + 8}px`,
                    background: isPlayingAudio ? '#00f2fe' : 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. VIDEO DEEPFAKE PLAYER */}
        {mediaType === 'video' && (
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255, 0, 127, 0.3)', position: 'relative', background: '#000' }}>
            <video
              controls
              muted
              autoPlay
              loop
              src={currentCard.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
              style={{ width: '100%', maxHeight: '240px', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255, 0, 127, 0.85)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Video size={12} /> AI DEEPFAKE LIP-SYNC DETECTED
            </div>
          </div>
        )}

        {/* 4. SYNTHETIC ARTICLE DISPLAY */}
        {mediaType === 'article' && (
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 180, 0, 0.3)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#ffb400', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} /> Domain: {currentCard.source}
              </span>
              <span style={{ fontSize: '10px', background: 'rgba(255, 180, 0, 0.15)', color: '#ffb400', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                TRUST SCORE: 24/100 (Unverified)
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
              "BREAKING REPORT: According to unverified social blog leaks, synthetic additives have been detected in municipal infrastructure without public disclosure..."
            </p>
          </div>
        )}

        {/* Headline & Content */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, lineHeight: '1.4', color: '#fff', letterSpacing: '-0.3px' }}>
            "{displayHeadline}"
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.6' }}>
            This card is circulating across social feeds. Inspect signals or pass to your network.
          </p>
        </div>

        {/* DEEPFAKE FORENSIC INSPECTOR SCANNER TOGGLE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleRunForensicScan}
            style={{
              background: showForensicScan ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: showForensicScan ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.12)',
              color: showForensicScan ? '#00f2fe' : '#fff',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Cpu size={16} />
            {showForensicScan ? 'Close Forensic Inspector' : '🔬 Run Deepfake Forensic Scan'}
          </button>

          {/* FORENSIC INSPECTOR RESULTS PANEL */}
          {showForensicScan && (
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.2s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={14} /> FORENSIC SIGNAL ANALYSIS
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  MIL ECHO Inspector Engine v2.4
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>AUDIO PITCH ANOMALY</span>
                  <strong style={{ fontSize: '14px', color: currentCard.forensic_data?.audio_pitch_anomaly && currentCard.forensic_data.audio_pitch_anomaly > 50 ? '#ff007f' : '#00ffaa' }}>
                    {currentCard.forensic_data?.audio_pitch_anomaly ?? (currentCard.is_misinformation ? 84 : 12)}%
                  </strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>PIXEL MANIPULATION</span>
                  <strong style={{ fontSize: '14px', color: currentCard.forensic_data?.pixel_manipulation_score && currentCard.forensic_data.pixel_manipulation_score > 50 ? '#ff007f' : '#00ffaa' }}>
                    {currentCard.forensic_data?.pixel_manipulation_score ?? (currentCard.is_misinformation ? 78 : 8)}%
                  </strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>TIMESTAMP VERIFICATION</span>
                  <strong style={{ fontSize: '12px', color: currentCard.forensic_data?.metadata_timestamp_valid === false ? '#ff4d94' : '#00ffaa' }}>
                    {currentCard.forensic_data?.metadata_timestamp_valid === false ? '❌ Unverified EXIF' : '✅ Verified EXIF'}
                  </strong>
                </div>
              </div>

              {currentCard.deepfake_signals && currentCard.deepfake_signals.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#ff75b5', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    ⚠️ Detected Neural Signals:
                  </span>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#cbd5e1' }}>
                    {currentCard.deepfake_signals.map((signal, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{signal}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '4px' }}>
          <button
            onClick={handleShareClick}
            className="btn-primary"
            style={{ justifyContent: 'center' }}
          >
            <Rocket size={18} />
            Share & Pass (+1 CRED)
          </button>

          <button
            onClick={handleAuditClick}
            className="btn-audit"
            style={{ justifyContent: 'center' }}
          >
            <Search size={18} />
            Pause & Socratic Audit
          </button>

          <button
            onClick={handleFlagClick}
            className="btn-flag"
            style={{ justifyContent: 'center' }}
          >
            <ShieldX size={18} />
            Flag Misinformation
          </button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <button
          onClick={handlePrevClick}
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
          onClick={handleNextClick}
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
