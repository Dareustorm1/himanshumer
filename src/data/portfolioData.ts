export interface Project {
  title: string;
  slug: string;
  category: string;
  client?: string;
  year: string;
  role: string[];
  logline: string;
  description: string;
  software: string[];
  heroVideo?: string;
  poster: string;
  gallery: string[];
  bts: string[];
  credits: string[];
  awards?: string[];
  links: string[];
  tags: string[];
  featured: boolean;
  status: 'public' | 'private';
  relatedProjects?: string[];
}

export interface JourneyMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
  image: string;
}

export interface CraftGroup {
  id: string;
  name: string;
  skills: string[];
}

export const projectsData: Project[] = [
  {
    title: 'Independent Music Video',
    slug: 'music-video',
    category: 'Music Videos',
    year: '2023',
    role: ['Editor', 'Director', 'Colorist'],
    logline: 'A rhythmic, neon-drenched visual journey exploring sound waves and deep color gradations.',
    description: 'An independent music video edited with fast rhythmic assembly, custom visual presets, intense neon lights, and atmospheric tone maps.',
    software: ['DaVinci Resolve', 'After Effects'],
    heroVideo: 'https://youtu.be/d6DzRvG0euc?si=bufkXUxnLk6RE3tR',
    poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=compress&cs=tinysrgb&w=800',
    gallery: [],
    bts: ['BTS Log: Shot over 2 days in an abandoned warehouse', 'Colorist Note: Primary adjustments inside DaVinci YRGB Space'],
    credits: ['Directed by Himanshu Mer', 'Edited by Himanshu Mer', 'Camera by Crew'],
    links: ['https://youtu.be/d6DzRvG0euc?si=bufkXUxnLk6RE3tR'],
    tags: ['Beat Sync', 'Neon Aesthetic', 'Creative Direction'],
    featured: true,
    status: 'public'
  },
  {
    title: 'Creative Music Edits',
    slug: 'music-edits',
    category: 'Creator Content',
    year: '2024',
    role: ['Editor'],
    logline: 'A fast-paced mashup reel displaying editing momentum and speed ramp mastery.',
    description: 'A curation of high-speed creative visual edits and Instagram reels synchronizing visual beats and cuts.',
    software: ['After Effects', 'Photoshop'],
    poster: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=compress&cs=tinysrgb&w=800',
    gallery: [
      'https://www.instagram.com/reel/DJ7dBGkvKUB/',
      'https://www.instagram.com/reel/DRexF4JDDVR/',
      'https://www.instagram.com/reel/DVW11EijRsd/'
    ],
    bts: ['Shutter Sync: Audio peaks mapped to keyframe scale parameters'],
    credits: ['Edited by Himanshu Mer'],
    links: [
      'https://www.instagram.com/reel/DJ7dBGkvKUB/',
      'https://www.instagram.com/reel/DRexF4JDDVR/',
      'https://www.instagram.com/reel/DVW11EijRsd/'
    ],
    tags: ['Speed Ramps', 'Visual Effects', 'Reels'],
    featured: true,
    status: 'public'
  },
  {
    title: 'Punganuru Cow Documentary',
    slug: 'cow-documentary',
    category: 'Documentaries',
    client: 'Client Project',
    year: '2024',
    role: ['Editor'],
    logline: 'A descriptive exploration into the heritage and preservation of India\'s dwarf cows.',
    description: 'A documentary film capturing the heritage, biological details, and cultural preservation efforts surrounding the rare Punganuru cow.',
    software: ['DaVinci Resolve', 'Audition'],
    heroVideo: 'https://drive.google.com/file/d/1oovP4eQmOKLze7ohbqg9w1MiCuZOrvcK/view',
    poster: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=compress&cs=tinysrgb&w=800',
    gallery: [],
    bts: ['Sound Design: Ambient outdoor noises layered with soft classical notes'],
    credits: ['Edited by Himanshu Mer', 'Directing by Client Lead'],
    links: ['https://drive.google.com/file/d/1oovP4eQmOKLze7ohbqg9w1MiCuZOrvcK/view'],
    tags: ['Observational Cinema', 'Color Matching', 'Audio Mixing'],
    featured: true,
    status: 'public'
  },
  {
    title: 'College Event Trailer',
    slug: 'event-trailer',
    category: 'Event Films',
    year: '2023',
    role: ['Editor'],
    logline: 'A high-energy festival teaser capturing youth adrenaline and dynamic lights.',
    description: 'A high-energy event trailer cutting live festival highlights, crowds, and audio beats into an intense visual teaser.',
    software: ['After Effects'],
    heroVideo: 'https://youtu.be/gJFBbYB2fdc',
    poster: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=compress&cs=tinysrgb&w=800',
    gallery: [],
    bts: ['Pacing: Visual rhythm designed around 128BPM kick drum transients'],
    credits: ['Edited by Himanshu Mer'],
    links: ['https://youtu.be/gJFBbYB2fdc'],
    tags: ['Promo Cuts', 'Bass Drops', 'Teaser'],
    featured: false,
    status: 'public'
  },
  {
    title: 'Food Advertisement',
    slug: 'food-ad',
    category: 'Food & Hospitality',
    year: '2024',
    role: ['Editor'],
    logline: 'Cinematic gastronomy sizzle reel featuring fast cuts and macro lens details.',
    description: 'A gourmet commercial advertisement showcasing culinary arts, fast macro pans, and visual sizzles for restaurant promos.',
    software: ['DaVinci Resolve'],
    heroVideo: 'https://www.instagram.com/reel/DC3Woz9i9A_/',
    poster: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=compress&cs=tinysrgb&w=800',
    gallery: [],
    bts: ['Sound: Layered sizzling, knife chopping, and fire crackling sounds'],
    credits: ['Edited by Himanshu Mer', 'Camera by Hospitality Partner'],
    links: ['https://www.instagram.com/reel/DC3Woz9i9A_/'],
    tags: ['Macro Color', 'ASMR Cuts', 'Hospitality'],
    featured: false,
    status: 'public'
  },
  {
    title: 'Dentist Clinic Advertisement',
    slug: 'dentist-ad',
    category: 'Commercials',
    year: '2024',
    role: ['Editor'],
    logline: 'A clinical service teaser communicating care, hygiene, and modern machinery.',
    description: 'A professional business promo campaign covering dental clinic care, patient services, and technical equipment highlights.',
    software: ['DaVinci Resolve'],
    heroVideo: 'https://drive.google.com/file/d/15-PZiJzcgA4dKbVgMg895Vb4kM1A-m4C/view',
    poster: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=compress&cs=tinysrgb&w=800',
    gallery: [],
    bts: ['Formatting: Split screens displaying before/after dental treatment scopes'],
    credits: ['Edited by Himanshu Mer'],
    links: ['https://drive.google.com/file/d/15-PZiJzcgA4dKbVgMg895Vb4kM1A-m4C/view'],
    tags: ['Healthcare', 'Corporate cuts', 'Interview Audio'],
    featured: false,
    status: 'public'
  },
  {
    title: 'Cafe Qupa Campaign',
    slug: 'cafe-qupa',
    category: 'Food & Hospitality',
    client: 'Cafe Qupa',
    year: '2024',
    role: ['Content Editor'],
    logline: 'A social-first branding grid compiled for aesthetic cafe showcases.',
    description: 'Strategic social media post layouts and high-aesthetic food advertisements compiled for Cafe Qupa.',
    software: ['After Effects', 'Photoshop'],
    heroVideo: 'https://www.instagram.com/cafequpa.in',
    poster: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=compress&cs=tinysrgb&w=800',
    gallery: [],
    bts: ['Branding: Custom typeface overlay designs rendered at 60fps mobile grid rates'],
    credits: ['Content Compiled by Himanshu Mer'],
    links: ['https://www.instagram.com/cafequpa.in'],
    tags: ['Aesthetic Grid', 'Social Strategy', 'Brand Assets'],
    featured: false,
    status: 'public'
  },
  {
    title: 'Chef Abhilash Culinary Edits',
    slug: 'chef-abhilash',
    category: 'Creator Content',
    year: '2024',
    role: ['Editor'],
    logline: 'Gourmet cooking storytelling edits with dynamic visual flow parameters.',
    description: 'Culinary storytelling cooking show reels compiling dynamic close-ups, ASMR sounds, and clean aesthetic transitions.',
    software: ['After Effects'],
    heroVideo: 'https://www.instagram.com/_chefabhilash_/',
    poster: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=compress&cs=tinysrgb&w=800',
    gallery: [],
    bts: ['Cuts: Match cuts on hand gestures for fast cooking rhythms'],
    credits: ['Edited by Himanshu Mer'],
    links: ['https://www.instagram.com/_chefabhilash_'],
    tags: ['ASMR Sync', 'Culinary Story', 'Match Cut'],
    featured: false,
    status: 'public'
  },
  {
    title: 'Rishabh Bidhuri Series',
    slug: 'rishabh-bidhuri',
    category: 'Creator Content',
    year: '2023',
    role: ['Video Editor'],
    logline: 'High-retention YouTube entertainment cuts leveraging pacing and pop cues.',
    description: 'Worked on multiple long-form and short-form YouTube videos, polishing narrative logic, designing viewer hooks, and tuning sound dynamics.',
    software: ['DaVinci Resolve', 'Photoshop'],
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=compress&cs=tinysrgb&w=800',
    gallery: [
      'https://youtu.be/UpFUKE-dP5U?t=581',
      'https://youtube.com/shorts/AJQVayiqPj8'
    ],
    bts: ['Audience Hook: Frame jumps and zooming highlights during the initial 3 seconds'],
    credits: ['Edited by Himanshu Mer'],
    links: [
      'https://youtu.be/UpFUKE-dP5U?t=581',
      'https://youtube.com/shorts/AJQVayiqPj8'
    ],
    tags: ['YouTube Hooks', 'Retention Editing', 'Captions'],
    featured: false,
    status: 'public'
  },
  {
    title: 'Derek Kumo Gameplay Edits',
    slug: 'derek-kumo',
    category: 'Creator Content',
    year: '2024',
    role: ['Editor'],
    logline: 'Commentary pacing, zoom highlights, and sound effects inserts.',
    description: 'Dynamic gameplay commentary visual flow, zoom cuts, and highlight synchronization.',
    software: ['After Effects'],
    heroVideo: 'https://drive.google.com/file/d/1WNbnAow7cxLaNaciW9S7TE1g1aZMkoWz/view',
    poster: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=compress&cs=tinysrgb&w=800',
    gallery: [],
    bts: ['Sound Design: Comedic audio overlays mapped to player failures'],
    credits: ['Edited by Himanshu Mer'],
    links: ['https://drive.google.com/file/d/1WNbnAow7cxLaNaciW9S7TE1g1aZMkoWz/view'],
    tags: ['Gameplay', 'Zoom Cuts', 'Meme Overlays'],
    featured: false,
    status: 'public'
  },
  {
    title: 'Gilbert Sanchez Cybersecurity',
    slug: 'gilbert-sanchez',
    category: 'Commercials',
    year: '2024',
    role: ['Editor'],
    logline: 'Technical lectures structured for training and layout consistency.',
    description: 'Technical slide presentations and security training educational videos polished for clean formatting and maximum lecture clarity.',
    software: ['DaVinci Resolve', 'Photoshop'],
    heroVideo: 'https://youtu.be/bNY95j0NXz8',
    poster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=compress&cs=tinysrgb&w=800',
    gallery: [],
    bts: ['Layouts: Custom code block windows placed alongside terminal displays'],
    credits: ['Edited by Himanshu Mer'],
    links: ['https://youtu.be/bNY95j0NXz8'],
    tags: ['Security Tutorial', 'Formatting', 'Lecture Cuts'],
    featured: false,
    status: 'public'
  },
  {
    title: 'Narrative Short Films',
    slug: 'narrative-shorts',
    category: 'Private Archive',
    year: '2023 - Present',
    role: ['Director', 'Writer', 'Editor'],
    logline: 'Independent short stories kept inside the confidential vault for festival considerations.',
    description: 'Worked on multiple independent narrative short films. Unable to publish due to festival submission guidelines and client rights restrictions.',
    software: ['DaVinci Resolve', 'After Effects', 'ProTools'],
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=compress&cs=tinysrgb&w=800',
    gallery: [],
    bts: ['Confidential: Storyboard assets locked under NDA key signatures'],
    credits: ['Directed by Himanshu Mer', 'Written by Himanshu Mer'],
    links: [],
    tags: ['Confidential', 'Short Film', 'Festival Cut'],
    featured: true,
    status: 'private'
  }
];

export const journeyData: JourneyMilestone[] = [
  {
    id: 'engineering',
    year: '2019',
    title: 'The Foundation // Engineering',
    description: 'Developing logical structural reasoning, code, and analytical thinking frameworks.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=compress&cs=tinysrgb&w=500'
  },
  {
    id: 'first-camera',
    year: '2020',
    title: 'First Lens // The Shutter Click',
    description: 'Acquiring the first camera. Experimenting with visual frames, shadows, and lighting.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=compress&cs=tinysrgb&w=500'
  },
  {
    id: 'first-edit',
    year: '2020',
    title: 'First Assembly // The Timeline Cut',
    description: 'Assembling the first sequence, learning rhythmic pacing and ambient sound layout.',
    image: 'https://images.unsplash.com/photo-1574717024453-354056a2eb46?auto=compress&cs=tinysrgb&w=500'
  },
  {
    id: 'embro-media',
    year: '2024',
    title: 'Editing Head // Embro Media Productions',
    description: 'Managing editing outputs, client communications, and orchestrating video deliverables.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=compress&cs=tinysrgb&w=500'
  },
  {
    id: 'commercials',
    year: '2024',
    title: 'Commercial Projects',
    description: 'Directing and editing promotional campaigns for corporate clinic networks and restaurants.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=compress&cs=tinysrgb&w=500'
  },
  {
    id: 'music-videos',
    year: '2023',
    title: 'Music Videos',
    description: 'Creating atmospheric grading, neon lights, and fast rhythmic assemblies for independent musical tracks.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=compress&cs=tinysrgb&w=500'
  },
  {
    id: 'docs',
    year: '2024',
    title: 'Documentary Chronicles',
    description: 'Documenting real-world narratives, filming interviews, and matching pacing logic.',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=compress&cs=tinysrgb&w=500'
  },
  {
    id: 'creator-economy',
    year: '2023 - Present',
    title: 'Creator Economy Assemblies',
    description: 'Editing content, structuring hooks, and optimizing retention timelines for YouTube personalities.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=compress&cs=tinysrgb&w=500'
  },
  {
    id: 'future',
    year: 'Future',
    title: 'Feature Cinema // Directing Dreams',
    description: 'Stepping into full-length cinematic features, screenwriting arcs, and theatrical prints.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=compress&cs=tinysrgb&w=500'
  }
];

export const craftData: CraftGroup[] = [
  {
    id: 'editing',
    name: 'Editing Mode',
    skills: ['DaVinci Resolve', 'After Effects', 'Photoshop', 'Sound Design', 'Color Grading', 'Speed Ramping', 'Motion Graphics', 'Rotoscoping (Roto)', 'Visual Effects (VFX)', '3D Compositing & Elements']
  },
  {
    id: 'direction',
    name: 'Director Mode',
    skills: ['Storyboarding', 'Shot Planning & Blocking', 'Creative Direction', 'Scene Composition', 'Visual Tone Design', 'Actor Direction']
  },
  {
    id: 'storytelling',
    name: 'Storyteller Mode',
    skills: ['Screenplay Structure', 'Visual Narrative', 'Pacing & Rhythm', 'Character Arc Design', 'Colour Language & Mood', 'Cinematic Reference Building', 'Documentary Storytelling']
  }
];
export type ModeId = 'editing' | 'direction' | 'storytelling';
export const globalColors = {
  background: '#080808',
  surface: '#121212',
  card: '#1A1A1A',
  primaryText: '#F4F4F4',
  secondaryText: '#A0A0A0',
  accentGold: '#D4AF37',   // Origin
  accentOcean: '#2E8BC0',  // Journey
  accentCrimson: '#C62828',// Filmography
  accentEmerald: '#35D07F',// Craft
  accentSilver: '#D8D8D8'  // Ending
};
