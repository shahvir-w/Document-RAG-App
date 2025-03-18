import { useState, useEffect, useRef } from "react";
import { MdSend } from "react-icons/md";
import { getChatResponse } from "../services/api";

interface Source {
  content: string;
  metadata: {
    id: string;
    [key: string]: any;
  };
}

interface Message {
  sender: "AI" | "User";
  content: string;
  sources?: Source[];
  isThinking?: boolean;
}

interface ChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userId: string;
  onSourceClick: (sourceContent: string) => void;
}

function Chat({ messages, setMessages, userId, onSourceClick }: ChatProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSources, setShowSources] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const [isResponding, setIsResponding] = useState(false);
  
  // Save scroll position when scrolling
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  };
  
  // Restore scroll position on component mount
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = scrollPositionRef.current;
      
      // Add scroll event listener
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Only scroll to bottom for new messages if we're already at the bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, currentTypingText]);

  // Update typing animation effect
  useEffect(() => {
    if (isTyping && messages[messages.length - 1]?.sender === "AI") {
      const text = messages[messages.length - 1].content;
      let index = 0;
    
      const typeNextCharacter = () => {
        if (index < text.length) {
          setCurrentTypingText(text.slice(0, index + 1));
          index++;
          setTimeout(typeNextCharacter, 20);
        } else {
          setIsTyping(false);
          setShowSources(true);
          setIsResponding(false);
        }
      };
      
      typeNextCharacter(); 
    }
  }, [isTyping, messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" || isResponding) return;
    
    // Set responding state to disable input
    setIsResponding(true);
    
    const newUserMessage: Message = {
      sender: "User",
      content: input
    };
    
    // Add user message and thinking message immediately
    setMessages([...messages, newUserMessage, {
      sender: "AI",
      content: "Thinking...",
      isThinking: true
    }]);
    setInput("");
    
    // Force scroll to bottom after adding messages
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    
    try {
      const result = await getChatResponse(input, userId);
      
      setIsTyping(true);
      setMessages(prevMessages => [
        ...prevMessages.slice(0, -1),
        {
          sender: "AI",
          content: result.response,
          sources: result.sources
        }
      ]);
      
      setShowSources(false);
      setCurrentTypingText("");
      
      // Note: isResponding will be set to false after typing completes
      
    } catch (error) {
      setMessages(prevMessages => [
        ...prevMessages.slice(0, -1),
        {
          sender: "AI",
          content: "Sorry, I encountered an error processing your request."
        }
      ]);
      
      // Enable input on error
      setIsResponding(false);
      
      // Force scroll to bottom after error
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };
  
  // Add this helper function at the top of the component
  const renderMarkdownText = (text: string) => {
    // Split by bold markdown pattern
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove ** and make text bold
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar"
        onScroll={handleScroll}
      >
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.sender === "AI" ? "chat-background2 border border-zinc-700" : "chat-background1 full-border ml-auto"
              } p-3 rounded-lg max-w-[80%]`}
            >
              <p className="text-sm font-medium text-zinc-300">
                {message.sender === "AI" ? "Compartmentalize AI" : "You"}
              </p>
              <div className="text-zinc-200 relative" style={{ whiteSpace: "pre-line" }}>
                {message.isThinking ? (
                  <div className="flex items-center gap-2 animate-pulse">
                    Thinking
                    <span className="flex gap-1">
                      <span className="w-1 h-1 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}/>
                      <span className="w-1 h-1 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}/>
                      <span className="w-1 h-1 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}/>
                    </span>
                  </div>
                ) : (
                  <>
                    {isTyping && index === messages.length - 1 
                      ? renderMarkdownText(currentTypingText) 
                      : renderMarkdownText(message.content)
                    }
                    {message.sources && message.sources.length > 0 && (
                      <span 
                        className={`inline-flex gap-1 ml-2 transition-opacity duration-300 ${
                          (isTyping && index === messages.length - 1) ? 
                            (showSources ? 'opacity-100' : 'opacity-0') : 
                            'opacity-100'
                        }`}
                      >
                        {message.sources.map((source, idx) => (
                          <button
                            key={idx}
                            onClick={() => onSourceClick(source.content)}
                            className="inline-flex items-center justify-center w-6 h-5 text-[12px] rounded-full bg-zinc-500 hover:bg-zinc-400 text-white transition-colors"
                            title={`Source ${idx + 1}: ${source.content.substring(0, 60)}...`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
            
      <div className="flex-none border-t border-zinc-700 p-4 bg-zinc-900">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder={isResponding ? "Waiting for response..." : "Ask a question about this document..."}
            className={`flex-1 p-2 border border-zinc-700 rounded-md bg-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#96b2f0] focus:ring-opacity-60 focus:border-transparent ${isResponding ? 'opacity-50' : ''}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isResponding}
          />
          <button 
            type="submit"
            className={`custom-background text-white px-4 py-2 rounded-md transition-colors ${isResponding ? 'opacity-50' : 'hover:bg-[#6783c2]'}`}
            disabled={isResponding}
          >
            <MdSend className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;