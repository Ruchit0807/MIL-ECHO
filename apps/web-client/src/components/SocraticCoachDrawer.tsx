import React from 'react';
import { X, Sparkles, AlertTriangle, HelpCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface AuditResult {
  creator_analysis: string;
  emotional_triggers: string[];
  socratic_question: string;
  resilience_score_impact: number;
  clout_score_risk: string;
}

interface SocraticCoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditData: AuditResult | null;
  cardHeadline: string;
  isLoading: boolean;
}

export const SocraticCoachDrawer: React.FC<SocraticCoachDrawerProps> = ({
  isOpen,
  onClose,
  auditData,
  cardHeadline,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Socratic AI Coach</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>3C2B Media Analysis Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(157, 78, 225, 0.3)', borderTopColor: '#9d4edd', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>Auditing Socratic 3C2B Triggers...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : auditData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Card Headline Banner */}
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Audited Scenario</span>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>"{cardHeadline}"</p>
            </div>

            {/* Creator & Intent Analysis */}
            <div style={{ background: 'rgba(157, 78, 225, 0.08)', border: '1px solid rgba(157, 78, 225, 0.25)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#9d4edd', fontWeight: 700, fontSize: '14px' }}>
                <ShieldCheck size={18} /> 1. Creator & Intent (3C Framework)
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {auditData.creator_analysis}
              </p>
            </div>

            {/* Emotional Manipulation Triggers */}
            <div style={{ background: 'rgba(255, 0, 127, 0.08)', border: '1px solid rgba(255, 0, 127, 0.25)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#ff007f', fontWeight: 700, fontSize: '14px' }}>
                <AlertTriangle size={18} /> 2. Emotional Triggers Detected
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {auditData.emotional_triggers.map((trigger, i) => (
                  <span key={i} style={{ background: 'rgba(255, 0, 127, 0.2)', border: '1px solid rgba(255, 0, 127, 0.4)', color: '#ff75b5', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600 }}>
                    ⚠️ {trigger}
                  </span>
                ))}
              </div>
            </div>

            {/* Socratic Verification Question */}
            <div style={{ background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.25)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#00f2fe', fontWeight: 700, fontSize: '14px' }}>
                <HelpCircle size={18} /> 3. Socratic Prompt Question
              </div>
              <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#fff', lineHeight: '1.5', background: 'rgba(0, 242, 254, 0.1)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #00f2fe' }}>
                "{auditData.socratic_question}"
              </p>
            </div>

            {/* Score Impact & Risk Rating */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Resilience Reward</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>+{auditData.resilience_score_impact} pts</div>
              </div>

              <div style={{ background: 'rgba(255, 183, 3, 0.1)', border: '1px solid rgba(255, 183, 3, 0.3)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Viral Clout Risk</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffb703', marginTop: '2px' }}>{auditData.clout_score_risk}</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-flag"
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
            >
              <CheckCircle2 size={18} /> Got It — Return to Arena
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
};
