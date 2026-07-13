import { useEffect, useRef, useState } from 'react';
import { Film } from 'lucide-react';

export default function Footer() {
  const [creditsPhase, setCreditsPhase] = useState<'idle' | 'rolling' | 'fadeToBlack' | 'done'>('idle');
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && creditsPhase === 'idle') {
          setCreditsPhase('rolling');
        }
      },
      { threshold: 0.15 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, [creditsPhase]);

  useEffect(() => {
    if (creditsPhase === 'rolling') {
      const timer = setTimeout(() => {
        setCreditsPhase('fadeToBlack');
      }, 4500); // 4.5s rolling crawl
      return () => clearTimeout(timer);
    }

    if (creditsPhase === 'fadeToBlack') {
      const timer = setTimeout(() => {
        setCreditsPhase('done');
      }, 1000); // 1s fade to black
      return () => clearTimeout(timer);
    }
  }, [creditsPhase]);

  return (
    <footer
      ref={footerRef}
      className="relative bg-black min-h-[90vh] flex items-center justify-center overflow-hidden border-t border-white/[0.02] lg:pl-[200px]"
    >
      {/* Projector flickering light flare */}
      {creditsPhase === 'rolling' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_80%)] animate-pulse pointer-events-none z-0"></div>
      )}

      {/* 1. Rolling Credits Crawl */}
      {creditsPhase === 'rolling' && (
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center select-none space-y-12 animate-[fadeInUp_1.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <div className="flex justify-center mb-4">
            <Film className="w-6 h-6 text-neutral-700 animate-spin-slow" />
          </div>

          <div className="space-y-8 font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-500">
            <div>
              <div className="text-neutral-700 mb-1 text-[8px]">Directed By</div>
              <div className="text-white text-base font-display-cinematic tracking-widest font-normal">Himanshu Mer</div>
            </div>
            <div>
              <div className="text-neutral-700 mb-1 text-[8px]">Edited By</div>
              <div className="text-white text-base font-display-cinematic tracking-widest font-normal">Himanshu Mer</div>
            </div>
            <div>
              <div className="text-neutral-700 mb-1 text-[8px]">Written By</div>
              <div className="text-white text-base font-display-cinematic tracking-widest font-normal">Himanshu Mer</div>
            </div>
            <div>
              <div className="text-neutral-700 mb-1 text-[8px]">Color By</div>
              <div className="text-white text-base font-display-cinematic tracking-widest font-normal">Himanshu Mer</div>
            </div>
            <div>
              <div className="text-neutral-700 mb-1 text-[8px]">Story By</div>
              <div className="text-white text-base font-display-cinematic tracking-widest font-normal">Life</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Fade to Black Card */}
      {creditsPhase === 'fadeToBlack' && (
        <div className="absolute inset-0 bg-[#080808] z-40 transition-opacity duration-1000 flex items-center justify-center lg:pl-[200px]">
          <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-800 animate-pulse">
            SHUTTER DEFLATED
          </span>
        </div>
      )}

      {/* 3. Done Phase: To Be Continued slide */}
      {creditsPhase === 'done' && (
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-4 font-mono select-none animate-[fadeIn_1s_ease_forwards]">
          <h4 className="text-xl sm:text-2xl tracking-[0.4em] text-[#D8D8D8]">
            TO BE CONTINUED...
          </h4>
          <p className="text-[10px] tracking-widest text-neutral-500 mt-2">
            Let's make the next story together.
          </p>
        </div>
      )}

      {/* Frame specifications details */}
      <div className="absolute bottom-6 left-6 lg:left-[224px] right-6 flex justify-between text-[8px] font-mono text-neutral-800 tracking-widest uppercase pointer-events-none select-none">
        <span>FPS: 24.00</span>
        <span>SOUND: DOLBY CINE</span>
        <span>© {new Date().getFullYear()} HIMANSHU MER</span>
      </div>
    </footer>
  );
}
