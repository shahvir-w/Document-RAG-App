import { useState, useEffect, useRef } from 'react';
import { FileText, File } from 'lucide-react';
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';


interface DocumentViewProps {
  text: string;
  pdfUrl?: string;
  highlightedText?: string;
  setViewMode: (mode: 'text' | 'pdf') => void;
  viewMode: 'text' | 'pdf';
}

function DocumentView({ text, pdfUrl, highlightedText, setViewMode, viewMode }: DocumentViewProps) {
  const highlightRef = useRef<HTMLElement>(null);
  const textScrollRef = useRef<HTMLDivElement>(null);
  const pdfScrollRef = useRef<HTMLDivElement>(null);
  
  // Store scroll positions for each view
  const textScrollPosition = useRef<number>(0);
  const pdfScrollPosition = useRef<number>(0);
  
  // Save scroll positions when scrolling
  const handleTextScroll = () => {
    if (textScrollRef.current) {
      textScrollPosition.current = textScrollRef.current.scrollTop;
    }
  };
  
  const handlePdfScroll = () => {
    if (pdfScrollRef.current) {
      pdfScrollPosition.current = pdfScrollRef.current.scrollTop;
    }
  };
  
  // Restore scroll positions when switching views
  useEffect(() => {
    if (viewMode === 'text' && textScrollRef.current) {
      textScrollRef.current.scrollTop = textScrollPosition.current;
    } else if (viewMode === 'pdf' && pdfScrollRef.current) {
      pdfScrollRef.current.scrollTop = pdfScrollPosition.current;
    }
  }, [viewMode]);

  // Handle highlighted text scrolling
  useEffect(() => {
    if (highlightedText && highlightRef.current && viewMode === 'text') {
      highlightRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      // Update stored text scroll position after scrolling to highlight
      if (textScrollRef.current) {
        setTimeout(() => {
          textScrollPosition.current = textScrollRef?.current?.scrollTop || 0;
        }, 500); // Allow time for smooth scrolling
      }
    }
  }, [highlightedText]);

  const renderHighlightedText = () => {
    if (!highlightedText) return text;
    
    const index = text.indexOf(highlightedText);
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const highlight = text.substring(index, index + highlightedText.length);
    const after = text.substring(index + highlightedText.length);
    
    return (
      <>
        {before}
        <mark 
          ref={highlightRef}
          className="custom-text-background text-zinc-200"
        >
          {highlight}
        </mark>
        {after}
      </>
    );
  };

  return (
    <div className="w-2/5 overflow-hidden border-r border-zinc-700">
      {/* View Toggle */}
      <div className="top-0 bg-zinc-950 z-10 p-4 border-b border-zinc-700 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            className={`flex items-center px-3 py-2 text-sm font-medium border rounded-l-md ${
              viewMode === "text" ? "custom-background full-border text-purple-100" : "bg-zinc-800 border-zinc-700 text-zinc-300"
            } transition-colors`}
            onClick={() => setViewMode("text")}
          >
            <FileText className="w-4 h-4 mr-1" />
            Text View
          </button>
          <button
            className={`flex items-center px-3 py-2 text-sm font-medium border rounded-r-md border-l-0 ${
              viewMode === "pdf" ? "custom-background full-border text-purple-100" : "bg-zinc-800 border-zinc-700 text-zinc-300"
            } transition-colors`}
            onClick={() => setViewMode("pdf")}
          >
            <File className="w-4 h-4 mr-1" />
            PDF View
          </button>
        </div>
      </div>

      {/* Both views are always rendered but only one is visible */}
      <div 
        ref={textScrollRef}
        className={`h-[calc(100%-70px)] overflow-auto p-6 custom-scrollbar ${viewMode === 'text' ? 'block' : 'hidden'}`}
        onScroll={handleTextScroll}
      >
        <div className="text-zinc-300">
          {renderHighlightedText()}
        </div>
      </div>

      <div 
        ref={pdfScrollRef}
        className={`h-[calc(100%-70px)] overflow-auto custom-scrollbar ${viewMode === 'pdf' ? 'block' : 'hidden'}`}
        onScroll={handlePdfScroll}
      >
        {pdfUrl ? (
          <div className="h-full">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <div
                style={{
                  height: '100%',
                  padding: '10px',
                }}
              >
                <Viewer fileUrl={pdfUrl} />
              </div>
            </Worker>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500 h-full">
            <div className="text-center mt-10">
              <p>PDF view not available for this document</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentView;
