import { useEffect, useRef, useState, useCallback } from 'react';
import { Shield, Eye, EyeOff, MapPin, Award, BookOpen, Lock, Save, X } from 'lucide-react';
import { isFirebaseConfigured, getFirebaseDossier, saveFirebaseDossier, db, formatFirebaseError } from '../lib/firebase';
import { onSnapshot, doc } from 'firebase/firestore';
import FirebaseErrorModal, { FirebaseErrorDetails } from './FirebaseErrorModal';

export interface CaseFileData {
  sectionTitle: string;
  name: string;
  titles: string[];
  photoUrl: string;
  introParagraph: string;
  location: string;
  role: string;
  focus: string;
  status: string;
  docVersion: string;
  updatedDate: string;
}

const DEFAULT_CASE_FILE: CaseFileData = {
  sectionTitle: "CASE FILE",
  name: "HIMANSHU MER",
  titles: ["Editor", "Filmmaker", "Storyteller"],
  photoUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=compress&cs=tinysrgb&w=800",
  introParagraph: "I'm Himanshu Mer, a filmmaker and editor based in Gujarat who enjoys building stories that people can connect with. Over the past few years, I've worked across commercials, music videos, documentaries, creator content and independent short films, always looking for the balance between creativity and purpose. For me, every project is a collaboration, every edit is a decision, and every story is another opportunity to make someone feel something.",
  location: "Bhavnagar, Gujarat",
  role: "Editor & Filmmaker",
  focus: "Narrative Films • Commercials • Creator Content",
  status: "Open to meaningful collaborations",
  docVersion: "CF-29",
  updatedDate: "12-07-2026"
};

export const CASE_FILE_STORAGE_KEY = 'himanshumer_casefile_data_v2';
export const AUTH_TOKEN_KEY = 'himanshumer_admin_auth_token_v3';

export default function CaseFile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<CaseFileData>(DEFAULT_CASE_FILE);
  const [activeTab, setActiveTab] = useState('bio');
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isEditingRef = useRef(isEditing);

  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<FirebaseErrorDetails | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'failed'>('idle');

  // Fade title states
  const [titleIndex, setTitleIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  // Editing form states
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [editName, setEditName] = useState('');
  const [editTitles, setEditTitles] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editIntroParagraph, setEditIntroParagraph] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editFocus, setEditFocus] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editDocVersion, setEditDocVersion] = useState('');
  const [editUpdatedDate, setEditUpdatedDate] = useState('');

  const sectionRef = useRef<HTMLDivElement>(null);

  // Load data & admin credentials
  const loadStoredData = useCallback(async () => {
    // 1. Check local admin token
    const hasAdminToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (hasAdminToken === '3f7137d5d93de0be0462cb9a49f330397ea8e68518dad4cd2f4c0344d24c50d3') {
      setIsAdmin(true);
    }

    // 2. Load Dossier Config
    let initialData = DEFAULT_CASE_FILE;
    if (isFirebaseConfigured) {
      initialData = await getFirebaseDossier(DEFAULT_CASE_FILE);
    } else {
      const stored = localStorage.getItem(CASE_FILE_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.introParagraph && parsed.introParagraph.length > 500) {
            parsed.introParagraph = DEFAULT_CASE_FILE.introParagraph;
          }
          initialData = { ...DEFAULT_CASE_FILE, ...parsed };
        } catch (_) {}
      }
    }
    setData(initialData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStoredData();

    let unsubscribe: () => void = () => {};
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'portfolio_data', 'dossier');
      unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists() && !isEditingRef.current) {
          const updated = snapshot.data() as CaseFileData;
          setData(updated);
          setIsLoading(false);
          // Sync variables globally across other components
          window.dispatchEvent(new CustomEvent('casefile-updated', {
            detail: {
              name: updated.name,
              titles: updated.titles
            }
          }));
        }
      }, (error) => {
        console.error("Dossier real-time listener error:", error);
        setIsLoading(false);
      });
    }

    const handleStorage = () => loadStoredData();
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      unsubscribe();
    };
  }, [loadStoredData]);

  // Fade cycle titles loop
  useEffect(() => {
    if (data.titles.length === 0) return;
    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setTitleIndex((prev) => (prev + 1) % data.titles.length);
        setFadeState('in');
      }, 500);
    }, 4500);

    return () => clearInterval(interval);
  }, [data.titles]);

  // Intersection observer for section entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleStartEdit = () => {
    setEditSectionTitle(data.sectionTitle);
    setEditName(data.name);
    setEditTitles(data.titles.join(', '));
    setEditPhotoUrl(data.photoUrl);
    setEditIntroParagraph(data.introParagraph);
    setEditLocation(data.location);
    setEditRole(data.role);
    setEditFocus(data.focus);
    setEditStatus(data.status);
    setEditDocVersion(data.docVersion);
    setEditUpdatedDate(data.updatedDate);
    setIsEditing(true);
  };

  // Helper calculations for edits checking
  const hasChanges = 
    editSectionTitle !== data.sectionTitle ||
    editName !== data.name ||
    editTitles !== (data.titles ? data.titles.join(', ') : '') ||
    editPhotoUrl !== data.photoUrl ||
    editIntroParagraph !== data.introParagraph ||
    editLocation !== data.location ||
    editRole !== data.role ||
    editFocus !== data.focus ||
    editStatus !== data.status ||
    editDocVersion !== data.docVersion ||
    editUpdatedDate !== data.updatedDate;

  const currentStatus = 
    saveStatus === 'saving' ? 'saving' :
    saveStatus === 'saved' ? 'saved' :
    saveStatus === 'failed' ? 'failed' :
    (isEditing && hasChanges) ? 'unsaved' : 'idle';

  // Prevent leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing && hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditing, hasChanges]);

  // Keyboard shortcut Ctrl+S trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const isAdminMode = token === '3f7137d5d93de0be0462cb9a49f330397ea8e68518dad4cd2f4c0344d24c50d3';
        if (isAdminMode && isEditing) {
          e.preventDefault();
          if (hasChanges && saveStatus !== 'saving') {
            handleSaveEdit();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, hasChanges, saveStatus, editSectionTitle, editName, editTitles, editPhotoUrl, editIntroParagraph, editLocation, editRole, editFocus, editStatus, editDocVersion, editUpdatedDate, data]);

  const handleSaveEdit = async () => {
    const updated: CaseFileData = {
      sectionTitle: editSectionTitle.trim() || DEFAULT_CASE_FILE.sectionTitle,
      name: editName.trim() || DEFAULT_CASE_FILE.name,
      titles: editTitles.split(',').map(t => t.trim()).filter(Boolean),
      photoUrl: editPhotoUrl.trim() || DEFAULT_CASE_FILE.photoUrl,
      introParagraph: editIntroParagraph.trim(),
      location: editLocation.trim() || DEFAULT_CASE_FILE.location,
      role: editRole.trim() || DEFAULT_CASE_FILE.role,
      focus: editFocus.trim() || DEFAULT_CASE_FILE.focus,
      status: editStatus.trim() || DEFAULT_CASE_FILE.status,
      docVersion: editDocVersion.trim() || DEFAULT_CASE_FILE.docVersion,
      updatedDate: editUpdatedDate.trim() || DEFAULT_CASE_FILE.updatedDate
    };

    setSaveStatus('saving');
    if (isFirebaseConfigured) {
      try {
        await saveFirebaseDossier(updated);
        localStorage.setItem(CASE_FILE_STORAGE_KEY, JSON.stringify(updated));
        
        // Refetch latest from Firebase to guarantee UI reflects actual cloud state
        const freshData = await getFirebaseDossier(DEFAULT_CASE_FILE);
        setData(freshData);
        
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus('idle');
          setIsEditing(false);
        }, 1500);
      } catch (e: any) {
        console.error("Error saving dossier changes:", e);
        setSaveStatus('failed');
        const details = formatFirebaseError(e, 'portfolio_data', 'dossier', 'setDoc', updated);
        setErrorDetails(details);
        setErrorModalOpen(true);
        return;
      }
    } else {
      localStorage.setItem(CASE_FILE_STORAGE_KEY, JSON.stringify(updated));
      setData(updated);
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditing(false);
      }, 1500);
    }

    // Sync variables globally across other components
    window.dispatchEvent(new CustomEvent('casefile-updated', {
      detail: {
        name: updated.name,
        titles: updated.titles
      }
    }));
  };

  const handleResetData = async () => {
    if (window.confirm("RESET DOSSIER DATA TO DEFAULT CONFIGURATION?")) {
      if (isFirebaseConfigured) {
        try {
          await saveFirebaseDossier(DEFAULT_CASE_FILE);
        } catch (e: any) {
          console.error("Error resetting dossier:", e);
          alert(`ERROR RESETTING DOSSIER ON FIREBASE: ${e.message || e}\n\nPlease verify that your Firestore Security Rules allow writes.`);
          return;
        }
      } else {
        localStorage.removeItem(CASE_FILE_STORAGE_KEY);
      }
      setData(DEFAULT_CASE_FILE);
      setIsEditing(false);
      window.dispatchEvent(new CustomEvent('casefile-updated', {
        detail: {
          name: DEFAULT_CASE_FILE.name,
          titles: DEFAULT_CASE_FILE.titles
        }
      }));
    }
  };

  async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await sha256(password);
    if (hash === '3f7137d5d93de0be0462cb9a49f330397ea8e68518dad4cd2f4c0344d24c50d3') {
      localStorage.setItem(AUTH_TOKEN_KEY, '3f7137d5d93de0be0462cb9a49f330397ea8e68518dad4cd2f4c0344d24c50d3');
      setIsAdmin(true);
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
      setTimeout(() => handleStartEdit(), 100);
    } else {
      setPasswordError('ACCESS DENIED. INVALID CREDENTIALS.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAdmin(false);
    setIsEditing(false);
  };

  // Dossier File Tabs Contents
  const tabs = [
    {
      id: 'bio',
      name: '01_DOSSIER.pdf',
      category: 'IDENTIFICATION REPORT',
      content: isEditing ? (
        <div className="space-y-2 text-left font-mono text-[10px] w-full">
          <label className="text-neutral-500 block uppercase font-bold">Biography Paragraph (PDF Raw Data)</label>
          <textarea
            rows={6}
            value={editIntroParagraph}
            onChange={(e) => setEditIntroParagraph(e.target.value)}
            className="w-full bg-neutral-950 border border-white/10 rounded p-3 text-neutral-200 font-sans text-xs md:text-sm leading-relaxed outline-none focus:border-white/20 resize-none h-[140px]"
          />
        </div>
      ) : isLoading ? (
        <div className="space-y-2.5 animate-pulse w-full">
          <div className="h-4 bg-white/[0.03] rounded-sm w-full" />
          <div className="h-4 bg-white/[0.03] rounded-sm w-full" />
          <div className="h-4 bg-white/[0.03] rounded-sm w-11/12" />
          <div className="h-4 bg-white/[0.03] rounded-sm w-2/3" />
        </div>
      ) : (
        <div className="text-neutral-300 font-serif-cinematic text-lg md:text-xl leading-relaxed text-left select-text whitespace-pre-line">
          <p>
            {data.introParagraph}
          </p>
        </div>
      ),
    },
    {
      id: 'metadata',
      name: '02_METADATA.dat',
      category: 'SYSTEM COGNITION',
      content: isEditing ? (
        <div className="grid grid-cols-1 gap-3.5 text-left font-mono text-[10px] w-full">
          <span className="text-[8px] text-amber-500 font-bold block uppercase border-b border-white/[0.03] pb-1">Dossier Coordinates</span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-500 block mb-0.5">BASED IN</label>
              <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-white" />
            </div>
            <div>
              <label className="text-neutral-500 block mb-0.5">CURRENTLY</label>
              <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-white" />
            </div>
            <div>
              <label className="text-neutral-500 block mb-0.5">FOCUS FIELDS</label>
              <input type="text" value={editFocus} onChange={(e) => setEditFocus(e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-white" />
            </div>
            <div>
              <label className="text-neutral-500 block mb-0.5">STATUS</label>
              <input type="text" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-white" />
            </div>
          </div>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left select-text font-mono w-full animate-pulse">
          <div className="flex gap-3 items-center">
            <div className="w-3.5 h-3.5 bg-white/[0.03] rounded-full shrink-0 animate-pulse" />
            <div className="space-y-1">
              <div className="h-2 bg-white/[0.03] rounded-sm w-12" />
              <div className="h-4 bg-white/[0.03] rounded-sm w-24 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="w-3.5 h-3.5 bg-white/[0.03] rounded-full shrink-0 animate-pulse" />
            <div className="space-y-1">
              <div className="h-2 bg-white/[0.03] rounded-sm w-12" />
              <div className="h-4 bg-white/[0.03] rounded-sm w-24 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3 items-center sm:col-span-2">
            <div className="w-3.5 h-3.5 bg-white/[0.03] rounded-full shrink-0 animate-pulse" />
            <div className="space-y-1">
              <div className="h-2 bg-white/[0.03] rounded-sm w-16" />
              <div className="h-4 bg-white/[0.03] rounded-sm w-36 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3 items-center sm:col-span-2 pt-2 border-t border-white/[0.03]">
            <div className="w-3.5 h-3.5 bg-white/[0.03] rounded-full shrink-0 animate-pulse" />
            <div className="space-y-1">
              <div className="h-2 bg-white/[0.03] rounded-sm w-12" />
              <div className="h-4 bg-white/[0.03] rounded-sm w-24 animate-pulse" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left select-text font-mono">
          <div className="flex gap-3 items-center">
            <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <div>
              <span className="text-[8px] text-neutral-600 uppercase tracking-widest block">Based In</span>
              <span className="text-neutral-200 text-xs md:text-[13px] tracking-wide">{data.location}</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Award className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <div>
              <span className="text-[8px] text-neutral-600 uppercase tracking-widest block">Currently</span>
              <span className="text-neutral-200 text-xs md:text-[13px] tracking-wide">{data.role}</span>
            </div>
          </div>
          <div className="flex gap-3 items-center sm:col-span-2">
            <BookOpen className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <div>
              <span className="text-[8px] text-neutral-600 uppercase tracking-widest block">Focus Fields</span>
              <span className="text-neutral-200 text-xs md:text-[13px] tracking-wide">{data.focus}</span>
            </div>
          </div>
          <div className="flex gap-3 items-center sm:col-span-2 pt-2 border-t border-white/[0.03]">
            <Shield className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <div>
              <span className="text-[8px] text-neutral-600 uppercase tracking-widest block">Status</span>
              <span className="text-amber-400 text-xs md:text-[13px] tracking-wide">{data.status}</span>
            </div>
          </div>
        </div>
      ),
    }
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-16 md:py-20 bg-[#080808] border-t border-white/[0.02]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className={`mb-12 md:mb-16 text-left transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {isEditing ? (
            <div className="space-y-3.5 max-w-lg font-mono text-[10px] text-left">
              <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] font-semibold block font-mono">01 // EDIT PROFILE HEADER</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-neutral-500 block mb-1">SECTION LABEL</label>
                  <input type="text" value={editSectionTitle} onChange={(e) => setEditSectionTitle(e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-white" />
                </div>
                <div>
                  <label className="text-neutral-500 block mb-1">FULL NAME</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-neutral-500 block mb-1">SUBTITLES (COMMA SEPARATED)</label>
                  <input type="text" value={editTitles} onChange={(e) => setEditTitles(e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] font-semibold mb-3 block font-mono">
                01 // PROFILE
              </span>
              <h2 className="text-5xl md:text-7xl text-white font-display-cinematic tracking-wider">
                {isLoading ? (
                  <span className="inline-block bg-white/[0.04] h-10 w-48 rounded animate-pulse" />
                ) : (
                  data.sectionTitle
                )}
              </h2>
              <div className="mt-3.5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 font-mono text-xs uppercase">
                {isLoading ? (
                  <span className="inline-block bg-white/[0.04] h-6 w-32 rounded animate-pulse" />
                ) : (
                  <span className="text-2xl text-neutral-300 tracking-wide font-light">{data.name}</span>
                )}
                <span className="hidden sm:inline text-neutral-700">//</span>
                <div className="h-6 flex items-center text-[10px] tracking-[0.25em] text-amber-500">
                  {isLoading ? (
                    <span className="inline-block bg-white/[0.04] h-3.5 w-24 rounded animate-pulse" />
                  ) : (
                    <span className={`transition-all duration-500 ${fadeState === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1.5'}`}>
                      {data.titles[titleIndex]}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Batcomputer classic dossier UI grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-stretch transition-all duration-1000 delay-150 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          {/* LEFT PANEL: File Cover, tabs list, diagnostic trigger */}
          <div className="lg:col-span-5 flex flex-col justify-between border border-white/10 rounded bg-neutral-950/40 p-6 space-y-6">
            
            {/* Visual Portrait Cover Frame */}
            <div className="relative group overflow-hidden border border-white/5 rounded aspect-[16/10] bg-neutral-900 shadow-2xl">
              {isLoading ? (
                <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] animate-pulse pointer-events-none" />
                  <span className="text-neutral-600 font-mono text-[8px] uppercase tracking-[0.3em] animate-pulse">Decrypting Feed...</span>
                </div>
              ) : isEditing ? (
                <div className="absolute inset-0 bg-black/85 flex flex-col justify-center p-4 font-mono text-[9px] z-10 text-left">
                  <label className="text-neutral-400 block mb-1">PORTRAIT COVER IMAGE URL</label>
                  <textarea rows={4} value={editPhotoUrl} onChange={(e) => setEditPhotoUrl(e.target.value)} className="w-full bg-neutral-950 border border-white/10 rounded p-2 text-white text-[8px] resize-none leading-normal" />
                  <span className="text-[7px] text-neutral-500 mt-2">Enter a direct image link (e.g. Unsplash / hosting url)</span>
                </div>
              ) : (
                <>
                  <img
                    src={data.photoUrl}
                    alt="Case Dossier Cover"
                    className="w-full h-full object-cover filter grayscale contrast-125 scale-105 group-hover:scale-100 transition-all duration-[1s] pointer-events-none"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=compress&cs=tinysrgb&w=800&q=75';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent text-left"></div>
                </>
              )}
              
              {/* Bracket corner overlays */}
              <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t border-l border-white/10"></div>
              <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t border-r border-white/10"></div>
              <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b border-l border-white/10"></div>
              <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b border-r border-white/10"></div>
            </div>

            {/* Folder tabs index list */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono font-medium block mb-2">
                INDEX FILES:
              </span>
              
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 rounded border transition-all duration-300 font-mono text-xs flex items-center justify-between interactive-item cursor-pointer ${
                      isActive
                        ? 'border-white/20 bg-white/[0.02] text-white shadow-[0_0_12px_rgba(255,255,255,0.02)]'
                        : 'border-white/5 hover:border-white/10 text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <span>{tab.name}</span>
                    <span className="text-[8px] uppercase tracking-widest opacity-40">
                      {isActive ? 'OPEN' : 'READ'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Diagnostics triggers & Admin buttons */}
            <div className="flex flex-col gap-3">
              {isEditing ? (
                /* Action buttons in Edit Mode */
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[8px] font-mono text-neutral-500 uppercase tracking-widest px-1">
                    <span>SAVE STATUS</span>
                    <span className="flex items-center gap-1.5 animate-fade-in">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        currentStatus === 'saving' ? 'bg-blue-500 animate-pulse' :
                        currentStatus === 'saved' ? 'bg-[#35D07F]' :
                        currentStatus === 'failed' ? 'bg-red-500 animate-pulse' :
                        currentStatus === 'unsaved' ? 'bg-amber-500' : 'bg-neutral-600'
                      }`} />
                      <span className={
                        currentStatus === 'saving' ? 'text-blue-400 font-bold' :
                        currentStatus === 'saved' ? 'text-[#35D07F] font-bold' :
                        currentStatus === 'failed' ? 'text-red-500 font-bold' :
                        currentStatus === 'unsaved' ? 'text-amber-500 font-bold' : 'text-neutral-500'
                      }>
                        {currentStatus === 'saving' ? 'Saving...' :
                         currentStatus === 'saved' ? 'Saved' :
                         currentStatus === 'failed' ? 'Save Failed' :
                         currentStatus === 'unsaved' ? 'Unsaved Changes' : 'Saved'}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={!hasChanges || currentStatus === 'saving' || currentStatus === 'saved'}
                      className={`flex-grow flex items-center justify-center gap-1.5 py-2.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        currentStatus === 'saving' ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5' :
                        currentStatus === 'saved' ? 'bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30' :
                        currentStatus === 'failed' ? 'bg-red-950/20 text-red-500 border border-red-500/30 hover:bg-red-950/30' :
                        !hasChanges ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-white/5' :
                        'bg-white hover:bg-neutral-200 text-black'
                      }`}
                    >
                      {currentStatus === 'saving' ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : currentStatus === 'saved' ? (
                        <>✓ Saved</>
                      ) : currentStatus === 'failed' ? (
                        <>Retry Save</>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save Case File
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={currentStatus === 'saving'}
                      className="flex-grow flex items-center justify-center gap-1.5 py-2.5 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white rounded text-[10px] font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Mode controls */
                <>
                  <button
                    onClick={() => setIsDecrypted(!isDecrypted)}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/5 hover:border-white/20 text-[9px] font-mono tracking-widest uppercase text-neutral-500 hover:text-white rounded transition-all duration-300 interactive-item cursor-pointer"
                  >
                    {isDecrypted ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Lock Metadata
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Show Target Metadata
                      </>
                    )}
                  </button>

                  {isAdmin ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={handleStartEdit}
                          className="flex-grow flex items-center justify-center gap-1.5 py-2.5 bg-white hover:bg-neutral-200 text-black rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                        >
                          Edit Dossier
                        </button>
                        <button
                          onClick={handleResetData}
                          className="flex-grow flex items-center justify-center gap-1.5 py-2.5 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white rounded text-[10px] font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer"
                        >
                          Reset Defaults
                        </button>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full py-2 border border-dashed border-red-500/20 hover:border-red-500/40 text-[9px] font-mono text-red-500 hover:text-red-400 rounded transition-all duration-300 cursor-pointer uppercase tracking-widest"
                      >
                        Logout Admin
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full py-2.5 border border-dashed border-white/5 hover:border-white/20 text-[9px] font-mono text-neutral-500 hover:text-white rounded transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
                      title="Admin Settings"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Admin Credentials</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Active dossier file display */}
          <div className="lg:col-span-7 border border-white/10 rounded bg-neutral-900/10 p-6 md:p-10 relative flex flex-col justify-between overflow-hidden">
            
            {/* Top secure category HUD */}
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-600 border-b border-white/[0.04] pb-4 mb-5">
              <span className="flex items-center gap-2 uppercase">
                <Shield className="w-3.5 h-3.5 text-neutral-655" />
                {tabs.find((t) => t.id === activeTab)?.category}
              </span>
              <span>SECURE_DATA // MODULE_0{tabs.findIndex((t) => t.id === activeTab) + 1}</span>
            </div>

            {/* Folder tab active contents */}
            <div className="space-y-5 flex-grow flex flex-col justify-center">
              {tabs.find((t) => t.id === activeTab)?.content}

              {/* Decrypted secrets metadata coordinates */}
              {isDecrypted && !isEditing && (
                <div className="mt-5 pt-4 border-t border-dashed border-white/10 text-[10px] font-mono text-neutral-500 space-y-1.5 animate-[fadeInUp_0.5s_ease_forwards] select-text">
                  <div>• SYS_COORD: {data.location.toUpperCase().replace(',', ' //')}</div>
                  <div>• CRYPTO_NET: AES_256 // TLS_1.3_ACTIVE</div>
                  <div>• FRAME_RATE: 23.976_FPS // REC_709_LUT</div>
                  <div>• TRACE_BUFFER: 0x545F526260766E656B1412</div>
                  <div>• CORE_SIG: 3f7137d5d93de0be0462cb9a49f330397ea8e68518dad4cd2f4c0344d24c50d3</div>
                </div>
              )}
            </div>

            {/* Subtle Document Footer (anchored to bottom of flex layout card) */}
            <div className="mt-auto pt-4 border-t border-white/[0.04] flex justify-between items-center text-[8px] font-mono text-neutral-600 uppercase tracking-widest select-text">
              {isEditing ? (
                <div className="flex gap-4 w-full">
                  <div>
                    <label className="text-[7px] text-neutral-500 block mb-0.5">DOC VERSION</label>
                    <input type="text" value={editDocVersion} onChange={(e) => setEditDocVersion(e.target.value)} className="bg-neutral-950 border border-white/10 rounded px-1.5 text-[8px] text-white w-16 outline-none" />
                  </div>
                  <div>
                    <label className="text-[7px] text-neutral-500 block mb-0.5">DATE MODIFIED</label>
                    <input type="text" value={editUpdatedDate} onChange={(e) => setEditUpdatedDate(e.target.value)} className="bg-neutral-950 border border-white/10 rounded px-1.5 text-[8px] text-white w-24 outline-none" />
                  </div>
                </div>
              ) : (
                <>
                  <span>SYSTEM_DATA // {data.docVersion}</span>
                  <span>LAST SECURED: {data.updatedDate}</span>
                </>
              )}
            </div>

            {/* Folder aesthetics bracket corners */}
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-white/5 pointer-events-none"></div>
            <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-white/5 pointer-events-none"></div>
          </div>

        </div>

      </div>

      {/* Access Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-neutral-900 border border-white/10 rounded-sm p-6 w-full max-w-xs relative font-mono shadow-2xl text-left">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordError('');
                setPassword('');
              }}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/[0.05] pb-2">
              Secure Credentials
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-neutral-950 border border-white/10 rounded px-2.5 py-1.5 w-full text-xs text-white tracking-widest outline-none focus:border-white/20"
                  autoFocus
                />
              </div>
              {passwordError && (
                <div className="text-[9px] text-red-500 font-bold tracking-wide animate-pulse">
                  {passwordError}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-white hover:bg-neutral-200 text-black py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
              >
                Authenticate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating lock icon for quick edit trigger if already admin */}
      {isAdmin && !isEditing && (
        <button
          onClick={handleStartEdit}
          className="fixed bottom-6 right-6 bg-white hover:bg-neutral-200 text-black rounded-full p-3 shadow-2xl z-45 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer border border-black/10"
          title="Edit Case File"
        >
          <Lock className="w-4 h-4 text-black" />
        </button>
      )}

      {/* Firebase Error Modal Diagnostics */}
      <FirebaseErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errorDetails={errorDetails}
        onRetry={handleSaveEdit}
      />
    </section>
  );
}
