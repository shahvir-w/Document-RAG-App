import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, File } from 'lucide-react';
import dummyPdf from "../assets/dummy.pdf" 
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';


interface DocumentViewProps {
  text: string;
  pdfUrl?: string;
}

function DocumentView({ text, pdfUrl }: DocumentViewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [viewMode, setViewMode] = useState<'text' | 'pdf'>('text');

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const nextPage = () => {
    if (pageNumber < (numPages || 0)) {
      setPageNumber(pageNumber + 1);
    }
  };

  const previousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const zoomIn = () => {
    setScale(scale + 0.1);
  };

  const zoomOut = () => {
    if (scale > 0.5) {
      setScale(scale - 0.1);
    }
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
        // Text viewer
        <div className="overflow-auto p-6">
          <div className="text-zinc-300">
              {text}
          </div>
        </div>
      ) : (
        <>
          {pdfUrl ? (
            <div className="flex-1 flex flex-col">
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
