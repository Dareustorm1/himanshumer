import { useEffect, useRef, useState } from 'react';
import { Edit3, Camera, Feather, CheckCircle2 } from 'lucide-react';
import { craftData } from '../data/portfolioData';

export default function Modes() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeMode, setActiveMode] = useState('editing');
  const [triggerGlow, setTriggerGlow] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleModeChange = (modeId: string) => {
    setActiveMode(modeId);
    setTriggerGlow(true);
    setTimeout(() => {
      setTriggerGlow(false);
    }, 600);
  };

  const getModeIcon = (id: string) => {
    switch (id) {
      case 'editing':
        return Edit3;
      case 'direction':
        return Camera;
      case 'storytelling':
        return Feather;
      default:
        return Edit3;
    }
  };

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative py-16 md:py-20 bg-[#080808]"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 text-left">
        
        {/* Section Header */}
        <div className={`mb-12 md:mb-16 text-left transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <span className="text-neutral-500 text-xs uppercase tracking-[0.3em] font-semibold mb-3 block font-mono">
            04 // TECHNIQUES
          </span>
          <h2 className="text-5xl md:text-7xl text-white font-display-cinematic tracking-wider">
            THE CRAFT
          </h2>
          <div className="w-16 h-px bg-[#35D07F] mt-4"></div>
        </div>

        {/* Console layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Bezel Options */}
          <div className={`lg:col-span-4 space-y-3 transition-all duration-1000 delay-200 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono font-medium block mb-2">
              Select Bezel Core:
            </span>

            {craftData.map((mode) => {
              const isActive = mode.id === activeMode;
              const Icon = getModeIcon(mode.id);
              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={`w-full flex items-center justify-between p-4 rounded border transition-all duration-500 font-mono text-xs interactive-item ${
                    isActive
                      ? 'border-white/20 bg-white/[0.02] text-white'
                      : 'border-white/5 hover:border-white/10 text-neutral-550 hover:text-neutral-300'
                  }`}
                  style={{
                    boxShadow: isActive && triggerGlow ? '0 0 20px rgba(53, 208, 127, 0.2)' : 'none',
                    borderColor: isActive && triggerGlow ? '#35D07F' : undefined
                  }}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-neutral-500" />
                    {mode.name}
                  </span>
                  {isActive && (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        triggerGlow ? 'bg-[#35D07F] animate-ping' : 'bg-white'
                      }`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Skills Panel */}
          <div className={`lg:col-span-8 transition-all duration-1000 delay-400 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            {craftData.map((mode) => {
              if (mode.id !== activeMode) return null;
              return (
                <div
                  key={mode.id}
                  className={`glass-card rounded p-8 md:p-12 space-y-8 animate-[fadeInUp_0.5s_ease_forwards] transition-all duration-500 ${
                    triggerGlow ? 'border-[#35D07F]/20 shadow-[0_0_30px_rgba(53, 208, 127, 0.03)]' : ''
                  }`}
                >
                  {/* Mode Label */}
                  <div className="space-y-1">
                    <h3 className="text-2xl font-light text-white font-serif-cinematic">
                      {mode.name} Assembly
                    </h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                      Masteries & Specifications
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mode.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 border border-white/5 bg-white/[0.01] rounded-sm font-mono text-xs text-neutral-300 hover:border-white/10 hover:text-white transition-all duration-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-neutral-600 shrink-0" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
