import { useState, useEffect } from 'react';
import { Activity, Terminal, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { isFirebaseConfigured, runFirebaseHealthCheck, FirebaseHealthCheckResult } from '../lib/firebase';

export default function FirebaseDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<FirebaseHealthCheckResult | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Monitor Keyboard Shortcuts (Ctrl + Shift + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Monitor Custom Click Event (Filmmaking heading clicks)
  useEffect(() => {
    let clickCount = 0;
    let timer: NodeJS.Timeout;

    const handleHeadingClick = () => {
      clickCount++;
      clearTimeout(timer);
      if (clickCount >= 5) {
        setIsOpen(prev => !prev);
        clickCount = 0;
      }
      timer = setTimeout(() => {
        clickCount = 0;
      }, 2000);
    };

    const targetHeading = document.querySelector('#projects h2');
    if (targetHeading) {
      targetHeading.addEventListener('click', handleHeadingClick);
    }

    return () => {
      if (targetHeading) {
        targetHeading.removeEventListener('click', handleHeadingClick);
      }
    };
  }, []);

  const executeHealthCheck = async () => {
    setLoading(true);
    setLastError(null);
    try {
      const res = await runFirebaseHealthCheck();
      setHealthData(res);
    } catch (e: any) {
      setLastError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 z-[999999] w-80 bg-neutral-950 border border-neutral-800 rounded-sm font-mono text-[9px] text-neutral-400 p-4 shadow-2xl animate-[fadeIn_0.2s_ease]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 mb-3">
        <div className="flex items-center gap-1.5 text-white font-bold tracking-widest uppercase">
          <Terminal className="w-3.5 h-3.5 text-[#C62828]" />
          <span>// FIREBASE DIAGNOSTIC PANEL</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info Indicators */}
      <div className="space-y-1.5 mb-4 border-b border-white/[0.03] pb-3">
        <div className="flex justify-between">
          <span>FIREBASE CONFIGURED:</span>
          <span className={isFirebaseConfigured ? 'text-[#35D07F] font-bold' : 'text-red-500 font-bold'}>
            {isFirebaseConfigured ? 'YES' : 'NO'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>PORTFOLIO AUTH ROLE:</span>
          <span className="text-amber-500 font-bold">
            {localStorage.getItem('himanshumer_admin_auth_token_v3') ? 'ADMIN_ACCESS' : 'VISITOR_ACCESS'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>NETWORK ONLINE:</span>
          <span className={navigator.onLine ? 'text-[#35D07F] font-bold' : 'text-red-500 font-bold animate-pulse'}>
            {navigator.onLine ? 'YES' : 'NO'}
          </span>
        </div>
      </div>

      {/* Health Check Details */}
      {healthData && (
        <div className="space-y-2 mb-4 bg-white/[0.02] p-2.5 rounded border border-white/5">
          <div className="flex items-center gap-1.5 text-white uppercase font-bold text-[8px] tracking-wider mb-1">
            <Activity className="w-3 h-3 text-[#35D07F]" />
            <span>Health Check: {healthData.ok ? 'HEALTHY' : 'UNHEALTHY'}</span>
          </div>
          <div className="text-neutral-500 uppercase flex flex-col gap-0.5">
            <div>FIRESTORE: <span className="text-white font-normal lowercase">{healthData.firestore.details}</span></div>
            <div>VERIFIED PATHS:</div>
            <div className="pl-2.5 flex flex-col gap-0.5 mt-0.5">
              <div className="flex justify-between">
                <span>- dossier</span>
                <span className={healthData.collections.dossier ? 'text-[#35D07F]' : 'text-neutral-600'}>
                  {healthData.collections.dossier ? 'FOUND' : 'MISSING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>- brain_nodes</span>
                <span className={healthData.collections.nodes ? 'text-[#35D07F]' : 'text-neutral-600'}>
                  {healthData.collections.nodes ? 'FOUND' : 'MISSING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>- brain_connections</span>
                <span className={healthData.collections.connections ? 'text-[#35D07F]' : 'text-neutral-600'}>
                  {healthData.collections.connections ? 'FOUND' : 'MISSING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>- notebook_pages</span>
                <span className={healthData.collections.notebook ? 'text-[#35D07F]' : 'text-neutral-600'}>
                  {healthData.collections.notebook ? 'FOUND' : 'MISSING'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {lastError && (
        <div className="p-2 border border-red-500/10 bg-red-950/5 text-red-400 rounded-sm mb-4 leading-normal flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{lastError}</span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={executeHealthCheck}
        disabled={loading}
        className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded border border-white/10 uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'TESTING...' : 'RUN HEALTH TEST'}
      </button>

      {/* Cinematic Brackets */}
      <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-white/10 pointer-events-none" />
      <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-white/10 pointer-events-none" />
    </div>
  );
}
