import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Folder, Lock, X, Plus, Trash2,
  RotateCw, Pin, Unlock, RotateCcw, Link2, Book, Bookmark, Save
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { onSnapshot, collection } from 'firebase/firestore';
import { 
  isFirebaseConfigured, 
  getFirebaseNodes, 
  saveFirebaseNodes, 
  getFirebaseConnections, 
  saveFirebaseConnections, 
  getFirebaseNotebook, 
  saveFirebaseNotebook,
  db,
  NotebookMetadata,
  formatFirebaseError
} from '../lib/firebase';
import FirebaseErrorModal, { FirebaseErrorDetails } from './FirebaseErrorModal';
import { resolveImageUrl } from '../utils/urlHelper';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BrainNode {
  id: string;
  type: 'polaroid' | 'note' | 'ticket' | 'location' | 'quote';
  title: string;
  desc: string;
  tags: string[];
  image?: string;
  x: number;   // % of canvas width
  y: number;   // % of canvas height
  size: 'sm' | 'md' | 'lg';
  rotation: number;
  pinned: boolean;
}

interface Connection { from: string; to: string; }

interface NotebookPage {
  id: string;
  title: string;
  content: string;
  highlighted?: boolean;
}

// ─── Default Data ────────────────────────────────────────────────────────────

const DEFAULT_NODES: BrainNode[] = [
  { id: 'n1', type: 'polaroid', title: 'Dead Poets Society', desc: 'Warm amber tones, low-angle camera movements. Emotional safety through cinematography.', tags: ['Composition', 'Warmth'], image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=compress&cs=tinysrgb&w=300', x: 6,  y: 8,  size: 'md', rotation: -4, pinned: false },
  { id: 'n2', type: 'note',     title: 'Good Will Hunting',  desc: 'The screenplay delays the reveal of Will\'s genius — isolation before connection.', tags: ['Writing', 'Pacing'], x: 44, y: 10, size: 'sm', rotation: 3,  pinned: false },
  { id: 'n3', type: 'ticket',   title: 'Forrest Gump Editing', desc: 'Invisible CGI compositing. Music as a frame for historical time progression.', tags: ['Editing', 'VFX'], x: 7,  y: 52, size: 'sm', rotation: 5,  pinned: false },
  { id: 'n4', type: 'location', title: 'Resolve Timeline', desc: 'Audio waveform anchors for speed-ramp transitions. Rhythmic editing as music.', tags: ['Timeline', 'Workflow'], x: 68, y: 42, size: 'md', rotation: 0,  pinned: false },
  { id: 'n5', type: 'quote',    title: '"Carpe Diem"', desc: 'Seize the day, boys. Make your lives extraordinary. — Dead Poets Society', tags: ['Philosophy'], x: 40, y: 55, size: 'md', rotation: -6, pinned: false },
  { id: 'n6', type: 'note',     title: 'Color Theory Study', desc: 'Complementary split-toning: warm highlights vs cool shadows. Looks cinematic, not flat.', tags: ['Color', 'Grading'], x: 72, y: 10, size: 'sm', rotation: 2,  pinned: false },
];

const DEFAULT_CONNECTIONS: Connection[] = [
  { from: 'n1', to: 'n2' },
  { from: 'n2', to: 'n5' },
  { from: 'n3', to: 'n4' },
  { from: 'n4', to: 'n5' },
];

const DEFAULT_NOTEBOOK_PAGES: NotebookPage[] = [
  { id: 'p1', title: 'Good Will Hunting Observations', content: '"Real loss is only possible when you love something more than you love yourself."\n\nThe screenplay delays the reveal of Will\'s genius until he solves the hallway chalkboard equation in complete isolation. Vulnerability before triumph.' },
  { id: 'p2', title: 'Dead Poets Society', content: '"Carpe Diem. Seize the day, boys. Make your lives extraordinary."\n\nLighting transitions from cold blue shadows to warm candle-light as the secret society revives. Color grading = spiritual freedom.' },
  { id: 'p3', title: 'Forrest Gump Notes', content: '"Life is like a box of chocolates. You never know what you\'re gonna get."\n\nThe feather scene uses early digital compositing. Pacing rhythm matches guitar strums perfectly.' },
  { id: 'p4', title: 'Editing Philosophy', content: '"An edit is not a cut — it\'s a breath."\n\nEvery transition should feel as natural as breathing. If it draws attention to itself, it failed.' },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const ADMIN_KEY = 'himanshumer_brainwall_admin_v3';
const VISITOR_KEY = 'himanshumer_brainwall_visitor_v3';
const NOTEBOOK_ADMIN_KEY = 'himanshumer_notebook_admin_v3';
const NOTEBOOK_VISITOR_KEY = 'himanshumer_notebook_visitor_v3';
const AUTH_TOKEN_KEY = 'himanshumer_admin_auth_token_v3';

const NODE_SIZE_MAP = { sm: 168, md: 200, lg: 248 }; // px widths

// ─── Component ───────────────────────────────────────────────────────────────

export default function InsideHead() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLDivElement>(null);
  const { stopSounds } = useAudio();

  const [isVisible, setIsVisible] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPw, setAdminPw] = useState('');
  const [adminPwError, setAdminPwError] = useState('');
  const [activeOverlay, setActiveOverlay] = useState<{ title: string; content: React.ReactNode } | null>(null);

  // ── Brain Wall state ──
  const [rawNodes, setRawNodes] = useState<BrainNode[]>([]);
  const nodes = rawNodes;
  
  const setNodes = useCallback((val: BrainNode[] | ((prev: BrainNode[]) => BrainNode[])) => {
    setRawNodes((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      return next.map(node => ({
        ...node,
        tags: Array.isArray(node.tags) 
          ? node.tags.filter(t => t !== 'Inspiration') 
          : []
      }));
    });
  }, []);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId,  setHoveredNodeId]  = useState<string | null>(null);
  const [linkFromId,     setLinkFromId]     = useState<string | null>(null);

  // Zoom / pan
  const [zoom,      setZoom]      = useState(1);
  const [pan,       setPan]       = useState({ x: 0, y: 0 });

  // Admin add-node form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc,  setNewDesc]  = useState('');
  const [newImg,   setNewImg]   = useState('');
  const [newTag,   setNewTag]   = useState('');
  const [newType,  setNewType]  = useState<BrainNode['type']>('note');

  // ── Notebook state ──
  const [notebookPages, setNotebookPages] = useState<NotebookPage[]>([]);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [foldedPages,   setFoldedPages]   = useState<string[]>([]);
  const [bookmarks,     setBookmarks]     = useState<string[]>([]);

  // ── Unsaved changes states ──
  const [isWallLoading, setIsWallLoading] = useState(true);
  const [isNotebookLoading, setIsNotebookLoading] = useState(true);
  const [hasUnsavedWall, setHasUnsavedWall] = useState(false);
  const [hasUnsavedNotebook, setHasUnsavedNotebook] = useState(false);
  const [wallSaveStatus, setWallSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [notebookSaveStatus, setNotebookSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<FirebaseErrorDetails | null>(null);
  const [confirmResetWall, setConfirmResetWall] = useState(false);
  const [confirmResetNotebook, setConfirmResetNotebook] = useState(false);

  const hasUnsavedWallRef = useRef(false);
  const hasUnsavedNotebookRef = useRef(false);
  useEffect(() => { hasUnsavedWallRef.current = hasUnsavedWall; }, [hasUnsavedWall]);
  useEffect(() => { hasUnsavedNotebookRef.current = hasUnsavedNotebook; }, [hasUnsavedNotebook]);

  // ── Audio — managed by shared AudioContext ──

  // ─── Drag — ref-based so zero re-renders while dragging ─────────────────
  const dragging = useRef<{
    nodeId: string;
    startMouseX: number;
    startMouseY: number;
    startNodeX: number;  // % at drag start
    startNodeY: number;
  } | null>(null);

  const panning = useRef<{
    startMouseX: number;
    startMouseY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  // Keep latest nodes in a ref so mouse handlers can read without stale closure
  const nodesRef = useRef(nodes);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  const panRef  = useRef(pan);
  useEffect(() => { panRef.current = pan; }, [pan]);
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // ─── Load ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);

    // Check if authenticated
    const hasAdminToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const isCurrentlyAdmin = hasAdminToken === '3f7137d5d93de0be0462cb9a49f330397ea8e68518dad4cd2f4c0344d24c50d3';
    if (isCurrentlyAdmin) {
      setIsAdminMode(true);
    }

    const initData = async () => {
      if (isFirebaseConfigured) {
        // Load Brain Wall from Firebase (using empty array fallback to determine if collection is actually empty)
        let firebaseNodes = await getFirebaseNodes([]);
        let firebaseConnections = await getFirebaseConnections([]);
        
        const isWallEmpty = firebaseNodes.length === 0;
        if (isWallEmpty) {
          // If empty, default to default configurations
          firebaseNodes = DEFAULT_NODES;
          firebaseConnections = DEFAULT_CONNECTIONS;
          
          // Auto-migrate local storage data if it exists
          const adminSaved   = localStorage.getItem(ADMIN_KEY);
          const visitorSaved = localStorage.getItem(VISITOR_KEY);
          const wallData = visitorSaved || adminSaved;
          if (wallData) {
            try {
              const parsed = JSON.parse(wallData);
              if (parsed.nodes && parsed.nodes.length > 0) {
                await saveFirebaseNodes(parsed.nodes);
                await saveFirebaseConnections(parsed.connections || []);
                firebaseNodes = parsed.nodes;
                firebaseConnections = parsed.connections || [];
              }
            } catch (_) {}
          }
        }
        
        setNodes(firebaseNodes as any);
        setConnections(firebaseConnections);
        setIsWallLoading(false);

        // Load Notebook from Firebase
        let firebaseNotebook = await getFirebaseNotebook([], [], []);
        const isNotebookEmpty = firebaseNotebook.pages.length === 0;
        
        if (isNotebookEmpty) {
          firebaseNotebook = {
            pages: DEFAULT_NOTEBOOK_PAGES,
            folded: [],
            bookmarks: []
          };
          
          // Auto-migrate local storage data if it exists
          const nbAdmin   = localStorage.getItem(NOTEBOOK_ADMIN_KEY);
          const nbVisitor = localStorage.getItem(NOTEBOOK_VISITOR_KEY);
          const nbData = nbVisitor || nbAdmin;
          if (nbData) {
            try {
              const parsed = JSON.parse(nbData);
              if (parsed.pages && parsed.pages.length > 0) {
                const migratedPages = parsed.pages;
                const migratedFolded = parsed.folded || [];
                const migratedBookmarks = parsed.bookmarks || [];
                await saveFirebaseNotebook(migratedPages, migratedFolded, migratedBookmarks);
                firebaseNotebook = {
                  pages: migratedPages,
                  folded: migratedFolded,
                  bookmarks: migratedBookmarks
                };
              }
            } catch (_) {}
          }
        }
        
        // Clean up fallback local storage variables so they can never overwrite Firebase changes again
        localStorage.removeItem(ADMIN_KEY);
        localStorage.removeItem(VISITOR_KEY);
        localStorage.removeItem(NOTEBOOK_ADMIN_KEY);
        localStorage.removeItem(NOTEBOOK_VISITOR_KEY);
        
        setNotebookPages(firebaseNotebook.pages);
        setFoldedPages(firebaseNotebook.folded);
        setBookmarks(firebaseNotebook.bookmarks);
        setIsNotebookLoading(false);
      } else {
        // Fallback to local storage (only load adminSaved/nbAdmin for visitors to reset edits on refresh)
        const adminSaved   = localStorage.getItem(ADMIN_KEY);
        const visitorSaved = localStorage.getItem(VISITOR_KEY);
        const wallData = isCurrentlyAdmin ? (visitorSaved || adminSaved) : adminSaved;
        try {
          if (wallData) {
            const p = JSON.parse(wallData);
            setNodes(p.nodes || DEFAULT_NODES);
            setConnections(p.connections || DEFAULT_CONNECTIONS);
          } else {
            setNodes(DEFAULT_NODES);
            setConnections(DEFAULT_CONNECTIONS);
          }
        } catch (_) {
          setNodes(DEFAULT_NODES);
          setConnections(DEFAULT_CONNECTIONS);
        }
        setIsWallLoading(false);

        // Notebook
        const nbAdmin   = localStorage.getItem(NOTEBOOK_ADMIN_KEY);
        const nbVisitor = localStorage.getItem(NOTEBOOK_VISITOR_KEY);
        const nbData = isCurrentlyAdmin ? (nbVisitor || nbAdmin) : nbAdmin;
        try {
          if (nbData) {
            const p = JSON.parse(nbData);
            setNotebookPages(p.pages      || DEFAULT_NOTEBOOK_PAGES);
            setFoldedPages(p.folded       || []);
            setBookmarks(p.bookmarks      || []);
          } else {
            setNotebookPages(DEFAULT_NOTEBOOK_PAGES);
          }
        } catch (_) {
          setNotebookPages(DEFAULT_NOTEBOOK_PAGES);
        }
        setIsNotebookLoading(false);
      }
    };

    initData();

    return () => { obs.disconnect(); stopSounds(); };
  }, []);

  // ─── Real-time Firestore Sync ──────────────────────────────────────────
  useEffect(() => {
    if (!db || !isFirebaseConfigured) return;

    // Listen to brain_nodes changes
    const unsubNodes = onSnapshot(collection(db, 'brain_nodes'), (snapshot) => {
      // Ignore incoming snapshots if we have unsaved local changes or are dragging
      if (!hasUnsavedWallRef.current && !dragging.current) {
        const list: BrainNode[] = [];
        snapshot.forEach((doc) => {
          if (doc.id !== '_metadata') {
            list.push(doc.data() as BrainNode);
          }
        });
        if (list.length > 0) {
          setNodes(list as any);
        }
      }
      setIsWallLoading(false);
    }, (err) => {
      console.error(err);
      setIsWallLoading(false);
    });

    // Listen to brain_connections changes
    const unsubConns = onSnapshot(collection(db, 'brain_connections'), (snapshot) => {
      if (!hasUnsavedWallRef.current) {
        const list: Connection[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Connection);
        });
        setConnections(list);
      }
    });

    // Listen to notebook_pages changes
    const unsubNotebook = onSnapshot(collection(db, 'notebook_pages'), (snapshot) => {
      if (!hasUnsavedNotebookRef.current) {
        const pagesMap: Record<string, NotebookPage> = {};
        let foldedList: string[] = [];
        let bookmarksList: string[] = [];
        let orderList: string[] = [];

        snapshot.forEach((doc) => {
          if (doc.id === '_metadata') {
            const meta = doc.data() as NotebookMetadata;
            foldedList = meta.folded || [];
            bookmarksList = meta.bookmarks || [];
            orderList = meta.order || [];
          } else {
            pagesMap[doc.id] = doc.data() as NotebookPage;
          }
        });

        // Reconstruct pages in their exact stored order
        const orderedPages: NotebookPage[] = [];
        orderList.forEach((id) => {
          if (pagesMap[id]) {
            orderedPages.push(pagesMap[id]);
            delete pagesMap[id];
          }
        });
        
        // Append any remaining pages
        Object.values(pagesMap).forEach((page) => {
          orderedPages.push(page);
        });

        if (orderedPages.length > 0) {
          setNotebookPages(orderedPages);
        }
        setFoldedPages(foldedList);
        setBookmarks(bookmarksList);
      }
      setIsNotebookLoading(false);
    }, (err) => {
      console.error(err);
      setIsNotebookLoading(false);
    });

    return () => {
      unsubNodes();
      unsubConns();
      unsubNotebook();
    };
  }, []);

  // ─── Persist ─────────────────────────────────────────────────────────────

  const saveWall = useCallback(async (ns: BrainNode[], cs: Connection[], admin: boolean) => {
    if (isFirebaseConfigured && admin) {
      await saveFirebaseNodes(ns as any);
      await saveFirebaseConnections(cs);
    } else {
      const key = admin ? ADMIN_KEY : VISITOR_KEY;
      localStorage.setItem(key, JSON.stringify({ nodes: ns, connections: cs }));
      if (admin) localStorage.removeItem(VISITOR_KEY);
    }
  }, []);

  const saveNotebook = useCallback(async (pages: NotebookPage[], folded: string[], bmarks: string[], admin: boolean) => {
    if (isFirebaseConfigured && admin) {
      await saveFirebaseNotebook(pages, folded, bmarks);
    } else {
      const key = admin ? NOTEBOOK_ADMIN_KEY : NOTEBOOK_VISITOR_KEY;
      localStorage.setItem(key, JSON.stringify({ pages, folded, bookmarks: bmarks }));
      if (admin) localStorage.removeItem(NOTEBOOK_VISITOR_KEY);
    }
  }, []);

  // ─── Change Wrappers (Drafts in Admin Mode, Auto-Save in Visitor Mode) ───

  const handleWallChange = useCallback((updatedNodes: BrainNode[], updatedConns: Connection[]) => {
    setNodes(updatedNodes);
    setConnections(updatedConns);
    if (isAdminMode) {
      setHasUnsavedWall(true);
    } else {
      saveWall(updatedNodes, updatedConns, false);
    }
  }, [isAdminMode, saveWall]);

  const handleNotebookChange = useCallback((updatedPages: NotebookPage[], updatedFolded: string[], updatedBmarks: string[]) => {
    setNotebookPages(updatedPages);
    setFoldedPages(updatedFolded);
    setBookmarks(updatedBmarks);
    if (isAdminMode) {
      setHasUnsavedNotebook(true);
    } else {
      saveNotebook(updatedPages, updatedFolded, updatedBmarks, false);
    }
  }, [isAdminMode, saveNotebook]);

  // Calculate status indicators
  const currentWallStatus = 
    wallSaveStatus === 'saving' ? 'saving' :
    wallSaveStatus === 'saved' ? 'saved' :
    wallSaveStatus === 'failed' ? 'failed' :
    hasUnsavedWall ? 'unsaved' : 'saved';

  const currentNotebookStatus = 
    notebookSaveStatus === 'saving' ? 'saving' :
    notebookSaveStatus === 'saved' ? 'saved' :
    notebookSaveStatus === 'failed' ? 'failed' :
    hasUnsavedNotebook ? 'unsaved' : 'saved';

  // Prevent leaving page with unsaved changes in brain wall or notebook
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedWall || hasUnsavedNotebook) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedWall, hasUnsavedNotebook]);

  // Keyboard shortcut Ctrl+S trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        if (isAdminMode) {
          let intercepted = false;
          if (hasUnsavedWall && wallSaveStatus !== 'saving') {
            e.preventDefault();
            handleSaveWall();
            intercepted = true;
          }
          if (hasUnsavedNotebook && notebookSaveStatus !== 'saving') {
            e.preventDefault();
            handleSaveNotebook();
            intercepted = true;
          }
          if (intercepted) {
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminMode, hasUnsavedWall, hasUnsavedNotebook, wallSaveStatus, notebookSaveStatus, nodes, connections, notebookPages, foldedPages, bookmarks]);

  const handleSaveWall = async () => {
    setWallSaveStatus('saving');
    try {
      await saveWall(nodes, connections, true);
      
      // Refetch from Firebase to ensure local UI matches actual cloud data
      if (isFirebaseConfigured) {
        const fbNodes = await getFirebaseNodes(nodes as any);
        const fbConns = await getFirebaseConnections(connections);
        setNodes((fbNodes as any).sort((a: any, b: any) => (a.pinned === b.pinned ? 0 : a.pinned ? 1 : -1)));
        setConnections(fbConns as any);
      }
      
      setHasUnsavedWall(false);
      setWallSaveStatus('saved');
      setTimeout(() => setWallSaveStatus('idle'), 2000);
    } catch (e: any) {
      console.error("Error saving wall changes:", e);
      setWallSaveStatus('failed');
      const details = formatFirebaseError(e, 'brain_nodes / brain_connections', 'batch write', 'writeBatch.commit', { nodes, connections });
      setErrorDetails(details);
      setErrorModalOpen(true);
    }
  };

  const handleSaveNotebook = async () => {
    setNotebookSaveStatus('saving');
    try {
      await saveNotebook(notebookPages, foldedPages, bookmarks, true);
      
      // Refetch from Firebase to ensure local UI matches actual cloud data
      if (isFirebaseConfigured) {
        const res = await getFirebaseNotebook(notebookPages, foldedPages, bookmarks);
        setNotebookPages(res.pages);
        setFoldedPages(res.folded);
        setBookmarks(res.bookmarks);
      }
      
      setHasUnsavedNotebook(false);
      setNotebookSaveStatus('saved');
      setTimeout(() => setNotebookSaveStatus('idle'), 2000);
    } catch (e: any) {
      console.error("Error saving notebook changes:", e);
      setNotebookSaveStatus('failed');
      const details = formatFirebaseError(e, 'notebook_pages', 'all documents batch', 'writeBatch.commit', { notebookPages, foldedPages, bookmarks });
      setErrorDetails(details);
      setErrorModalOpen(true);
    }
  };

  // ─── Mouse handlers (wall) ────────────────────────────────────────────────

  const onNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node || node.pinned) return;

    dragging.current = {
      nodeId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNodeX: node.x,
      startNodeY: node.y,
    };
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    panning.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPanX: panRef.current.x,
      startPanY: panRef.current.y,
    };
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { width, height } = canvas.getBoundingClientRect();
      const { nodeId, startMouseX, startMouseY, startNodeX, startNodeY } = dragging.current;
      const dxPx = (e.clientX - startMouseX) / zoomRef.current;
      const dyPx = (e.clientY - startMouseY) / zoomRef.current;
      const dxPct = (dxPx / width)  * 100;
      const dyPct = (dyPx / height) * 100;
      const newX = Math.max(0, Math.min(90, startNodeX + dxPct));
      const newY = Math.max(0, Math.min(90, startNodeY + dyPct));

      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x: newX, y: newY } : n));
    } else if (panning.current) {
      const { startMouseX, startMouseY, startPanX, startPanY } = panning.current;
      setPan({
        x: startPanX + (e.clientX - startMouseX),
        y: startPanY + (e.clientY - startMouseY),
      });
    }
  }, []);

  const onMouseUp = useCallback(() => {
    if (dragging.current) {
      const { nodeId } = dragging.current;
      dragging.current = null;
      if (isAdminMode) {
        setHasUnsavedWall(true);
      } else {
        saveWall(nodesRef.current, connections, false);
      }
      void nodeId;
    }
    panning.current = null;
  }, [connections, isAdminMode, saveWall]);

  // Native non-passive wheel listener to allow Ctrl+scroll zoom towards cursor without page scrolling glitch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        // Calculate new zoom level
        const delta = -e.deltaY * 0.0015;
        const oldZoom = zoomRef.current;
        const newZoom = Math.max(0.4, Math.min(2.5, oldZoom + delta));

        // Get cursor position relative to the canvas bounding rectangle
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Current pan offset
        const currentPan = panRef.current;

        // Calculate new pan to keep mouse cursor as the zoom anchor pivot
        const factor = newZoom / oldZoom;
        const newPanX = mouseX - (mouseX - currentPan.x) * factor;
        const newPanY = mouseY - (mouseY - currentPan.y) * factor;

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // ─── Node click (select / open) ──────────────────────────────────────────

  const onNodeClick = (node: BrainNode, e: React.MouseEvent) => {
    e.stopPropagation();

    if (linkFromId && isAdminMode) {
      // Finish linking
      if (linkFromId !== node.id) {
        const exists = connections.some(
          c => (c.from === linkFromId && c.to === node.id) || (c.from === node.id && c.to === linkFromId)
        );
        if (!exists) {
          const updated = [...connections, { from: linkFromId, to: node.id }];
          handleWallChange(nodesRef.current, updated);
        }
      }
      setLinkFromId(null);
      return;
    }

    if (selectedNodeId === node.id) {
      // Second click → open overlay
      setSelectedNodeId(null);
      openNodeOverlay(node);
    } else {
      setSelectedNodeId(node.id);
    }
  };

  const onCanvasClick = () => { setSelectedNodeId(null); setLinkFromId(null); };

  // ─── Node overlay ─────────────────────────────────────────────────────────

  const openNodeOverlay = (node: BrainNode) => {
    setActiveOverlay({
      title: node.title,
      content: (
        <NodeOverlayContent
          node={node}
          isAdminMode={isAdminMode}
          onSave={(updatedNode) => {
            const updated = nodesRef.current.map(n => n.id === updatedNode.id ? updatedNode : n);
            handleWallChange(updated, connections);
            // Re-open node overlay with updated details to update title/content immediately
            openNodeOverlay(updatedNode);
          }}
        />
      )
    });
  };

  // ─── Admin: node CRUD ────────────────────────────────────────────────────

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    const node: BrainNode = {
      id: 'n_' + Date.now(),
      type: newType,
      title: newTitle,
      desc: newDesc,
      tags: newTag.trim() ? newTag.split(',').map(t => t.trim()).filter(Boolean) : [],
      image: newImg || undefined,
      x: 20 + Math.random() * 50,
      y: 20 + Math.random() * 50,
      size: 'md',
      rotation: Math.round(Math.random() * 14) - 7,
      pinned: false,
    };
    const updated = [...nodes, node];
    handleWallChange(updated, connections);
    setNewTitle(''); setNewDesc(''); setNewImg(''); setNewTag('');
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = nodes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
    handleWallChange(updated, connections);
  };
  const rotateNode = (id: string, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const amount = direction === 'left' ? -15 : 15;
    const updated = nodes.map(n => n.id === id ? { ...n, rotation: n.rotation + amount } : n);
    handleWallChange(updated, connections);
  };
  const resizeNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = nodes.map(n => {
      if (n.id !== id) return n;
      const s: BrainNode['size'] = n.size === 'sm' ? 'md' : n.size === 'md' ? 'lg' : 'sm';
      return { ...n, size: s };
    });
    handleWallChange(updated, connections);
  };

  const deleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ns = nodes.filter(n => n.id !== id);
    const cs = connections.filter(c => c.from !== id && c.to !== id);
    handleWallChange(ns, cs);
  };

  const removeNodeConns = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = connections.filter(c => c.from !== id && c.to !== id);
    handleWallChange(nodesRef.current, updated);
  };

  // ─── Reset ───────────────────────────────────────────────────────────────

  const resetWall = async () => {
    if (isAdminMode) {
      // Admin: reload their own saved data from Firebase
      if (isFirebaseConfigured && db) {
        const firebaseNodes = await getFirebaseNodes(DEFAULT_NODES);
        const firebaseConnections = await getFirebaseConnections(DEFAULT_CONNECTIONS);
        setNodes(firebaseNodes as any);
        setConnections(firebaseConnections);
      } else {
        const admin = localStorage.getItem(ADMIN_KEY);
        if (admin) {
          const p = JSON.parse(admin);
          setNodes(p.nodes || DEFAULT_NODES);
          setConnections(p.connections || DEFAULT_CONNECTIONS);
        } else {
          setNodes(DEFAULT_NODES as any); setConnections(DEFAULT_CONNECTIONS);
        }
      }
      setHasUnsavedWall(false);
      setConfirmResetWall(false);
    } else {
      // Visitor: wipe their local overrides, reload the admin-saved layout from Firebase
      localStorage.removeItem(VISITOR_KEY);
      if (isFirebaseConfigured && db) {
        const firebaseNodes = await getFirebaseNodes(DEFAULT_NODES);
        const firebaseConnections = await getFirebaseConnections(DEFAULT_CONNECTIONS);
        setNodes(firebaseNodes as any);
        setConnections(firebaseConnections);
      } else {
        const admin = localStorage.getItem(ADMIN_KEY);
        if (admin) {
          const p = JSON.parse(admin);
          setNodes(p.nodes || DEFAULT_NODES);
          setConnections(p.connections || DEFAULT_CONNECTIONS);
        } else {
          setNodes(DEFAULT_NODES as any); setConnections(DEFAULT_CONNECTIONS);
        }
      }
    }
    setSelectedNodeId(null); setLinkFromId(null);
    setZoom(1); setPan({ x: 0, y: 0 });
  };

  const resetNotebook = async () => {
    if (isAdminMode) {
      // Admin: reload saved data from Firebase
      if (isFirebaseConfigured && db) {
        const firebaseNotebook = await getFirebaseNotebook(DEFAULT_NOTEBOOK_PAGES, [], []);
        setNotebookPages(firebaseNotebook.pages);
        setFoldedPages(firebaseNotebook.folded);
        setBookmarks(firebaseNotebook.bookmarks);
      } else {
        const admin = localStorage.getItem(NOTEBOOK_ADMIN_KEY);
        if (admin) {
          const p = JSON.parse(admin);
          setNotebookPages(p.pages || DEFAULT_NOTEBOOK_PAGES);
          setFoldedPages(p.folded || []); setBookmarks(p.bookmarks || []);
        } else {
          setNotebookPages(DEFAULT_NOTEBOOK_PAGES);
          setFoldedPages([]); setBookmarks([]);
        }
      }
      setHasUnsavedNotebook(false);
      setConfirmResetNotebook(false);
    } else {
      // Visitor: wipe their local saved state so refresh also resets
      localStorage.removeItem(NOTEBOOK_VISITOR_KEY);
      setNotebookPages(DEFAULT_NOTEBOOK_PAGES);
      setFoldedPages([]); setBookmarks([]);
    }
    setActivePageIdx(0);
  };

  // ─── Admin mode ───────────────────────────────────────────────────────────

  async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const toggleAdmin = () => {
    if (isAdminMode) {
      if (hasUnsavedWall || hasUnsavedNotebook) {
        if (!window.confirm("DISCARD ALL UNSAVED CHANGES AND LOGOUT?")) {
          return;
        }
      }
      setIsAdminMode(false);
      setHasUnsavedWall(false);
      setHasUnsavedNotebook(false);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      // Force reload from DB to ensure local state reflects live database
      if (isFirebaseConfigured && db) {
        getFirebaseNodes(DEFAULT_NODES).then(ns => setNodes(ns as any));
        getFirebaseConnections(DEFAULT_CONNECTIONS).then(cs => setConnections(cs));
        getFirebaseNotebook(DEFAULT_NOTEBOOK_PAGES, [], []).then(nb => {
          setNotebookPages(nb.pages);
          setFoldedPages(nb.folded);
          setBookmarks(nb.bookmarks);
        });
      }
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
      setAdminPwError('ACCESS DENIED // CORRUPT COORDINATES');
    }
  };

  // ─── Notebook helpers ────────────────────────────────────────────────────

  const editContent = (val: string) => {
    const updated = notebookPages.map((p, i) => i === activePageIdx ? { ...p, content: val } : p);
    handleNotebookChange(updated, foldedPages, bookmarks);
  };

  const editTitle = (val: string) => {
    const updated = notebookPages.map((p, i) => i === activePageIdx ? { ...p, title: val } : p);
    handleNotebookChange(updated, foldedPages, bookmarks);
  };

  const addPage = () => {
    const np: NotebookPage = { id: 'p_' + Date.now(), title: 'New Idea Log', content: '' };
    const updated = [...notebookPages, np];
    handleNotebookChange(updated, foldedPages, bookmarks);
    setActivePageIdx(updated.length - 1);
  };

  const deleteCurPage = () => {
    if (notebookPages.length <= 1) return;
    const pid = notebookPages[activePageIdx].id;
    const updated = notebookPages.filter((_, i) => i !== activePageIdx);
    const f2 = foldedPages.filter(id => id !== pid);
    const b2 = bookmarks.filter(id => id !== pid);
    handleNotebookChange(updated, f2, b2);
    setActivePageIdx(0);
  };

  const toggleFold = (pid: string) => {
    const f2 = foldedPages.includes(pid) ? foldedPages.filter(id => id !== pid) : [...foldedPages, pid];
    handleNotebookChange(notebookPages, f2, bookmarks);
  };

  const toggleBookmark = (pid: string) => {
    const b2 = bookmarks.includes(pid) ? bookmarks.filter(id => id !== pid) : [...bookmarks, pid];
    handleNotebookChange(notebookPages, foldedPages, b2);
  };

  const toggleHighlight = (pid: string) => {
    const updated = notebookPages.map(p => p.id === pid ? { ...p, highlighted: !p.highlighted } : p);
    handleNotebookChange(updated, foldedPages, bookmarks);
  };

  const movePage = (idx: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= notebookPages.length) return;
    const updated = [...notebookPages];
    const temp = updated[idx];
    updated[idx] = updated[nextIdx];
    updated[nextIdx] = temp;
    handleNotebookChange(updated, foldedPages, bookmarks);
    if (activePageIdx === idx) {
      setActivePageIdx(nextIdx);
    } else if (activePageIdx === nextIdx) {
      setActivePageIdx(idx);
    }
  };

  // ─── Audio — delegated to shared AudioContext ────────────────────────────



  // ─── Derived highlight state ──────────────────────────────────────────────

  const connectedToSelected = (nodeId: string): boolean => {
    if (!selectedNodeId) return true;
    if (selectedNodeId === nodeId) return true;
    return connections.some(c =>
      (c.from === selectedNodeId && c.to === nodeId) ||
      (c.to   === selectedNodeId && c.from === nodeId)
    );
  };

  const isConnectionHighlighted = (c: Connection): boolean => {
    if (!selectedNodeId) return true;
    return c.from === selectedNodeId || c.to === selectedNodeId;
  };

  // ─── Hotspot overlays ────────────────────────────────────────────────────

  const openDeskOverlay = () => setActiveOverlay({
    title: 'EDITING STATION',
    content: (
      <div className="space-y-6 text-left text-xs leading-relaxed font-mono">
        <div className="border border-white/10 rounded overflow-hidden bg-[#181818] p-2 space-y-2 select-none shadow-xl">
          <div className="flex justify-between items-center text-[8px] bg-[#1c1c1c] p-1.5 text-neutral-400 border-b border-white/5">
            <div className="flex gap-2"><span>File</span><span>Edit</span><span>Trim</span><span>Timeline</span><span>Clip</span></div>
            <span className="text-white">HIMANSHU_TIMELINE_V1 // DaVinci Resolve</span>
          </div>
          <div className="grid grid-cols-2 gap-2 h-28">
            <div className="bg-black border border-white/5 flex items-center justify-center relative">
              <span className="text-[7px] text-neutral-500">Source Monitor</span>
              <div className="absolute bottom-1 left-2 text-[6px] text-neutral-400">00:02:14:08</div>
            </div>
            <div className="bg-black border border-white/5 flex items-center justify-center relative">
              <span className="text-[7px] text-neutral-500">Timeline Output</span>
              <div className="absolute bottom-1 left-2 text-[6px] text-neutral-400">00:15:32:20</div>
            </div>
          </div>
          <div className="bg-[#121212] border border-white/5 p-2 rounded-sm space-y-1.5 relative">
            <div className="h-full bg-[#C62828] absolute top-0 bottom-0 left-1/3 w-[1px] z-20"></div>
            <div className="flex items-center gap-2">
              <span className="text-[7px] text-neutral-500 w-4">V1</span>
              <div className="flex-grow flex gap-1 h-3">
                <div className="w-12 bg-sky-900 border border-sky-600 rounded-sm text-[5px] text-white flex items-center px-1">ClipA.mp4</div>
                <div className="w-16 bg-sky-900 border border-sky-600 rounded-sm text-[5px] text-white flex items-center px-1">ClipB_Ramp.mp4</div>
                <div className="w-8 bg-sky-900 border border-sky-600 rounded-sm text-[5px] text-white flex items-center px-1">Title</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[7px] text-neutral-500 w-4">A1</span>
              <div className="flex-grow flex gap-1 h-3">
                <div className="w-16 bg-emerald-900 border border-emerald-600 rounded-sm text-[5px] text-white flex items-center px-1">Sfx_Bass.wav</div>
                <div className="w-12 bg-emerald-900 border border-emerald-600 rounded-sm text-[5px] text-white flex items-center px-1">Dialogue.wav</div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div><span className="text-white font-bold block">ASUS TUF A15</span><span className="text-neutral-500 text-[10px]">RTX 3050, 1TB SSD, AMD Ryzen 7</span></div>
          <div><span className="text-white font-bold block">Chai & Coke</span><span className="text-neutral-500 text-[10px]">Hot chai + a collection of Diet Coke cans</span></div>
        </div>
        <p className="text-neutral-500 text-[10px]">Mechanical keyboard, gaming mouse, IEM earphones, external SSD, USB drives, notebook, pen, sticky notes.</p>
      </div>
    )
  });

  const openCRTOverlay = () => setActiveOverlay({
    title: 'WATCH & REVIEW LOG',
    content: (
      <div className="space-y-5 text-left text-xs leading-relaxed font-mono">
        <div className="flex justify-between border-b border-white/[0.04] pb-4">
          <span className="text-white font-serif-cinematic text-lg">Watch & Review Log</span>
          <div className="flex gap-4 text-[9px]">
            <a href="https://letterboxd.com/HimanshuMer1/" target="_blank" rel="noreferrer" className="text-[#C62828] hover:underline">Letterboxd</a>
            <a href="https://www.moctale.in/u/Himanshumer1" target="_blank" rel="noreferrer" className="text-[#2E8BC0] hover:underline">Moctale</a>
          </div>
        </div>
        {[
          { film: 'GOOD WILL HUNTING (1997)', quote: '"Real loss is only possible when you love something more than you love yourself."', rating: '🟢 Perfection' },
          { film: 'DEAD POETS SOCIETY (1989)', quote: '"Carpe Diem. Seize the day, boys. Make your lives extraordinary."', rating: '🟢 Perfection' },
          { film: 'FORREST GUMP (1994)', quote: '"Life is like a box of chocolates. You never know what you\'re gonna get."', rating: '🟢 Perfection' },
        ].map(item => (
          <div key={item.film} className="p-4 border border-white/5 bg-neutral-900/40 rounded-sm space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-[2px] bg-[#35D07F]"></div>
            <div className="flex justify-between text-[#35D07F] font-bold text-[10px]">
              <span>{item.film}</span><span>{item.rating}</span>
            </div>
            <p className="text-neutral-400 italic">{item.quote}</p>
          </div>
        ))}
      </div>
    )
  });

  const openCharactersOverlay = () => setActiveOverlay({
    title: 'CHARACTERS THAT BUILT ME',
    content: (
      <div className="space-y-5 text-left text-xs leading-relaxed font-mono">
        <p className="text-neutral-400 font-serif-cinematic text-base italic">"These aren't just characters. They're the parts of me I found in fiction."</p>
        {[
          {
            name: 'BATMAN',
            label: 'Discipline & Darkness',
            color: '#D4AF37',
            why: 'Bruce Wayne lost everything and chose to become something. I relate to that — the idea that pain doesn\'t have to destroy you. It can define you. Batman showed me that you can choose who you become, regardless of what happened to you.',
            mindset: 'I don\'t wait to feel ready. I show up, I prepare, I execute. Every single day, regardless of mood — that\'s the Batman in me.',
          },
          {
            name: 'MONKEY D. LUFFY',
            label: 'Freedom & Loyalty',
            color: '#2E8BC0',
            why: 'Luffy never doubts himself. He doesn\'t overthink. He doesn\'t ask permission. He just goes. That raw, fearless conviction — I want that in every decision I make in life. He also never abandons the people he loves.',
            mindset: 'I choose my crew carefully. Once you\'re in, I\'ll go to the ends of the world for you. That\'s just who I am.',
          },
          {
            name: 'PETER PARKER',
            label: 'Heart & Responsibility',
            color: '#C62828',
            why: 'Peter is the most human superhero. He fails, he cries, he gets back up. He cares deeply — about people, about doing the right thing — even when no one\'s watching. I feel like him more than any other character.',
            mindset: 'I genuinely care. About people, about quality, about impact. I can\'t do things halfway. That\'s not a skill — that\'s just me.',
          },
          {
            name: 'BEN 10',
            label: 'Curiosity & Adaptability',
            color: '#35D07F',
            why: 'Ben was just a kid with a watch and infinite possibilities. He figured it out as he went. That\'s exactly how I feel about life — I don\'t always have a plan, but I adapt fast. Growing up watching Ben taught me that curiosity is a superpower.',
            mindset: 'I get bored if I\'m not learning something new. That\'s not a flaw — it\'s how I\'m wired.',
          },
        ].map(c => (
          <div key={c.name} className="p-4 border border-white/5 bg-white/[0.01] space-y-3">
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
              <span className="font-bold text-white">{c.name}</span>
              <span className="text-[9px]" style={{ color: c.color }}>{c.label}</span>
            </div>
            <div><span className="text-neutral-500 text-[9px] uppercase tracking-widest block mb-1">Why they connect with me</span><p className="text-neutral-350">{c.why}</p></div>
            <div><span className="text-neutral-500 text-[9px] uppercase tracking-widest block mb-1">How it shows in my life</span><p className="text-neutral-350 italic">{c.mindset}</p></div>
          </div>
        ))}
      </div>
    )
  });

  const openComputerOverlay = () => setActiveOverlay({
    title: 'UNLOCKED DESKTOP',
    content: (
      <div className="space-y-5 text-left text-xs font-mono">
        <span className="text-[8px] uppercase tracking-widest text-[#D4AF37] block">C:\USERS\HIMANSHUMER1\DESKTOP</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['Projects', 'Footage', 'Exports', 'References', 'Music'].map(f => (
            <div key={f} className="p-3 border border-white/5 bg-white/[0.01] flex items-center gap-2 rounded-sm text-neutral-400">
              <Folder className="w-4 h-4 text-neutral-500" /><span>{f}</span>
            </div>
          ))}
          <div className="p-3 border border-[#C62828]/30 bg-[#C62828]/5 flex items-center gap-2 rounded-sm text-[#C62828] border-dashed">
            <Lock className="w-4 h-4" /><span>Unclosed</span>
          </div>
        </div>
        <div className="p-4 border border-[#C62828]/20 bg-[#C62828]/5 rounded text-[9px] text-[#C62828] space-y-1">
          <div>📂 UNCLOSED FILES:</div>
          <div>• Labuk Jabuk.mp4</div>
          <div>• I Didn't Kill Her.mp4</div>
          <div>• Dreams.mp4</div>
        </div>
      </div>
    )
  });

  // ─── Node card styles ─────────────────────────────────────────────────────

  const nodeCardClass = (node: BrainNode, isSelected: boolean, isLinker: boolean) => {
    const base = 'absolute select-none group transition-[opacity,box-shadow] duration-200';
    const sizeW = `w-[${NODE_SIZE_MAP[node.size]}px]`;
    const bg =
      isLinker     ? 'bg-black/70 border-[#C62828] shadow-[0_0_20px_rgba(198,40,40,0.3)]' :
      isSelected   ? 'border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.08)]' :
      node.type === 'polaroid' ? 'bg-[#121212] border-white/10' :
      node.type === 'note'     ? 'bg-[#1e1b15] border-[#D4AF37]/25' :
      node.type === 'ticket'   ? 'bg-[#1a0e0e] border-[#C62828]/25' :
      node.type === 'location' ? 'bg-[#0f1411] border-[#35D07F]/25' :
                                 'bg-[#0f1318] border-[#2E8BC0]/25';
    return `${base} ${sizeW} p-3 border rounded cursor-grab active:cursor-grabbing shadow-xl ${bg}`;
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section
      id="inside-head"
      ref={sectionRef}
      className="relative py-16 md:py-20 bg-[#080808]"
    >
      <style dangerouslySetInnerHTML={{__html: `
        /* Float animation uses translateY only — never conflicts with the outer rotate() transform */
        @keyframes node-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-4px); }
        }
        .node-float-wrap {
          animation: node-float 5s ease-in-out infinite;
        }
        /* Stagger delay variants so cards don't all move in sync */
        .node-float-wrap:nth-child(2n)   { animation-duration: 6.5s; }
        .node-float-wrap:nth-child(3n)   { animation-duration: 4.2s; animation-delay: -1.5s; }
        .node-float-wrap:nth-child(4n)   { animation-duration: 7s;   animation-delay: -3s; }
      `}} />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className={`mb-12 md:mb-16 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <span className="text-neutral-500 text-xs uppercase tracking-[0.3em] font-semibold mb-3 block font-mono">
            05 // CREATIVE DNA
          </span>
          <h2 className="text-5xl md:text-7xl text-white font-display-cinematic tracking-wider">INSIDE MY HEAD</h2>
          <div className="w-16 h-px bg-[#D4AF37] mt-4"></div>
        </div>


        {/* ── Room Hotspots ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'STATION CORE', title: 'Editing Station',     sub: 'ASUS TUF A15 + DaVinci Resolve timeline.', color: '#D4AF37', action: openDeskOverlay,       cta: 'INSPECT DESK' },
            { label: 'WATCH LOG',    title: 'Watch & Review Log',  sub: 'Good Will Hunting · Dead Poets · Forrest Gump.', color: '#C62828', action: openCRTOverlay, cta: 'WAKE CRT TV' },
            { label: 'PHILOSOPHY',   title: 'Characters That Built Me', sub: 'Batman · Luffy · Peter Parker · Ben 10.', color: '#2E8BC0', action: openCharactersOverlay, cta: 'VIEW SHELF' },
            { label: 'DIRECTORIES',  title: 'Unlocked Desktop',    sub: 'Folder archive + unclosed files.', color: '#35D07F', action: openComputerOverlay, cta: 'OPEN WORKSTATION' },
          ].map(item => (
            <div
              key={item.title}
              onClick={item.action}
              className="glass-card rounded p-5 hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col justify-between h-[160px] group interactive-item"
            >
              <div className="space-y-1.5">
                <span className="text-[7px] uppercase tracking-widest font-mono font-medium block" style={{ color: item.color }}>{item.label}</span>
                <h4 className="text-base font-light text-white font-serif-cinematic group-hover:underline">{item.title}</h4>
                <p className="text-[10px] text-neutral-500 font-light leading-relaxed">{item.sub}</p>
              </div>
              <div className="text-[7px] font-mono text-neutral-600 flex justify-between pt-2 border-t border-white/[0.03] uppercase">
                <span>{item.cta}</span><span>ENTER →</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── THE BRAIN WALL ────────────────────────────────────────────── */}
        <div className="mb-20 space-y-5">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/[0.04] pb-5 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-[#C62828] font-mono block">CENTERPIECE // INSPIRATION CANVAS</span>
              <h3 className="text-4xl font-light text-white font-serif-cinematic">THE BRAIN WALL</h3>
              <p className="text-[11px] text-neutral-500 max-w-lg leading-relaxed font-mono">
                Drag cards freely · Hold Ctrl + Scroll to zoom on cursor · Click once to highlight connections · Click twice to open · Drag background to pan
              </p>
            </div>
            <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-widest flex-wrap">
              {isAdminMode && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 mr-1 animate-fade-in">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      currentWallStatus === 'saving' ? 'bg-blue-500 animate-pulse' :
                      currentWallStatus === 'saved' ? 'bg-[#35D07F]' :
                      currentWallStatus === 'failed' ? 'bg-red-500 animate-pulse' :
                      currentWallStatus === 'unsaved' ? 'bg-amber-500' : 'bg-neutral-600'
                    }`} />
                    <span className={`text-[8px] font-mono tracking-wider ${
                      currentWallStatus === 'saving' ? 'text-blue-400 font-bold' :
                      currentWallStatus === 'saved' ? 'text-[#35D07F] font-bold' :
                      currentWallStatus === 'failed' ? 'text-red-500 font-bold' :
                      currentWallStatus === 'unsaved' ? 'text-amber-500 font-bold' : 'text-neutral-500'
                    }`}>
                      {currentWallStatus === 'saving' ? 'Saving...' :
                       currentWallStatus === 'saved' ? 'Saved' :
                       currentWallStatus === 'failed' ? 'Save Failed' :
                       currentWallStatus === 'unsaved' ? 'Unsaved Changes' : 'Saved'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveWall}
                    disabled={!hasUnsavedWall || currentWallStatus === 'saving' || currentWallStatus === 'saved'}
                    className={`px-4 py-2 border rounded flex items-center gap-1.5 font-bold transition-all duration-200 cursor-pointer ${
                      currentWallStatus === 'saving' ? 'border-neutral-800 bg-neutral-900/50 text-neutral-500 cursor-not-allowed' :
                      currentWallStatus === 'saved' ? 'border-[#35D07F]/30 bg-[#35D07F]/10 text-[#35D07F]' :
                      currentWallStatus === 'failed' ? 'border-red-500/30 bg-red-950/10 text-red-500 hover:bg-red-950/20' :
                      !hasUnsavedWall ? 'border-white/5 bg-neutral-900/20 text-neutral-600 cursor-not-allowed' :
                      'border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {currentWallStatus === 'saving' ? (
                      <>
                        <svg className="animate-spin h-3 w-3 text-neutral-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Save
                      </>
                    ) : currentWallStatus === 'saved' ? (
                      <>✓ Save</>
                    ) : currentWallStatus === 'failed' ? (
                      <>Save</>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              )}
              <div className="flex border border-white/10 rounded overflow-hidden">
                <button onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} className="px-3 py-2 bg-white/5 hover:bg-white/10 border-r border-white/10 text-white">−</button>
                <span className="px-3 py-2 text-neutral-400 bg-neutral-900 min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(2.5, z + 0.15))} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white">+</button>
              </div>
              <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="px-4 py-2 border border-white/10 rounded hover:border-white text-neutral-400 hover:text-white interactive-item">FIT</button>
              {isAdminMode
                ? confirmResetWall
                  ? <span className="flex items-center gap-1.5 font-mono text-[9px]">
                      <span className="text-amber-400">Sure?</span>
                      <button type="button" onClick={resetWall} className="px-2.5 py-1.5 bg-red-900/40 border border-red-500/30 text-red-400 rounded hover:bg-red-900/60 transition-colors">YES</button>
                      <button type="button" onClick={() => setConfirmResetWall(false)} className="px-2.5 py-1.5 border border-white/10 text-neutral-400 rounded hover:border-white/30 transition-colors">NO</button>
                    </span>
                  : <button type="button" onClick={() => setConfirmResetWall(true)} className="px-4 py-2 border border-white/10 rounded hover:border-red-500/40 text-neutral-400 hover:text-red-400 flex items-center gap-1.5 interactive-item transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" /> RESET
                    </button>
                : <button type="button" onClick={resetWall} className="px-4 py-2 border border-white/10 rounded hover:border-white/30 text-neutral-400 hover:text-white flex items-center gap-1.5 interactive-item transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> RESET
                  </button>
              }
              <button onClick={toggleAdmin} className={`px-4 py-2 border rounded flex items-center gap-2 interactive-item ${isAdminMode ? 'border-[#C62828] bg-[#C62828]/10 text-white' : 'border-white/10 text-neutral-400 hover:text-white'}`}>
                {isAdminMode ? <Lock className="w-3.5 h-3.5 text-[#C62828]" /> : <Unlock className="w-3.5 h-3.5" />}
                {isAdminMode ? 'ADMIN' : 'VISITOR'}
              </button>
            </div>
          </div>

          {/* Admin add node form */}
          {isAdminMode && (
            <form onSubmit={handleAddNode} className="p-5 border border-[#C62828]/20 bg-[#C62828]/5 rounded space-y-3 font-mono text-[9px]">
              <div className="text-[#C62828] font-bold uppercase tracking-widest">// ADMIN: Add Node</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" className="bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20" />
                <input required value={newDesc}  onChange={e => setNewDesc(e.target.value)}  placeholder="Description" className="bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20" />
                <input         value={newImg}   onChange={e => setNewImg(e.target.value)}   placeholder="Image URL (optional)" className="bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20" />
                <input         value={newTag}   onChange={e => setNewTag(e.target.value)}   placeholder="Tag (optional)" className="bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20" />
                <div className="flex gap-2">
                  <select value={newType} onChange={e => setNewType(e.target.value as any)} className="flex-grow bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none uppercase">
                    {(['note','polaroid','ticket','location','quote'] as const).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="submit" className="px-3 bg-white hover:bg-neutral-200 text-black font-bold rounded-sm flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {linkFromId && <p className="text-[#C62828] animate-pulse">🔗 Click another node to create connection…</p>}
            </form>
          )}

          {/* Canvas */}
          <div
            ref={canvasRef}
            onMouseDown={onCanvasMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onClick={onCanvasClick}
            className="relative w-full h-[600px] bg-[#060606] border border-white/[0.06] rounded overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ userSelect: 'none' }}
          >
            {/* Animated grid inside panned/zoomed viewport */}
            <div
              className="absolute inset-0 origin-top-left"
              style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, willChange: 'transform' }}
            >
              {/* Dot grid background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
              />

              {/* SVG connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                <defs>
                  <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                {connections.map((c, i) => {
                  const a = nodes.find(n => n.id === c.from);
                  const b = nodes.find(n => n.id === c.to);
                  if (!a || !b) return null;
                  const highlighted = isConnectionHighlighted(c);
                  return (
                    <line
                      key={i}
                      x1={`${a.x}%`} y1={`${a.y}%`}
                      x2={`${b.x}%`} y2={`${b.y}%`}
                      stroke={highlighted ? '#D4AF37' : '#ffffff'}
                      strokeWidth={highlighted ? 1.5 : 0.5}
                      strokeOpacity={highlighted ? 0.7 : 0.08}
                      filter={highlighted ? 'url(#glow)' : undefined}
                      strokeDasharray={highlighted ? undefined : '4 6'}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </svg>

              {/* Node cards */}
              {nodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                const isLinker   = linkFromId === node.id;
                const isDimmed   = selectedNodeId ? !connectedToSelected(node.id) : false;
                const isHovered  = hoveredNodeId === node.id;

                return (
                  /*
                   * Two-layer approach:
                   *   outer div  — handles position (left/top) + rotation + scale via inline transform
                   *   inner div  — handles the float/bob animation via translateY ONLY
                   *   This ensures CSS keyframe animation never overwrites the rotation.
                   */
                  <div
                    key={node.id}
                    data-node="true"
                    onMouseDown={e => onNodeMouseDown(node.id, e)}
                    onClick={e => onNodeClick(node, e)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{
                      position: 'absolute',
                      left: `${node.x}%`,
                      top:  `${node.y}%`,
                      width: `${NODE_SIZE_MAP[node.size]}px`,
                      transform: `translate(-50%, -50%) rotate(${node.rotation}deg) scale(${isHovered || isSelected ? 1.04 : 1})`,
                      opacity: isDimmed ? 0.18 : 1,
                      filter: isDimmed ? 'blur(0.5px)' : 'none',
                      zIndex: isSelected ? 50 : isHovered ? 40 : 10,
                      transition: 'opacity 0.25s, filter 0.25s, box-shadow 0.2s, transform 0.18s',
                      cursor: node.pinned ? 'default' : 'grab',
                    }}
                  >
                    {/* Inner float wrapper — translateY animation only, never touches rotate */}
                    <div
                      className={`node-float-wrap relative group ${nodeCardClass(node, isSelected, isLinker)}`}
                      style={{ width: '100%' }}
                    >
                      {/* Action icons — onMouseDown on wrapper stops drag swallowing clicks */}
                      <div
                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-30"
                        onMouseDown={e => e.stopPropagation()}
                      >
                        <button onClick={e => togglePin(node.id, e)} title="Pin" className="w-5 h-5 bg-neutral-900 border border-white/10 rounded flex items-center justify-center hover:border-white">
                          <Pin className={`w-2.5 h-2.5 ${node.pinned ? 'text-[#C62828]' : 'text-neutral-400'}`} />
                        </button>
                        <button onClick={e => rotateNode(node.id, 'left', e)} title="Rotate Left" className="w-5 h-5 bg-neutral-900 border border-white/10 rounded flex items-center justify-center hover:border-white">
                          <RotateCcw className="w-2.5 h-2.5 text-neutral-400" />
                        </button>
                        <button onClick={e => rotateNode(node.id, 'right', e)} title="Rotate Right" className="w-5 h-5 bg-neutral-900 border border-white/10 rounded flex items-center justify-center hover:border-white">
                          <RotateCw className="w-2.5 h-2.5 text-neutral-400" />
                        </button>
                        {isAdminMode && <>
                          <button onClick={e => resizeNode(node.id, e)} title="Resize" className="w-5 h-5 bg-neutral-900 border border-white/10 rounded flex items-center justify-center hover:border-white">
                            <Plus className="w-2.5 h-2.5 text-neutral-400" />
                          </button>
                          <button onClick={e => { setLinkFromId(node.id); e.stopPropagation(); }} title="Link" className="w-5 h-5 bg-neutral-900 border border-white/10 rounded flex items-center justify-center hover:border-white">
                            <Link2 className="w-2.5 h-2.5 text-neutral-400" />
                          </button>
                          <button onClick={e => removeNodeConns(node.id, e)} title="Remove links" className="w-5 h-5 bg-neutral-900 border border-white/10 rounded flex items-center justify-center hover:border-white">
                            <X className="w-2.5 h-2.5 text-neutral-400" />
                          </button>
                          <button onClick={e => deleteNode(node.id, e)} title="Delete" className="w-5 h-5 bg-neutral-900 border border-white/10 rounded flex items-center justify-center hover:border-[#C62828]">
                            <Trash2 className="w-2.5 h-2.5 text-neutral-400" />
                          </button>
                        </>}
                      </div>

                      {/* Card content */}
                      <div className="text-[6px] uppercase tracking-widest text-neutral-600 font-mono mb-1.5 border-b border-white/[0.04] pb-1 flex items-center justify-between">
                        <span>{node.type}</span>
                        {node.pinned && <Pin className="w-2 h-2 text-[#C62828]" />}
                      </div>

                      {node.image && (
                        <div className="w-full aspect-video mb-2 overflow-hidden bg-neutral-900 rounded-sm border border-white/[0.05]">
                          <img 
                            src={resolveImageUrl(node.image)} 
                            alt={node.title} 
                            className="w-full h-full object-cover pointer-events-none" 
                            draggable={false} 
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=compress&cs=tinysrgb&w=400&q=70';
                            }}
                          />
                        </div>
                      )}

                      <h4 className="text-[10px] font-semibold text-white leading-snug mb-1">{node.title}</h4>
                      <p className="text-[8px] text-neutral-500 leading-normal line-clamp-3">{node.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fixed HUD overlay on top of canvas */}
            {selectedNodeId && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/80 border border-white/10 rounded font-mono text-[9px] text-neutral-300 backdrop-blur-sm">
                Connected nodes highlighted · Click again to open · Click empty space to deselect
              </div>
            )}

            {isWallLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 z-40 font-mono text-xs backdrop-blur-[2px] select-none">
                <div className="text-[#C62828] uppercase tracking-[0.35em] mb-2 animate-pulse">[ SECURE WALL FEED ]</div>
                <div className="text-neutral-500 uppercase tracking-widest text-[9px] animate-[pulse_1.5s_infinite]">Decrypting nodes... Scanning connections...</div>
              </div>
            )}
          </div>
        </div>

        {/* ── NOTEBOOK ──────────────────────────────────────────────────── */}
        <div id="notebook-section" className="mb-24 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/[0.04] pb-5 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-mono block">CREATIVE JOURNAL // LIVING NOTEBOOK</span>
              <h3 className="text-4xl font-light text-white font-serif-cinematic">THE NOTEBOOK</h3>
            </div>
            <div className="flex gap-2.5 font-mono text-[10px] uppercase tracking-widest flex-wrap">
              {isAdminMode && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 mr-1 animate-fade-in">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      currentNotebookStatus === 'saving' ? 'bg-blue-500 animate-pulse' :
                      currentNotebookStatus === 'saved' ? 'bg-[#35D07F]' :
                      currentNotebookStatus === 'failed' ? 'bg-red-500 animate-pulse' :
                      currentNotebookStatus === 'unsaved' ? 'bg-amber-500' : 'bg-neutral-600'
                    }`} />
                    <span className={`text-[8px] font-mono tracking-wider ${
                      currentNotebookStatus === 'saving' ? 'text-blue-400 font-bold' :
                      currentNotebookStatus === 'saved' ? 'text-[#35D07F] font-bold' :
                      currentNotebookStatus === 'failed' ? 'text-red-500 font-bold' :
                      currentNotebookStatus === 'unsaved' ? 'text-amber-500 font-bold' : 'text-neutral-500'
                    }`}>
                      {currentNotebookStatus === 'saving' ? 'Saving...' :
                       currentNotebookStatus === 'saved' ? 'Saved' :
                       currentNotebookStatus === 'failed' ? 'Save Failed' :
                       currentNotebookStatus === 'unsaved' ? 'Unsaved Changes' : 'Saved'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveNotebook}
                    disabled={!hasUnsavedNotebook || currentNotebookStatus === 'saving' || currentNotebookStatus === 'saved'}
                    className={`px-4 py-2 border rounded flex items-center gap-1.5 font-bold transition-all duration-200 cursor-pointer ${
                      currentNotebookStatus === 'saving' ? 'border-neutral-800 bg-neutral-900/50 text-neutral-500 cursor-not-allowed' :
                      currentNotebookStatus === 'saved' ? 'border-[#35D07F]/30 bg-[#35D07F]/10 text-[#35D07F]' :
                      currentNotebookStatus === 'failed' ? 'border-red-500/30 bg-red-950/10 text-red-500 hover:bg-red-950/20' :
                      !hasUnsavedNotebook ? 'border-white/5 bg-neutral-900/20 text-neutral-600 cursor-not-allowed' :
                      'border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {currentNotebookStatus === 'saving' ? (
                      <>
                        <svg className="animate-spin h-3 w-3 text-neutral-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : currentNotebookStatus === 'saved' ? (
                      <>✓ Saved</>
                    ) : currentNotebookStatus === 'failed' ? (
                      <>Retry Save</>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save Notebook
                      </>
                    )}
                  </button>
                </div>
              )}
              {isAdminMode
                ? confirmResetNotebook
                  ? <span className="flex items-center gap-1.5 font-mono text-[9px]">
                      <span className="text-amber-400">Sure?</span>
                      <button type="button" onClick={resetNotebook} className="px-2.5 py-1.5 bg-red-900/40 border border-red-500/30 text-red-400 rounded hover:bg-red-900/60 transition-colors">YES</button>
                      <button type="button" onClick={() => setConfirmResetNotebook(false)} className="px-2.5 py-1.5 border border-white/10 text-neutral-400 rounded hover:border-white/30 transition-colors">NO</button>
                    </span>
                  : <button type="button" onClick={() => setConfirmResetNotebook(true)} className="px-4 py-2 border border-white/10 rounded hover:border-red-500/40 text-neutral-400 hover:text-red-400 flex items-center gap-1.5 interactive-item transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                : <button type="button" onClick={resetNotebook} className="px-4 py-2 border border-white/10 rounded hover:border-white/30 text-neutral-400 hover:text-white flex items-center gap-1.5 interactive-item transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
              }
              <button onClick={toggleAdmin} className={`px-4 py-2 border rounded flex items-center gap-2 interactive-item ${isAdminMode ? 'border-[#C62828] bg-[#C62828]/10 text-white' : 'border-white/10 text-neutral-400 hover:text-white'}`}>
                {isAdminMode ? <Lock className="w-3.5 h-3.5 text-[#C62828]" /> : <Unlock className="w-3.5 h-3.5" />}
                {isAdminMode ? 'ADMIN' : 'VISITOR'}
              </button>
              {isAdminMode && <>
                <button onClick={addPage} className="px-4 py-2 border border-white/10 rounded hover:border-white text-white flex items-center gap-1.5 interactive-item"><Plus className="w-3.5 h-3.5" /> Page</button>
                <button onClick={deleteCurPage} className="px-4 py-2 border border-white/10 rounded hover:border-[#C62828] text-[#C62828] flex items-center gap-1.5 interactive-item"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </>}
            </div>
          </div>

          {isNotebookLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-[320px] animate-pulse">
              {/* Simulated Page Content */}
              <div className="lg:col-span-8 border border-white/5 rounded p-7 flex flex-col justify-between bg-neutral-950/20">
                <div className="space-y-3.5 flex-grow">
                  <div className="h-5 bg-white/[0.03] rounded-sm w-1/3" />
                  <div className="border-t border-white/[0.03] pt-4 space-y-2.5">
                    <div className="h-3.5 bg-white/[0.03] rounded-sm w-full" />
                    <div className="h-3.5 bg-white/[0.03] rounded-sm w-11/12" />
                    <div className="h-3.5 bg-white/[0.03] rounded-sm w-5/6" />
                    <div className="h-3.5 bg-white/[0.03] rounded-sm w-3/4" />
                  </div>
                </div>
                <div className="h-3 bg-white/[0.03] rounded-sm w-1/4 pt-2 border-t border-white/[0.03]" />
              </div>
              {/* Simulated Index List */}
              <div className="lg:col-span-4 border border-white/5 rounded p-5 flex flex-col justify-between bg-neutral-950/20">
                <div className="space-y-4 flex-grow">
                  <div className="h-3 bg-white/[0.03] rounded-sm w-1/2" />
                  <div className="space-y-2.5">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 bg-white/[0.03] rounded-sm w-full" />
                    ))}
                  </div>
                </div>
                <div className="h-3 bg-white/[0.03] rounded-sm w-1/3 pt-4 border-t border-white/5" />
              </div>
            </div>
          ) : notebookPages.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Page content */}
              <div className="lg:col-span-8 glass-card rounded p-7 flex flex-col space-y-4 relative overflow-hidden bg-neutral-900/30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.02)_10%,transparent_60%)] pointer-events-none" />
                {/* Fold corner */}
                <button
                  onClick={() => toggleFold(notebookPages[activePageIdx].id)}
                  className={`absolute top-0 right-0 w-8 h-8 transition-colors ${foldedPages.includes(notebookPages[activePageIdx].id) ? 'bg-[#D4AF37]' : 'bg-white/5 hover:bg-white/10'}`}
                  style={{ clipPath: 'polygon(100% 0,0 0,100% 100%)' }}
                />
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 relative z-10">
                  {isAdminMode
                    ? <input value={notebookPages[activePageIdx].title} onChange={e => editTitle(e.target.value)} className="bg-transparent border-b border-white/10 focus:border-white text-lg font-serif-cinematic text-white outline-none py-0.5 mr-8 w-full max-w-md" />
                    : <h4 className="text-lg font-light text-white font-serif-cinematic mr-8">{notebookPages[activePageIdx].title}</h4>
                  }
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleBookmark(notebookPages[activePageIdx].id)} className={bookmarks.includes(notebookPages[activePageIdx].id) ? 'text-[#D4AF37]' : 'text-neutral-500'}>
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                    <span className="text-[7px] font-mono text-neutral-500 uppercase">PG {activePageIdx + 1}/{notebookPages.length}</span>
                  </div>
                </div>
                {isAdminMode
                  ? <textarea rows={8} value={notebookPages[activePageIdx].content} onChange={e => editContent(e.target.value)} className="relative z-10 w-full bg-neutral-900/40 border border-white/5 rounded p-3 text-xs text-neutral-300 font-mono outline-none focus:border-white/10 resize-none" />
                  : <p className={`relative z-10 text-xs font-mono leading-relaxed p-2 rounded whitespace-pre-wrap ${notebookPages[activePageIdx].highlighted ? 'bg-[#D4AF37]/10 text-white' : 'text-neutral-400'}`}>
                      {notebookPages[activePageIdx].content}
                    </p>
                }
                <div className="relative z-10 flex justify-between items-center pt-2 border-t border-white/[0.03]">
                  <button onClick={() => toggleHighlight(notebookPages[activePageIdx].id)} className="text-[7px] font-mono uppercase tracking-widest text-neutral-500 hover:text-white">
                    {notebookPages[activePageIdx].highlighted ? 'Clear Highlight' : 'Highlight Page'}
                  </button>
                  {isAdminMode ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <span className={`w-1 h-1 rounded-full ${
                          currentNotebookStatus === 'saving' ? 'bg-blue-500 animate-pulse' :
                          currentNotebookStatus === 'saved' ? 'bg-[#35D07F]' :
                          currentNotebookStatus === 'failed' ? 'bg-red-500 animate-pulse' :
                          currentNotebookStatus === 'unsaved' ? 'bg-amber-500' : 'bg-neutral-600'
                        }`} />
                        <span className={`text-[7px] font-mono tracking-wider ${
                          currentNotebookStatus === 'saving' ? 'text-blue-400 font-bold' :
                          currentNotebookStatus === 'saved' ? 'text-[#35D07F]' :
                          currentNotebookStatus === 'failed' ? 'text-red-500 font-bold' :
                          currentNotebookStatus === 'unsaved' ? 'text-amber-400 font-bold' : 'text-neutral-500'
                        }`}>
                          {currentNotebookStatus === 'saving' ? 'Saving...' :
                           currentNotebookStatus === 'saved' ? 'Saved' :
                           currentNotebookStatus === 'failed' ? 'Save Failed' :
                           currentNotebookStatus === 'unsaved' ? 'Unsaved Edits' : 'Saved'}
                        </span>
                      </span>
                      {hasUnsavedNotebook && (
                        <button
                          onClick={handleSaveNotebook}
                          disabled={currentNotebookStatus === 'saving' || currentNotebookStatus === 'saved'}
                          className="text-[8px] font-mono uppercase tracking-widest text-[#D4AF37] hover:text-white font-bold underline cursor-pointer disabled:opacity-50"
                        >
                          {currentNotebookStatus === 'saving' ? 'Saving...' :
                           currentNotebookStatus === 'saved' ? 'Saved' :
                           currentNotebookStatus === 'failed' ? 'Retry' : 'Save Notebook'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-[7px] font-mono text-neutral-500">✓ AUTO-SAVED</span>
                  )}
                </div>
              </div>

              {/* Index panel */}
              <div className="lg:col-span-4 bg-neutral-950 border border-white/5 rounded p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[7px] uppercase tracking-widest text-neutral-500 font-mono block">JOURNAL INDEX</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {notebookPages.map((page, idx) => (
                      <div key={page.id} className="flex items-center gap-1.5 w-full">
                        <button
                          onClick={() => setActivePageIdx(idx)}
                          className={`flex-grow flex items-center justify-between p-2.5 border rounded text-[10px] font-mono text-left transition-colors truncate ${idx === activePageIdx ? 'border-white/20 bg-white/5 text-white' : 'border-white/5 text-neutral-500 hover:text-white'}`}
                        >
                          <span className="truncate">{page.title}</span>
                          <div className="flex gap-1.5 shrink-0">
                            {bookmarks.includes(page.id) && <Bookmark className="w-2.5 h-2.5 text-[#D4AF37] fill-current" />}
                            {foldedPages.includes(page.id) && <span className="text-[6px] border border-[#D4AF37]/40 text-[#D4AF37] px-1 rounded-sm">FOLD</span>}
                          </div>
                        </button>
                        {isAdminMode && (
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button
                              disabled={idx === 0}
                              onClick={(e) => { e.stopPropagation(); movePage(idx, 'up'); }}
                              className="w-4 h-4 rounded border border-white/10 hover:border-white/20 flex items-center justify-center text-neutral-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer text-[7px]"
                              title="Move Page Up"
                            >
                              ▲
                            </button>
                            <button
                              disabled={idx === notebookPages.length - 1}
                              onClick={(e) => { e.stopPropagation(); movePage(idx, 'down'); }}
                              className="w-4 h-4 rounded border border-white/10 hover:border-white/20 flex items-center justify-center text-neutral-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer text-[7px]"
                              title="Move Page Down"
                            >
                              ▼
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[7px] font-mono text-neutral-700 uppercase tracking-wider pt-4 border-t border-white/5 flex items-center gap-1">
                  <Book className="w-3.5 h-3.5" /> LIVING JOURNAL // VOL III
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 font-mono text-xs text-neutral-500">
              No journal entries found.
            </div>
          )}
        </div>

        {/* Exit transition shutter / bridge */}
        <div className="mt-28 pt-20 border-t border-dashed border-white/5 text-center flex flex-col items-center justify-center space-y-4 select-none">
          <div className="space-y-3 font-mono text-xs uppercase tracking-widest text-neutral-500 max-w-lg">
            <p>"You've seen my work."</p>
            <p>"You've seen my mind."</p>
            <p className="text-white font-serif-cinematic text-sm tracking-wider mt-2">"Now, let's work together."</p>
          </div>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="pt-6 text-neutral-500 hover:text-white transition-colors animate-bounce interactive-item"
            aria-label="Scroll to Contact"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

      </div>

      {/* ── Global Overlay ─────────────────────────────────────────────── */}
      {activeOverlay && (
        <div onClick={() => setActiveOverlay(null)} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl">
          <div
            onClick={e => e.stopPropagation()}
            className="bg-[#121212] border border-white/10 rounded w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative"
          >
            {/* Sticky header with close button — never overlaps content */}
            <div className="sticky top-0 z-10 bg-[#121212] border-b border-white/[0.04] px-8 py-4 flex justify-between items-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest">{activeOverlay.title}</span>
                <span className="text-[8px] font-mono text-neutral-700 uppercase tracking-widest">INSIDE HEAD // SECURE DATA</span>
              </div>
              <button
                onClick={() => setActiveOverlay(null)}
                className="w-8 h-8 shrink-0 rounded border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center bg-[#121212] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="p-8 pt-6">
              {activeOverlay.content}
            </div>

            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/10 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/10 pointer-events-none" />
          </div>
        </div>
      )}

      {/* ── Admin Password Modal ── */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6">
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
      />
    </section>
  );
}

interface NodeOverlayContentProps {
  node: BrainNode;
  isAdminMode: boolean;
  onSave: (updatedNode: BrainNode) => void;
}

function NodeOverlayContent({ node, isAdminMode, onSave }: NodeOverlayContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(node.title);
  const [desc, setDesc] = useState(node.desc);
  const [image, setImage] = useState(node.image || '');
  const [type, setType] = useState(node.type);
  const [tagsInput, setTagsInput] = useState(node.tags.join(', '));

  const handleSave = () => {
    onSave({
      ...node,
      title: title.trim(),
      desc: desc.trim(),
      image: image.trim() || undefined,
      type,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-4 text-left font-mono text-[10px] text-neutral-300">
        <div>
          <label className="text-neutral-500 block mb-1">NODE TITLE</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
          />
        </div>
        <div>
          <label className="text-neutral-500 block mb-1">NODE TYPE</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as any)}
            className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20 uppercase"
          >
            {(['note', 'polaroid', 'ticket', 'location', 'quote'] as const).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-neutral-500 block mb-1">IMAGE URL (OPTIONAL)</label>
          <input
            type="text"
            value={image}
            onChange={e => setImage(e.target.value)}
            className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
          />
        </div>
        <div>
          <label className="text-neutral-500 block mb-1">TAGS (COMMA SEPARATED)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-white/20"
            placeholder="Philosophy, Composition, etc..."
          />
        </div>
        <div>
          <label className="text-neutral-500 block mb-1">DESCRIPTION</label>
          <textarea
            rows={4}
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="w-full bg-neutral-950 border border-white/10 rounded p-2.5 text-white outline-none focus:border-white/20 resize-y"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-grow py-2 bg-white hover:bg-neutral-200 text-black font-bold rounded-sm uppercase tracking-widest text-[9px] transition-all cursor-pointer"
          >
            Save Changes
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white rounded-sm uppercase tracking-widest text-[9px] transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left text-xs leading-relaxed font-mono">
      {node.image && (
        <div className="w-full aspect-video overflow-hidden bg-black rounded border border-white/10">
          <img 
            src={resolveImageUrl(node.image)} 
            alt={node.title} 
            className="w-full h-full object-cover" 
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=compress&cs=tinysrgb&w=800&q=75';
            }}
          />
        </div>
      )}
      <p className="text-neutral-350 leading-relaxed whitespace-pre-line">{node.desc}</p>
      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
        {node.tags.map(t => (
          <span key={t} className="px-2 py-0.5 border border-white/10 bg-white/5 text-neutral-400 text-[9px] uppercase tracking-wider">{t}</span>
        ))}
      </div>
      <div className="flex justify-between items-center text-[8px] text-neutral-600 pt-2 border-t border-white/5">
        <span>ADDED: {node.id}</span>
        {isAdminMode && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-2.5 py-1 bg-white/5 border border-white/10 hover:border-white text-white rounded-sm uppercase tracking-wider text-[8px] cursor-pointer"
          >
            Edit Node
          </button>
        )}
      </div>
    </div>
  );
}
