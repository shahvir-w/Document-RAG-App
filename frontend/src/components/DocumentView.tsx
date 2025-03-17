import { useState } from 'react';
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
        <mark className="bg-yellow-500/30 text-white">{highlight}</mark>
        {after}
      </>
    );
  };

  return (
    <div className="w-2/5 overflow-auto border-r border-zinc-700 custom-scrollbar">
      {/* View Toggle */}
      <div className="sticky top-0 bg-zinc-950 z-10 p-4 border-b border-zinc-700 flex justify-center">
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

      {viewMode === 'text' ? (
        <div className="overflow-auto p-6">
          <div className="text-zinc-300">
            {renderHighlightedText()}
          </div>
        </div>
      ) : (
        <>
          {pdfUrl ? (
            <div className="flex-1 flex flex-col justify-center">
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <div
                style={{
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    height: '100%',
                    padding: '10px',
                }}
              >
                <Viewer fileUrl={pdfUrl} />
              </div>
              </Worker>
            </div>
          ) : (
            // PDF not available message
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              <div className="text-center mt-10">
                <p>PDF view not available for this document</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DocumentView;
