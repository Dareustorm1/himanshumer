import { X, ShieldAlert, Cpu, Terminal, Disc } from 'lucide-react';

interface PopCultureEffectsProps {
  detectiveMode: boolean;
  gearFifth: boolean;
  greatPower: boolean;
  showBts: boolean;
  onCloseBts: () => void;
}

export default function PopCultureEffects({
  detectiveMode,
  gearFifth,
  greatPower,
  showBts,
  onCloseBts,
}: PopCultureEffectsProps) {
  return (
    <>
      {/* 1. Detective Mode Overlay (Batman Theme) */}
      {detectiveMode && (
        <div className="fixed inset-0 pointer-events-none z-[99990] border-[12px] border-emerald-500/10 bg-emerald-950/[0.03]">
          {/* Diagnostic grids */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
          
          {/* Scroll scanline */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.04] to-transparent h-1/2 w-full -translate-y-full animate-[scanlineScroll_6s_infinite_linear]"></div>
          
          {/* HUD Targets */}
          <div className="absolute top-1/4 left-1/4 w-12 h-12 border border-emerald-500/20 rounded-full flex items-center justify-center animate-ping [animation-duration:4s]">
            <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full"></div>
          </div>
          <div className="absolute bottom-1/3 right-1/4 w-16 h-16 border border-emerald-500/20 rounded-full flex items-center justify-center animate-ping [animation-duration:6s]">
            <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full"></div>
          </div>

          {/* HUD Text overlay */}
          <div className="absolute top-24 left-12 font-mono text-[9px] text-emerald-500/60 uppercase tracking-widest hidden md:block space-y-1">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 animate-pulse" />
              <span>DETECTIVE_MODE: ON</span>
            </div>
            <div>SCANNING COGNITIVE PATTERNS...</div>
            <div>TARGET: GOTHAM_PORTFOLIO</div>
          </div>

          <div className="absolute bottom-24 right-12 font-mono text-[9px] text-emerald-500/60 uppercase tracking-widest hidden md:block">
            <div>SECURE BAT-NET LINK: ESTABLISHED</div>
            <div>COORDS: 40.7128° N, 74.0060° W</div>
          </div>
        </div>
      )}

      {/* 2. Gear Fifth Clouds (One Piece Theme) */}
      {gearFifth && (
        <div className="fixed inset-0 pointer-events-none z-[99980] overflow-hidden select-none">
          {/* Left top cloud */}
          <div className="absolute -top-10 -left-10 w-96 h-96 opacity-30 blur-md bg-[radial-gradient(circle,white_20%,transparent_70%)] animate-pulse"></div>
          {/* Looping vector clouds */}
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] opacity-25 blur-lg bg-[radial-gradient(circle,white_20%,transparent_70%)] animate-[spin_40s_infinite_linear]"></div>
          
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-12 md:px-24">
            <div className="text-[120px] font-bold text-white/5 font-mono select-none animate-[bounce_3s_infinite_ease-in-out]">
              5
            </div>
            <div className="text-[120px] font-bold text-white/5 font-mono select-none animate-[bounce_3s_infinite_ease-in-out] [animation-delay:1.5s]">
              G
            </div>
          </div>
        </div>
      )}

      {/* 3. With Great Power Banner (Spider-Man Theme) */}
      {greatPower && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[99995] max-w-md w-full px-4 animate-[fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <div className="bg-neutral-950/90 border border-[#FF3E3E]/30 backdrop-blur-md px-6 py-4 rounded shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF3E3E]/10 flex items-center justify-center text-[#FF3E3E]">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <p className="text-xs text-neutral-200 tracking-wider font-light leading-relaxed">
                "With great power comes <span className="text-[#FF3E3E] font-semibold">great responsibility</span>."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Behind the Scenes Secret Dossier (Konami Code Unlocked) */}
      {showBts && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-[#0B0B0B] border border-[#D4AF37]/30 rounded w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-8 relative font-mono text-xs text-neutral-400 space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
              <div>
                <h3 className="text-sm uppercase tracking-[0.35em] text-[#D4AF37] font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 animate-pulse" />
                  PROJECT: DIRECTORS_CUT.log
                </h3>
                <p className="text-[10px] text-neutral-500 mt-1">AUTHORIZATION STATE: KONAMI_BYPASS</p>
              </div>
              <button
                onClick={onCloseBts}
                className="w-8 h-8 rounded border border-white/10 hover:border-[#D4AF37] text-neutral-400 hover:text-white flex items-center justify-center transition-all interactive-item"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dossier Body */}
            <div className="space-y-4">
              <div className="bg-neutral-900/50 p-4 border border-white/[0.03] rounded space-y-1 text-neutral-300">
                <p className="text-[#D4AF37] font-semibold">System Diagnostics:</p>
                <div>• Frame Engine: 120 FPS React Virtualization</div>
                <div>• Dynamic Modes: Omnitrix State Switcher Loaded</div>
                <div>• Physics: Spider-swing elastic spring modules active</div>
                <div>• Visuals: A24 styled procedural film grain active</div>
              </div>

              <div className="space-y-2">
                <p className="text-white font-semibold flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
                  Subtle Easter Eggs list:
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-neutral-500">
                  <li>Type <span className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">im batman</span> for Detective scanlines HUD.</li>
                  <li>Type <span className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">gear fifth</span> to summon Sun God Nika clouds.</li>
                  <li>Type <span className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">omnitrix</span> to trigger Ben 10 color cycle.</li>
                  <li>Type <span className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">with great power</span> for Spidey's reminder.</li>
                </ul>
              </div>

              <p className="text-[10px] text-neutral-600 italic">
                // "Every frame tells a story, and every line of code houses a dream." - H.M.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
