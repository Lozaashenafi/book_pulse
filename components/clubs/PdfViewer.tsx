"use client";

import React, { useState, useEffect } from "react";
import {
  Maximize2,
  Minimize2,
  X,
  Loader2,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface PdfViewerProps {
  pdfUrl: string;
  clubName: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
}

const PdfViewer = ({
  pdfUrl,
  clubName,
  isFullscreen,
  onToggleFullscreen,
  onClose,
}: PdfViewerProps) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!pdfUrl) {
      setError("No PDF URL provided");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(pdfUrl, { mode: "cors" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setIsLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(`Failed to load: ${err.message}`);
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [pdfUrl]);

  if (!pdfUrl) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#333]">
        <div className="text-center text-gray-400">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <p>No manuscript available for this club</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1a1a1a] relative">
      <header className="px-4 py-3 border-b border-white/10 bg-[#252525] flex justify-between items-center z-20 text-white">
        <div className="flex items-center gap-4">
          <FileText size={16} className="text-[#d4a373]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4a373]">
            {clubName} / Manuscript
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleFullscreen}
            className="p-2 hover:bg-white/5 rounded"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-red-400 hover:bg-red-400/10 rounded"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 bg-[#333] relative">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 gap-4 p-8 text-center">
            <AlertTriangle size={48} />
            <p className="max-w-md">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                setBlobUrl(null);
                const retryFetch = async () => {
                  try {
                    const response = await fetch(pdfUrl, { mode: "cors" });
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = URL.createObjectURL(blob);
                      setBlobUrl(url);
                    } else {
                      setError(`HTTP ${response.status}: Failed to load PDF`);
                      setIsLoading(false);
                    }
                  } catch (err: any) {
                    setError(`Failed to load: ${err.message}`);
                    setIsLoading(false);
                  }
                };
                retryFetch();
              }}
              className="mt-4 px-4 py-2 bg-[#d4a373] text-tertiary rounded text-sm font-mono hover:bg-[#c4925a] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-[#d4a373] gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="text-sm font-mono">Loading manuscript...</p>
          </div>
        ) : (
          <iframe
            src={blobUrl!}
            className="w-full h-full border-none"
            title={`${clubName} - Manuscript`}
            allowFullScreen
          />
        )}
      </div>

      <footer className="px-6 py-1 bg-[#d4a373] text-[#1a1614] flex justify-between items-center text-[8px] font-mono font-bold">
        <span>Use your browser&apos;s PDF viewer to navigate</span>
        <span>Page syncing available in sidebar</span>
      </footer>
    </div>
  );
};

export default PdfViewer;
