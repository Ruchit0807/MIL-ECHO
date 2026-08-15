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
    <header className="glass-panel mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-[#00f2fe] to-[#9d4edd] p-2 sm:p-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,242,254,0.4)]">
          <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" color="#000" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-black tracking-tight bg-gradient-to-r from-[#00f2fe] to-white bg-clip-text text-transparent flex items-center gap-2 flex-wrap">
            MIL ECHO <span className="text-[10px] sm:text-xs font-bold text-neo-black bg-[#9d4edd]/30 px-2 py-0.5 rounded-md border border-[#9d4edd]/50">VIRAL SPIRAL</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-on-surface-variant mt-0.5 flex items-center gap-1.5 font-label-mono">
            <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00f2fe]" /> 3C2B Socratic AI Prebunking Arena
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
        {/* Sound FX Toggle Button */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          className={`px-2 py-1 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 ${
            isMuted
              ? 'bg-[#ff007f]/15 border border-[#ff007f]/40 text-[#ff4d94]'
              : 'bg-[#00f2fe]/12 border border-[#00f2fe]/40 text-[#00f2fe]'
          }`}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          <span>{isMuted ? 'MUTED' : 'SOUND FX'}</span>
        </button>

        {/* How to Play Guide Button */}
        <button
          onClick={() => {
            soundFx.playCardDraw();
            onOpenHowToPlay();
          }}
          className="px-2.5 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-[#00f2fe]/20 to-[#4facfe]/20 border border-[#00f2fe] text-white text-[10px] sm:text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,242,254,0.2)] transition-all hover:scale-105"
        >
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00f2fe]" />
          <span><span className="hidden sm:inline">🎮 HOW TO PLAY </span>GUIDE</span>
        </button>

        {/* Extension Inbox Button */}
        <button
          onClick={() => {
            soundFx.playCardDraw();
            onOpenExtensionDeck();
          }}
          className="px-2.5 py-1 sm:px-4 sm:py-2 bg-white/5 border border-white/10 text-white text-[10px] sm:text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all hover:bg-white/10"
        >
          <Chrome className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00f2fe]" />
          <span>INBOX ({extensionCardCount})</span>
        </button>

        <div className="bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="hidden sm:inline">AI CONNECTED</span>
          <span className="sm:hidden">LIVE</span>
        </div>
      </div>
    </header>
  );
};
