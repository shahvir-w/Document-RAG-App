import { useState, useEffect, useRef } from "react";

interface Message {
  sender: "AI" | "User";
  content: string;
}

function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "AI",
      content: "Hello! I can help you understand this research paper on Explainable AI in Cybersecurity. What would you like to know about it?"
    },
    {
      sender: "User",
      content: "Can you explain what XAI is and why it's important for cybersecurity?"
    },
    {
      sender: "AI",
      content: "XAI (Explainable Artificial Intelligence) refers to methods that make AI systems more transparent and interpretable. In cybersecurity, this is crucial because:\n• Most AI security systems operate as \"black boxes\" where decisions can't be easily explained\n• Security experts need to understand how the AI reached its conclusions about threats\n• Trust in AI security systems increases when users can comprehend how decisions are made\n• Regulatory compliance often requires explainability for critical security systems\n\nThe paper emphasizes that as cyber attacks become more sophisticated, having explainable AI becomes even more important for effective defense."
    },
    {
      sender: "User",
      content: "What are some examples of XAI techniques mentioned in the paper?"
    },
    {
      sender: "AI",
      content: "The paper discusses several XAI techniques applicable to cybersecurity, including:\n• Feature importance methods like LIME and SHAP\n• Rule extraction from trained models\n• Attention mechanisms in deep learning models\n• Counterfactual explanations\n• Decision trees as interpretable models\n\nThese techniques help security experts understand why an AI system flagged something as suspicious or malicious."
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const newUserMessage: Message = {
      sender: "User",
      content: input
    };
    
    setMessages([...messages, newUserMessage]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`${
                message.sender === "AI" ? "bg-gray-100" : "bg-blue-100 ml-auto"
              } p-3 rounded-lg max-w-[80%]`}
            >
              <p className="text-sm font-medium">{message.sender === "AI" ? "AI Assistant" : "You"}</p>
              <p style={{ whiteSpace: "pre-line" }}>{message.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="flex-none border-t p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question about this paper..."
            className="flex-1 p-2 border rounded-md"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
