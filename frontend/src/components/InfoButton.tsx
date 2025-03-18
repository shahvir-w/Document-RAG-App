import { useState } from 'react';
import { HelpCircle, X, Github } from 'lucide-react';

function InfoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Question mark button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative top-0 right-0 z-30 p-2 text-zinc-500 hover:text-zinc-300 transition-colors  rounded-full"
        aria-label="Information"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
          style={{ pointerEvents: 'all' }}
          onClick={() => setIsModalOpen(false)}
        >
          {/* Modal container with gradient border */}
          <div 
            className="w-[500px] relative rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient background - positioned behind the content */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 from-0% via-indigo-600/20 via-20% via-blue-700/20 via-40% via-sky-600/20 via-60% via-teal-500/20 via-80% to-purple-600/20 to-100% opacity-50"></div>
            
            {/* Gradient border */}
            <div className="absolute inset-0 p-[2px] rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 from-0% via-indigo-500 via-20% via-blue-600 via-40% via-sky-500 via-60% via-teal-400 via-80% to-purple-500 to-100% rounded-xl"></div>
            </div>
            
            {/* Content with glass background */}
            <div className="relative bg-zinc-900/90 p-6 backdrop-blur-md rounded-xl border border-zinc-700/30 z-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium bg-gradient-to-r from-blue-400 from-0% via-indigo-500 via-20% via-blue-600 via-40% via-sky-500 via-60% via-teal-400 via-80% to-purple-500 to-100% inline-block text-transparent bg-clip-text">
                  About Compartmentalize AI
                </h2>
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
                  <h3 className="text-lg font-medium text-zinc-200 mb-2">How It Works</h3>
                  <p className="text-zinc-400 text-sm">
                    Compartmentalize AI breaks down your documents into structured sections, 
                    allowing for better understanding. The app also employs Retrieval Augmented Generation (RAG) - 
                    when you chat with the AI, it references the specific sections of your document to provide
                    accurate responses.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-zinc-200 mb-2">Privacy Information</h3>
                  <p className="text-zinc-400 text-sm">
                    Your documents are stored only for a few minutes to convert them into vectors, which are then stored in a database for up to 1 hour.
                    We use OpenAI's embedding API to convert your documents into vectors and OpenAI's chat completion API to answer questions.
                  </p>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <a 
                      href="https://github.com/shahviraj/compartmentalize" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      <span>View on GitHub</span>
                    </a>
                    
                    <p className="text-zinc-400 text-sm">
                      Created by <span className="bg-gradient-to-r from-blue-400 from-0% via-indigo-500 via-20% via-blue-600 via-40% via-sky-500 via-60% via-teal-400 via-80% to-purple-500 to-100% inline-block text-transparent bg-clip-text font-medium">Shahvir</span>
                    </p>
                  </div>
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