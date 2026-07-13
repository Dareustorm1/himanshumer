import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, Instagram, Linkedin, FileText, ArrowRight, Check } from 'lucide-react';

export default function ContactSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    if (honeypot) {
      // Bot detected - silently ignore
      setIsSent(true);
      setName('');
      setEmail('');
      setMessage('');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch("https://formsubmit.co/ajax/himanshumer296@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          _subject: `New Message from Portfolio: ${name}`,
          _captcha: "false" // Disable captcha verification so AJAX doesn't block
        })
      });

      // FormSubmit returns response.ok on success
      if (response.ok) {
        setIsSent(true);
        setName('');
        setEmail('');
        setMessage('');
        setTimeout(() => setIsSent(false), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMsg(errorData.message || "Transmission failed. FormSubmit backend returned an error. Please verify your FormSubmit account activation.");
      }
    } catch (err: any) {
      setErrorMsg("Network error. Please check your internet connection or email directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadResume = () => {
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Himanshu_Mer_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-16 md:py-20 bg-[#080808]"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 text-left">
        
        {/* Section Header */}
        <div className={`mb-12 md:mb-16 text-left transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <span className="text-neutral-500 text-xs uppercase tracking-[0.3em] font-semibold mb-3 block font-mono">
            07 // INQUIRY
          </span>
          <h2 className="text-5xl md:text-7xl text-white font-display-cinematic tracking-wider">
            CONTACT ME
          </h2>
          <div className="w-16 h-px bg-[#D8D8D8] mt-4"></div>
        </div>

        {/* Projector Sentence Banner */}
        <div className="mb-12 text-center w-full">
          <h3 className="text-xl sm:text-2xl font-light text-neutral-400 font-serif-cinematic italic">
            "Every great story starts with a conversation."
          </h3>
        </div>

        {/* Glass Contact Panel */}
        <div className={`glass-card rounded-md p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto transition-all duration-1000 delay-200 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          
          {/* Left: Message Box */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-1.5">
              <span className="text-[8px] uppercase tracking-widest text-[#D8D8D8] font-mono font-medium block">
                DIRECT INPUT // TRANSMITTER
              </span>
              <h3 className="text-xl font-light text-white font-serif-cinematic">
                Let's make the next story together.
              </h3>
            </div>

            {isSent ? (
              <div className="p-6 border border-[#35D07F]/20 bg-[#35D07F]/5 rounded-sm flex flex-col items-center justify-center text-center space-y-3 animate-[fadeIn_0.5s_ease_forwards]">
                <div className="w-10 h-10 rounded-full bg-[#35D07F]/10 flex items-center justify-center text-[#35D07F]">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">Transmission Sent</h4>
                <p className="text-[10px] text-neutral-400 font-light">
                  Your inquiry message was compiled and sent to the director.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs text-neutral-350">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-500 block">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent border-b border-white/10 focus:border-white py-2 outline-none text-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-500 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-transparent border-b border-white/10 focus:border-white py-2 outline-none text-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-500 block">Your Message</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your scene or inquiry details..."
                    className="w-full bg-transparent border-b border-white/10 focus:border-white py-2 outline-none text-white resize-none transition-colors"
                  ></textarea>
                </div>

                {/* Honeypot field for bot detection */}
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  style={{ display: 'none' }}
                  autoComplete="off"
                />

                {errorMsg && (
                  <div className="p-3.5 border border-[#C62828]/20 bg-[#C62828]/5 rounded text-[#C62828] text-[10px] font-mono leading-relaxed">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black font-semibold text-[10px] uppercase tracking-[0.2em] rounded-sm transition-all duration-300 flex items-center justify-center gap-2 interactive-item disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Transmitting...' : 'Send Message'}</span>
                  <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                </button>
              </form>
            )}
          </div>

          {/* Right: Social Credits */}
          <div className="lg:col-span-6 space-y-4 font-mono text-xs uppercase tracking-widest self-end">
            <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-mono font-medium block mb-2">
              Dossier Coordinates:
            </span>

            {/* Email */}
            <a
              href="mailto:himanshumer296@gmail.com"
              className="flex items-center justify-between p-3.5 border border-white/5 bg-black/20 hover:border-[#D8D8D8]/20 rounded transition-all duration-300 group interactive-item"
            >
              <span className="flex items-center gap-3 text-neutral-500 group-hover:text-white">
                <Mail className="w-4 h-4 text-neutral-600" />
                Email
              </span>
              <span className="text-white text-[10px] lowercase tracking-normal">himanshumer296@gmail.com</span>
            </a>

            {/* Phone */}
            <a
              href="tel:+919016146464"
              className="flex items-center justify-between p-3.5 border border-white/5 bg-black/20 hover:border-[#D8D8D8]/20 rounded transition-all duration-300 group interactive-item"
            >
              <span className="flex items-center gap-3 text-neutral-500 group-hover:text-white">
                <Phone className="w-4 h-4 text-neutral-600" />
                Phone
              </span>
              <span className="text-white text-[10px]">+91 90161 46464</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/himanshumer1"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 border border-white/5 bg-black/20 hover:border-[#D8D8D8]/20 rounded transition-all duration-300 group interactive-item"
            >
              <span className="flex items-center gap-3 text-neutral-500 group-hover:text-white">
                <Instagram className="w-4 h-4 text-neutral-600" />
                Instagram
              </span>
              <span className="text-white text-[10px] lowercase">@himanshumer1</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/himanshu-mer/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 border border-white/5 bg-black/20 hover:border-[#D8D8D8]/20 rounded transition-all duration-300 group interactive-item"
            >
              <span className="flex items-center gap-3 text-neutral-500 group-hover:text-white">
                <Linkedin className="w-4 h-4 text-neutral-600" />
                LinkedIn
              </span>
              <span className="text-white text-[10px]">Himanshu Mer</span>
            </a>

            {/* Press Kit resume */}
            <button
              onClick={handleDownloadResume}
              className="w-full flex items-center justify-between p-3.5 border border-white/5 bg-black/20 hover:border-[#D8D8D8]/20 rounded transition-all duration-300 group interactive-item text-left"
            >
              <span className="flex items-center gap-3 text-neutral-500 group-hover:text-white">
                <FileText className="w-4 h-4 text-neutral-600" />
                Resume Document
              </span>
              <span className="text-[#D8D8D8] text-[9px]">Download PDF</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
