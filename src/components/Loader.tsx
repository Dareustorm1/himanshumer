import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [projectorStarted, setProjectorStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [creditPhase, setCreditPhase] = useState<'countdown' | 'filmBy' | 'title' | 'done'>('countdown');

  // Trigger synthetic projector motor clicks & hums using Web Audio API
  useEffect(() => {
    if (!projectorStarted) return;

    // Web Audio Setup
    let audioCleanup: (() => void) | undefined;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        
        // Low motor hum
        const humOsc = audioCtx.createOscillator();
        const humGain = audioCtx.createGain();
        const lpFilter = audioCtx.createBiquadFilter();
        
        humOsc.type = 'sawtooth';
        humOsc.frequency.setValueAtTime(50, audioCtx.currentTime);
        
        lpFilter.type = 'lowpass';
        lpFilter.frequency.setValueAtTime(120, audioCtx.currentTime);
        
        humOsc.connect(lpFilter);
        lpFilter.connect(humGain);
        humGain.connect(audioCtx.destination);
        humGain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        humOsc.start();

        // Shutter clicks loop
        const tickTimer = setInterval(() => {
          try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
            
            gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
          } catch (e) {}
        }, 120);

        audioCleanup = () => {
          clearInterval(tickTimer);
          try {
            humOsc.stop();
            audioCtx.close();
          } catch (e) {}
        };
      }
    } catch (err) {
      console.warn('Web Audio API not supported / blocked:', err);
    }

    // Countdown sequence
    let countInterval: number;
    if (creditPhase === 'countdown') {
      countInterval = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) return prev - 1;
          
          clearInterval(countInterval);
          setCreditPhase('filmBy');
          return 0;
        });
      }, 800);
    }

    return () => {
      if (countInterval) clearInterval(countInterval);
      if (audioCleanup) audioCleanup();
    };
  }, [projectorStarted, creditPhase]);

  // Phase transition timings
  useEffect(() => {
    if (creditPhase === 'filmBy') {
      const timer = setTimeout(() => {
        setCreditPhase('title');
      }, 2500);
      return () => clearTimeout(timer);
    }

    if (creditPhase === 'title') {
      const timer = setTimeout(() => {
        setCreditPhase('done');
        // Let transition overlay run, then trigger scroll unlock complete
        const completeTimer = setTimeout(() => {
          onComplete();
        }, 1200);
        return () => clearTimeout(completeTimer);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [creditPhase, onComplete]);

  // Handle click unlock scroll
  const handleStart = () => {
    setProjectorStarted(true);
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#070707] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
        creditPhase === 'done' ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
    >
      {/* 1. Projector Start Trigger Block */}
      {!projectorStarted && (
        <div className="text-center z-50 space-y-6 font-mono text-neutral-400 select-none max-w-sm animate-[fadeInUp_0.8s_ease_forwards]">
          <h2 className="text-xs uppercase tracking-[0.4em] text-[#D4AF37]">
            CHAPTER 0 // INTRO
          </h2>
          <p className="text-[10px] leading-relaxed tracking-wider uppercase text-neutral-500">
            For the full immersive experience, enable projector sound.
          </p>
          <button
            onClick={handleStart}
            className="mx-auto w-16 h-16 rounded-full border border-white/10 hover:border-[#D4AF37] bg-white/[0.01] hover:bg-[#D4AF37]/10 flex items-center justify-center text-white hover:text-[#D4AF37] transition-all duration-500 interactive-item"
            title="Start Projector"
          >
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </button>
        </div>
      )}

      {/* 2. Visual Projector Light Beam */}
      {projectorStarted && creditPhase !== 'done' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.025)_0%,transparent_75%)] pointer-events-none z-0 animate-pulse"></div>
      )}

      {/* 3. Credits Countdown Phase */}
      {projectorStarted && creditPhase === 'countdown' && (
        <div className="relative text-center flex flex-col items-center justify-center font-mono select-none z-10 animate-[fadeInUp_0.5s_ease_forwards]">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-neutral-850 flex items-center justify-center mb-6">
            <div className="absolute inset-1 rounded-full border border-dashed border-neutral-700/30 animate-spin [animation-duration:12s]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-neutral-800/10"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-px h-full bg-neutral-800/10"></div>
            </div>
            <span className="text-3xl md:text-4xl text-neutral-300 font-extralight">
              0{countdown}
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-600">
            Projector Shutter Loaded
          </span>
        </div>
      )}

      {/* 4. "A Film By" Phase */}
      {projectorStarted && creditPhase === 'filmBy' && (
        <div className="text-center z-10 space-y-3 font-mono select-none px-6 animate-[fadeInUp_1.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-body-cinematic">
            A FILM BY
          </span>
          <h2 className="text-5xl sm:text-7xl tracking-[0.15em] text-white font-display-cinematic">
            HIMANSHU MER
          </h2>
        </div>
      )}

      {/* 5. Title Credits Phase */}
      {projectorStarted && creditPhase === 'title' && (
        <div className="text-center z-10 space-y-4 select-none px-6 animate-[fadeInUp_1.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-mono font-body-cinematic">
            CHAPTER I // PROLOGUE
          </span>
          <h1 className="text-5xl sm:text-7xl md:text-9xl tracking-[0.1em] text-white font-display-cinematic leading-none">
            THE MAKING OF
          </h1>
          <h2 className="text-3xl sm:text-4xl tracking-[0.2em] text-white font-display-cinematic">
            HIMANSHU MER
          </h2>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 font-body-cinematic font-light pt-4 border-t border-white/5 w-64 mx-auto">
            Filmmaker • Editor • Storyteller
          </p>
        </div>
      )}

      {/* Retro frame crop marks */}
      <div className="absolute top-8 left-8 w-6 h-6 border-t border-l border-neutral-900/50"></div>
      <div className="absolute top-8 right-8 w-6 h-6 border-t border-r border-neutral-900/50"></div>
      <div className="absolute bottom-8 left-8 w-6 h-6 border-b border-l border-neutral-900/50"></div>
      <div className="absolute bottom-8 right-8 w-6 h-6 border-b border-r border-neutral-900/50"></div>
    </div>
  );
}
