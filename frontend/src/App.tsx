import React, { useState } from 'react';
import { Upload, Clipboard, X } from 'lucide-react';
import DocumentViewer from './components/DocumentViewer';
import BlockSummary from './components/BlockSummary';
import ViewSlider from './components/ViewSlider';


function App() {
  const [activeDocument, setActiveDocument] = useState<File | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textContent, setTextContent] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setActiveDocument(file);
    }
  };

  const handleTextSubmit = () => {
    if (textContent.trim()) {
      // Create a new file from the text content
      const blob = new Blob([textContent], { type: 'text/plain' });
      const file = new File([blob], 'document.txt', { type: 'text/plain' });
      setActiveDocument(file);
      setShowTextInput(false);
      setTextContent('');
    }
  };

  if (!activeDocument) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-blue-900/40 via-gray-900/60 to-black" />
        
        {/* Checkered background pattern */}
        <div className="absolute inset-0 grid grid-cols-[repeat(40,minmax(0,1fr))] grid-rows-[repeat(40,minmax(0,1fr))]">
          {Array.from({ length: 1600 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-500/[0.03] border border-gray-500/[0.08]"
            />
          ))}
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-radial-glow opacity-50" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 to-orange-500 to-yellow-500 to-green-500">
            Compartmentalizatize AI
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl">
            Upload your document and let our AI analyze, compartmentalize, and help you understand it better.
          </p>
          
          <div className="flex flex-col items-center gap-6">
            {/* Upload section */}
            <label className="group cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="w-96 h-64 rounded-3xl bg-gray-900/50 border-2 border-gray-700/30 flex flex-col items-center justify-center group-hover:bg-gray-800/50 group-hover:border-gray-600/40 transition-all duration-300 backdrop-blur-sm">
                  <Upload className="w-24 h-24 text-gray-400 group-hover:scale-110 transition-transform duration-300 mb-6" />
                  <span className="text-xl text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    Drop a file or click to upload
                  </span>
                </div>
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>

            {/* Text input toggle button */}
            <button
              onClick={() => setShowTextInput(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800/50 border border-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600/40 transition-all duration-300"
            >
              <Clipboard className="w-5 h-5" />
              <span>Paste Text Content</span>
            </button>
          </div>

          {/* Text input modal */}
          {showTextInput && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="w-[800px] bg-gray-900/90 rounded-3xl border-2 border-gray-700/30 p-8 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-200">Paste Your Text</h2>
                  <button
                    onClick={() => setShowTextInput(false)}
                    className="text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your text content here..."
                  className="w-full h-64 bg-gray-800/50 border border-gray-700/30 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-700/50 transition-colors resize-none"
                />
                <div className="flex justify-end mt-6 gap-4">
                  <button
                    onClick={() => setShowTextInput(false)}
                    className="px-6 py-2 rounded-xl bg-black-800/50 border border-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTextSubmit}
                    className="px-6 py-2 rounded-xl bg-black-900/20 border border-gray-700/30 text-gray-400 hover:bg-gray-800/30 transition-all duration-300"
                  >
                    Process Text
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-green-400">
            Compartmentalization AI
          </h1>
        </header>

        <div className="flex flex-1 gap-6 overflow-hidden">
          <div className="w-1/2 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700/50 shadow-2xl overflow-hidden">
            <DocumentViewer document={activeDocument} />
          </div>

          <div className="w-1/2 flex flex-col">
            <div className="mb-6 bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <ViewSlider value={0} onChange={() => {}} />
            </div>

            <div className="flex-1 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700/50 shadow-2xl overflow-hidden">
              <div className="relative h-full">
                <div className="absolute inset-0">
                  <BlockSummary />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;