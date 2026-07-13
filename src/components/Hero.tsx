import { useEffect, useState, useCallback } from 'react';
import { ArrowDown, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  // Lazy initialisers — read stored values on first render so there is
  // never a flash of the static fallbacks being swapped out.
  const [name, setName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('himanshumer_casefile_data_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) return parsed.name;
      }
    } catch (_) {}
    return 'HIMANSHU MER';
  });

  const [roles, setRoles] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('himanshumer_casefile_data_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.titles && parsed.titles.length > 0) {
          // Normalise legacy 'Storyteller' → 'Visual Storyteller'
          return parsed.titles.map((t: string) =>
            t.trim() === 'Storyteller' ? 'Visual Storyteller' : t
          );
        }
      }
    } catch (_) {}
    return ['Filmmaker', 'Editor', 'Visual Storyteller'];
  });

  const { audioOn, wantHum, wantRain, wantMusic, setWantHum, setWantRain, toggleAudio, toggleMusic } = useAudio();

  // Keep in sync when the Case File is saved while the page is open
  const normaliseRoles = (titles: string[]) =>
    titles.map((t: string) => t.trim() === 'Storyteller' ? 'Visual Storyteller' : t);

  const loadCaseFileSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem('himanshumer_casefile_data_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setName(parsed.name);
        if (parsed.titles && parsed.titles.length > 0) setRoles(normaliseRoles(parsed.titles));
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    // Listen for live updates from the admin panel
    const handleCaseFileSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.name) setName(customEvent.detail.name);
        if (customEvent.detail.titles) setRoles(normaliseRoles(customEvent.detail.titles));
      }
    };

    window.addEventListener('casefile-updated', handleCaseFileSync);
    window.addEventListener('storage', loadCaseFileSettings);

    const t = setTimeout(() => setIsVisible(true), 200);

    return () => {
      window.removeEventListener('casefile-updated', handleCaseFileSync);
      window.removeEventListener('storage', loadCaseFileSettings);
      clearTimeout(t);
    };
  }, [loadCaseFileSettings]);

  const handleToggleAudio = () => {
    toggleAudio();
  };

  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#080808]">

      {/* Background Autoplay Video */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline
          className="w-full h-full object-cover opacity-15 filter grayscale contrast-125 scale-105"
        >
          <source
            src="https://player.vimeo.com/external/435674703.sd.mp4?s=7f7db191e1d3550b73c2ad2c351b8c04ec5cc449&profile_id=165&oauth2_token_id=57447761"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#080808_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/80 via-transparent to-[#080808]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-grow flex items-center max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-24 pb-8 w-full">
        <div className={`max-w-4xl text-left transition-all duration-[1.5s] transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>

          <h1 className="text-7xl sm:text-9xl md:text-[10rem] lg:text-[11rem] text-white mb-3 font-display-cinematic leading-none tracking-wider uppercase select-none">
            {name}
          </h1>

          <div className="flex flex-wrap gap-x-4 md:gap-x-6 text-neutral-400 text-xs md:text-sm tracking-[0.25em] uppercase font-mono mb-4 select-text">
            {roles.map((r, i) => (
              <span key={i} className="flex items-center gap-x-4 md:gap-x-6">
                <span>{r}</span>
                {i < roles.length - 1 && <span className="text-neutral-700 select-none">•</span>}
              </span>
            ))}
          </div>

          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-neutral-500 font-body-cinematic font-light max-w-2xl">
            I'm here to make something that people remembers.
          </p>

          {/* Combined Actions & Sound Console Bar (Proper arrangement, no layout voids) */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 border-t border-white/[0.03] pt-6 mt-6 w-full">
            
            {/* Left: Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 font-mono text-[9px] uppercase tracking-widest">
              <button
                onClick={() => scrollToSection('#projects')}
                className="group px-8 py-4 bg-white hover:bg-neutral-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.18)] text-black font-bold rounded-sm transition-all duration-500 flex items-center justify-center gap-2.5 interactive-item"
              >
                <span>View Filmography</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={() => scrollToSection('#contact')}
                className="group px-8 py-4 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-white font-medium rounded-sm transition-all duration-500 flex items-center justify-center gap-2 interactive-item"
              >
                Contact Me
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="hidden lg:block w-px h-8 bg-white/[0.08]" />

            {/* Right: High-Visibility Sound Bezel Controls */}
            <div className="glass-card border border-white/10 bg-neutral-900/40 backdrop-blur-md px-4 py-3 rounded-sm flex flex-col sm:flex-row sm:items-center gap-3.5 font-mono text-[9px] uppercase tracking-widest hover:border-white/20 transition-all duration-300">
              
              <div className="flex items-center gap-2 select-none">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${audioOn ? 'bg-emerald-400' : 'bg-neutral-600'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${audioOn ? 'bg-emerald-500' : 'bg-neutral-700'}`}></span>
                </span>
                <span className="text-neutral-450">Ambient Sound:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Master on/off */}
                <button
                  onClick={handleToggleAudio}
                  title={audioOn ? 'Mute all' : 'Enable sound'}
                  className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
                    audioOn
                      ? 'border-emerald-500/30 text-emerald-450 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.12)]'
                      : 'border-white/10 text-neutral-500 hover:text-neutral-300 hover:border-white/20 hover:bg-white/[0.01]'
                  }`}
                >
                  {audioOn ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3" />}
                  {audioOn ? 'On' : 'Off'}
                </button>

                <div className="w-px h-4 bg-white/[0.08]" />

                {/* Projector hum */}
                <button
                  onClick={() => setWantHum(!wantHum)}
                  disabled={!audioOn}
                  title="Toggle projector hum"
                  className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none ${
                    wantHum && audioOn
                      ? 'border-amber-500/30 text-amber-450 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                      : 'border-white/10 text-neutral-500 hover:text-neutral-300 hover:border-white/20 hover:bg-white/[0.01]'
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full ${wantHum && audioOn ? 'bg-amber-450 animate-pulse' : 'bg-transparent'}`} />
                  📽 Projector
                </button>

                {/* Rain */}
                <button
                  onClick={() => setWantRain(!wantRain)}
                  disabled={!audioOn}
                  title="Toggle rain ambience"
                  className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none ${
                    wantRain && audioOn
                      ? 'border-blue-500/30 text-blue-450 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.12)]'
                      : 'border-white/10 text-neutral-500 hover:text-neutral-300 hover:border-white/20 hover:bg-white/[0.01]'
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full ${wantRain && audioOn ? 'bg-blue-400 animate-pulse' : 'bg-transparent'}`} />
                  🌧 Rain
                </button>

                {/* Music (Crimson Red active state) */}
                <button
                  onClick={toggleMusic}
                  disabled={!audioOn}
                  title="Toggle inspirational lofi music"
                  className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none ${
                    wantMusic && audioOn
                      ? 'border-red-500/30 text-red-450 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                      : 'border-white/10 text-neutral-500 hover:text-neutral-300 hover:border-white/20 hover:bg-white/[0.01]'
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full ${wantMusic && audioOn ? 'bg-red-400 animate-pulse' : 'bg-transparent'}`} />
                  🎵 Music
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Down arrow scroll helper */}
      <div className="relative z-10 w-full flex justify-center pb-12">
        <button
          onClick={() => scrollToSection('#about')}
          className="text-neutral-500 hover:text-white transition-colors duration-300 flex flex-col items-center gap-2 group interactive-item text-[8px] uppercase tracking-widest font-mono"
        >
          Scroll to explore
          <ArrowDown className="w-4 h-4 text-neutral-500 group-hover:translate-y-1 transition-transform duration-300" />
        </button>
      </div>
    </section>
  );
}
