export interface ProjectContent {
  title: string;
  subtitle?: string;
  type: string; // e.g. Creative Editing, Music Video
  year: string;
  role: string; // myContribution
  status: string; // e.g. Personal Work, Public Access
  storyBehindIt: string;
  myContribution?: string;
  whatIWorkedOn?: string;
  whatThisProjectTaughtMe?: string;
  craft?: string;
  credits?: string[];
  festivalSelections?: string[]; // laurels
  productionNotes?: string[]; // productionTimeline
  tags?: string[];
}

export interface ProjectPresentation {
  coverImage: string; // heroImage
  poster?: string;
  thumbnail?: string;
  accentColor?: string; // e.g. #C62828
}

export interface ProjectMediaItem {
  id: string;
  type: 'video' | 'image';
  sourceType: 'local' | 'youtube' | 'instagram' | 'drive' | 'vimeo' | 'external';
  url: string; // local file path or external link
  label: string; // caption
  displayOrder: number;
  coverImage?: string;
  thumbnail?: string;
  poster?: string;
  orientation?: 'landscape' | 'portrait';
  altText?: string;
  visibility?: 'visible' | 'hidden';
}

export interface FilmographyProject {
  id: string; // Project ID
  displayOrder: number;
  featured?: boolean;
  visibility: 'draft' | 'published' | 'archive';
  createdDate: string;
  updatedDate: string;
  badge?: string; // e.g. Work in Progress, Currently freelancing
  
  content: ProjectContent;
  presentation: ProjectPresentation;
  media: ProjectMediaItem[];
}
