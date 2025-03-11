import { useState } from "react";
import { Upload } from "lucide-react";
import DocumentView from "./DocumentView";
import Summaries from "./Summaries";
import Chat from "./Chat";

function MainView() {
  const [activeTab, setActiveTab] = useState("summaries");
  const documentTitle = "Explainable Artificial Intelligence Applications in Cyber Security: State-of-the-Art in Research";

  return (
    <div className="flex flex-col h-screen">
      {/* Full-width Title Bar */}
      <div className="sticky top-0 bg-background z-10 flex justify-between items-center p-4 border-b w-full">
        <h1 className="text-xl font-bold leading-tight">{documentTitle}</h1>
        <button className="border rounded px-3 py-2 flex items-center gap-2 hover:bg-gray-100">
          <Upload className="h-4 w-4" />
          Upload New Document
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document Section (Left - 40% width) */}
        <DocumentView title={documentTitle} />

        {/* Navigation Section (Right - 60% width) */}
        <div className="w-3/5 flex flex-col overflow-hidden">
          {/* Tabs Navigation - Only Summaries and Chat */}
          <div className="p-4 flex-none">
            <div className="w-full flex justify-center border-b">
              <button
                className={`px-4 py-2 ${
                  activeTab === "summaries" ? "border-b-2 border-blue-500 -mb-px" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("summaries")}
              >
                Summaries
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === "chat" ? "border-b-2 border-blue-500 -mb-px" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTab === "summaries" && <Summaries />}
            {activeTab === "chat" && <Chat />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainView;