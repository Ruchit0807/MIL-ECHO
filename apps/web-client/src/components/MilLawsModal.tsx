import React from 'react';

interface MilLawsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MIL_LAWS_DATA = [
  {
    law: 1,
    title: 'Equal Status & Civic Engagement',
    icon: 'balance',
    color: 'bg-neo-mint text-neo-black',
    borderColor: 'border-l-neo-mint',
    description:
      'All forms of information providers (media, internet, libraries, technology) are for critical civic engagement and sustainable development. None is more relevant than the other.'
  },
  {
    law: 2,
    title: 'Citizen Empowerment & Inclusivity',
    icon: 'group_add',
    color: 'bg-neo-lavender text-neo-black',
    borderColor: 'border-l-neo-lavender',
    description:
      'Every citizen is a creator of information and has a message. They must be empowered to access, create, and express themselves. MIL is for ALL.'
  },
  {
    law: 3,
    title: 'Transparency of Biases & Intent',
    icon: 'visibility',
    color: 'bg-neo-coral text-neo-black',
    borderColor: 'border-l-neo-coral',
    description:
      'Information is NOT always value-neutral. It always carries biases. MIL must make this transparent and understandable.'
  },
  {
    law: 4,
    title: 'Universal Right to Information',
    icon: 'verified_user',
    color: 'bg-neo-yellow text-neo-black',
    borderColor: 'border-l-neo-yellow',
    description:
      'Every citizen wants to know, understand, and communicate information — even if they don\'t admit it. Their rights must never be compromised.'
  },
  {
    law: 5,
    title: 'Lifelong Dynamic Process',
    icon: 'all_inclusive',
    color: 'bg-neo-mint text-neo-black',
    borderColor: 'border-l-neo-mint',
    description:
      'MIL is NOT acquired at once. It\'s a dynamic, lived experience covering knowledge + skills + attitudes.'
  }
];

export const MilLawsModal: React.FC<MilLawsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neo-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-high border-4 border-neo-black neu-shadow max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 border-b-4 border-neo-black bg-neo-lavender flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-neo-black text-3xl font-black">gavel</span>
            <div>
              <span className="font-label-mono text-[10px] font-black uppercase text-neo-black tracking-widest">
                UNESCO FRAMEWORK
              </span>
              <h2 className="font-headline-lg text-xl sm:text-2xl uppercase font-black text-neo-black m-0 leading-none">
                THE 5 LAWS OF MEDIA &amp; INFORMATION LITERACY
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-neo-black text-neo-coral border-2 border-neo-black font-black font-label-mono text-sm neu-btn flex items-center justify-center hover:bg-neo-coral hover:text-neo-black transition-colors"
            title="Close Modal"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4 bg-background">
          <div className="p-4 bg-neo-black text-neo-lavender font-label-mono text-xs neu-border border-l-4 border-l-neo-lavender leading-relaxed">
            💡 <strong>UNESCO MIL Principles:</strong> Media and Information Literacy (MIL) provides citizens with essential competencies for critical thinking, digital safety, and democratic participation in the 21st century.
          </div>

          <div className="grid grid-cols-1 gap-4">
            {MIL_LAWS_DATA.map((item) => (
              <div
                key={item.law}
                className={`bg-surface-container border-4 border-neo-black p-4 shadow-[4px_4px_0_#000] flex flex-col gap-2 ${item.borderColor} border-l-8 hover:scale-[1.01] transition-transform`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 font-label-mono font-black text-xs uppercase neu-border ${item.color}`}>
                      LAW {item.law}
                    </span>
                    <h3 className="font-headline-lg text-base font-black text-on-background uppercase">
                      {item.title}
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-neo-mint text-xl font-bold">
                    {item.icon}
                  </span>
                </div>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant font-bold leading-relaxed pt-1">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-neo-black bg-surface-container-low flex justify-between items-center flex-wrap gap-3">
          <span className="font-label-mono text-[11px] text-neo-mint font-bold">
            🌐 UNESCO YOUTH HACKATHON 2026 • PREBUNKING PROTOCOL
          </span>
          <button
            onClick={onClose}
            className="bg-neo-mint text-neo-black font-headline-lg font-black text-xs px-6 py-2.5 neu-btn"
          >
            GOT IT, CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
