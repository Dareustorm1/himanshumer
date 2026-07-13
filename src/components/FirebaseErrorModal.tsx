import { X, RefreshCw, AlertTriangle } from 'lucide-react';

export interface FirebaseErrorDetails {
  collection: string;
  docId: string;
  operation: string;
  errorCode: string;
  errorMessage: string;
  networkStatus: string;
  currentUser: string;
  timestamp: string;
}

interface FirebaseErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorDetails: FirebaseErrorDetails | null;
  onRetry?: () => void;
}

export default function FirebaseErrorModal({
  isOpen,
  onClose,
  errorDetails,
  onRetry
}: FirebaseErrorModalProps) {
  if (!isOpen || !errorDetails) return null;

  return (
    <div className="fixed inset-0 z-[9999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 select-none font-mono">
      <div className="bg-[#0e0e0e] border border-red-500/30 rounded w-full max-w-md relative shadow-2xl p-6 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-red-500/20 pb-3 mb-5">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">// FIREBASE TRANSACTION FAILURE</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostics Table */}
        <div className="space-y-2.5 text-[10px] text-neutral-300 mb-6 bg-red-950/5 p-4 rounded border border-red-500/10">
          <div className="grid grid-cols-3 border-b border-white/[0.03] pb-1.5">
            <span className="text-neutral-500 uppercase font-semibold">OPERATION</span>
            <span className="col-span-2 text-red-400 font-bold uppercase tracking-wider">{errorDetails.operation}</span>
          </div>
          <div className="grid grid-cols-3 border-b border-white/[0.03] pb-1.5">
            <span className="text-neutral-500 uppercase font-semibold">COLLECTION</span>
            <span className="col-span-2 text-white font-semibold">{errorDetails.collection}</span>
          </div>
          <div className="grid grid-cols-3 border-b border-white/[0.03] pb-1.5">
            <span className="text-neutral-500 uppercase font-semibold">DOCUMENT ID</span>
            <span className="col-span-2 text-neutral-400 select-all font-semibold">{errorDetails.docId}</span>
          </div>
          <div className="grid grid-cols-3 border-b border-white/[0.03] pb-1.5">
            <span className="text-neutral-500 uppercase font-semibold">ERROR CODE</span>
            <span className="col-span-2 text-red-500 font-bold tracking-wider">{errorDetails.errorCode}</span>
          </div>
          <div className="grid grid-cols-3 border-b border-white/[0.03] pb-1.5">
            <span className="text-neutral-500 uppercase font-semibold">NETWORK STATUS</span>
            <span className={`col-span-2 font-bold ${errorDetails.networkStatus === 'ONLINE' ? 'text-[#35D07F]' : 'text-red-500 animate-pulse'}`}>
              {errorDetails.networkStatus}
            </span>
          </div>
          <div className="grid grid-cols-3 border-b border-white/[0.03] pb-1.5">
            <span className="text-neutral-500 uppercase font-semibold">CURRENT USER</span>
            <span className="col-span-2 text-amber-500 font-bold uppercase">{errorDetails.currentUser}</span>
          </div>
          <div className="grid grid-cols-3 border-b border-white/[0.03] pb-1.5">
            <span className="text-neutral-500 uppercase font-semibold">TIMESTAMP</span>
            <span className="col-span-2 text-neutral-450">{errorDetails.timestamp}</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-2 border-t border-white/[0.04] pt-2">
            <span className="text-neutral-550 uppercase font-bold">RAW FIREBASE MESSAGE:</span>
            <span className="text-red-400 bg-black/40 p-2.5 rounded border border-red-500/10 leading-normal select-text break-words max-h-[100px] overflow-y-auto">
              {errorDetails.errorMessage}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-grow py-2.5 bg-white hover:bg-neutral-200 text-black text-[10px] font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Transaction
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white text-[10px] uppercase tracking-widest rounded-sm cursor-pointer transition-all"
          >
            Close / Discard
          </button>
        </div>

        {/* Cinematic Brackets */}
        <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-red-500/50 pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-red-500/50 pointer-events-none" />
      </div>
    </div>
  );
}
