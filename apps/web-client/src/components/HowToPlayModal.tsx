import React, { useState } from 'react';
import { X, ShieldCheck, Flame, Cpu, Eye, Zap, HelpCircle, CheckCircle2, AlertTriangle, Radio, Video, FileText, Award } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'goal' | 'cards' | 'actions' | 'forensics' | 'multiplayer'>('goal');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(5, 8, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="glass-panel glow-border"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(16, 23, 42, 0.98) 0%, rgba(10, 15, 30, 0.99) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 242, 254, 0.25)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 242, 254, 0.5)'
              }}
            >
              <HelpCircle size={22} color="#000" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
                How to Play MIL ECHO
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                1-Minute Quick Guide to Media & Information Literacy Multiplayer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '8px 16px',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          {[
            { id: 'goal', label: '🎯 Objective & Scores' },
            { id: 'cards', label: '🃏 Cards & Deepfakes' },
            { id: 'actions', label: '⚡ Turn Actions' },
            { id: 'forensics', label: '🔬 Forensic Scanner' },
            { id: 'multiplayer', label: '👥 Co-op & Power Moves' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: activeTab === tab.id ? 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)' : 'transparent',
                color: activeTab === tab.id ? '#000' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === tab.id ? '0 0 12px rgba(0, 242, 254, 0.4)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TAB 1: OBJECTIVE & SCORES */}
          {activeTab === 'goal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(0, 242, 254, 0.06)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '16px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#00f2fe', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} /> Win Individually vs Survive Co-operatively!
                </h3>
                <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
                  MIL ECHO is a high-stakes multiplayer card game. Every round, players draw trending media cards, analyze them with Socratic AI tools, and decide whether to pass, keep, or flag them.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'rgba(0, 255, 170, 0.08)', border: '1px solid rgba(0, 255, 170, 0.25)', padding: '16px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>💎</div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#00ffaa', margin: '0 0 6px 0' }}>
                    CRED Score (+1)
                  </h4>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    Earn <strong>CRED</strong> by sharing verified authentic news or accurately flagging misinformation. First player to reach <strong>10 CRED</strong> wins an Individual Victory!
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 0, 127, 0.08)', border: '1px solid rgba(255, 0, 127, 0.25)', padding: '16px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🔥</div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ff4d94', margin: '0 0 6px 0' }}>
                    Global CHAOS Meter
                  </h4>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    The <strong>CHAOS meter</strong> represents community truth resilience. If fake news & unverified prejudice are shared unchecked, CHAOS drops. If CHAOS hits <strong>0</strong>, <strong>EVERYBODY LOSES!</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CARDS & DEEPFAKES */}
          {activeTab === 'cards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Recognize Card Types & AI Deepfakes
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'rgba(0, 255, 170, 0.06)', border: '1px solid rgba(0, 255, 170, 0.2)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ background: '#00ffaa', color: '#000', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>FACTUAL</span>
                  <p style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '8px', marginBottom: 0 }}>
                    Verified authentic report from trusted news bureaus. Safe to pass (+1 CRED, +1 CHAOS).
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 180, 0, 0.06)', border: '1px solid rgba(255, 180, 0, 0.2)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ background: '#ffb400', color: '#000', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>OPINION</span>
                  <p style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '8px', marginBottom: 0 }}>
                    Subjective commentary or blog post. Neutral impact on CHAOS meter.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 0, 127, 0.06)', border: '1px solid rgba(255, 0, 127, 0.2)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ background: '#ff007f', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>PREJUDICE & FAKE</span>
                  <p style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '8px', marginBottom: 0 }}>
                    Sensationalized bait targeting specific communities. Sharing drops CHAOS (-1).
                  </p>
                </div>
              </div>

              {/* Deepfake Types */}
              <div style={{ background: 'rgba(123, 44, 191, 0.12)', border: '1px solid rgba(123, 44, 191, 0.3)', padding: '16px', borderRadius: '16px', marginTop: '4px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#c77dff', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🤖 Special AI Deepfake Cards
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0' }}>
                    <Radio size={16} color="#00f2fe" /> <strong>Audio Deepfake</strong> (Cloned Voice)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0' }}>
                    <Video size={16} color="#ff007f" /> <strong>Video Deepfake</strong> (AI Lip-Sync)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0' }}>
                    <FileText size={16} color="#ffb400" /> <strong>Synthetic Article</strong> (Fake Portal)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TURN ACTIONS */}
          {activeTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Your 3 Tactical Options on Every Turn
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px 16px', borderRadius: '12px', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(0, 242, 254, 0.2)', color: '#00f2fe', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <strong style={{ color: '#00f2fe', fontSize: '14px' }}>🔍 Pause & Socratic Audit:</strong>
                    <span style={{ fontSize: '12px', color: '#cbd5e1', display: 'block' }}>
                      Ask your Socratic AI Copilot to analyze creator intent, emotional triggers, and source credibility using the 3C2B framework.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px 16px', borderRadius: '12px', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(0, 255, 170, 0.2)', color: '#00ffaa', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <strong style={{ color: '#00ffaa', fontSize: '14px' }}>🚀 Pass & Share to Teammate:</strong>
                    <span style={{ fontSize: '12px', color: '#cbd5e1', display: 'block' }}>
                      Forward card to another player's deck to earn +1 CRED score! But beware: passing fake cards drops global CHAOS.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px 16px', borderRadius: '12px', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(255, 0, 127, 0.2)', color: '#ff007f', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <strong style={{ color: '#ff007f', fontSize: '14px' }}>🛡️ Flag Misinformation or Discard:</strong>
                    <span style={{ fontSize: '12px', color: '#cbd5e1', display: 'block' }}>
                      Call out fake news cards in your hand or received from others! Correct flags penalize the sender (-1 CRED). Discarding mutes toxic prejudice safely.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FORENSIC SCANNER */}
          {activeTab === 'forensics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(123, 44, 191, 0.1) 100%)', border: '1px solid rgba(0, 242, 254, 0.3)', padding: '16px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#00f2fe', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={20} /> Deepfake Forensic Inspector
                </h3>
                <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
                  Each deepfake card includes embedded forensic signals! Click <strong>"Run Deepfake Scanner"</strong> inside the Audit drawer to uncover:
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '12px' }}>
                  <strong style={{ color: '#00f2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>🎵 Voice Pitch Anomaly</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Measures unnatural robotic cadence & missing breathing pauses in cloned audio.</span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '12px' }}>
                  <strong style={{ color: '#ff007f', fontSize: '13px', display: 'block', marginBottom: '4px' }}>🖼️ Pixel Manipulation Score</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Detects lip-sync boundary blurring and facial warping artifacts in video clips.</span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '12px' }}>
                  <strong style={{ color: '#ffb400', fontSize: '13px', display: 'block', marginBottom: '4px' }}>🌐 Metadata Timestamp Check</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verifies if domain EXIF data and publish dates match official news registries.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MULTIPLAYER & POWER MOVES */}
          {activeTab === 'multiplayer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Real-Time Multiplayer & Cascade Power Moves
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(0, 242, 254, 0.06)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '14px', borderRadius: '14px' }}>
                  <strong style={{ color: '#00f2fe', fontSize: '14px', display: 'block', marginBottom: '4px' }}>🌐 Multi-Device Synchronization</strong>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                    Connect 2-6 players seamlessly across smartphones, tablets, or laptops over WebSocket. Turn phases, active card draws, and scoreboard updates sync in real time.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 0, 127, 0.08)', border: '1px solid rgba(255, 0, 127, 0.25)', padding: '14px', borderRadius: '14px' }}>
                  <strong style={{ color: '#ff007f', fontSize: '14px', display: 'block', marginBottom: '4px' }}>⚡ VIRAL SPIRAL CASCADE POWER MOVE</strong>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                    When holding high-impact prejudice cards in your hand, activate the <strong>"Viral Spiral Cascade"</strong> to broadcast card copies to ALL players simultaneously!
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.3)'
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            UNESCO Youth Hackathon 2026 • MIL ECHO
          </span>

          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '8px 24px', fontSize: '13px' }}
          >
            Got It, Let's Play! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
