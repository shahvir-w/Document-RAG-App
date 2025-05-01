import { useState } from 'react';
import { HelpCircle, X, Github } from 'lucide-react';

function InfoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Question mark button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative top-0 right-0 z-30 p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-full"
        aria-label="Information"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
        
        onClick={() => setIsModalOpen(false)}
        >
          <div className="w-[500px] bg-zinc-900/90 border border-zinc-700/50 p-6 rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-zinc-200">About Compartmentalize AI</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-zinc-300">

            <div>
                <h3 className="text-lg text-left font-medium text-zinc-200 mb-2">How It Works</h3>
                <p className="text-zinc-400 text-sm text-left">
                  Compartmentalize AI breaks down your documents into structured sections, 
                  allowing for better understanding. The app employs Retrieval Augmented Generation - 
                  when you chat with the AI, it references the specific sections of your document to provide
                  accurate responses.
                
                </p>
              </div>

              <div>
                <h3 className="text-lg text-left font-medium text-zinc-200 mb-2">Privacy Information</h3>
                <p className="text-zinc-400 text-sm text-left">
                  Your documents are converted into vectors and stored in a database for up to 1 hour.
                  We use OpenAI's embedding API to convert your documents into vectors and OpenAI's chat completion API to answer questions.
                </p>
              </div>
              
              
              
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <a 
                    href="https://github.com/shahvir-w/Document-RAG-App" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>View on GitHub</span>
                  </a>
                  
                  <p className="text-zinc-400 text-sm">
                    Created by <span className="text-zinc-200">Shahvir</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InfoButton; 