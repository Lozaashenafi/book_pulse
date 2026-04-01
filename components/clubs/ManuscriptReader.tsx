// components/ManuscriptReader.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { 
  Maximize2, Minimize2, X, Plus, Minus, 
  ChevronLeft, ChevronRight, Zap, Loader2, AlertTriangle 
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useChat } from "@/hooks/useChat";
import { useAuthStore } from "@/store/useAuthStore";

// Configure PDF.js worker
// This ensures the worker version ALWAYS matches your library version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
 
   
interface ReaderProps {
  pdfUrl: string;
  clubName: string;
  clubId:string;
  currentPage: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
  onLogProgress: (page: number) => void;
}

const ManuscriptReader = ({ 
  pdfUrl, clubName, currentPage, isFullscreen, clubId,
  onToggleFullscreen, onClose, onLogProgress 
}: ReaderProps) => {
    const { user, profile: myProfile } = useAuthStore();
  
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPageNum, setCurrentPageNum] = useState(currentPage);
  const [zoom, setZoom] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSyncIndicator, setShowSyncIndicator] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    logProgress,
  } = useChat(clubId, user?.id);
  // Load PDF with proper CORS handling
  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfUrl) {
        setError("No PDF URL provided");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      console.log('Loading PDF from:', pdfUrl);
      
      try {
        // FIX: Remove credentials: 'include' and use simple fetch without credentials
        const response = await fetch(pdfUrl, {
          mode: 'cors',
          // DON'T include credentials - this causes the CORS error
          // credentials: 'include',  // REMOVED THIS LINE
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Convert to blob URL to avoid CORS issues with PDF.js
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setPdfData(blobUrl);
        setIsLoading(false)
        
        // Clean up old blob URL
        return () => {
          URL.revokeObjectURL(blobUrl);
        };
        
      } catch (err: any) {
        console.error('Failed to fetch PDF:', err);
        setError(`Failed to load PDF: ${err.message}`);
        setIsLoading(false);
      }
    };
    
    loadPDF();
    
    // Set timeout for loading
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setError("PDF is taking too long to load. Please check your connection.");
        setIsLoading(false);
      }
    }, 15000);
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully, pages:', numPages);
    setNumPages(numPages);
    setIsLoading(false);
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  };

  const onDocumentLoadError = (err: Error) => {
  console.error("PDF render engine error:", err);
  setError(`PDF Engine Error: ${err.message}. Try refreshing.`);
  setIsLoading(false); // This stops the spinner
};
const handlePageChange = useCallback((newPage: number) => {
  if (newPage >= 1 && newPage <= numPages && newPage !== currentPageNum) {
    setCurrentPageNum(newPage);
    
    // FIX: Only call the prop. 
    // The parent (ClubDiscussion) already handles the database logic.
    // Calling both causes a database collision.
    onLogProgress(newPage); 
    
    setShowSyncIndicator(true);
    setTimeout(() => setShowSyncIndicator(false), 1000);
  }
}, [numPages, currentPageNum, onLogProgress]);
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!numPages) return;
      if (e.key === "ArrowLeft") {
        handlePageChange(currentPageNum - 1);
      } else if (e.key === "ArrowRight") {
        handlePageChange(currentPageNum + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPageNum, handlePageChange, numPages]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfData && pdfData.startsWith('blob:')) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [pdfData]);

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

    const documentOptions = useMemo(
    () => ({
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
    }),
    []
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1a1a1a] relative">
      {/* Header */}
      <header className="px-4 py-3 border-b border-white/10 bg-[#252525] flex justify-between items-center z-20 text-white">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4a373]">
            {clubName} / Page {currentPageNum} of {numPages || "?"}
          </span>
          <div className="flex items-center bg-black/40 rounded border border-white/10 p-1">
            <button 
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} 
              disabled={!numPages}
              className="p-1 hover:text-[#d4a373] disabled:opacity-50"
            >
              <Minus size={14}/>
            </button>
            <span className="text-[10px] font-mono w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={() => setZoom(z => Math.min(2.0, z + 0.1))}
              disabled={!numPages}
              className="p-1 hover:text-[#d4a373] disabled:opacity-50"
            >
              <Plus size={14}/>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onToggleFullscreen} className="p-2 hover:bg-white/5 rounded">
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button onClick={onClose} className="p-2 text-red-400 hover:bg-red-400/10 rounded">
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Viewer */}
      <div className="flex-1 bg-[#333] relative overflow-auto">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 gap-4 p-8 text-center">
            <AlertTriangle size={48} />
            <p className="max-w-md">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                setPdfData(null);
                setTimeout(() => {
                  // Reload with fresh fetch
                  const fetchAndSet = async () => {
                    try {
                      const response = await fetch(pdfUrl, { mode: 'cors' });
                      if (response.ok) {
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        setPdfData(blobUrl);
                      } else {
                        setError(`HTTP ${response.status}: Failed to load PDF`);
                        setIsLoading(false);
                      }
                    } catch (err: any) {
                      setError(`Failed to load PDF: ${err.message}`);
                      setIsLoading(false);
                    }
                  };
                  fetchAndSet();
                }, 100);
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
          <>
            {/* Navigation Arrows */}
            {numPages > 0 && (
              <>
                <button
                  onClick={() => handlePageChange(currentPageNum - 1)}
                  disabled={currentPageNum <= 1}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={32} />
                </button>
                
                <button
                  onClick={() => handlePageChange(currentPageNum + 1)}
                  disabled={currentPageNum >= numPages}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* PDF Viewer */}
            <div className="flex items-center justify-center p-4 min-h-full w-full">
              <Document
                file={pdfData}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                onSourceError={onDocumentLoadError} // Add this line

                loading={
                  <div className="flex items-center justify-center w-96 h-96">
                    <Loader2 className="animate-spin text-[#d4a373]" size={32} />
                  </div>
                }
                options={
                  documentOptions
                }
                // options={{
                //   cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
                //   cMapPacked: true,
                // }}
              >
                <Page 
                  pageNumber={currentPageNum} 
                  scale={zoom}
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                  width={Math.min(1000, window.innerWidth - 100)}
                  loading={
                    <div className="flex items-center justify-center w-96 h-96">
                      <Loader2 className="animate-spin text-[#d4a373]" size={32} />
                    </div>
                  }
                />
              </Document>
            </div>

            {/* Page Indicator */}
            {/* {numPages > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-mono">
                Page {currentPageNum} of {numPages}
              </div>
            )} */}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="px-6 py-1 bg-[#d4a373] text-[#1a1614] flex justify-between items-center text-[8px] font-mono font-bold">
        <div className="flex items-center gap-2">
          <Zap size={10} />
          <span>Auto-sync active</span>
        </div>
        <div className="flex items-center gap-2">
          <span>← → keys to navigate</span>
          <span className="ml-2">Page {numPages ? Math.round((currentPageNum / numPages) * 100) : 0}%</span>
        </div>
      </footer>

      {/* Sync Indicator */}
      {showSyncIndicator && (
        <div className="fixed bottom-20 right-4 bg-green-500 text-white px-3 py-1.5 rounded-md text-xs animate-pulse shadow-lg z-50">
          Synced
        </div>
      )}
    </div>
  );
};

export default ManuscriptReader;