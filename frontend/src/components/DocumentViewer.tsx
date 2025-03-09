import React from 'react';
import { FileText } from 'lucide-react';

interface DocumentViewerProps {
  document: File;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Document Header */}
      <div className="p-4 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-400" />
          <span className="text-gray-200 font-medium">{document.name}</span>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="prose prose-invert max-w-none">
          {/* Placeholder content - In a real app, this would render the actual document */}
          <p className="text-gray-400">Document content would be rendered here...</p>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;