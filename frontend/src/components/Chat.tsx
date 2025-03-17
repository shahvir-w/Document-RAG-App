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
}

interface ChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userId: string;
  onSourceClick: (sourceContent: string) => void;
}

function Chat({ messages, setMessages, userId, onSourceClick }: ChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;
    
    const newUserMessage: Message = {
      sender: "User",
      content: input
    };
    
    // Add user message immediately
    setMessages([...messages, newUserMessage]);
    
    try {
      const result = await getChatResponse(input, userId);
      
      const newAiMessage: Message = {
        sender: "AI",
        content: result.response,
        sources: result.sources
      };
      
      // Add AI message after response is received
      setMessages(prevMessages => [...prevMessages, newAiMessage]);
    } catch (error) {
      // Handle error
      const errorMessage: Message = {
        sender: "AI",
        content: "Sorry, I encountered an error processing your request."
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
    
    setInput("");
  };
  
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.sender === "AI" ? "chat-background2 border border-zinc-700" : "chat-background1 full-border ml-auto"
              } p-3 rounded-lg max-w-[80%]`}
            >
              <p className="text-sm font-medium text-zinc-300">
                {message.sender === "AI" ? "AI Assistant" : "You"}
              </p>
              <div className="text-zinc-200 relative" style={{ whiteSpace: "pre-line" }}>
                {message.content}
                {message.sources && message.sources.length > 0 && (
                  <span className="inline-flex gap-1 ml-2">
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
            placeholder="Ask a question about this paper..."
            className="flex-1 p-2 border border-zinc-700 rounded-md bg-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#96b2f0] focus:ring-opacity-60 focus:border-transparent"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            className="custom-background text-white px-4 py-2 rounded-md hover:bg-[#6783c2] transition-colors"
          >
            <MdSend className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;