import { useEffect, useRef, useState } from 'react';
import { Download, FileText, Mail, Instagram, Linkedin, MessageSquare, ArrowRight, Camera } from 'lucide-react';

export default function PressKit() {
  const [isVisible, setIsVisible] = useState(false);
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

  const handleDownloadFile = (type: 'resume' | 'cv' | 'headshot') => {
    if (type === 'resume') {
      const link = document.createElement('a');
      link.href = '/resume.pdf';
      link.download = 'Himanshu_Mer_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    if (type === 'cv') {
      content = `HIMANSHU MER - CV\nVisual Storyteller\nPortfolio: http://localhost:5173`;
      filename = 'Himanshu_Mer_CV.txt';
    } else {
      content = `MOCK HEADSHOT DATA`;
      filename = 'Himanshu_Mer_Headshot.jpg';
      mimeType = 'image/jpeg';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const contactLinks = [
    { name: 'Email', icon: Mail, href: 'mailto:himanshumer296@gmail.com', label: 'himanshumer296@gmail.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/himanshumer1', label: '@himanshumer1' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/himanshu-mer/', label: 'Himanshu Mer' },
    { name: 'WhatsApp', icon: MessageSquare, href: 'https://wa.me/919016146464', label: '+91 90161 46464' }
  ];

  return (
    <section
      id="presskit"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-[#0B0B0B]"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 text-left">
        
        {/* Section Header */}
        <div className={`mb-16 md:mb-24 text-left transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <span className="text-neutral-500 text-xs uppercase tracking-[0.3em] font-semibold mb-3 block font-mono">
            06 // DOWNLOADS
          </span>
          <h2 className="text-5xl md:text-7xl text-white font-display-cinematic tracking-wider">
            PRESS KIT
          </h2>
          <div className="w-16 h-px bg-[#D8D8D8] mt-4"></div>
        </div>

        {/* Layout Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-start transition-all duration-1000 delay-200 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          
          {/* Left panel: Actions & contacts */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded p-8 space-y-6">
              <h3 className="text-xl font-light font-serif-cinematic text-white border-b border-white/[0.04] pb-4">
                Dossier Kit Files
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleDownloadFile('resume')}
                  className="w-full px-6 py-3.5 bg-white hover:bg-neutral-200 text-black font-semibold text-[10px] uppercase tracking-[0.2em] rounded-sm transition-all duration-300 flex items-center justify-center gap-2 interactive-item"
                >
                  <Download className="w-4 h-4" />
                  Download Resume
                </button>
                <button
                  onClick={() => handleDownloadFile('cv')}
                  className="w-full px-6 py-3.5 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-medium rounded-sm transition-all duration-300 flex items-center justify-center gap-2 interactive-item"
                >
                  <FileText className="w-4 h-4 text-neutral-500" />
                  Download CV Folder
                </button>
                <button
                  onClick={() => handleDownloadFile('headshot')}
                  className="w-full px-6 py-3.5 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-medium rounded-sm transition-all duration-300 flex items-center justify-center gap-2 interactive-item"
                >
                  <Camera className="w-4 h-4 text-neutral-500" />
                  Download Headshot (JPG)
                </button>
              </div>
            </div>

            {/* Direct Contact Handles */}
            <div className="space-y-3">
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono font-medium block">
                Direct Communications:
              </span>
              {contactLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 border border-white/5 bg-neutral-950/30 hover:bg-white/5 hover:border-white/15 rounded transition-all duration-300 group interactive-item"
                >
                  <span className="flex items-center gap-3 text-neutral-400 group-hover:text-white font-mono text-xs transition-colors">
                    <link.icon className="w-4 h-4 text-neutral-500" />
                    {link.name}
                  </span>
                  <span className="text-neutral-500 group-hover:text-neutral-300 font-mono text-[9px] transition-colors flex items-center gap-1.5">
                    {link.label}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Right panel: Printable preview sheet */}
          <div className="lg:col-span-7">
            <div className="w-full bg-[#0E0E0E] border border-white/5 shadow-2xl p-8 md:p-12 relative rounded">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/[0.04] pb-6 mb-8 gap-4 font-mono">
                <div>
                  <h3 className="text-2xl font-light text-white font-serif-cinematic">
                    Himanshu Mer
                  </h3>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 mt-1">
                    Filmmaker & Editor // Visual Storyteller
                  </p>
                </div>
                <div className="text-[9px] text-neutral-500 space-y-1">
                  <div>EMAIL: himanshumer296@gmail.com</div>
                  <div>PHONE: +91-9016146464</div>
                  <div>LOC: Bhavnagar, Gujarat</div>
                </div>
              </div>

              {/* Dossier contents */}
              <div className="space-y-6 text-neutral-400 font-light text-xs leading-relaxed">
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-widest text-white font-semibold font-mono">Summary Log</h4>
                  <p>
                    Creative filmmaker and editor passionate about visual storytelling. Directs, edits, color grades, and designs emotional visual assets across commercials, documentaries, and narrative cuts.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-widest text-white font-semibold font-mono">Experience Journey</h4>
                  <div className="space-y-3 font-sans text-xs">
                    <div className="border-l border-white/10 pl-4">
                      <div className="font-semibold text-white font-serif-cinematic text-sm">Editing Head</div>
                      <div className="text-neutral-500 text-[9px] uppercase tracking-wider font-mono">Embro Media Productions // Nov 2024 - Present</div>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <div className="font-semibold text-white font-serif-cinematic text-sm">Digital Marketing Intern</div>
                      <div className="text-neutral-500 text-[9px] uppercase tracking-wider font-mono">Memighty // Internship</div>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <div className="font-semibold text-white font-serif-cinematic text-sm">Full Stack Developer</div>
                      <div className="text-neutral-500 text-[9px] uppercase tracking-wider font-mono">HP Param // Internship</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
