import { FilmographyProject } from '../types/project';

export const DEFAULT_PROJECTS: FilmographyProject[] = [
  {
    id: 'music-edits',
    displayOrder: 1,
    visibility: 'published',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Music Edits',
      type: 'Creative Editing',
      role: 'Editor',
      status: 'Personal Work',
      year: '2024 - 2026',
      storyBehindIt: "These edits weren't created for any client. They started because I heard music that made me imagine visuals. Whenever a song stayed in my head, I opened DaVinci Resolve and experimented until the visuals matched the feeling I had while listening. This became my creative playground. No deadlines. No revisions. Just experimenting with rhythm, pacing, transitions and emotion. This is where I slowly developed my editing style.",
      myContribution: 'Editor',
      whatThisProjectTaughtMe: "Editing isn't just about cutting footage. It's about translating emotion into visuals.",
      craft: "DaVinci Resolve, Speed Ramps, Rhythmic Editing, Sound Sync",
      credits: ['Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=compress&cs=tinysrgb&w=800'
    },
    media: [
      { id: 'm1_1', type: 'video', sourceType: 'instagram', url: 'https://www.instagram.com/reel/DJ7dBGkvKUB/', label: 'Reel 01', displayOrder: 1 },
      { id: 'm1_2', type: 'video', sourceType: 'instagram', url: 'https://www.instagram.com/reel/DRexF4JDDVR/', label: 'Reel 02', displayOrder: 2 },
      { id: 'm1_3', type: 'video', sourceType: 'instagram', url: 'https://www.instagram.com/reel/DVW11EijRsd/', label: 'Reel 03', displayOrder: 3 }
    ]
  },
  {
    id: 'music-video',
    displayOrder: 2,
    visibility: 'published',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Independent Music Video',
      type: 'Music Video',
      role: 'Assistant • Editor',
      status: 'Public Access',
      year: '2026',
      storyBehindIt: "This was one of the first projects where I experienced the reality of filmmaking. We had almost no budget. Most of the production relied on creativity, improvisation and a lot of jugaad. The entire shoot happened across two days. Everyone multitasked. Everyone solved problems together. I assisted throughout the production and later edited the complete music video. Looking back, I don't remember the budget. I remember the excitement of making something despite the limitations.",
      myContribution: 'Assistant • Editor',
      whatThisProjectTaughtMe: "Creativity is often born from limitations.",
      craft: "Shot Planning, Production Assistance, DaVinci Resolve Assembly, Colorist adjustments",
      productionNotes: ['Day 1: Planning', 'Day 1: Shoot', 'Day 2: Shoot', 'Day 2: Editing', 'Release'],
      credits: ['Assistant & Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://img.youtube.com/vi/d6DzRvG0euc/maxresdefault.jpg'
    },
    media: [
      { id: 'm2_1', type: 'video', sourceType: 'youtube', url: 'https://youtu.be/d6DzRvG0euc?si=bufkXUxnLk6RE3tR', label: 'Watch Film', displayOrder: 1 }
    ]
  },
  {
    id: 'cow-documentary',
    displayOrder: 3,
    visibility: 'published',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Punganuru Cow Documentary',
      type: 'Client Documentary',
      role: 'Assistant Camera • Editor',
      status: 'Public Access',
      year: '2024',
      storyBehindIt: "This project arrived with a very tight deadline. The client wanted a documentary completed quickly, so we travelled outside the city early in the morning to capture everything before the day became busy. Once shooting was finished, I returned and edited the documentary overnight to deliver it within the deadline. The strongest memory from this project isn't the editing. It's seeing the client's smile after watching the final documentary. That reaction made every sleepless hour worth it.",
      myContribution: 'Assistant Camera • Editor',
      whatThisProjectTaughtMe: "Deadlines can be stressful, but preparation and commitment always matter more.",
      craft: "Field Shooting, Audio Cleanup, DaVinci Resolve overnight editing",
      productionNotes: ['Early Morning Shoot', 'Same Day Edit', 'Overnight Export', 'Client Delivery'],
      credits: ['Assistant Camera & Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://drive.google.com/thumbnail?id=1oovP4eQmOKLze7ohbqg9w1MiCuZOrvcK&sz=w1000'
    },
    media: [
      { id: 'm3_1', type: 'video', sourceType: 'drive', url: 'https://drive.google.com/file/d/1oovP4eQmOKLze7ohbqg9w1MiCuZOrvcK/view', label: 'Watch Documentary', displayOrder: 1 }
    ]
  },
  {
    id: 'udaan',
    displayOrder: 4,
    visibility: 'published',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Udaan',
      type: 'College Event Film',
      role: 'Photography Team • Editor',
      status: 'Public Access',
      year: '2023',
      storyBehindIt: "More than anything else, this project reminds me of teamwork. I was part of the college photography team where we spent countless nights planning, shooting and editing together. Nothing went exactly according to plan. There were technical failures. Unexpected problems. Long nights. Endless discussions. But there was also laughter, friendship and shared excitement. Despite everything, we came together and created something we were proud of. I worked as one of the editors for the final event film.",
      myContribution: 'Photography Team • Editor',
      whatThisProjectTaughtMe: "Great films are never made alone.",
      craft: "Event Photography, Montage Editing, Audio Beats Mapping, After Effects Title Animation",
      credits: ['Photography Team Member & Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://img.youtube.com/vi/gJFBbYB2fdc/maxresdefault.jpg'
    },
    media: [
      { id: 'm4_1', type: 'video', sourceType: 'youtube', url: 'https://youtu.be/gJFBbYB2fdc?feature=shared', label: 'Watch Event Film', displayOrder: 1 }
    ]
  },
  {
    id: 'food-commercials',
    displayOrder: 5,
    visibility: 'published',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Food Commercials',
      type: 'Commercial Advertisements',
      role: 'Editor',
      status: 'Commercial Collection',
      year: '2024',
      storyBehindIt: "Food advertisements taught me something very different. Unlike longer videos, I only had a few seconds to make viewers hungry. Every transition, every sound effect, every close-up, every slow motion shot had to make the food feel irresistible. These projects pushed me to improve pacing, visual rhythm and attention to detail.",
      myContribution: 'Editor',
      whatThisProjectTaughtMe: "Sometimes storytelling only has thirty seconds.",
      craft: "Macro Editing, Food Grading, Sound Layering (chopping, sizzling)",
      credits: ['Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=compress&cs=tinysrgb&w=800'
    },
    media: [
      { id: 'm5_1', type: 'video', sourceType: 'instagram', url: 'https://www.instagram.com/reel/DC3Woz9i9A_/', label: 'Commercial Reel', displayOrder: 1 }
    ]
  },
  {
    id: 'dentist-campaigns',
    displayOrder: 6,
    visibility: 'published',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Dentist Campaigns',
      type: 'Commercial Advertisement',
      role: 'Editor',
      status: 'Dental Campaign',
      year: '2024',
      storyBehindIt: "This wasn't a single advertisement. It became an entire series of promotional videos. The challenge wasn't creating one good edit. The challenge was maintaining consistency across multiple videos while keeping every reel visually fresh. Each advertisement needed to communicate trust, professionalism and care while remaining engaging enough for social media audiences. There were many more videos beyond the ones displayed here.",
      myContribution: 'Editor',
      whatThisProjectTaughtMe: "Consistency is a creative skill.",
      craft: "Interview Pacing, Audio Layering, Split Screens",
      credits: ['Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://drive.google.com/thumbnail?id=15-PZiJzcgA4dKbVgMg895Vb4kM1A-m4C&sz=w1000'
    },
    media: [
      { id: 'm6_1', type: 'video', sourceType: 'drive', url: 'https://drive.google.com/file/d/1yHsdq5cY-qZliDTzLrWUbVlAOgayEI6_/view', label: 'Bleeding Gums Ad', displayOrder: 1 },
      { id: 'm6_2', type: 'video', sourceType: 'drive', url: 'https://drive.google.com/file/d/19am9mA1KWGYEoaF_kBOqxDnjw-jQZNxB/view', label: 'Brushing Techniques Ad', displayOrder: 2 },
      { id: 'm6_3', type: 'video', sourceType: 'drive', url: 'https://drive.google.com/file/d/1wA54LIg7f63pWm3JjGgTBfe1D5AAE8xo/view', label: 'Flossing Routine Ad', displayOrder: 3 },
      { id: 'm6_4', type: 'video', sourceType: 'drive', url: 'https://drive.google.com/file/d/17N3lAfeYgFEGuePGUdu1G1G1Jl0fEv9i/view', label: 'Oral Cancer Awareness Ad', displayOrder: 4 }
    ]
  },
  {
    id: 'cafe-qupa',
    displayOrder: 7,
    visibility: 'published',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Cafe Qupa',
      type: 'Brand Content',
      role: 'Lead Content Creator & Marketing Designer',
      status: 'Brand Campaign',
      year: '2025',
      storyBehindIt: "I created all the reels and marketing content for Cafe Qupa's page. I assisted during concept shoots, shaping the creative ideas and executing the edits to align with the brand's premium identity. I was responsible for their complete social footprint, editing almost every reel on the page.",
      myContribution: 'Lead Content Creator & Marketing Designer',
      whatThisProjectTaughtMe: "Great edits begin with great planning.",
      craft: "Concept Development, Camera framing, Reels Editing, Brand Typography",
      credits: ['Editor & Concept Shoot Assistant: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=compress&cs=tinysrgb&w=800'
    },
    media: [
      { id: 'm7_1', type: 'video', sourceType: 'instagram', url: 'https://www.instagram.com/cafequpa.in', label: 'Cafe Instagram Page ↗', displayOrder: 1 }
    ]
  },
  {
    id: 'chef-abhilash',
    displayOrder: 8,
    visibility: 'published',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Chef Abhilash',
      type: 'Short Form Content',
      role: 'Editor',
      status: 'Series',
      year: '2025',
      storyBehindIt: "Food content is all about rhythm. The timing of cuts. The pacing. The sound. The tiny details. Working with Chef Abhilash helped me refine fast-paced storytelling while making every dish feel satisfying to watch. Rather than editing one-off videos, I focused on building a consistent editing style across multiple reels.",
      myContribution: 'Editor',
      whatThisProjectTaughtMe: "Small details create big reactions.",
      craft: "Match Cuts, ASMR Audio Mixing, Food Motion Effects",
      credits: ['Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=compress&cs=tinysrgb&w=800'
    },
    media: [
      { id: 'm8_1', type: 'video', sourceType: 'instagram', url: 'https://www.instagram.com/p/DNLWMhzhhrs/', label: 'Chef Abhilash Reel', displayOrder: 1 }
    ]
  },
  {
    id: 'rishabh-bidhuri',
    displayOrder: 9,
    visibility: 'published',
    badge: 'Currently freelancing',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Rishabh Bidhuri',
      type: 'YouTube Content',
      role: 'Editor',
      status: 'Currently Working',
      year: '2026',
      storyBehindIt: "Working with Rishabh Bidhuri has been one of the biggest learning experiences in my editing journey. Unlike one-time client projects, this collaboration continues. I've edited both long-form YouTube videos and short-form content, adapting my editing style depending on the format and audience. Every new upload teaches me something different about storytelling, retention and pacing. This project is still evolving.",
      myContribution: 'Editor',
      whatThisProjectTaughtMe: "Consistency improves craft faster than perfection.",
      craft: "Retention Hooks, Pacing Adjustments, Pop-up Graphics, Audio EQ",
      credits: ['Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://img.youtube.com/vi/UpFUKE-dP5U/maxresdefault.jpg'
    },
    media: [
      { id: 'm9_1', type: 'video', sourceType: 'youtube', url: 'https://www.youtube.com/@Rishabh.gujjar.38', label: 'YouTube Channel ↗', displayOrder: 1 }
    ]
  },
  {
    id: 'derek-kumo',
    displayOrder: 10,
    visibility: 'published',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Derek Kumo',
      type: 'YouTube',
      role: 'Intro Editor',
      status: 'Opening Sequence',
      year: '2026',
      storyBehindIt: "Although my contribution focused on the opening sequence, creating the first impression of a video is something I genuinely enjoy. An intro has only a few seconds to capture attention. This project challenged me to think about pacing, energy and visual identity right from the first frame.",
      myContribution: 'Intro Editor',
      whatThisProjectTaughtMe: "The first few seconds decide whether someone keeps watching.",
      craft: "Intro Montage, Pacing Hooks, Title designs",
      credits: ['Intro Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://img.youtube.com/vi/4f1EM0fP4CI/maxresdefault.jpg'
    },
    media: [
      { id: 'm10_1', type: 'video', sourceType: 'youtube', url: 'https://www.youtube.com/watch?v=4f1EM0fP4CI&t=1s', label: 'Opening Sequence', displayOrder: 1 }
    ]
  },
  {
    id: 'gilbert-sanchez',
    displayOrder: 11,
    visibility: 'published',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Gilbert Sanchez',
      type: 'Long Form YouTube',
      role: 'Editor',
      status: 'Public Access',
      year: '2026',
      storyBehindIt: "Working on a cybersecurity-focused YouTube video was different from my previous editing work. The challenge wasn't flashy transitions. The challenge was keeping an educational topic engaging while maintaining pacing and clarity. This project strengthened my understanding of audience attention and storytelling through editing rather than effects.",
      myContribution: 'Editor',
      whatThisProjectTaughtMe: "Good editing should support the story, not distract from it.",
      craft: "Lecture cuts, slides timing, technical pace pacing",
      credits: ['Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://img.youtube.com/vi/bNY95j0NXz8/maxresdefault.jpg'
    },
    media: [
      { id: 'm11_1', type: 'video', sourceType: 'youtube', url: 'https://youtu.be/bNY95j0NXz8?si=SY2NQ16_l5xKkFjj', label: 'Cybersecurity Video', displayOrder: 1 }
    ]
  },
  {
    id: 'dreams',
    displayOrder: 12,
    visibility: 'published',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Dreams',
      type: 'Narrative Short Film',
      role: 'Assistant • Editor',
      status: 'Festival Competition',
      year: '2024',
      storyBehindIt: "Dreams was created for the Yugantar Yuva Mahotsav inter-college short film competition. Unlike commercial work, this project was driven entirely by storytelling. I assisted throughout production and later edited the film. Every scene required balancing emotion, rhythm and continuity while working within limited resources. This project reminded me why I enjoy narrative filmmaking so much.",
      myContribution: 'Assistant • Editor',
      whatThisProjectTaughtMe: "Stories connect people more deeply than visuals alone.",
      craft: "Narrative pacing, Color grading, Sound continuity",
      credits: ['Assistant & Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://drive.google.com/thumbnail?id=1t8pnWAYpsvTt36GPMQI-OltpdpthCh-a&sz=w1000'
    },
    media: [
      { id: 'm12_1', type: 'video', sourceType: 'drive', url: 'https://drive.google.com/file/d/1t8pnWAYpsvTt36GPMQI-OltpdpthCh-a/view', label: 'Watch Short Film', displayOrder: 1 }
    ]
  },
  {
    id: 'i-didnt-kill-her',
    displayOrder: 13,
    visibility: 'published',
    badge: 'Work in Progress',
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: "I Didn't Kill Her",
      type: 'Independent Short Film',
      role: 'Editor',
      status: 'Unfinished',
      year: '2025',
      storyBehindIt: "This project demanded far more commitment than most people would ever see on screen. We travelled multiple times between Anand and Vadodara, often bunking college just to complete the shoot. Schedules changed constantly. Resources were limited. Every shooting day came with new problems. But everyone kept showing up because we believed in the story. Although the film cannot be shared publicly, the memories behind it are some of the most valuable experiences I've had as a filmmaker.",
      myContribution: 'Editor',
      whatThisProjectTaughtMe: "Some films are remembered more for the journey than the final export.",
      craft: "Atmospheric Editing, Suspense pacing, Sound design, Tension build",
      credits: ['Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://drive.google.com/thumbnail?id=1YZ6TUz3mA1h8AN3tYFeLcQVIdV7BmyuP&sz=w1000'
    },
    media: [
      { id: 'm13_1', type: 'image', sourceType: 'drive', url: 'https://drive.google.com/thumbnail?id=1YZ6TUz3mA1h8AN3tYFeLcQVIdV7BmyuP&sz=w1000', label: 'Production Still 01', displayOrder: 1 },
      { id: 'm13_2', type: 'image', sourceType: 'drive', url: 'https://drive.google.com/thumbnail?id=1kbDqVHBkyT1Tb_BjTJgB9f3FF2AdHmYb&sz=w1000', label: 'Production Still 02', displayOrder: 2 },
      { id: 'm13_3', type: 'image', sourceType: 'drive', url: 'https://drive.google.com/thumbnail?id=1S6Ys1gYm4YCQXV6-6Lf0bgl6RfFjXBxA&sz=w1000', label: 'Production Still 03', displayOrder: 3 },
      { id: 'm13_4', type: 'image', sourceType: 'drive', url: 'https://drive.google.com/thumbnail?id=1ZKkY_vA9eOm0K5NGZp9Rxp3P60pXhwXX&sz=w1000', label: 'Production Still 04', displayOrder: 4 },
      { id: 'm13_5', type: 'image', sourceType: 'drive', url: 'https://drive.google.com/thumbnail?id=1NKbvfVPNQU7Qs7i4Rn2tXm-2OnaBRj0F&sz=w1000', label: 'Production Still 05', displayOrder: 5 },
      { id: 'm13_6', type: 'image', sourceType: 'drive', url: 'https://drive.google.com/thumbnail?id=1-y6ONNvngNKsyEvutcv9YRUid9hfmV75&sz=w1000', label: 'Production Still 06', displayOrder: 6 }
    ]
  },
  {
    id: 'labuk-jabuk',
    displayOrder: 14,
    visibility: 'published',
    featured: true,
    createdDate: '2026-07-13',
    updatedDate: '2026-07-13',
    content: {
      title: 'Labuk Jabuk',
      type: 'Festival Short Film',
      role: 'Assistant • Editor',
      status: 'Hunf Productions',
      year: '2025 - 2026',
      storyBehindIt: "Labuk Jabuk represents one of the biggest milestones in my filmmaking journey so far. I worked throughout production while assisting and editing the film. Like every independent production, it came with long days, constant problem solving and countless small responsibilities that never appear in the credits. Watching the finished film travel to multiple film festivals became one of the proudest moments of my career. This project reminded me that every late night, every revision and every challenge eventually becomes part of something much bigger.",
      myContribution: 'Assistant • Editor',
      whatThisProjectTaughtMe: "The journey doesn't end when the film is finished. Sometimes that's where it truly begins.",
      craft: "Assistant Direction, Script Continuity, Short Film Editing, Festival Submission Management",
      festivalSelections: [
        'Global Independent Film Festival of India (GIFFI) 2026',
        'Goa International Film Competition (GIFC) 2026',
        'Ahmedabad International Film Festival (AIFF) 2026',
        'MFC Short Film Competition 2026',
        'First-Time Filmmaker Sessions Volume 7 (supported by Lift-Off Sessions)'
      ],
      credits: ['Assistant & Editor: Himanshu Mer']
    },
    presentation: {
      coverImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=compress&cs=tinysrgb&w=800'
    },
    media: [
      { id: 'm14_1', type: 'video', sourceType: 'instagram', url: 'https://www.instagram.com/reel/DZ2c3P1Bigd/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', label: 'Watch Teaser', displayOrder: 1 }
    ]
  }
];
