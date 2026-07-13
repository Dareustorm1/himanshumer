import { useEffect, useState, useRef } from 'react';
import { Film } from 'lucide-react';

interface LinkItem {
  name: string;
  href: string;
}

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [scrollUp, setScrollUp] = useState(true);
  const lastScrollYRef = useRef(0);

  const navLinks: LinkItem[] = [
    { name: 'Home', href: '#home' },
    { name: 'Case File', href: '#about' },
    { name: 'The Journey', href: '#journey' },
    { name: 'Filmography', href: '#projects' },
    { name: 'The Craft', href: '#skills' },
    { name: 'Inside My Head', href: '#inside-head' },
    { name: 'Contact Me', href: '#contact' },
    { name: 'Roll Credits', href: '#footer' }
  ];

  // Track active scroll section
  useEffect(() => {
    let ticked = false;

    const handleScroll = () => {
      if (!ticked) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const lastScrollY = lastScrollYRef.current;
          
          // Toggle nav visibility on mobile scroll
          if (currentScrollY > lastScrollY && currentScrollY > 150) {
            setScrollUp(false);
          } else {
            setScrollUp(true);
          }
          lastScrollYRef.current = currentScrollY;

          // Section tracker
          let currentActive = 'home';
          const middleOfScreen = window.innerHeight / 2;

          for (const link of navLinks) {
            const id = link.href.substring(1);
            const el = document.getElementById(id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= middleOfScreen && rect.bottom >= middleOfScreen) {
                currentActive = id;
                break;
              }
            }
          }

          // Fix glitch in roll credits section at bottom of page
          const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
          if (isAtBottom) {
            setActiveSection('footer');
          } else {
            setActiveSection(currentActive);
          }
          
          ticked = false;
        });
        ticked = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.substring(1);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Center active nav link in mobile view
  useEffect(() => {
    const activeEl = document.querySelector('.mobile-nav-active');
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeSection]);

  return (
    <>
      {/* 1. Desktop Layout: Fixed Vertical Film Strip (Left Side) */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-[49] hidden lg:flex flex-col bg-[#121212] border border-white/5 py-8 px-4 rounded w-36 shadow-2xl select-none font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        
        {/* Left sprocket hole column */}
        <div className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 border border-white/50 rounded-sm"></div>
          ))}
        </div>

        {/* Right sprocket hole column */}
        <div className="absolute right-1.5 top-0 bottom-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 border border-white/50 rounded-sm"></div>
          ))}
        </div>

        {/* Brand label */}
        <div className="flex flex-col items-center gap-1 mb-8 border-b border-white/[0.04] pb-4 px-2 text-center text-white font-display-cinematic tracking-wider">
          <Film className="w-4 h-4 text-neutral-500" />
          <span className="text-[10px] mt-1">CINE // MER</span>
        </div>

        {/* Navigation list */}
        <div className="flex flex-col gap-2 relative z-10">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`py-2 px-1 text-center rounded transition-all duration-350 flex items-center justify-center interactive-item font-body-cinematic font-semibold text-[8px] ${
                  isActive
                    ? 'border border-[var(--theme-accent,#D4AF37)] bg-white/[0.03] text-white'
                    : 'border border-transparent hover:border-white/5 text-neutral-500 hover:text-neutral-355'
                }`}
                style={{
                  borderColor: isActive ? 'var(--theme-accent)' : undefined
                }}
              >
                {link.name}
              </a>
            );
          })}
        </div>
      </nav>

      {/* 2. Mobile Layout: Horizontal Sticky Film Strip (Top Bar) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-white/5 py-1 transition-transform duration-355 lg:hidden shadow-md ${
          scrollUp ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Top sprockets */}
        <div className="absolute top-0.5 left-0 right-0 flex justify-between px-4 pointer-events-none opacity-20">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1 border border-white/50 rounded-sm"></div>
          ))}
        </div>

        {/* Bottom sprockets */}
        <div className="absolute bottom-0.5 left-0 right-0 flex justify-between px-4 pointer-events-none opacity-20">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1 border border-white/50 rounded-sm"></div>
          ))}
        </div>

        {/* Links horizontal bar */}
        <div 
          className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none font-mono text-[8.5px] uppercase tracking-wider text-neutral-400 font-body-cinematic font-semibold select-none [webkit-overflow-scrolling:touch]"
          style={{ 
            paddingLeft: 'calc(1.25rem + env(safe-area-inset-left))', 
            paddingRight: 'calc(1.25rem + env(safe-area-inset-right))' 
          }}
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`flex items-center justify-center min-h-[44px] px-3 shrink-0 rounded transition-all duration-300 whitespace-nowrap select-none ${
                  isActive
                    ? 'mobile-nav-active bg-white/[0.04] text-white border border-[var(--theme-accent,#D4AF37)]'
                    : 'border border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
                style={{
                  borderColor: isActive ? 'var(--theme-accent)' : undefined
                }}
              >
                {link.name}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
