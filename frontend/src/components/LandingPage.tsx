import React, { useState } from 'react';
import { Upload, Clipboard, X, AlertCircle } from 'lucide-react';

type LandingPageProps = {
  onFileUpload: (file: File) => void;
  onTextSubmit: (textContent: string) => void;
  isProcessing: boolean;
  uploadProgress: number;
  error: string | null;
  processingMessage: string;
};

function LandingPage({ 
  onFileUpload, 
  onTextSubmit, 
  isProcessing, 
  uploadProgress, 
  error, 
  processingMessage 
}: LandingPageProps) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isTextSubmitted, setIsTextSubmitted] = useState(false);

  
  const validateAndUploadFile = (file: File) => {
    const acceptedTypes = [
      'application/pdf', 
      'text/markdown', 
      'text/plain',
      'text/md'
    ];
    
    const isValidExtension = 
      file.name.endsWith('.pdf') || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.txt');
      
    if (!acceptedTypes.includes(file.type) && !isValidExtension) {
      setFileError('Please upload a PDF, MD, or TXT file.');
      return;
    }
    
    setFileError(null);
    onFileUpload(file);
  };


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndUploadFile(file);
    }
  };


  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      validateAndUploadFile(event.dataTransfer.files[0]);
    }
  };

  
  const handleTextSubmit = () => {
    if (textContent.trim()) {
      setShowTextInput(false);
      setIsTextSubmitted(true);
      onTextSubmit(textContent);
    }
  };


  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };


  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Checkered background pattern */}
      <div className="absolute inset-0 grid grid-cols-[repeat(40,minmax(0,1fr))] grid-rows-[repeat(40,minmax(0,1fr))]">
        {Array.from({ length: 1600 }).map((_, i) => (
          <div
            key={i}
            className="bg-zinc-500/[0.03] border border-zinc-500/[0.08]"
          />
        ))}
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-radial-glow opacity-100" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text whitespace-nowrap">
          <span className="bg-gradient-to-r from-blue-400 from-0% via-indigo-500 via-20% via-blue-600 via-40% via-sky-500 via-60% via-teal-400 via-80% to-purple-500 to-100% inline-block text-transparent bg-clip-text">
            Compartmentalize AI
          </span>
        </h1>
        <p className="text-xl text-zinc-400 mb-12 max-w-2xl">
          Upload your document and let AI analyze, compartmentalize, and help you understand it better.
        </p>
        
        {/* Error display */}
        {(error || fileError) && (
          <div className="mb-6 flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-3 rounded-md border border-red-500/30">
            <AlertCircle className="w-5 h-5" />
            <span>{error || fileError}</span>
          </div>
        )}
        
        <div className="flex flex-col items-center gap-6">
          {/* Upload section */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`group cursor-pointer ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
          >
            <label className="flex flex-col items-center">
              <div className={`w-96 h-64 ${dragOver ? 'bg-zinc-800/60 border-zinc-500/50' : 'bg-zinc-900/50 border-zinc-700/30'} border-2 flex flex-col items-center justify-center group-hover:bg-zinc-800/50 group-hover:border-zinc-600/40 transition-all duration-300 backdrop-blur-sm`}>
                <Upload className="w-24 h-24 text-zinc-400 group-hover:scale-110 transition-transform duration-300 mb-6" />
                <span className="text-xl text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                  {isProcessing ? 'Processing...' : 'Drop a file or click to upload'}
                </span>
                <span className="text-sm text-zinc-500 mt-2">
                  Supports PDF, MD, and TXT files
                </span>
              </div>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                accept=".pdf,.md,.txt,application/pdf,text/markdown,text/plain" 
                disabled={isProcessing}
              />
            </label>
          </div>

          {/* Text input toggle button */}
          <button
            onClick={() => setShowTextInput(true)}
            className={`flex items-center gap-2 px-6 py-3 bg-zinc-800/50 border border-zinc-700/30 text-zinc-300 hover:bg-zinc-700/50 hover:border-zinc-600/40 transition-all duration-300 ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
            disabled={isProcessing}
          >
            <Clipboard className="w-5 h-5" />
            <span>Paste Text Content</span>
          </button>
          
        </div>


        {/* Progress bar section */}
        {(isProcessing && (isTextSubmitted || !showTextInput)) && (
            <div className="w-full max-w-lg mt-6">
              <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 from-0% via-indigo-500 via-20% via-blue-600 via-40% via-sky-500 via-60% via-teal-400 via-80% to-purple-500 to-100% animate-pulse transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-zinc-400 mt-2">
                <span>{processingMessage || "Processing..."}</span>
                <span>{uploadProgress}%</span>
              </div>
              <p className="text-sm text-zinc-500 mt-2 italic">
                Processing time varies between 1-3 minutes depending on text length
              </p>
            </div>
          )}

        {/* Text input modal */}
        {showTextInput && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-[800px] bg-zinc-900/80 border-2 border-zinc-700/30 p-8 backdrop-blur-sm rounded-xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-zinc-200">Paste Your Text</h2>
                <button
                  onClick={() => !isProcessing && setShowTextInput(false)}
                  className={`text-zinc-400 hover:text-zinc-200 transition-colors ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
                  disabled={isProcessing}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste your text content here..."
                className="w-full h-64 bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-4 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 hover:border-zinc-500 transition-all duration-300 resize-none shadow-inner"
                disabled={isProcessing}
              />
              
              <div className="flex justify-end mt-6 gap-4">
                <button
                  onClick={() => setShowTextInput(false)}
                  className={`px-6 py-2.5 rounded-xl bg-transparent text-zinc-400 hover:text-zinc-200 transition-colors ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTextSubmit}
                  disabled={!textContent.trim() || isProcessing}
                  className={`px-6 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/30 text-zinc-300 ${
                    textContent.trim() && !isProcessing
                      ? 'hover:bg-zinc-700/40 hover:text-zinc-100 hover:border-zinc-600/50' 
                      : 'opacity-50 cursor-not-allowed'
                  } transition-all duration-300 shadow-sm`}
                >
                  {isProcessing ? 'Processing...' : 'Compartmentalize'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPage;