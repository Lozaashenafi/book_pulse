"use client";

import React from "react";
import {
  Maximize2,
  Minimize2,
  X,
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
        <iframe
          src={pdfUrl}
          className="w-full h-full border-none"
          title={`${clubName} - Manuscript`}
          allowFullScreen
        />
      </div>

      <footer className="px-6 py-1 bg-[#d4a373] text-[#1a1614] flex justify-between items-center text-[8px] font-mono font-bold">
        <span>Use your browser&apos;s PDF viewer to navigate</span>
        <span>Page syncing available in sidebar</span>
      </footer>
    </div>
  );
};

export default PdfViewer;
