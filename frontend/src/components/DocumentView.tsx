import { useState } from "react";
import { Book, FileText } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import dummyPdf from "../assets/dummy.pdf" 

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewProps {
  pdfUrl?: string;
  text?: string;
}

function DocumentView({ pdfUrl = dummyPdf, text }: DocumentViewProps) {
  const [viewMode, setViewMode] = useState<"text" | "doc">("text");
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

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
            <Book className="h-4 w-4 mr-2" />
            Text View
          </button>
          <button
            className={`flex items-center px-3 py-2 text-sm font-medium border rounded-r-md border-l-0 ${
              viewMode === "doc" ? "custom-background full-border text-purple-100" : "bg-zinc-800 border-zinc-700 text-zinc-300"
            } transition-colors`}
            onClick={() => setViewMode("doc")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Document View
          </button>
        </div>
      </div>

      {/* Document View Container */}
      <div className="p-4">
        {viewMode === "text" ? (
          <div className="border border-zinc-700 rounded-md p-4 bg-zinc-900 h-full overflow-auto custom-scrollbar">
            <p className="mb-4 text-zinc-300">
              {text}
            </p>
          </div>
        ) : (
          <div className="border border-zinc-700 rounded-md bg-zinc-900 h-full overflow-auto custom-scrollbar">
            <div className="flex flex-col items-center p-4">
              {/* PDF Document - Scrollable Container */}
              <div className="w-full max-h-screen overflow-auto custom-scrollbar bg-zinc-800 rounded-md">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex flex-col items-center"
                  loading={
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-pulse text-zinc-400">Loading PDF...</div>
                    </div>
                  }
                  error={
                    <div className="text-center p-4 text-red-400 bg-red-900/20 rounded-md">
                      <p>Error loading PDF. Please check the URL and try again.</p>
                    </div>
                  }
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="mb-4"
                      width={450}
                      loading={
                        <div className="flex justify-center items-center h-64 w-full mb-4">
                          <div className="animate-pulse text-zinc-400">Loading page {index + 1}...</div>
                        </div>
                      }
                    />
                  ))}
                </Document>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentView;