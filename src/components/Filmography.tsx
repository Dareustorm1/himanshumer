import { useEffect, useRef, useState, useCallback } from 'react';
import {
  X, Play, ChevronLeft, ChevronRight, ExternalLink, ChevronDown, Folder, Film,
  Plus, Trash2, Edit, Copy, Move, Lock, Unlock, RotateCcw, ShieldAlert, Save
} from 'lucide-react';
import { getStoredProjects, saveAllProjects, validateProject } from '../utils/projectManager';
import { FilmographyProject, ProjectMediaItem } from '../types/project';
import { DEFAULT_PROJECTS } from '../data/defaultProjects';
import { isFirebaseConfigured, getFirebaseProjects, saveFirebaseProjects, formatFirebaseError } from '../lib/firebase';
import FirebaseErrorModal, { FirebaseErrorDetails } from './FirebaseErrorModal';
import { resolveImageUrl } from '../utils/urlHelper';

const AUTH_TOKEN_KEY = 'himanshumer_admin_auth_token_v3';

export default function Filmography() {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [projects, setProjects] = useState<FilmographyProject[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<FirebaseErrorDetails | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [projectSaveStatus, setProjectSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  // Admin password state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPw, setAdminPw] = useState('');
  const [adminPwError, setAdminPwError] = useState('');
  
  // Drag and Drop (Projects Reordering)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Project Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<FilmographyProject | null>(null);
  const [editorTab, setEditorTab] = useState<'content' | 'presentation' | 'media'>('content');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Editing Fields (Content)
  const [editId, setEditId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editType, setEditType] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editTaught, setEditTaught] = useState('');
  const [editCraft, setEditCraft] = useState('');
  const [editCredits, setEditCredits] = useState('');
  const [editTimeline, setEditTimeline] = useState('');
  const [editLaurels, setEditLaurels] = useState('');
  const [editVisibility, setEditVisibility] = useState<'draft' | 'published' | 'archive'>('published');
  const [editFeatured, setEditFeatured] = useState(false);

  // Editing Fields (Presentation)
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editPoster, setEditPoster] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editAccentColor, setEditAccentColor] = useState('');

  // Editing Fields (Media Collection)
  const [editMedia, setEditMedia] = useState<ProjectMediaItem[]>([]);
  const [draggedMediaIdx, setDraggedMediaIdx] = useState<number | null>(null);
  
  // New Media Item Form
  const [newMediaLabel, setNewMediaLabel] = useState('');
  const [newMediaType, setNewMediaType] = useState<'video' | 'image'>('video');
  const [newMediaSource, setNewMediaSource] = useState<ProjectMediaItem['sourceType']>('youtube');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCover, setNewMediaCover] = useState('');

  // Universal Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerItems, setViewerItems] = useState<ProjectMediaItem[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number>(0);
  const [viewerProjectTitle, setViewerProjectTitle] = useState<string>('');

  const sectionRef = useRef<HTMLDivElement>(null);
  const projectRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Sync projects and auth status
  const loadProjectsData = useCallback(async () => {
    const local = getStoredProjects();
    setProjects(local.sort((a, b) => a.displayOrder - b.displayOrder));

    if (isFirebaseConfigured) {
      try {
        const fbProjects = await getFirebaseProjects(local);
        if (fbProjects && fbProjects.length > 0) {
          const sorted = fbProjects.sort((a, b) => a.displayOrder - b.displayOrder);
          setProjects(sorted);
          saveAllProjects(sorted); // Cache locally
          setHasUnsavedChanges(false);
        }
      } catch (err) {
        console.error('Failed to load projects from Firebase:', err);
      }
    }
  }, []);

  useEffect(() => {
    loadProjectsData();
    const handleStorage = () => {
      const list = getStoredProjects();
      setProjects(list.sort((a, b) => a.displayOrder - b.displayOrder));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadProjectsData]);

  // Auth Polling Check
  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      setIsAdminMode(token === '3f7137d5d93de0be0462cb9a49f330397ea8e68518dad4cd2f4c0344d24c50d3');
    };
    checkAdmin();
    const interval = setInterval(checkAdmin, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time synchronization helper
  const syncProjectsState = async (updatedList: FilmographyProject[], originalList: FilmographyProject[]) => {
    if (isFirebaseConfigured && navigator.onLine) {
      try {
        await saveFirebaseProjects(updatedList);
        setProjects(updatedList);
        saveAllProjects(updatedList);
        setHasUnsavedChanges(false);
      } catch (err: any) {
        console.error('Failed to sync projects to Firebase:', err);
        const details = formatFirebaseError(err, 'portfolio_data', 'dossier (projects)', 'setDoc', updatedList);
        setErrorDetails(details);
        setErrorModalOpen(true);
        // Revert local changes on failure to prevent UI desync
        setProjects(originalList);
      }
    } else {
      setProjects(updatedList);
      saveAllProjects(updatedList);
      setHasUnsavedChanges(true);
    }
  };

  async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const toggleAdmin = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return;
    }
    setAdminPw('');
    setAdminPwError('');
    setShowAdminModal(true);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await sha256(adminPw);
    if (hash === '3f7137d5d93de0be0462cb9a49f330397ea8e68518dad4cd2f4c0344d24c50d3') {
      localStorage.setItem(AUTH_TOKEN_KEY, '3f7137d5d93de0be0462cb9a49f330397ea8e68518dad4cd2f4c0344d24c50d3');
      setIsAdminMode(true);
      setShowAdminModal(false);
      setAdminPw('');
      setAdminPwError('');
    } else {
      setAdminPwError('ACCESS DENIED // INVALID DECRYPTION KEY');
    }
  };

  const handleSaveToBackend = async () => {
    setSaveStatus('saving');
    if (isFirebaseConfigured) {
      try {
        await saveFirebaseProjects(projects);
        saveAllProjects(projects);
        
        // Refetch latest from Firebase to guarantee UI reflects actual cloud state
        const fbProjects = await getFirebaseProjects(projects);
        if (fbProjects && fbProjects.length > 0) {
          setProjects(fbProjects.sort((a, b) => a.displayOrder - b.displayOrder));
        }
        
        setHasUnsavedChanges(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err: any) {
        console.error('Failed to save to Firebase:', err);
        setSaveStatus('failed');
        const details = formatFirebaseError(err, 'portfolio_data', 'dossier (projects)', 'setDoc', projects);
        setErrorDetails(details);
        setErrorModalOpen(true);
      }
    } else {
      saveAllProjects(projects);
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleResetToSaved = async () => {
    if (!window.confirm('DISCARD ALL LOCAL EDITS AND PULL RECENT CLOUD VERSION FROM FIREBASE?')) return;
    if (isFirebaseConfigured) {
      try {
        const fbProjects = await getFirebaseProjects(projects);
        if (fbProjects && fbProjects.length > 0) {
          const sorted = fbProjects.sort((a, b) => a.displayOrder - b.displayOrder);
          setProjects(sorted);
          saveAllProjects(sorted);
          setHasUnsavedChanges(false);
          alert('SUCCESSFULLY PULLED LATEST DATA FROM FIREBASE.');
          return;
        }
      } catch (err) {
        console.error('Failed to pull from Firebase:', err);
      }
    }
    loadProjectsData();
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('WARNING: THIS WILL WIPE ALL CUSTOM FILMOGRAPHY EDITS AND RESTORE THE DEFAULT 14 PROJECTS. PROCEED?')) return;
    localStorage.removeItem('himanshumer_projects_v2');
    const defaults = [...DEFAULT_PROJECTS];
    setProjects(defaults);
    saveAllProjects(defaults);
    if (isFirebaseConfigured) {
      try {
        await saveFirebaseProjects(defaults);
        setHasUnsavedChanges(false);
      } catch (err) {
        console.error('Failed to reset Firebase:', err);
      }
    }
  };

  // Section visible transitions
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.02 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Dropdown Close listener on global click
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Media Priority Fallbacks
  const getPrimaryMediaPreview = (project: FilmographyProject): string => {
    const primary = project.media[0];
    if (primary) {
      if (primary.coverImage) return resolveImageUrl(primary.coverImage);
      if (primary.thumbnail) return resolveImageUrl(primary.thumbnail);
      if (primary.url) {
        const resolved = resolveImageUrl(primary.url);
        if (resolved !== primary.url) return resolved;
      }
      if (primary.sourceType === 'local' && primary.type === 'image') return resolveImageUrl(primary.url);
    }
    if (project.presentation.coverImage) return resolveImageUrl(project.presentation.coverImage);
    if (project.presentation.thumbnail) return resolveImageUrl(project.presentation.thumbnail);
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=compress&cs=tinysrgb&w=800';
  };

  const getInstagramEmbed = (url: string) => {
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}embed/`;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('embed/')) {
      return url;
    } else if (url.includes('youtube.com/watch')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  };

  const getDriveEmbedUrl = (url: string) => {
    if (url.includes('/view')) {
      return url.replace('/view', '/preview');
    }
    if (url.includes('/file/d/')) {
      const parts = url.split('/file/d/');
      const fileId = parts[1]?.split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
  };

  const getVideoEmbedUrl = (item: ProjectMediaItem) => {
    const url = item.url;
    if (!url) return null;
    if (item.sourceType === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      return getYouTubeEmbedUrl(url);
    }
    if (item.sourceType === 'drive' || url.includes('drive.google.com')) {
      return getDriveEmbedUrl(url);
    }
    if (item.sourceType === 'instagram' || url.includes('instagram.com/reel') || url.includes('instagram.com/p')) {
      return getInstagramEmbed(url);
    }
    if (item.sourceType === 'vimeo' || url.includes('vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return vimeoId ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1` : url;
    }
    return url;
  };

  const toggleExpand = (projectId: string) => {
    const el = projectRefs.current[projectId];
    if (!el) return;

    let absoluteTop = 0;
    let curr: HTMLElement | null = el;
    while (curr) {
      absoluteTop += curr.offsetTop;
      curr = curr.offsetParent as HTMLElement | null;
    }

    if (expandedId === projectId) {
      setExpandedId(null);
      setTimeout(() => {
        window.scrollTo({ top: absoluteTop - 100, behavior: 'smooth' });
      }, 50);
    } else {
      let precedingHeightOffset = 0;
      if (expandedId) {
        const clickedIndex = projects.findIndex(p => p.id === projectId);
        const prevExpandedIndex = projects.findIndex(p => p.id === expandedId);
        
        if (prevExpandedIndex !== -1 && prevExpandedIndex < clickedIndex) {
          const prevEl = projectRefs.current[expandedId];
          if (prevEl) {
            const expandedPanel = prevEl.querySelector('.overflow-hidden');
            if (expandedPanel) {
              precedingHeightOffset = expandedPanel.scrollHeight;
            }
          }
        }
      }

      setExpandedId(projectId);
      setTimeout(() => {
        const targetScroll = absoluteTop - precedingHeightOffset - 80;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }, 50);
    }
  };

  const openUniversalViewer = (project: FilmographyProject, index: number) => {
    const item = project.media[index];
    if (!item) return;
    if (
      item.url.includes('youtube.com/@') || 
      (item.url.includes('instagram.com') && !item.url.includes('/reel/') && !item.url.includes('/p/'))
    ) {
      window.open(item.url, '_blank');
      return;
    }
    setViewerProjectTitle(project.content.title);
    setViewerItems(project.media);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!viewerOpen) return;
      if (e.key === 'Escape') setViewerOpen(false);
      else if (e.key === 'ArrowRight') {
        setViewerIndex(prev => (prev + 1) % viewerItems.length);
      } else if (e.key === 'ArrowLeft') {
        setViewerIndex(prev => (prev - 1 + viewerItems.length) % viewerItems.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerOpen, viewerItems]);

  // Touch Swipe gestures helper
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setViewerIndex(prev => (prev + 1) % viewerItems.length);
      } else {
        setViewerIndex(prev => (prev - 1 + viewerItems.length) % viewerItems.length);
      }
    }
  };

  // Drag & Drop: Project Reordering
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const reordered = [...projects];
    const [removed] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, removed);

    const updated = reordered.map((p, i) => ({ ...p, displayOrder: i + 1 }));
    syncProjectsState(updated, projects);
    setDraggedIdx(null);
  };

  // Drag & Drop: Media Reordering
  const handleMediaDragStart = (idx: number) => setDraggedMediaIdx(idx);
  const handleMediaDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleMediaDrop = (targetIdx: number) => {
    if (draggedMediaIdx === null || draggedMediaIdx === targetIdx) return;
    const reordered = [...editMedia];
    const [removed] = reordered.splice(draggedMediaIdx, 1);
    reordered.splice(targetIdx, 0, removed);

    const updated = reordered.map((m, i) => ({ ...m, displayOrder: i + 1 }));
    setEditMedia(updated);
    setDraggedMediaIdx(null);
  };

  // Project Editor Actions
  const handleOpenEditor = (project?: FilmographyProject) => {
    if (project) {
      setEditingProject(project);
      setEditId(project.id);
      setEditTitle(project.content.title);
      setEditSubtitle(project.content.subtitle || '');
      setEditType(project.content.type);
      setEditYear(project.content.year);
      setEditRole(project.content.role);
      setEditStatus(project.content.status);
      setEditBadge(project.badge || '');
      setEditStory(project.content.storyBehindIt);
      setEditTaught(project.content.whatThisProjectTaughtMe || '');
      setEditCraft(project.content.craft || '');
      setEditCredits(project.content.credits?.join(', ') || '');
      setEditTimeline(project.content.productionNotes?.join(', ') || '');
      setEditLaurels(project.content.festivalSelections?.join(', ') || '');
      setEditVisibility(project.visibility);
      setEditFeatured(!!project.featured);
      
      setEditCoverImage(project.presentation.coverImage);
      setEditPoster(project.presentation.poster || '');
      setEditThumbnail(project.presentation.thumbnail || '');
      setEditAccentColor(project.presentation.accentColor || '');
      
      setEditMedia(project.media || []);
    } else {
      setEditingProject(null);
      setEditId(`project-${Date.now()}`);
      setEditTitle('');
      setEditSubtitle('');
      setEditType('Creative Editing');
      setEditYear(new Date().getFullYear().toString());
      setEditRole('Editor');
      setEditStatus('Draft');
      setEditBadge('');
      setEditStory('');
      setEditTaught('');
      setEditCraft('');
      setEditCredits('Editor: Himanshu Mer');
      setEditTimeline('');
      setEditLaurels('');
      setEditVisibility('draft');
      setEditFeatured(false);
      
      setEditCoverImage('');
      setEditPoster('');
      setEditThumbnail('');
      setEditAccentColor('');
      
      setEditMedia([]);
    }
    setValidationErrors([]);
    setValidationWarnings([]);
    setEditorTab('content');
    setEditorOpen(true);
  };

  // Computes if any changes exist inside the active editor modal
  const hasProjectChanges = !editingProject ? true : (
    editId !== editingProject.id ||
    editTitle !== editingProject.content.title ||
    editSubtitle !== (editingProject.content.subtitle || '') ||
    editType !== editingProject.content.type ||
    editYear !== editingProject.content.year ||
    editRole !== editingProject.content.role ||
    editStatus !== editingProject.content.status ||
    editBadge !== (editingProject.badge || '') ||
    editStory !== (editingProject.content.storyBehindIt || '') ||
    editTaught !== (editingProject.content.whatThisProjectTaughtMe || '') ||
    editCraft !== (editingProject.content.craft || '') ||
    editCredits !== (editingProject.content.credits?.join(', ') || '') ||
    editTimeline !== (editingProject.content.productionNotes?.join(', ') || '') ||
    editLaurels !== (editingProject.content.festivalSelections?.join(', ') || '') ||
    editVisibility !== editingProject.visibility ||
    editFeatured !== !!editingProject.featured ||
    editCoverImage !== editingProject.presentation.coverImage ||
    editPoster !== (editingProject.presentation.poster || '') ||
    editThumbnail !== (editingProject.presentation.thumbnail || '') ||
    editAccentColor !== (editingProject.presentation.accentColor || '') ||
    JSON.stringify(editMedia) !== JSON.stringify(editingProject.media)
  );

  const currentProjectStatus = 
    projectSaveStatus === 'saving' ? 'saving' :
    projectSaveStatus === 'saved' ? 'saved' :
    projectSaveStatus === 'failed' ? 'failed' :
    hasProjectChanges ? 'unsaved' : 'saved';

  const currentFilmographyStatus = 
    saveStatus === 'saving' ? 'saving' :
    saveStatus === 'saved' ? 'saved' :
    saveStatus === 'failed' ? 'failed' :
    hasUnsavedChanges ? 'unsaved' : 'saved';

  // Warn user before leaving if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasModalChanges = editorOpen && hasProjectChanges;
      if (hasUnsavedChanges || hasModalChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, editorOpen, hasProjectChanges]);

  // Keyboard shortcut Ctrl+S trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        if (isAdminMode) {
          e.preventDefault();
          if (editorOpen) {
            if (projectSaveStatus !== 'saving') {
              handleSaveProject();
            }
          } else {
            if (hasUnsavedChanges && saveStatus !== 'saving') {
              handleSaveToBackend();
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminMode, editorOpen, hasUnsavedChanges, saveStatus, projectSaveStatus, projects, editingProject, editId, editTitle, editSubtitle, editType, editYear, editRole, editStatus, editBadge, editCoverImage, editPoster, editThumbnail, editAccentColor, editMedia]);

  const handleSaveProject = async () => {
    const updatedProject: FilmographyProject = {
      id: editId.trim(),
      displayOrder: editingProject ? editingProject.displayOrder : Math.max(...projects.map(p => p.displayOrder), 0) + 1,
      featured: editFeatured,
      visibility: editVisibility,
      createdDate: editingProject ? editingProject.createdDate : new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      badge: editBadge.trim() || undefined,
      content: {
        title: editTitle.trim(),
        subtitle: editSubtitle.trim() || undefined,
        type: editType.trim(),
        year: editYear.trim(),
        role: editRole.trim(),
        status: editStatus.trim(),
        storyBehindIt: editStory.trim(),
        myContribution: editRole.trim(),
        whatThisProjectTaughtMe: editTaught.trim() || undefined,
        craft: editCraft.trim() || undefined,
        credits: editCredits.trim() ? editCredits.split(',').map(s => s.trim()) : undefined,
        productionNotes: editTimeline.trim() ? editTimeline.split(',').map(s => s.trim()) : undefined,
        festivalSelections: editLaurels.trim() ? editLaurels.split(',').map(s => s.trim()) : undefined,
      },
      presentation: {
        coverImage: editCoverImage.trim(),
        poster: editPoster.trim() || undefined,
        thumbnail: editThumbnail.trim() || undefined,
        accentColor: editAccentColor.trim() || undefined,
      },
      media: editMedia
    };

    const isNew = !editingProject;
    const checkResult = validateProject(updatedProject, projects, isNew);
    
    if (!checkResult.valid) {
      setValidationErrors(checkResult.errors);
      setValidationWarnings(checkResult.warnings);
      return;
    }

    let updatedList = [...projects];
    if (isNew) {
      updatedList.push(updatedProject);
    } else {
      updatedList = updatedList.map(p => p.id === editingProject.id ? updatedProject : p);
    }

    setProjectSaveStatus('saving');
    try {
      if (isFirebaseConfigured && navigator.onLine) {
        await saveFirebaseProjects(updatedList);
        
        // Sync UI state with fresh data
        const fbProjects = await getFirebaseProjects(updatedList);
        if (fbProjects && fbProjects.length > 0) {
          const sorted = fbProjects.sort((a, b) => a.displayOrder - b.displayOrder);
          setProjects(sorted);
          saveAllProjects(sorted);
        } else {
          setProjects(updatedList);
          saveAllProjects(updatedList);
        }
        setHasUnsavedChanges(false);
      } else {
        setProjects(updatedList);
        saveAllProjects(updatedList);
        setHasUnsavedChanges(true);
      }
      
      setProjectSaveStatus('saved');
      setTimeout(() => {
        setProjectSaveStatus('idle');
        setEditorOpen(false);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to save project:', err);
      setProjectSaveStatus('failed');
      const details = formatFirebaseError(err, 'portfolio_data', `dossier.projects[id=${updatedProject.id}]`, 'setDoc', updatedList);
      setErrorDetails(details);
      setErrorModalOpen(true);
    }
  };

  const handleResetEditorFields = () => {
    if (!window.confirm('DISCARD CURRENT EDITS AND RESET FIELDS TO THE PREVIOUSLY SAVED VERSION?')) return;
    const storedList = getStoredProjects();
    const savedProject = storedList.find(p => p.id === editId);
    
    if (savedProject) {
      setEditTitle(savedProject.content.title);
      setEditSubtitle(savedProject.content.subtitle || '');
      setEditType(savedProject.content.type);
      setEditYear(savedProject.content.year);
      setEditRole(savedProject.content.role);
      setEditStatus(savedProject.content.status);
      setEditBadge(savedProject.badge || '');
      setEditStory(savedProject.content.storyBehindIt);
      setEditTaught(savedProject.content.whatThisProjectTaughtMe || '');
      setEditCraft(savedProject.content.craft || '');
      setEditCredits(savedProject.content.credits?.join(', ') || '');
      setEditTimeline(savedProject.content.productionNotes?.join(', ') || '');
      setEditLaurels(savedProject.content.festivalSelections?.join(', ') || '');
      setEditVisibility(savedProject.visibility);
      setEditFeatured(!!savedProject.featured);
      setEditCoverImage(savedProject.presentation.coverImage);
      setEditPoster(savedProject.presentation.poster || '');
      setEditThumbnail(savedProject.presentation.thumbnail || '');
      setEditAccentColor(savedProject.presentation.accentColor || '');
      setEditMedia(savedProject.media || []);
    } else {
      setEditTitle('');
      setEditSubtitle('');
      setEditType('Creative Editing');
      setEditYear(new Date().getFullYear().toString());
      setEditRole('Editor');
      setEditStatus('Draft');
      setEditBadge('');
      setEditStory('');
      setEditTaught('');
      setEditCraft('');
      setEditCredits('Editor: Himanshu Mer');
      setEditTimeline('');
      setEditLaurels('');
      setEditVisibility('draft');
      setEditFeatured(false);
      setEditCoverImage('');
      setEditPoster('');
      setEditThumbnail('');
      setEditAccentColor('');
      setEditMedia([]);
    }
  };

  const handleDuplicateProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return;
    const original = projects[index];
    const nextOrder = Math.max(...projects.map(p => p.displayOrder), 0) + 1;
    const newId = `${original.id}-copy-${Date.now()}`;
    const copy: FilmographyProject = {
      ...original,
      id: newId,
      displayOrder: nextOrder,
      visibility: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      content: {
        ...original.content,
        title: `${original.content.title} (Copy)`
      },
      media: original.media.map(m => ({
        ...m,
        id: `${m.id}-copy-${Math.random().toString(36).substr(2, 5)}`
      }))
    };
    syncProjectsState([...projects, copy], projects);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('ARE YOU SURE YOU WANT TO DELETE THIS PROJECT? THIS ACTION CANNOT BE UNDONE.')) return;
    const ns = projects.filter(p => p.id !== id);
    syncProjectsState(ns, projects);
    if (expandedId === id) setExpandedId(null);
  };

  // Add media item to collection
  const handleAddMediaItem = () => {
    if (!newMediaUrl.trim() || !newMediaLabel.trim()) {
      alert('Label and URL are required.');
      return;
    }
    const item: ProjectMediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: newMediaType,
      sourceType: newMediaSource,
      url: newMediaUrl.trim(),
      label: newMediaLabel.trim(),
      displayOrder: editMedia.length + 1,
      coverImage: newMediaCover.trim() || undefined
    };
    setEditMedia([...editMedia, item]);
    setNewMediaLabel('');
    setNewMediaUrl('');
    setNewMediaCover('');
  };

  const handleRemoveMediaItem = (mediaId: string) => {
    const updated = editMedia.filter(m => m.id !== mediaId).map((m, i) => ({ ...m, displayOrder: i + 1 }));
    setEditMedia(updated);
  };

  const handleSetPrimaryMedia = (mediaId: string) => {
    const target = editMedia.find(m => m.id === mediaId);
    if (!target) return;
    const rest = editMedia.filter(m => m.id !== mediaId);
    const updated = [target, ...rest].map((m, i) => ({ ...m, displayOrder: i + 1 }));
    setEditMedia(updated);
  };

  // Filter list for public view
  const visibleProjects = projects.filter(p => isAdminMode || p.visibility === 'published');

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-16 md:py-20 bg-[#080808] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 text-left">
        
        {/* ── Heading and Subtitle ────────────────────────────────────────── */}
        <div className={`mb-12 md:mb-16 text-left transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/[0.04] pb-5 gap-4">
            <div className="space-y-1">
              <span className="text-neutral-500 text-xs uppercase tracking-[0.3em] font-semibold mb-3 block font-mono">
                03 // ARCHIVE
              </span>
              <h2 className="text-5xl md:text-7xl text-white font-display-cinematic tracking-wider">
                FILMOGRAPHY
              </h2>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-455 font-serif-cinematic italic mt-3 max-w-xl">
                "Stories I've been fortunate enough to help bring to life."
              </p>
            </div>
            
            {/* Admin Management Dashboard Button */}
            <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-widest flex-wrap">
              <button onClick={toggleAdmin} className={`px-4 py-2 border rounded-sm flex items-center gap-2 cursor-pointer interactive-item ${isAdminMode ? 'border-[#C62828] bg-[#C62828]/10 text-white' : 'border-white/10 text-neutral-400 hover:text-white'}`}>
                {isAdminMode ? <Lock className="w-3.5 h-3.5 text-[#C62828]" /> : <Unlock className="w-3.5 h-3.5" />}
                {isAdminMode ? 'ADMIN' : 'VISITOR'}
              </button>
              {isAdminMode && (
                <button
                  onClick={() => handleOpenEditor()}
                  className="px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold rounded-sm transition-all duration-300 flex items-center gap-1.5 cursor-pointer interactive-item"
                >
                  <Plus className="w-3.5 h-3.5" /> NEW PROJECT
                </button>
              )}
            </div>
          </div>
          <div className="w-16 h-px bg-[#C62828] mt-4"></div>
        </div>

        {/* ── Hidden Admin Control deck ── */}
        {isAdminMode && (
          <div className="mb-12 p-6 border border-[#C62828]/20 bg-[#C62828]/5 rounded-sm font-mono text-left animate-[fadeIn_0.3s_ease]">
            <h3 className="text-[#C62828] text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C62828] animate-ping" />
              // Project Control deck (Admin Access)
            </h3>
            <p className="text-[9px] text-neutral-400 mb-4">
              DRAG & DROP TO REORDER PROJECT TIMELINE. CLICK THE PEN ICON TO EDIT OR UPDATE ANY METADATA, WORK STORY, OR MEDIA EMBEDS.
            </p>
            
            <div className="flex flex-wrap items-center gap-3 mb-5 font-mono text-[9px] uppercase tracking-widest">
              <div className="flex items-center gap-1.5 mr-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  currentFilmographyStatus === 'saving' ? 'bg-blue-500 animate-pulse' :
                  currentFilmographyStatus === 'saved' ? 'bg-[#35D07F]' :
                  currentFilmographyStatus === 'failed' ? 'bg-red-500 animate-pulse' :
                  currentFilmographyStatus === 'unsaved' ? 'bg-amber-500' : 'bg-neutral-600'
                }`} />
                <span className={`text-[8px] tracking-wider ${
                  currentFilmographyStatus === 'saving' ? 'text-blue-400 font-bold' :
                  currentFilmographyStatus === 'saved' ? 'text-[#35D07F] font-bold' :
                  currentFilmographyStatus === 'failed' ? 'text-red-500 font-bold' :
                  currentFilmographyStatus === 'unsaved' ? 'text-amber-500 font-bold' : 'text-neutral-500'
                }`}>
                  {currentFilmographyStatus === 'saving' ? 'Saving...' :
                   currentFilmographyStatus === 'saved' ? 'Saved' :
                   currentFilmographyStatus === 'failed' ? 'Save Failed' :
                   currentFilmographyStatus === 'unsaved' ? 'Unsaved Changes' : 'Saved'}
                </span>
              </div>

              <button
                onClick={handleSaveToBackend}
                disabled={!hasUnsavedChanges || currentFilmographyStatus === 'saving' || currentFilmographyStatus === 'saved'}
                className={`px-4 py-2 font-bold rounded-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  currentFilmographyStatus === 'saving' ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5' :
                  currentFilmographyStatus === 'saved' ? 'bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30' :
                  currentFilmographyStatus === 'failed' ? 'bg-red-950/20 text-red-500 border border-red-500/30 hover:bg-red-950/30' :
                  !hasUnsavedChanges ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-white/5' :
                  'bg-white hover:bg-neutral-200 text-black'
                }`}
              >
                {currentFilmographyStatus === 'saving' ? (
                  <>
                    <svg className="animate-spin h-3 w-3 text-neutral-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : currentFilmographyStatus === 'saved' ? (
                  <>✓ Saved</>
                ) : currentFilmographyStatus === 'failed' ? (
                  <>Retry Save</>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Filmography
                  </>
                )}
              </button>
              
              <button
                onClick={handleResetToSaved}
                disabled={!hasUnsavedChanges}
                className={`px-4 py-2 border rounded-sm transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  hasUnsavedChanges
                    ? 'border-white/20 hover:border-white text-white bg-white/5'
                    : 'border-white/5 text-neutral-600 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to Saved
              </button>

              <button
                onClick={handleResetToDefault}
                className="px-4 py-2 border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 text-red-500 rounded-sm transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Restore Defaults
              </button>
              
              {hasUnsavedChanges && (
                <span className="text-[8px] text-amber-500 font-bold self-center animate-pulse tracking-wide ml-2">
                  [ CHANGES PENDING - CLICK SAVE TO COMMIT ]
                </span>
              )}
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 border border-white/5 bg-black/40 p-2 rounded-sm">
              {projects.map((p, idx) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  className="flex items-center justify-between p-3 border border-white/5 bg-neutral-900/40 rounded hover:border-white/10 transition-colors text-[10px] cursor-move select-none"
                >
                  <div className="flex items-center gap-3">
                    <Move className="w-3 h-3 text-neutral-500 shrink-0" />
                    <span className="text-neutral-600 w-4 text-right">0{p.displayOrder}</span>
                    <span className={`px-1.5 py-0.5 rounded-sm text-[8px] tracking-wide uppercase ${
                      p.visibility === 'published' ? 'bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/20' : 
                      p.visibility === 'draft' ? 'bg-neutral-500/10 text-neutral-400 border border-white/10' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {p.visibility}
                    </span>
                    <span className="text-white font-medium">{p.content.title}</span>
                    {p.featured && <span className="text-[#D4AF37] text-[8px] bg-[#D4AF37]/5 px-1 py-0.2 rounded-sm border border-[#D4AF37]/15">FEATURED</span>}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditor(p)}
                      title="Edit Project"
                      className="p-1 text-neutral-400 hover:text-white border border-white/5 hover:border-white/10 rounded cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicateProject(p.id, e)}
                      title="Duplicate"
                      className="p-1 text-neutral-400 hover:text-white border border-white/5 hover:border-white/10 rounded cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(p.id, e)}
                      title="Delete"
                      className="p-1 text-neutral-400 hover:text-[#C62828] border border-white/5 hover:border-white/10 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Cinematic Archive Grid Shelf Background (Visual Decor) ── */}
        <div className="mb-12 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-white/5 bg-white/[0.01] rounded text-[8px] font-mono text-neutral-500 tracking-wider uppercase select-none opacity-60">
          <div className="flex flex-col gap-1 border-r border-white/5 pr-2">
            <span className="text-neutral-600">[ STORAGE_SHELF_A ]</span>
            <span>Film Cans: {projects.length} Archived</span>
            <span>Hard Drives: 4.8 TB</span>
          </div>
          <div className="flex flex-col gap-1 border-r border-white/5 px-2">
            <span className="text-neutral-600">[ CLAPPERBOARD_LOGS ]</span>
            <span>Takes Logged: 1,420</span>
            <span>Formats: Digital Raw</span>
          </div>
          <div className="flex flex-col gap-1 border-r border-white/5 px-2">
            <span className="text-neutral-600">[ SCREENPLAY_STACKS ]</span>
            <span>Short Scripts: 9</span>
            <span>Outlines: Active</span>
          </div>
          <div className="flex flex-col gap-1 pl-2">
            <span className="text-neutral-600">[ MONITORS ]</span>
            <span>Color Deck: Active</span>
            <span>Pacing Engine: Resolve</span>
          </div>
        </div>

        {/* ── Cinematic Vertical Timeline ── */}
        <div className="relative border-l border-neutral-900 ml-4 md:ml-8 pl-6 md:pl-12 space-y-12">
          
          {visibleProjects.map((project, index) => {
            const isExpanded = expandedId === project.id;
            const isDropdownOpen = activeDropdownId === project.id;

            return (
              <div
                key={project.id}
                ref={el => { projectRefs.current[project.id] = el; }}
                className={`relative transition-all duration-700 ${
                  isExpanded ? 'z-30' : 'z-10'
                }`}
              >
                {/* Timeline Dot */}
                <div 
                  className={`absolute -left-[31px] md:-left-[55px] top-6 w-[10px] h-[10px] rounded-full border-2 transition-all duration-500 z-20 ${
                    isExpanded 
                      ? 'bg-[#C62828] border-[#C62828] scale-125 shadow-[0_0_10px_#C62828]' 
                      : 'bg-[#121212] border-neutral-800 hover:border-neutral-500'
                  }`}
                />

                {/* Manila Archive File Container */}
                <div 
                  className={`glass-card rounded border transition-all duration-500 ease-in-out ${
                    isExpanded 
                      ? 'border-white/10 shadow-2xl bg-neutral-900/50' 
                      : 'border-white/5 hover:border-white/10 hover:scale-[1.01] bg-neutral-950/20'
                  }`}
                >
                  {/* Closed Folder Header */}
                  <div 
                    onClick={() => toggleExpand(project.id)}
                    className="p-5 md:p-6 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none"
                  >
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] font-mono tracking-widest text-[#C62828] bg-[#C62828]/10 border border-[#C62828]/25 px-1.5 py-0.5 rounded-sm uppercase">
                          FILE_0{index + 1}
                        </span>
                        {project.badge && (
                          <span className="text-[8px] font-mono tracking-widest text-[#35D07F] bg-[#35D07F]/10 border border-[#35D07F]/20 px-1.5 py-0.5 rounded-sm uppercase">
                            {project.badge}
                          </span>
                        )}
                        {project.visibility !== 'published' && (
                          <span className="text-[8px] font-mono tracking-widest text-neutral-400 bg-neutral-800 border border-white/10 px-1.5 py-0.5 rounded-sm uppercase">
                            {project.visibility}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-neutral-500 tracking-wider uppercase">
                          {project.content.type} // {project.content.year}
                        </span>
                      </div>
                      {project.content.festivalSelections && project.content.festivalSelections.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
                          {project.content.festivalSelections.map((laurel, idx) => (
                            <span key={idx} className="text-[7px] font-mono tracking-wide text-[#D4AF37] bg-[#D4AF37]/5 border border-[#D4AF37]/15 px-1.5 py-0.5 rounded-sm uppercase">
                              ★ {laurel.split(' (')[0]}
                            </span>
                          ))}
                        </div>
                      )}
                      <h3 className={`text-xl md:text-2xl font-light text-white transition-colors duration-300 font-serif-cinematic ${
                        isExpanded ? 'text-[#C62828]' : 'hover:text-white'
                      }`}>
                        {project.content.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isAdminMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditor(project);
                          }}
                          className="text-[8px] font-mono uppercase tracking-widest text-white border border-[#C62828]/30 hover:bg-[#C62828]/10 bg-black/40 px-3 py-2 rounded-sm transition-all"
                        >
                          EDIT FILE
                        </button>
                      )}
                      <button className="text-[8px] font-mono uppercase tracking-widest text-neutral-400 hover:text-white border border-white/5 hover:border-white/20 bg-white/[0.01] px-4 py-2 rounded-sm transition-all">
                        {isExpanded ? 'CLOSE FILE [-]' : 'UNFOLD ARCHIVE [+]'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded File Contents */}
                  <div 
                    className={`transition-all duration-700 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[3000px] border-t border-white/[0.03] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    {/* Consistent Two Column Layout */}
                    <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-start text-left">
                      
                      {/* LEFT: Hero Preview, Media Count, dropdown trigger button */}
                      <div className="w-full lg:w-[40%] space-y-4">
                        
                        {/* Widescreen Hero Cover Preview Box */}
                        <div 
                          onClick={() => openUniversalViewer(project, 0)}
                          className="relative aspect-video w-full rounded overflow-hidden bg-neutral-950 border border-white/10 shadow-inner group/hero cursor-pointer"
                        >
                          <img
                            src={resolveImageUrl(getPrimaryMediaPreview(project))}
                            alt={project.content.title}
                            className="w-full h-full object-cover opacity-50 group-hover/hero:opacity-75 transition-opacity duration-500 filter contrast-105"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=compress&cs=tinysrgb&w=800&q=75';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          
                          {/* Large Hover indicator */}
                          <div className="absolute w-12 h-12 rounded-full border border-white/20 bg-black/60 flex items-center justify-center text-white group-hover/hero:border-white transition-colors absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                          </div>
                          
                          <div className="absolute bottom-3 left-4 text-[9px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Film className="w-3 h-3" /> OPEN SCREENER
                          </div>
                        </div>

                        {/* Media count indicator */}
                        <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                          [ {project.media.length} {project.media.length === 1 ? 'MEDIA FILE' : 'MEDIA FILES'} ARCHIVED ]
                        </div>

                        {/* Dropdown Media Button */}
                        {project.media.length > 0 && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(isDropdownOpen ? null : project.id);
                              }}
                              className="w-full flex items-center justify-between px-3.5 py-2.5 border border-white/10 bg-white/[0.01] hover:bg-white/[0.04] text-white text-[9px] font-mono uppercase tracking-widest rounded-sm transition-all duration-200"
                            >
                              <span className="flex items-center gap-1.5">
                                <Folder className="w-3.5 h-3.5" /> Media
                              </span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Selection Panel */}
                            {isDropdownOpen && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full mt-1.5 border border-white/10 bg-[#0B0B0B]/60 rounded-sm overflow-hidden animate-[fadeIn_0.2s_ease]"
                              >
                                {project.media.map((item, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      openUniversalViewer(project, idx);
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-[9px] font-mono uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-white/5 border-b border-white/[0.03] last:border-b-0 transition-colors"
                                  >
                                    ▶ {item.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* RIGHT: Story Behind It, My Contribution, Craft, Taught Me, Credits */}
                      <div className="w-full lg:w-[60%] space-y-5">
                        
                        {/* Story Behind It */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-[#C62828] font-bold block">[ STORY_BEHIND_IT ]</span>
                          <p className="text-xs text-neutral-350 leading-relaxed font-light whitespace-pre-line">
                            {project.content.storyBehindIt}
                          </p>
                        </div>

                        {/* My Contribution */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-450 font-bold block">[ MY_CONTRIBUTION ]</span>
                          <p className="text-xs text-white font-semibold font-mono tracking-wide">
                            {project.content.role}
                          </p>
                        </div>

                        {/* Craft */}
                        {project.content.craft && (
                          <div className="space-y-1.5 text-left">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-455 font-bold block">[ CRAFT ]</span>
                            <p className="text-xs text-neutral-400 font-light leading-relaxed">
                              {project.content.craft}
                            </p>
                          </div>
                        )}

                        {/* What This Project Taught Me */}
                        {project.content.whatThisProjectTaughtMe && (
                          <div className="space-y-1.5 text-left">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-450 font-bold block">[ WHAT_THIS_PROJECT_TAUGHT_ME ]</span>
                            <p className="text-xs text-neutral-400 font-light leading-relaxed italic border-l border-neutral-700 pl-3">
                              "{project.content.whatThisProjectTaughtMe}"
                            </p>
                          </div>
                        )}

                        {/* Production Timeline track */}
                        {project.content.productionNotes && project.content.productionNotes.length > 0 && (
                          <div className="space-y-2 text-left">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">[ PRODUCTION_TRACK ]</span>
                            <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] text-neutral-550 uppercase">
                              {project.content.productionNotes.map((item, idx) => (
                                <span key={idx} className="flex items-center gap-2">
                                  {idx > 0 && <span className="text-[#C62828] font-bold">→</span>}
                                  <span className="px-2 py-0.5 border border-white/5 bg-white/[0.01] rounded-sm text-neutral-300">
                                    {item}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Festival Laurels (Labuk Jabuk / or custom) */}
                        {project.content.festivalSelections && project.content.festivalSelections.length > 0 && (
                          <div className="space-y-3 pt-3 border-t border-white/[0.04] text-left">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold block">[ FESTIVAL_LAURELS ]</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {project.content.festivalSelections.map((laurel, idx) => (
                                <div key={idx} className="p-2 border border-[#D4AF37]/10 bg-[#D4AF37]/5 rounded-sm flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                  <span className="text-[9px] font-mono uppercase text-neutral-200 tracking-wider leading-snug">
                                    {laurel}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hunf Productions Collaboration Card inside Labuk Jabuk */}
                {project.id === 'labuk-jabuk' && (
                  <div className="pt-8 pl-0 md:pl-6 max-w-2xl text-left">
                    <div className="p-5 border border-[#D4AF37]/10 bg-[#D4AF37]/[0.01] rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[7px] uppercase tracking-widest text-[#D4AF37] font-mono block">COLLABORATING GROUP</span>
                        <h4 className="text-base font-light text-white font-serif-cinematic">Hunf Productions</h4>
                        <p className="text-[10px] text-neutral-500 font-light leading-relaxed">
                          Worked with Hunf Productions across production and post-production, assisting wherever needed while contributing to the editing process.
                        </p>
                      </div>
                      <a 
                        href="https://www.instagram.com/hunf.productions/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/5 text-white font-mono text-[9px] uppercase tracking-widest rounded-sm transition-all shrink-0 interactive-item"
                      >
                        Hunf Instagram
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Timeline End ── */}
        <div className="mt-20 pt-16 border-t border-dashed border-white/5 text-center flex flex-col items-center justify-center space-y-3 select-none">
          <div className="flex items-center gap-2 font-mono text-neutral-500 text-[10px] uppercase tracking-widest">
            <span>"I still have many stories left to tell"</span>
            <span className="w-1.5 h-3 bg-neutral-500 animate-[ping_1s_steps(2)_infinite]" />
          </div>
        </div>
      </div>

      {/* ── Universal Fullscreen Media Viewer ── */}
      {viewerOpen && viewerItems.length > 0 && (
        <div 
          onClick={() => setViewerOpen(false)}
          className="fixed inset-0 z-[99999] bg-black/98 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-[fadeIn_0.25s_ease_forwards]"
        >
          {/* Top Panel Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50 font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{viewerProjectTitle}</span>
              <span>//</span>
              <span className="text-neutral-500">{viewerItems[viewerIndex].label}</span>
              {viewerItems.length > 1 && (
                <span className="text-neutral-500 ml-2">({viewerIndex + 1}/{viewerItems.length})</span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <a 
                href={viewerItems[viewerIndex].url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 bg-black/40 px-3 py-1.5 rounded-sm transition-all"
              >
                Open Original <ExternalLink className="w-3 h-3" />
              </a>
              <button 
                onClick={() => setViewerOpen(false)}
                className="w-8 h-8 rounded border border-white/10 hover:border-white/20 text-neutral-450 hover:text-white flex items-center justify-center bg-black/40 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Swipeable / Clickable Container */}
          <div 
            onClick={e => e.stopPropagation()} 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full max-w-5xl max-h-[85vh] flex items-center justify-center"
          >
            
            {/* Left Nav Arrow */}
            {viewerItems.length > 1 && (
              <button 
                onClick={() => setViewerIndex((viewerIndex - 1 + viewerItems.length) % viewerItems.length)}
                className="absolute left-[-20px] md:left-[-60px] text-white/40 hover:text-white p-2 z-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Media Player Switcher */}
            <div className="w-full flex items-center justify-center select-none p-2 animate-[fadeIn_0.3s_ease]">
              {viewerItems[viewerIndex].type === 'video' ? (
                /* Video Player (Local / Embed) */
                <div 
                  className={`relative overflow-hidden bg-neutral-950 rounded border border-white/10 shadow-2xl transition-all ${
                    viewerItems[viewerIndex].url.includes('instagram.com')
                      ? 'w-[320px] h-[568px]' 
                      : 'w-full max-w-[960px] aspect-video' 
                  }`}
                >
                  {viewerItems[viewerIndex].sourceType === 'local' ? (
                    <video
                      src={viewerItems[viewerIndex].url}
                      controls
                      autoPlay
                      controlsList="nodownload"
                      onContextMenu={e => e.preventDefault()}
                      className="w-full h-full object-contain bg-neutral-950"
                    />
                  ) : (
                    <iframe
                      src={getVideoEmbedUrl(viewerItems[viewerIndex]) || ''}
                      className="w-full h-full border-0 absolute inset-0 bg-neutral-950"
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                      scrolling="no"
                      title={`viewer-item-${viewerIndex}`}
                    />
                  )}
                </div>
              ) : (
                /* Static Image View */
                 <img 
                   src={resolveImageUrl(viewerItems[viewerIndex].url)} 
                   alt={`viewer-still-${viewerIndex}`}
                   className="max-w-full max-h-[75vh] object-contain rounded border border-white/10 shadow-2xl pointer-events-none" 
                   loading="lazy"
                   onError={(e) => {
                     e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=compress&cs=tinysrgb&w=800&q=75';
                   }}
                 />
              )}
            </div>

            {/* Right Nav Arrow */}
            {viewerItems.length > 1 && (
              <button 
                onClick={() => setViewerIndex((viewerIndex + 1) % viewerItems.length)}
                className="absolute right-[-20px] md:right-[-60px] text-white/40 hover:text-white p-2 z-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
            
          </div>
        </div>
      )}

      {/* ── Hidden Project/Content Editor Modal ── */}
      {editorOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-white/10 rounded w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative font-mono text-xs text-neutral-350 p-6 md:p-8">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/[0.05] pb-4 mb-6">
              <div className="text-left space-y-1">
                <span className="text-[8px] text-[#C62828] uppercase tracking-widest font-bold">// FILMOGRAPHY PROJECT ARCHIVIST</span>
                <h3 className="text-xl font-light text-white font-serif-cinematic">
                  {editingProject ? `Edit Project: ${editTitle}` : 'Create New Project Record'}
                </h3>
              </div>
              <button
                onClick={() => setEditorOpen(false)}
                className="w-8 h-8 rounded border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white flex items-center justify-center bg-black/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Validation Feedback */}
            {validationErrors.length > 0 && (
              <div className="mb-5 p-4 bg-red-950/30 border border-red-500/20 text-red-400 rounded-sm text-left">
                <div className="font-bold mb-1">SYSTEM VALIDATION ERRORS:</div>
                <ul className="list-disc pl-4 space-y-1">
                  {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}
            {validationWarnings.length > 0 && (
              <div className="mb-5 p-4 bg-amber-950/20 border border-amber-500/20 text-amber-400 rounded-sm text-left">
                <div className="font-bold mb-1">ARCHIVE SYSTEM WARNINGS:</div>
                <ul className="list-disc pl-4 space-y-1">
                  {validationWarnings.map((warn, i) => <li key={i}>{warn}</li>)}
                </ul>
              </div>
            )}

            {/* Tab selection */}
            <div className="flex border-b border-white/[0.04] mb-6 gap-2 text-[9px] uppercase tracking-wider">
              <button
                onClick={() => setEditorTab('content')}
                className={`pb-2.5 px-4 cursor-pointer transition-colors border-b-2 ${
                  editorTab === 'content' ? 'border-[#C62828] text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                1. Content Layer
              </button>
              <button
                onClick={() => setEditorTab('presentation')}
                className={`pb-2.5 px-4 cursor-pointer transition-colors border-b-2 ${
                  editorTab === 'presentation' ? 'border-[#C62828] text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                2. Presentation Layer
              </button>
              <button
                onClick={() => setEditorTab('media')}
                className={`pb-2.5 px-4 cursor-pointer transition-colors border-b-2 ${
                  editorTab === 'media' ? 'border-[#C62828] text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                3. Media Layer
              </button>
            </div>

            {/* TAB CONTENT: Content Fields */}
            {editorTab === 'content' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Unique Project ID (Slug)</label>
                  <input
                    type="text"
                    value={editId}
                    onChange={e => setEditId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    disabled={!!editingProject}
                    placeholder="e.g. cafe-qupa"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Project Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="e.g. Cafe Qupa Brand Content"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Subtitle (Optional)</label>
                  <input
                    type="text"
                    value={editSubtitle}
                    onChange={e => setEditSubtitle(e.target.value)}
                    placeholder="e.g. Social footprint editing"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Project Type / Category</label>
                  <input
                    type="text"
                    value={editType}
                    onChange={e => setEditType(e.target.value)}
                    placeholder="e.g. Narrative Short Film"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Production Year</label>
                  <input
                    type="text"
                    value={editYear}
                    onChange={e => setEditYear(e.target.value)}
                    placeholder="e.g. 2025 - 2026"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Your Role</label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    placeholder="e.g. Assistant & Editor"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Project Status</label>
                  <input
                    type="text"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    placeholder="e.g. Completed, Post-Production"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Timeline Badge (Optional)</label>
                  <input
                    type="text"
                    value={editBadge}
                    onChange={e => setEditBadge(e.target.value)}
                    placeholder="e.g. Work in Progress"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Archive Visibility State</label>
                  <select
                    value={editVisibility}
                    onChange={e => setEditVisibility(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20 uppercase"
                  >
                    <option value="published">Published (Public View)</option>
                    <option value="draft">Draft (Visible only to Admin)</option>
                    <option value="archive">Archive (Hidden)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="editFeatured"
                    checked={editFeatured}
                    onChange={e => setEditFeatured(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#C62828] bg-neutral-950 border border-white/10"
                  />
                  <label htmlFor="editFeatured" className="text-neutral-400 text-[10px] uppercase select-none cursor-pointer">Feature this project in layouts</label>
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-neutral-550 block text-[9px] uppercase">Story Behind the Project</label>
                  <textarea
                    rows={4}
                    value={editStory}
                    onChange={e => setEditStory(e.target.value)}
                    placeholder="Provide details about the production background..."
                    className="w-full bg-neutral-950 border border-white/10 rounded p-2.5 text-white outline-none focus:border-white/20 resize-y"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-neutral-550 block text-[9px] uppercase">What This Project Taught You (Takeaway)</label>
                  <input
                    type="text"
                    value={editTaught}
                    onChange={e => setEditTaught(e.target.value)}
                    placeholder="e.g. Creativity is born from strict limitations."
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-neutral-550 block text-[9px] uppercase">Key Craft Skills used (Comma Separated)</label>
                  <input
                    type="text"
                    value={editCraft}
                    onChange={e => setEditCraft(e.target.value)}
                    placeholder="e.g. Macro Editing, Sound Layering, DaVinci Assembly"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-neutral-550 block text-[9px] uppercase">Credits (Comma Separated)</label>
                  <input
                    type="text"
                    value={editCredits}
                    onChange={e => setEditCredits(e.target.value)}
                    placeholder="e.g. Editor: Himanshu Mer, Assistant: Crew Member"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-neutral-550 block text-[9px] uppercase">Production Timeline / Track steps (Comma Separated)</label>
                  <input
                    type="text"
                    value={editTimeline}
                    onChange={e => setEditTimeline(e.target.value)}
                    placeholder="e.g. Day 1: Shoot, Day 2: Editing, Release"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-neutral-550 block text-[9px] uppercase">Festival Selections / Laurels list (Comma Separated)</label>
                  <input
                    type="text"
                    value={editLaurels}
                    onChange={e => setEditLaurels(e.target.value)}
                    placeholder="e.g. Global Independent Film Festival (GIFFI) 2026, Ahmedabad Film Competition 2026"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: Presentation Layer Artwork */}
            {editorTab === 'presentation' && (
              <div className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Project Primary Cover Image (URL)</label>
                  <input
                    type="text"
                    value={editCoverImage}
                    onChange={e => setEditCoverImage(e.target.value)}
                    placeholder="Paste unsplash or static image URL..."
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                  {editCoverImage && (
                    <div className="mt-2 aspect-video w-[240px] border border-white/10 rounded overflow-hidden">
                      <img src={resolveImageUrl(editCoverImage)} className="w-full h-full object-cover" alt="Cover preview" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Poster Image Artwork (URL) (Optional)</label>
                  <input
                    type="text"
                    value={editPoster}
                    onChange={e => setEditPoster(e.target.value)}
                    placeholder="Optional vertical poster URL..."
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Custom Thumbnail (URL) (Optional)</label>
                  <input
                    type="text"
                    value={editThumbnail}
                    onChange={e => setEditThumbnail(e.target.value)}
                    placeholder="Optional grid item thumbnail URL..."
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-550 block text-[9px] uppercase">Optional Custom Theme Accent Color (Hex)</label>
                  <input
                    type="text"
                    value={editAccentColor}
                    onChange={e => setEditAccentColor(e.target.value)}
                    placeholder="e.g. #C62828"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: Media Items Collection Manager */}
            {editorTab === 'media' && (
              <div className="space-y-6 text-left">
                {/* Drag-and-drop current media collection */}
                <div className="space-y-2">
                  <span className="text-neutral-550 block text-[9px] uppercase">Current Media Items (Drag to reorder)</span>
                  {editMedia.length === 0 ? (
                    <div className="p-6 text-center text-neutral-600 border border-dashed border-white/10 rounded">
                      NO MEDIA ITEMS RECORDED. ADD ONE BELOW.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {editMedia.map((item, idx) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleMediaDragStart(idx)}
                          onDragOver={handleMediaDragOver}
                          onDrop={() => handleMediaDrop(idx)}
                          className="flex items-center justify-between p-2.5 border border-white/5 bg-neutral-900/20 rounded hover:border-white/10 transition-colors cursor-move text-[10px]"
                        >
                          <div className="flex items-center gap-3">
                            <Move className="w-3 h-3 text-neutral-500 shrink-0" />
                            <span className="text-neutral-600 w-3">0{item.displayOrder}</span>
                            <span className="text-white font-medium">{item.label}</span>
                            <span className="text-neutral-500 text-[8px] tracking-wider font-mono">[{item.type} // {item.sourceType}]</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSetPrimaryMedia(item.id)}
                              className="px-2 py-1 text-[8px] bg-white/5 border border-white/10 hover:border-white hover:text-black hover:bg-white text-white rounded transition-colors cursor-pointer"
                            >
                              SET PRIMARY
                            </button>
                            <button
                              onClick={() => handleRemoveMediaItem(item.id)}
                              className="p-1 text-neutral-450 hover:text-red-500 rounded border border-white/5 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add new media item form */}
                <div className="p-4 border border-white/5 bg-white/[0.01] rounded space-y-3">
                  <div className="text-white font-bold text-[9px] uppercase tracking-widest">// ADD MEDIA FILE</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
                    <div className="space-y-1">
                      <label className="text-neutral-550 text-[8px] block">Media Type</label>
                      <select
                        value={newMediaType}
                        onChange={e => setNewMediaType(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-white uppercase text-[10px] outline-none"
                      >
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-neutral-550 text-[8px] block">Source Type</label>
                      <select
                        value={newMediaSource}
                        onChange={e => setNewMediaSource(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-white uppercase text-[10px] outline-none"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="instagram">Instagram</option>
                        <option value="drive">Google Drive</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="local">Local MP4 / Image</option>
                        <option value="external">External Link</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-550 text-[8px] block">Label / Caption</label>
                      <input
                        type="text"
                        value={newMediaLabel}
                        onChange={e => setNewMediaLabel(e.target.value)}
                        placeholder="e.g. Watch screener, Still 01"
                        className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-white text-[10px] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-550 text-[8px] block">Media URL / Local Path</label>
                      <input
                        type="text"
                        value={newMediaUrl}
                        onChange={e => setNewMediaUrl(e.target.value)}
                        placeholder="https://... or files/video.mp4"
                        className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-white text-[10px] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddMediaItem}
                    className="w-full bg-white hover:bg-neutral-200 text-black py-2 rounded-sm text-[9px] font-bold uppercase tracking-widest cursor-pointer"
                  >
                    ADD TO COLLECTION
                  </button>
                </div>
              </div>
            )}

            {/* Footer triggers */}
            <div className="flex justify-between items-center mt-8 border-t border-white/[0.05] pt-6">
              <button
                onClick={handleResetEditorFields}
                className="px-4 py-2.5 border border-[#C62828]/20 hover:border-[#C62828] text-[#C62828] hover:bg-[#C62828]/5 rounded-sm uppercase tracking-widest text-[9px] transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Fields
              </button>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 animate-fade-in">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    currentProjectStatus === 'saving' ? 'bg-blue-500 animate-pulse' :
                    currentProjectStatus === 'saved' ? 'bg-[#35D07F]' :
                    currentProjectStatus === 'failed' ? 'bg-red-500 animate-pulse' :
                    currentProjectStatus === 'unsaved' ? 'bg-amber-500' : 'bg-neutral-600'
                  }`} />
                  <span className={`text-[8px] font-mono tracking-wider ${
                    currentProjectStatus === 'saving' ? 'text-blue-400 font-bold' :
                    currentProjectStatus === 'saved' ? 'text-[#35D07F] font-bold' :
                    currentProjectStatus === 'failed' ? 'text-red-500 font-bold' :
                    currentProjectStatus === 'unsaved' ? 'text-amber-500 font-bold' : 'text-neutral-500'
                  }`}>
                    {currentProjectStatus === 'saving' ? 'Saving...' :
                     currentProjectStatus === 'saved' ? 'Saved' :
                     currentProjectStatus === 'failed' ? 'Save Failed' :
                     currentProjectStatus === 'unsaved' ? 'Unsaved Changes' : 'Saved'}
                  </span>
                </span>
                
                <button
                  onClick={() => setEditorOpen(false)}
                  disabled={currentProjectStatus === 'saving'}
                  className="px-5 py-2.5 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white rounded-sm uppercase tracking-widest text-[9px] transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProject}
                  disabled={!hasProjectChanges || currentProjectStatus === 'saving' || currentProjectStatus === 'saved'}
                  className={`px-6 py-2.5 font-bold rounded-sm uppercase tracking-widest text-[9px] transition-all duration-200 cursor-pointer ${
                    currentProjectStatus === 'saving' ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5' :
                    currentProjectStatus === 'saved' ? 'bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30' :
                    currentProjectStatus === 'failed' ? 'bg-red-950/20 text-red-500 border border-red-500/30 hover:bg-red-950/30' :
                    !hasProjectChanges ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-white/5' :
                    'bg-white hover:bg-neutral-200 text-black'
                  }`}
                >
                  {currentProjectStatus === 'saving' ? (
                    <>Saving...</>
                  ) : currentProjectStatus === 'saved' ? (
                    <>✓ Saved</>
                  ) : currentProjectStatus === 'failed' ? (
                    <>Retry Save</>
                  ) : (
                    <>Save Project</>
                  )}
                </button>
              </div>
            </div>

            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/10 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/10 pointer-events-none" />
          </div>
        </div>
      )}

      {/* ── Admin Password Modal ── */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[999999] flex items-center justify-center p-6">
          <div className="bg-neutral-900 border border-white/10 rounded-sm p-6 w-full max-w-xs relative font-mono shadow-2xl text-left">
            <button
              onClick={() => { setShowAdminModal(false); setAdminPwError(''); setAdminPw(''); }}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 border-b border-white/[0.05] pb-2">
              System Decryption Key
            </h3>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <input
                type="password"
                value={adminPw}
                onChange={(e) => setAdminPw(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 w-full text-xs text-white tracking-widest outline-none focus:border-white/20"
              />
              {adminPwError && (
                <div className="text-[9px] text-red-500 font-bold tracking-wide animate-pulse">
                  {adminPwError}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-white hover:bg-neutral-200 text-black py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
              >
                Authenticate
              </button>
            </form>
            <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-white/10 pointer-events-none" />
            <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-white/10 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Firebase Diagnostics Error Modal */}
      <FirebaseErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errorDetails={errorDetails}
        onRetry={handleSaveToBackend}
      />
    </section>
  );
}
