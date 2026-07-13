import { FilmographyProject } from '../types/project';
import { DEFAULT_PROJECTS } from '../data/defaultProjects';

const PROJECTS_STORAGE_KEY = 'himanshumer_projects_v2';

// Safe load projects from localStorage or default
export function getStoredProjects(): FilmographyProject[] {
  const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!stored) {
    // Initialize default list
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
    return DEFAULT_PROJECTS;
  }
  try {
    return JSON.parse(stored);
  } catch (_) {
    return DEFAULT_PROJECTS;
  }
}

// Save all projects
export function saveAllProjects(projects: FilmographyProject[]) {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

// Validate a project before saving
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProject(
  project: FilmographyProject,
  allProjects: FilmographyProject[],
  isNew: boolean
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required checks
  if (!project.id.trim()) {
    errors.push('Project ID is required.');
  } else if (!/^[a-z0-9-_]+$/.test(project.id)) {
    errors.push('Project ID must contain only lowercase letters, numbers, hyphens, and underscores.');
  }

  if (isNew && allProjects.some(p => p.id === project.id)) {
    errors.push(`Project ID "${project.id}" already exists. Must be unique.`);
  }

  if (!project.content.title.trim()) {
    errors.push('Project Title is required.');
  }

  // Cover image warning
  if (!project.presentation.coverImage.trim()) {
    warnings.push('Missing Cover Image. If no cover image is set, a placeholder will render.');
  }

  // Published check
  if (project.visibility === 'published') {
    if (!project.content.storyBehindIt.trim()) {
      warnings.push('Story Behind It is empty on a published project.');
    }
    if (project.media.length === 0) {
      warnings.push('No media items defined. Visitors will see a placeholder cover screener.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Duplicate a project
export function duplicateProjectById(id: string): FilmographyProject | null {
  const projects = getStoredProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  const original = projects[index];
  const nextOrder = Math.max(...projects.map(p => p.displayOrder), 0) + 1;
  const newId = `${original.id}-copy-${Date.now()}`;
  
  const copy: FilmographyProject = {
    ...original,
    id: newId,
    displayOrder: nextOrder,
    visibility: 'draft', // defaults to draft
    createdDate: new Date().toISOString().split('T')[0],
    updatedDate: new Date().toISOString().split('T')[0],
    content: {
      ...original.content,
      title: `${original.content.title} (Copy)`
    },
    // Deep copy media items with new IDs to prevent overlap
    media: original.media.map(m => ({
      ...m,
      id: `${m.id}-copy-${Math.random().toString(36).substr(2, 5)}`
    }))
  };

  projects.push(copy);
  saveAllProjects(projects);
  return copy;
}
