import React, { useState } from 'react';
import { X, ShieldCheck, Flame, Cpu, Eye, Zap, HelpCircle, CheckCircle2, AlertTriangle, Radio, Video, FileText, Award } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'cards' | 'multiplayer'>('quickstart');

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
        className="glass-panel border-4 border-neo-black shadow-[10px_10px_0px_0px_#000]"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '0px',
          overflow: 'hidden',
          background: '#1e293b',
        }}
      >
        {/* Modal Header */}
        <div
          className="border-b-4 border-neo-black"
          style={{
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0f172a'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              className="border-2 border-neo-black shadow-[3px_3px_0_#000]"
              style={{
                width: '44px',
                height: '44px',
                background: '#bef264',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HelpCircle size={24} color="#000" />
            </div>
            <div>
              <h2 className="font-headline-lg text-2xl text-on-background uppercase tracking-wide font-black" style={{ margin: 0 }}>
                Playbook &amp; AI Guide
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 700, fontFamily: 'monospace' }}>
                MASTER THE VIRAL SPIRAL IN 60 SECONDS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="neu-btn"
            style={{
              background: '#fda4af',
              color: '#000',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 800
            }}
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div
          className="border-b-4 border-neo-black"
          style={{
            display: 'flex',
            overflowX: 'auto',
            padding: '10px 16px',
            gap: '10px',
            background: '#0f172a'
          }}
        >
          {[
            { id: 'quickstart', label: '🎮 Quick Start Guide' },
            { id: 'cards', label: '🃏 Cards & Scoring' },
            { id: 'multiplayer', label: '👥 Multiplayer & Co-op' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 font-label-mono text-xs font-bold neu-btn`}
              style={{
                whiteSpace: 'nowrap',
                background: activeTab === tab.id ? '#bef264' : '#334155',
                color: activeTab === tab.id ? '#000' : '#fff',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', background: '#0f172a' }}>
          
          {/* TAB 1: QUICK START GUIDE */}
          {activeTab === 'quickstart' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Game Overview Infographic */}
              <div className="border-4 border-neo-black p-3 bg-slate-900 shadow-[4px_4px_0_#000] flex flex-col items-center gap-2">
                <div className="flex items-center justify-between w-full px-1">
                  <span className="font-label-mono text-xs font-bold text-neo-mint uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">analytics</span>
                    VISUAL GAMEPLAY GUIDE
                  </span>
                  <span className="font-label-mono text-[10px] text-slate-400 font-bold uppercase">
                    EVERY CHOICE HAS OUTCOMES
                  </span>
                </div>
                <img
                  src="/how_to_play_infographic.png"
                  alt="MIL ECHO - Every Choice Has Outcomes Guide"
                  className="w-full h-auto max-h-[520px] object-contain border-2 border-neo-black rounded bg-white"
                />
              </div>

              <div className="border-4 border-neo-black p-4 shadow-[4px_4px_0_#000] bg-slate-800">
                <h3 className="font-headline-lg text-lg text-neo-mint font-black flex items-center gap-2">
                  <Award size={20} /> THE OBJECTIVE
                </h3>
                <p className="font-body-md text-sm text-slate-300 leading-relaxed mt-1">
                  Survive together while trying to win individually! Work with Socratic AI to inspect incoming news, share real truths, flag toxic deepfakes, and prevent the community from descending into absolute chaos.
                </p>
              </div>

              {/* Steps timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Step 1 */}
                <div className="border-4 border-neo-black p-4 shadow-[4px_4px_0_#000] bg-slate-800/80 flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full border-2 border-neo-black bg-neo-mint text-neo-black flex items-center justify-center font-black flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white flex items-center gap-2">
                      <Eye size={16} className="text-neo-mint" /> Inspect &amp; Audit
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      On your turn, look at the media card. Click <strong>"Socratic Copilot"</strong> to analyze its creator, intent, emotional triggers, and core bias metrics.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border-4 border-neo-black p-4 shadow-[4px_4px_0_#000] bg-slate-800/80 flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full border-2 border-neo-black bg-neo-coral text-neo-black flex items-center justify-center font-black flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white flex items-center gap-2">
                      <Zap size={16} className="text-neo-coral" /> Take Tactical Action
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      You have three options depending on your assessment:
                    </p>
                    <ul className="text-xs text-slate-300 mt-1.5 list-disc pl-4 space-y-1">
                      <li><strong>Share &amp; Pass:</strong> Send the card to a teammate's inbox. Earns CRED if it is true, but drops chaos if it is fake!</li>
                      <li><strong>Flag &amp; Report:</strong> Call out fake news cards. Success gains you CRED and penalizes the sender.</li>
                      <li><strong>Discard:</strong> Safely trash subjective opinion or toxic articles to prevent chaos drops.</li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border-4 border-neo-black p-4 shadow-[4px_4px_0_#000] bg-slate-800/80 flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full border-2 border-neo-black bg-neo-lavender text-neo-black flex items-center justify-center font-black flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-neo-lavender" /> Watch the Scoreboards
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Two critical metrics govern the game arena:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                      <div className="p-2 border-2 border-neo-black bg-neo-mint/10 text-xs">
                        <strong className="text-neo-mint">💎 CRED Score (+10 to Win):</strong> First player to reach 10 CRED through smart truth-sharing and accurate flagging wins an Individual Victory.
                      </div>
                      <div className="p-2 border-2 border-neo-black bg-neo-coral/10 text-xs">
                        <strong className="text-neo-coral">🔥 CHAOS Meter (Irreversible):</strong> Community truth resilience. Sharing misinformation drops CHAOS. Once decreased, CHAOS cannot be increased or restored! If it hits 0, <strong>Everyone Loses!</strong>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CARDS & SCORING */}
          {activeTab === 'cards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 className="font-headline-lg text-base text-white tracking-wide font-black">
                Know Your Cards &amp; Scoring Impact
              </h3>

              {/* Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                
                {/* Factual Card */}
                <div className="border-4 border-neo-black shadow-[4px_4px_0_#000] bg-slate-800 flex flex-col justify-between" style={{ minHeight: '220px' }}>
                  <div className="p-3 border-b-4 border-neo-black bg-neo-mint text-neo-black font-black text-center text-xs font-label-mono">
                    FACTUAL NEWS
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Verified authentic report from verified news registries. High credibility. Shows player target MIL Laws on decision.
                    </p>
                  </div>
                  <div className="p-3 border-t-2 border-dashed border-slate-700 bg-slate-900/60 text-[11px] text-slate-300 space-y-1">
                    <div>📤 Share: <strong className="text-neo-mint">+1 CRED (Chaos never restores)</strong></div>
                    <div>🛡️ Flag: <strong className="text-neo-coral">-1 CRED (False Flag)</strong></div>
                  </div>
                </div>

                {/* Opinion Card */}
                <div className="border-4 border-neo-black shadow-[4px_4px_0_#000] bg-slate-800 flex flex-col justify-between" style={{ minHeight: '220px' }}>
                  <div className="p-3 border-b-4 border-neo-black bg-neo-lavender text-neo-black font-black text-center text-xs font-label-mono">
                    OPINION &amp; BLOG
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Subjective commentary, editorials, or personal blogs. Contains personal bias.
                    </p>
                  </div>
                  <div className="p-3 border-t-2 border-dashed border-slate-700 bg-slate-900/60 text-[11px] text-slate-300 space-y-1">
                    <div>📤 Share: <strong className="text-slate-400">0 Impact</strong></div>
                    <div>🛡️ Flag: <strong className="text-neo-coral">-1 CRED (False Flag)</strong></div>
                  </div>
                </div>

                {/* Fake/Prejudice Card */}
                <div className="border-4 border-neo-black shadow-[4px_4px_0_#000] bg-slate-800 flex flex-col justify-between" style={{ minHeight: '220px' }}>
                  <div className="p-3 border-b-4 border-neo-black bg-neo-coral text-neo-black font-black text-center text-xs font-label-mono">
                    FAKE / PREJUDICE
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Sensationalized falsehoods, rumors, or cloned toxic propaganda.
                    </p>
                  </div>
                  <div className="p-3 border-t-2 border-dashed border-slate-700 bg-slate-900/60 text-[11px] text-slate-300 space-y-1">
                    <div>📤 Share: <strong className="text-neo-coral">-1 CHAOS (Spreads Lies)</strong></div>
                    <div>🛡️ Flag: <strong className="text-neo-mint">+1 CRED (Correct Flag)</strong></div>
                  </div>
                </div>

              </div>

              {/* Special Deepfakes section */}
              <div className="border-4 border-neo-black p-4 bg-slate-800 shadow-[4px_4px_0_#000] mt-2">
                <h4 className="font-bold text-sm text-neo-lavender flex items-center gap-2">
                  🤖 SPECIAL AI DEEPFAKE CARDS
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  These special cards contain forged media files that look extremely realistic but carry hidden artifacts:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <Radio size={16} className="text-neo-mint" /> <strong>Audio Deepfake</strong> (Cloned Voice)
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <Video size={16} className="text-neo-coral" /> <strong>Video Deepfake</strong> (AI Lip-Sync)
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <FileText size={16} className="text-neo-lavender" /> <strong>Synthetic Article</strong> (Fake Portal)
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* TAB 4: MULTIPLAYER & CO-OP */}
          {activeTab === 'multiplayer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="border-4 border-neo-black p-4 bg-slate-800 shadow-[4px_4px_0_#000]">
                <h3 className="font-headline-lg text-base text-white tracking-wide font-black">
                  Multiplayer Mechanics &amp; Power Moves
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  MIL ECHO is fully synchronized in real-time. Link with friends over WebSockets to experience chaotic newsroom streams.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                
                {/* Co-op survival */}
                <div className="p-4 border-4 border-neo-black bg-slate-800 shadow-[4px_4px_0_#000] flex flex-col gap-2">
                  <span className="bg-neo-mint border-2 border-neo-black text-neo-black text-[10px] font-black font-label-mono px-2 py-0.5 self-start">
                    CO-OP COOPERATION
                  </span>
                  <h4 className="font-bold text-sm text-white mt-1">Multi-Device Synchronization</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    2 to 6 players play together on their own smartphones, laptops, or tablets. Room updates, active turns, and chat boards sync instantly. Protect each other by passing verified cards to help teammates score.
                  </p>
                </div>

                {/* Cascade Move */}
                <div className="p-4 border-4 border-neo-black bg-slate-800 shadow-[4px_4px_0_#000] flex flex-col gap-2">
                  <span className="bg-neo-coral border-2 border-neo-black text-neo-black text-[10px] font-black font-label-mono px-2 py-0.5 self-start">
                    POWER MOVE
                  </span>
                  <h4 className="font-bold text-sm text-white mt-1">⚡ Mega Cascade Move</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When holding a highly controversial or prejudiced card in your hand, activate the <strong>"Mega Cascade Move"</strong>! This replicates the card and sends copies to ALL active players simultaneously, forcing them to quickly react.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div
          className="border-t-4 border-neo-black"
          style={{
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0f172a'
          }}
        >
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', fontFamily: 'monospace' }}>
            MIL ECHO • SOCRATIC PREBUNKING ARENA
          </span>

          <button
            onClick={onClose}
            className="neu-btn px-6 py-2 text-xs font-black uppercase"
            style={{ background: '#bef264', color: '#000' }}
          >
            Got It, Let's Play! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
