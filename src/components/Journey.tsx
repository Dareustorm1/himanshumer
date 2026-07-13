import { useEffect, useRef, useState } from 'react';

interface Chapter {
  id: string;
  year: string;
  chapter: string;
  title: string;
  body: string[];
  note: string;
  accent: string;
  accentBg: string;
  accentText: string;
  details: string[];
  polaroid?: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'ch-2022',
    year: '2022',
    chapter: 'Chapter One',
    title: 'THE BEGINNING',
    body: [
      'Started my B.Tech in Information Technology at Birla Vishvakarma Mahavidyalaya.',
      'Like many engineering students, I entered college expecting technology to shape my future.',
      'But filmmaking quietly followed me everywhere.',
      'Whenever I had free time, I wasn\'t watching random videos. I was watching breakdowns. Movie edits. Behind-the-scenes. Trailers. Creators.',
      'I didn\'t own editing software. I didn\'t own equipment.',
      'I only had curiosity.',
    ],
    note: 'I still didn\'t know this would become my career.',
    accent: '#3B82F6',
    accentBg: 'rgba(59,130,246,0.06)',
    accentText: '#93C5FD',
    details: ['BVM Engineering', 'Hostel Life', 'Curiosity', 'No Software Yet'],
    polaroid: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'ch-2023',
    year: '2023',
    chapter: 'Chapter Two',
    title: 'THE FIRST TIMELINE',
    body: [
      'Everything changed this year.',
      'I bought my first proper editing laptop. Lenovo Legion 5.',
      'For most people, it was just another laptop.',
      'For me, it was permission to finally begin.',
      'I installed DaVinci Resolve. Created my first timeline. Watched tutorials almost every day.',
      'Spent nights experimenting. Deleted projects. Started again.',
      'Learned keyboard shortcuts. Learned pacing. Learned rhythm.',
      'No one saw those edits.',
      'But they mattered.',
      'Because this was the year I truly started learning editing.',
    ],
    note: 'My first timeline.',
    accent: '#F97316',
    accentBg: 'rgba(249,115,22,0.06)',
    accentText: '#FCA572',
    details: ['Lenovo Legion 5', 'DaVinci Resolve', 'First Timeline', 'Late Nights'],
    polaroid: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'ch-2024',
    year: '2024',
    chapter: 'Chapter Three',
    title: 'LOOKING THROUGH THE LENS',
    body: [
      'Second year of college. Joined the Photography Team.',
      'For the first time, I wasn\'t just editing shots.',
      'I was creating them.',
      'I held a camera with purpose. I learnt photography. Composition. Lighting. Framing. Cinematography.',
      'I realised editing actually begins long before post-production.',
      'It begins on set.',
      'Worked on multiple college productions. Learnt by making mistakes. Learnt by observing. Learnt by doing.',
    ],
    note: 'A camera taught me to see differently.',
    accent: '#D97706',
    accentBg: 'rgba(217,119,6,0.06)',
    accentText: '#FCD34D',
    details: ['Photography Team', 'College Shoots', 'Composition', 'BTS'],
    polaroid: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'ch-2025',
    year: '2025',
    chapter: 'Chapter Four',
    title: 'WHEN PASSION BECAME WORK',
    body: [
      'Third year. Everything accelerated.',
      'I stopped waiting for opportunities. I started creating them.',
      'Experimented with building a digital marketing agency. Worked with a production startup. Started freelancing.',
      'Edited music videos. Worked on documentaries. Created commercial advertisements.',
      'Edited restaurant content. Worked with YouTube creators. Created reels. Worked on college short films.',
      'Participated in cultural festivals. Collaborated with friends.',
      'Spent countless nights editing. Sometimes sleeping beside the timeline.',
      'Made mistakes. Missed deadlines. Solved problems. Learnt faster than ever before.',
      'This was the year filmmaking stopped feeling like a hobby.',
      'It became the career I wanted to chase.',
    ],
    note: 'Say yes first. Figure it out later.',
    accent: '#C62828',
    accentBg: 'rgba(198,40,40,0.06)',
    accentText: '#EF9A9A',
    details: ['Freelancing', 'Music Videos', 'Documentaries', 'Commercials', 'Short Films', 'Many Late Nights'],
    polaroid: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'ch-2026',
    year: '2026',
    chapter: 'Chapter Five',
    title: 'THE NEXT CHAPTER',
    body: [
      'Graduated with a B.Tech in Information Technology.',
      'Engineering taught me how to solve problems.',
      'Filmmaking taught me why I wanted to solve them.',
      'Continued editing for creators.',
      'Edited multiple short films. Collaborated on narrative projects.',
      'Labuk Jabuk became one of the proudest milestones of my journey — receiving selections at multiple film festivals.',
      'For the first time, the dream started feeling real.',
      'But I know this isn\'t the destination.',
      'It\'s simply another chapter.',
    ],
    note: 'Still learning.',
    accent: '#10B981',
    accentBg: 'rgba(16,185,129,0.06)',
    accentText: '#6EE7B7',
    details: ['Graduation', 'Hunf Productions', 'Festival Laurels', 'Labuk Jabuk', 'New Collaborations'],
    polaroid: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=compress&cs=tinysrgb&w=600',
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function ChapterBlock({ chapter, index }: { chapter: Chapter; index: number }) {
  const { ref, inView } = useInView(0.08);
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-1000 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {/* Year strip */}
      <div
        className="relative py-10 md:py-14 px-6 md:px-14 rounded-none border-l-2 border-b border-b-white/[0.03] mb-0"
        style={{ borderLeftColor: chapter.accent, backgroundColor: chapter.accentBg }}
      >

        {/* Chapter label + year */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span
              className="block text-[9px] font-mono uppercase tracking-[0.35em] mb-2 font-semibold"
              style={{ color: chapter.accentText }}
            >
              {chapter.chapter}
            </span>
            <div className="flex items-baseline gap-5">
              <span
                className="text-7xl md:text-9xl font-display-cinematic font-bold leading-none select-none"
                style={{ color: chapter.accent, opacity: 0.18 }}
              >
                {chapter.year}
              </span>
              <h3 className="text-xl md:text-3xl font-light text-white font-serif-cinematic tracking-wide leading-snug">
                {chapter.title}
              </h3>
            </div>
          </div>

          {/* Detail tags */}
          <div className="flex flex-wrap gap-1.5 max-w-xs md:justify-end">
            {chapter.details.map((d, i) => (
              <span
                key={i}
                className="text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm border"
                style={{ borderColor: `${chapter.accent}30`, color: chapter.accentText, background: `${chapter.accent}08` }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Two-col layout: body + polaroid */}
        <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-start`}>

          {/* Body text */}
          <div className="flex-1 space-y-3">
            {chapter.body.map((line, i) => {
              const isShort = line.length < 50;
              return (
                <p
                  key={i}
                  className={`leading-relaxed font-light transition-all ${
                    isShort
                      ? 'text-sm text-white/90 font-medium'
                      : 'text-xs text-neutral-350'
                  }`}
                  style={{ transitionDelay: `${(index * 60) + (i * 40)}ms` }}
                >
                  {line}
                </p>
              );
            })}
          </div>

          {/* Polaroid */}
          {chapter.polaroid && (
            <div className="w-full max-w-[280px] mx-auto md:mx-0 md:w-48 lg:w-56 shrink-0">
              <div
                className="relative bg-white p-3 pb-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] rotate-1 hover:rotate-0 transition-transform duration-500 select-none"
                style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)` }}
              >
                <img
                  src={chapter.polaroid}
                  alt={chapter.title}
                  className="w-full aspect-[4/3] object-cover filter grayscale contrast-110"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=compress&cs=tinysrgb&w=300&q=70';
                  }}
                />
                <p className="text-center mt-3 text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                  {chapter.year}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Handwritten sticky note */}
        <div className="mt-8 flex">
          <div
            className="relative px-4 py-3 max-w-xs text-xs italic font-serif-cinematic text-neutral-800 leading-snug shadow-md rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300"
            style={{
              background: 'linear-gradient(135deg, #f5f0d0 0%, #ede6b5 100%)',
              boxShadow: '2px 3px 10px rgba(0,0,0,0.35)',
            }}
          >
            <div className="absolute -top-2 left-5 w-8 h-3 bg-white/25 shadow-sm rotate-[1deg]" />
            <span className="text-[8px] font-mono uppercase tracking-widest text-neutral-600 block mb-1 not-italic">
              note
            </span>
            "{chapter.note}"
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Journey() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { ref: introRef, inView: introInView } = useInView(0.1);
  const { ref: finalRef, inView: finalInView } = useInView(0.1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.02 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative py-16 md:py-20 bg-[#080808] border-t border-white/[0.02] overflow-hidden"
    >
      {/* Ambient grain texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
        }}
      />

      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Section Eyebrow ─────────────────────────────────── */}
        <div className={`mb-12 md:mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="text-neutral-500 text-xs uppercase tracking-[0.3em] font-semibold mb-3 block font-mono">
            02 // ORIGIN
          </span>
          <h2 className="text-5xl md:text-7xl text-white font-display-cinematic tracking-wider">
            THE MAKING OF A FILMMAKER
          </h2>
          <div className="w-16 h-px bg-[#D4AF37] mt-4" />
        </div>

        {/* ── Cinematic Intro ──────────────────────────────────── */}
        <div
          ref={introRef}
          className={`mb-16 md:mb-20 transition-all duration-1000 ease-out ${introInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="border-l-2 border-[#D4AF37] pl-6 md:pl-10 py-2 space-y-5 max-w-2xl">
            <blockquote className="text-lg md:text-xl font-serif-cinematic italic text-white/90 leading-relaxed">
              "Every filmmaker remembers the film that inspired them.
              <br />I remember the edits."
            </blockquote>
            <div className="w-8 h-px bg-neutral-600" />
            <div className="space-y-3 text-xs text-neutral-400 font-light leading-relaxed">
              <p>Long before I knew what DaVinci Resolve was... Long before I touched a camera...</p>
              <p>I was already obsessed with YouTube edits, superhero scenes, movie trailers, AMVs, behind-the-scenes documentaries and the magic of storytelling.</p>
              <p>I never watched movies just for entertainment.</p>
              <p className="text-white/70 italic">I kept wondering... "How did they make me feel this?"</p>
              <p>That curiosity slowly became an obsession.</p>
              <p>And eventually... a career.</p>
            </div>
          </div>

          {/* Abstract film strip decorative element */}
          <div className="mt-10 flex gap-1 opacity-20 select-none pointer-events-none overflow-hidden">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-10 h-16 border border-white/20 rounded-sm bg-white/[0.02] flex items-center justify-center"
              >
                <div className="w-6 h-10 rounded-sm"
                  style={{
                    background: `hsl(${(i * 22) % 360}, 30%, ${8 + (i % 4) * 3}%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Chapters ────────────────────────────────────────── */}
        <div className="space-y-0">
          {CHAPTERS.map((chapter, idx) => (
            <ChapterBlock key={chapter.id} chapter={chapter} index={idx} />
          ))}
        </div>

        {/* ── Final Unfinished Page ────────────────────────────── */}
        <div
          ref={finalRef}
          className={`mt-0 transition-all duration-1000 ease-out ${finalInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="relative border-l-2 border-dashed border-neutral-700 bg-white/[0.008] px-6 md:px-14 py-10 md:py-14">

            {/* Blinking cursor text */}
            <div className="mb-8 space-y-1">
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-[0.3em] block">
                Final Chapter
              </span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-3xl md:text-5xl font-display-cinematic text-neutral-700 font-light tracking-wider">
                  TO BE CONTINUED
                </span>
                <span className="w-0.5 h-8 md:h-10 bg-white/60 animate-[blink_1s_steps(1)_infinite] self-end mb-1" />
              </div>
            </div>

            {/* Unfinished diary page */}
            <div className="max-w-xl space-y-4 mb-8">
              <p className="text-sm text-neutral-300 font-light italic font-serif-cinematic leading-relaxed">
                "I don't know where this journey ends.
                <br />I only know I'm not done telling stories."
              </p>
            </div>

            {/* Empty Polaroid + blank storyboard */}
            <div className="flex flex-wrap gap-6 items-start mb-10">
              {/* Empty polaroid */}
              <div
                className="w-32 h-40 bg-white/5 border border-white/10 p-2 pb-6 rotate-[-1deg] flex items-center justify-center shadow-lg"
              >
                <div className="w-full flex-1 bg-neutral-800/50 flex items-center justify-center">
                  <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest">upcoming</span>
                </div>
              </div>

              {/* Blank storyboard panels */}
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-20 h-14 border border-dashed border-neutral-700 bg-white/[0.01] rounded-sm flex items-end p-1"
                  >
                    <div className="w-full h-1 bg-neutral-800 rounded" />
                  </div>
                ))}
              </div>

              {/* Notebook with half-written line */}
              <div className="flex-1 min-w-40 max-w-xs space-y-2 pt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="h-px bg-neutral-700/60"
                      style={{ width: i === 3 ? '35%' : '100%' }}
                    />
                    {i === 3 && (
                      <span className="w-0.5 h-3 bg-neutral-500 animate-[blink_1s_steps(1)_infinite]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Project teaser */}
            <div className="border border-dashed border-neutral-800 p-5 max-w-sm rounded-sm">
              <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest block mb-2">
                Next Project
              </span>
              <p className="text-2xl font-display-cinematic text-neutral-500 tracking-widest">
                ???
              </p>
              <p className="text-[9px] font-mono text-neutral-700 mt-2 uppercase tracking-wider">
                [ Updating soon ]
              </p>
            </div>

          </div>
        </div>

        {/* ── Section end rule ─────────────────────────────────── */}
        <div className="mt-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-neutral-900" />
          <span className="text-[8px] font-mono text-neutral-700 uppercase tracking-widest">end of known chapters</span>
          <div className="flex-1 h-px bg-neutral-900" />
        </div>

      </div>
    </section>
  );
}
