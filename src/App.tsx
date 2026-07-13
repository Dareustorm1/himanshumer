import { useState, useEffect } from 'react';
import Loader from './components/Loader';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CaseFile from './components/CaseFile';
import Journey from './components/Journey';
import Filmography from './components/Filmography';
import Modes from './components/Modes';
import InsideHead from './components/InsideHead';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import RainEffect from './components/RainEffect';
import PopCultureEffects from './components/PopCultureEffects';
import FirebaseDebugPanel from './components/FirebaseDebugPanel';
import { AudioProvider } from './context/AudioContext';

function App() {
  const [isLoading, setIsLoading] = useState(() => {
    const localVal = localStorage.getItem('himanshumer_projector_completed');
    if (localVal === 'true') return false;
    const match = document.cookie.match(/(^|;)\s*himanshumer_projector_completed\s*=\s*([^;]+)/);
    return !(match && match[2] === 'true');
  });
  
  // Easter egg states
  const [detectiveMode, setDetectiveMode] = useState(false);
  const [gearFifth, setGearFifth] = useState(false);
  const [greatPower, setGreatPower] = useState(false);
  const [showBts, setShowBts] = useState(false);
  const [is404, setIs404] = useState(false);

  // Force scroll and navigation to home/hero page on reload/refresh
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    if (window.location.hash !== '' && window.location.hash !== '#home') {
      window.location.hash = '#home';
    }
  }, []);

  // Scroll active chapter accent tracker (Origin: Gold, Journey: Ocean Blue, Filmography: Crimson, Craft: Emerald, Ending: Silver)
  useEffect(() => {
    let ticked = false;
    const chapters = [
      { id: 'home', accent: '#D4AF37' },       // Gold (Origin)
      { id: 'about', accent: '#D4AF37' },      // Gold (Origin)
      { id: 'journey', accent: '#2E8BC0' },    // Ocean Blue (Journey)
      { id: 'projects', accent: '#C62828' },   // Crimson (Filmography)
      { id: 'skills', accent: '#35D07F' },     // Emerald Green (Craft)
      { id: 'inside-head', accent: '#D4AF37' } // Gold for creative DNA
    ];

    const handleScroll = () => {
      if (!ticked) {
        requestAnimationFrame(() => {
          let minDistance = Infinity;
          let currentAccent = '#D4AF37';

          chapters.forEach((ch) => {
            const el = document.getElementById(ch.id);
            if (el) {
              const rect = el.getBoundingClientRect();
              const distance = Math.abs(rect.top - 120); // offset padding threshold
              if (distance < minDistance) {
                minDistance = distance;
                currentAccent = ch.accent;
              }
            }
          });

          document.documentElement.style.setProperty('--theme-accent', currentAccent);
          ticked = false;
        });
        ticked = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Spotlight mouse listener mapping relative bounds coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const parentCard = target.closest('.glass-card') as HTMLElement;
      if (parentCard) {
        const rect = parentCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        parentCard.style.setProperty('--mouse-x', `${x}px`);
        parentCard.style.setProperty('--mouse-y', `${y}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard typing sequences listener
  useEffect(() => {
    let buffer = '';
    let konamiIndex = 0;
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Text triggers
      if (e.key.length === 1) {
        buffer = (buffer + e.key.toLowerCase()).slice(-30);
        
        if (buffer.endsWith("im batman") || buffer.endsWith("i'm batman")) {
          setDetectiveMode((prev) => !prev);
          buffer = '';
        }
        if (buffer.endsWith("gear fifth")) {
          setGearFifth((prev) => !prev);
          buffer = '';
        }
        if (buffer.endsWith("with great power")) {
          setGreatPower(true);
          setTimeout(() => setGreatPower(false), 5000);
          buffer = '';
        }
      }

      // 2. Konami Code trigger
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          setShowBts(true);
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle URL hash changes for simulated 404 pages
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#404') {
        setIs404(true);
      } else {
        setIs404(false);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Simulated 404 Screen ("CUT! Looks like this scene wasn't in the final edit. Back to Production")
  if (is404) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center p-6 text-center select-none font-mono relative">
        <div className="film-grain"></div>
        <div className="space-y-6 max-w-md z-10">
          <h1 className="text-8xl font-serif-cinematic font-bold text-[var(--theme-accent,#ffffff)] animate-pulse transition-colors duration-500">
            CUT!
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed uppercase tracking-[0.25em]">
            Looks like this scene wasn't in the final edit. <br />
            Roll camera again.
          </p>
          <button
            onClick={() => {
              setIs404(false);
              window.location.hash = '';
            }}
            className="px-8 py-3 bg-white hover:bg-neutral-200 text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-sm transition-all duration-500 interactive-item"
          >
            Back to Production
          </button>
        </div>
      </div>
    );
  }

  return (
    <AudioProvider>
      {isLoading && <Loader onComplete={() => {
        localStorage.setItem('himanshumer_projector_completed', 'true');
        const expiry = new Date();
        expiry.setTime(expiry.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `himanshumer_projector_completed=true; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
        setIsLoading(false);
      }} />}

      <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden font-sans relative selection:bg-white/10 selection:text-white">
        {/* Animated Film Grain Overlay */}
        <div className="film-grain"></div>

        {/* Gotham Rain Simulator backdrop */}
        <RainEffect />

        {/* Dynamic Interactive Easter Eggs overlay manager */}
        <PopCultureEffects
          detectiveMode={detectiveMode}
          gearFifth={gearFifth}
          greatPower={greatPower}
          showBts={showBts}
          onCloseBts={() => setShowBts(false)}
        />

        {/* Cinematic Custom Cursor */}
        <CustomCursor />

        {/* Global sticky translucent navigation */}
        <Navbar />
        
        <main className={`transition-all duration-1000 lg:pl-[200px] pt-16 lg:pt-0 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {/* Chapter 0: Hero Scene */}
          <Hero />
          
          {/* Chapter 1: The Origin dossier */}
          <CaseFile />
          
          {/* Chapter 2: The Journey timeline */}
          <Journey />
          
          {/* Chapter 3: Filmography */}
          <Filmography />
          
          {/* Chapter 4: The Craft */}
          <Modes />

          {/* Chapter 5: Inside My Head */}
          <InsideHead />

          {/* Chapter 6: Contact Form Inquiry */}
          <ContactSection />
        </main>

        {/* Ending: Roll Credits */}
        <Footer />

        {/* Hidden Diagnostics Panel — dev only */}
        {import.meta.env.DEV && <FirebaseDebugPanel />}
      </div>
    </AudioProvider>
  );
}

export default App;
