import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  writeBatch
} from 'firebase/firestore';
import { FilmographyProject } from '../types/project';

// Environment variables from Vite .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if variables are configured
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let db: any = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// ─── Diagnostics & Sanitization Utilities ────────────────────────────
export function findUndefinedPaths(data: any, path = ''): string[] {
  if (data === undefined) {
    return [path || 'root'];
  }
  if (data === null) {
    return [];
  }
  if (Array.isArray(data)) {
    const paths: string[] = [];
    data.forEach((item, index) => {
      paths.push(...findUndefinedPaths(item, `${path}[${index}]`));
    });
    return paths;
  }
  if (typeof data === 'object') {
    // Only traverse plain JS objects to avoid checking reference prototypes
    if (data.constructor === Object) {
      const paths: string[] = [];
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          paths.push(...findUndefinedPaths(data[key], path ? `${path}.${key}` : key));
        }
      }
      return paths;
    }
  }
  return [];
}

export function sanitizeFirestoreData(val: any): any {
  if (val === undefined) {
    return null;
  }
  if (val === null) {
    return null;
  }
  if (Array.isArray(val)) {
    return val.map(item => sanitizeFirestoreData(item));
  }
  if (typeof val === 'object') {
    if (val.constructor === Object) {
      const cleaned: any = {};
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          const cleanVal = sanitizeFirestoreData(val[key]);
          if (cleanVal !== undefined) {
            cleaned[key] = cleanVal;
          }
        }
      }
      return cleaned;
    }
  }
  return val;
}

export { db, isFirebaseConfigured };

export interface DossierData {
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

export interface BrainNode {
  id: string;
  title: string;
  type: string;
  image?: string;
  desc: string;
  tags: string[];
  x: number;
  y: number;
  pinned: boolean;
  rotation: number;
}

export interface BrainConnection {
  from: string;
  to: string;
}

export interface NotebookPage {
  id: string;
  title: string;
  content: string;
  highlighted?: boolean;
}

// ─── Case Dossier Sync ───────────────────────────────────────────────────
export async function getFirebaseDossier(fallback: DossierData): Promise<DossierData> {
  if (!db) return fallback;
  try {
    const docRef = doc(db, 'portfolio_data', 'dossier');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as DossierData;
    }
  } catch (e) {
    console.error('Error fetching dossier from Firebase:', e);
  }
  return fallback;
}

export async function saveFirebaseDossier(data: DossierData): Promise<void> {
  if (!db) throw new Error('Firebase database not initialized');
  try {
    const docRef = doc(db, 'portfolio_data', 'dossier');
    const clean = prepareFirestoreData(data, 'portfolio_data/dossier');
    await setDoc(docRef, clean, { merge: true });
  } catch (e) {
    console.error('Error saving dossier to Firebase:', e);
    throw e;
  }
}

// ─── Brain Wall Nodes Sync ───────────────────────────────────────────────
export async function getFirebaseNodes(fallback: BrainNode[]): Promise<BrainNode[]> {
  if (!db) return fallback;
  try {
    const colRef = collection(db, 'brain_nodes');
    const querySnapshot = await getDocs(colRef);
    if (querySnapshot.empty) return [];
    const list: BrainNode[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as BrainNode);
    });
    return list;
  } catch (e) {
    console.error('Error fetching nodes from Firebase:', e);
  }
  return fallback;
}

export async function saveFirebaseNodes(nodes: BrainNode[]): Promise<void> {
  if (!db) throw new Error('Firebase database not initialized');
  try {
    const colRef = collection(db, 'brain_nodes');
    const querySnapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    nodes.forEach((node) => {
      const docRef = doc(db, 'brain_nodes', node.id);
      const clean = prepareFirestoreData(node, `brain_nodes/${node.id}`);
      batch.set(docRef, clean);
    });
    
    await batch.commit();
  } catch (e) {
    console.error('Error saving nodes to Firebase:', e);
    throw e;
  }
}

// ─── Brain Wall Connections Sync ──────────────────────────────────────────
export async function getFirebaseConnections(fallback: BrainConnection[]): Promise<BrainConnection[]> {
  if (!db) return fallback;
  try {
    const colRef = collection(db, 'brain_connections');
    const querySnapshot = await getDocs(colRef);
    if (querySnapshot.empty) return [];
    const list: BrainConnection[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as BrainConnection);
    });
    return list;
  } catch (e) {
    console.error('Error fetching connections from Firebase:', e);
  }
  return fallback;
}

export async function saveFirebaseConnections(connections: BrainConnection[]): Promise<void> {
  if (!db) throw new Error('Firebase database not initialized');
  try {
    const colRef = collection(db, 'brain_connections');
    const querySnapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    connections.forEach((c) => {
      const connId = `${c.from}_${c.to}`;
      const docRef = doc(db, 'brain_connections', connId);
      const clean = prepareFirestoreData(c, `brain_connections/${connId}`);
      batch.set(docRef, clean);
    });
    
    await batch.commit();
  } catch (e) {
    console.error('Error saving connections to Firebase:', e);
    throw e;
  }
}

// ─── Notebook Pages Sync ─────────────────────────────────────────────────
export interface NotebookMetadata {
  folded: string[];
  bookmarks: string[];
  order?: string[];
}

export async function getFirebaseNotebook(
  fallbackPages: NotebookPage[],
  fallbackFolded: string[],
  fallbackBookmarks: string[]
): Promise<{ pages: NotebookPage[]; folded: string[]; bookmarks: string[] }> {
  if (!db) return { pages: fallbackPages, folded: fallbackFolded, bookmarks: fallbackBookmarks };
  try {
    // 1. Get Pages
    const pagesCol = collection(db, 'notebook_pages');
    const pagesSnapshot = await getDocs(pagesCol);
    
    if (pagesSnapshot.empty) {
      return { pages: [], folded: [], bookmarks: [] };
    }
    
    const pagesMap: Record<string, NotebookPage> = {};
    pagesSnapshot.forEach((doc) => {
      if (doc.id !== '_metadata') {
        pagesMap[doc.id] = doc.data() as NotebookPage;
      }
    });

    // 2. Get Metadata
    const metaDoc = doc(db, 'notebook_pages', '_metadata');
    const metaSnap = await getDoc(metaDoc);
    let folded = fallbackFolded;
    let bookmarks = fallbackBookmarks;
    let order: string[] = [];
    if (metaSnap.exists()) {
      const data = metaSnap.data() as NotebookMetadata;
      folded = data.folded || [];
      bookmarks = data.bookmarks || [];
      order = data.order || [];
    }

    // 3. Reconstruct ordered pages
    const orderedPages: NotebookPage[] = [];
    order.forEach((id) => {
      if (pagesMap[id]) {
        orderedPages.push(pagesMap[id]);
        delete pagesMap[id];
      }
    });
    
    // Append any remaining pages
    Object.values(pagesMap).forEach((page) => {
      orderedPages.push(page);
    });

    return {
      pages: orderedPages,
      folded,
      bookmarks
    };
  } catch (e) {
    console.error('Error fetching notebook from Firebase:', e);
  }
  return { pages: fallbackPages, folded: fallbackFolded, bookmarks: fallbackBookmarks };
}

export async function saveFirebaseNotebook(
  pages: NotebookPage[],
  folded: string[],
  bookmarks: string[]
): Promise<void> {
  if (!db) throw new Error('Firebase database not initialized');
  try {
    const pagesCol = collection(db, 'notebook_pages');
    const querySnapshot = await getDocs(pagesCol);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    pages.forEach((page) => {
      const docRef = doc(db, 'notebook_pages', page.id);
      const cleanPage = prepareFirestoreData(page, `notebook_pages/${page.id}`);
      batch.set(docRef, cleanPage);
    });

    const metaRef = doc(db, 'notebook_pages', '_metadata');
    const order = pages.map(p => p.id);
    const metaData: NotebookMetadata = { folded, bookmarks, order };
    const cleanMeta = prepareFirestoreData(metaData, 'notebook_pages/_metadata');
    batch.set(metaRef, cleanMeta);
    
    await batch.commit();
  } catch (e) {
    console.error('Error saving notebook to Firebase:', e);
    throw e;
  }
}

// ─── Filmography Projects Sync ──────────────────────────────────────────
export async function getFirebaseProjects(fallback: FilmographyProject[]): Promise<FilmographyProject[]> {
  if (!db) return fallback;
  try {
    const docRef = doc(db, 'portfolio_data', 'dossier');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && Array.isArray(data.projects)) {
        return data.projects as FilmographyProject[];
      }
    }
  } catch (e) {
    console.error('Error fetching filmography projects from Firebase:', e);
  }
  return fallback;
}

export async function saveFirebaseProjects(projects: FilmographyProject[]): Promise<void> {
  if (!db) throw new Error('Firebase database not initialized');
  try {
    const docRef = doc(db, 'portfolio_data', 'dossier');
    const cleanProjects = prepareFirestoreData(projects, 'portfolio_data/dossier.projects');
    await setDoc(docRef, { projects: cleanProjects }, { merge: true });
  } catch (e) {
    console.error('Error saving filmography projects to Firebase:', e);
    throw e;
  }
}

// ─── Firebase Health Check & Telemetry ─────────────────────────────────
export interface FirebaseHealthCheckResult {
  ok: boolean;
  firestore: {
    read: boolean;
    write: boolean;
    details: string;
  };
  collections: {
    dossier: boolean;
    nodes: boolean;
    connections: boolean;
    notebook: boolean;
  };
  timestamp: string;
}

export async function runFirebaseHealthCheck(): Promise<FirebaseHealthCheckResult> {
  const result: FirebaseHealthCheckResult = {
    ok: false,
    firestore: { read: false, write: false, details: 'NOT CHECKED' },
    collections: { dossier: false, nodes: false, connections: false, notebook: false },
    timestamp: new Date().toLocaleString()
  };

  if (!db) {
    result.firestore.details = 'Firebase not initialized (missing credentials)';
    return result;
  }

  try {
    // 1. Read test
    const startRead = Date.now();
    const docRef = doc(db, 'portfolio_data', 'dossier');
    const docSnap = await getDoc(docRef);
    result.firestore.read = true;
    result.collections.dossier = docSnap.exists();
    
    // Check nodes collection presence
    try {
      const nodesCol = collection(db, 'brain_nodes');
      const nodesSnap = await getDocs(nodesCol);
      result.collections.nodes = !nodesSnap.empty;
    } catch (_) {}

    // Check connections collection presence
    try {
      const connCol = collection(db, 'brain_connections');
      const connSnap = await getDocs(connCol);
      result.collections.connections = !connSnap.empty;
    } catch (_) {}

    // Check notebook pages collection presence
    try {
      const noteCol = collection(db, 'notebook_pages');
      const noteSnap = await getDocs(noteCol);
      result.collections.notebook = !noteSnap.empty;
    } catch (_) {}

    const readMs = Date.now() - startRead;
    
    // 2. Write test (merge a health check tag on dossier)
    const startWrite = Date.now();
    await setDoc(docRef, { last_health_check: Date.now() }, { merge: true });
    result.firestore.write = true;
    const writeMs = Date.now() - startWrite;

    result.ok = true;
    result.firestore.details = `HEALTHY // READ: ${readMs}ms, WRITE: ${writeMs}ms`;
  } catch (e: any) {
    console.error('Firebase Health Check Failed:', e);
    result.firestore.details = `FAILED: [${e.code || 'unknown'}] ${e.message || String(e)}`;
  }

  return result;
}

export function prepareFirestoreData(data: any, _identifierLabel: string): any {
  const undefinedPaths = findUndefinedPaths(data);
  if (undefinedPaths.length > 0) {
    console.error(`Firestore: undefined fields in payload:`, undefinedPaths);
  }
  return sanitizeFirestoreData(data);
}

export function formatFirebaseError(
  error: any,
  collectionName: string,
  docId: string,
  operation: string,
  rawPayload?: any
) {
  let extraMsg = '';
  if (rawPayload !== undefined) {
    const undefPaths = findUndefinedPaths(rawPayload);
    if (undefPaths.length > 0) {
      extraMsg = `\n\n[DIAGNOSTICS] Undefined Field Paths Found:\n` + undefPaths.map(p => `❌ ${p}`).join('\n');
    }
  }
  return {
    collection: collectionName,
    docId,
    operation,
    errorCode: error.code || 'unknown-error',
    errorMessage: (error.message || String(error)) + extraMsg,
    networkStatus: navigator.onLine ? 'ONLINE' : 'OFFLINE',
    currentUser: localStorage.getItem('himanshumer_admin_auth_token_v3') ? 'ADMIN (AUTHORIZED)' : 'VISITOR (READ-ONLY)',
    timestamp: new Date().toLocaleString()
  };
}


