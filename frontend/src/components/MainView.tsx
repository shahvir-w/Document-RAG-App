import { useState } from "react";
import { Upload } from "lucide-react";
import DocumentView from "./DocumentView";
import Compartments from "./Compartments";
import Chat from "./Chat";
import { ParsedSummary } from "../services/summaryParse";

function MainView(props: { summary: ParsedSummary, text: string, title: string, pdfUrl?: string }) {
  const [activeTab, setActiveTab] = useState("compartments");
  const documentTitle = props.title;

  console.log(props.summary);
  
  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200">
      {/* Full-width Title Bar */}
      <div className="sticky top-0 bg-zinc-950 z-10 flex justify-between items-center p-4 border-b border-zinc-700 w-full relative overflow-hidden">
        
        {/* Background Grid */}
        <div className="absolute inset-0 grid grid-cols-[repeat(50,minmax(0,1fr))] grid-rows-[repeat(4,minmax(0,1fr))]">
          {Array.from({ length: 300 }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-950/[0.03] border border-zinc-500/[0.08]"
            />
          ))}
        </div>
        
        {/* Content (Title and Button) */}
        <div className="relative z-10 flex justify-between items-center w-full">
          <h1 className="text-xl font-bold leading-tight text-zinc-100">
            {documentTitle}
          </h1>
          <button className="border border-zinc-700 rounded px-3 py-2 flex items-center gap-2 hover:bg-zinc-800 transition-colors bg-zinc-950">
            <Upload className="h-4 w-4" />
            Upload New Document
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document Section (Left - 40% width) */}
        <DocumentView text={props.text} pdfUrl={props.pdfUrl}/>
        
        {/* Navigation Section (Right - 60% width) */}
        <div className="w-3/5 flex flex-col overflow-hidden border-l border-zinc-700">
          {/* Tabs Navigation - Only Summaries and Chat */}
          <div className="p-4 flex-none">
            <div className="w-full flex justify-center border-b border-zinc-700">
              <button
                className={`px-4 py-2 ${
                  activeTab === "compartments" ? "border-b-2 custom-border -mb-px custom-color" : "text-zinc-400 hover:text-zinc-200"
                } transition-colors`}
                onClick={() => setActiveTab("compartments")}
              >
                Compartments
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === "chat" ? "border-b-2 custom-border -mb-px custom-color" : "text-zinc-400 hover:text-zinc-200"
                } transition-colors`}
                onClick={() => setActiveTab("chat")}
              >
                Chat 
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTab === "compartments" && <Compartments summary={props.summary}/>}
            {activeTab === "chat" && <Chat />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainView;