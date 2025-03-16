import { useState } from "react";
import { Download, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { ParsedSummary, Compartment as CompartmentType, SubCompartment } from "../services/summaryParse";

type CompartmentsProps = {
  summary: ParsedSummary;
  title: string;
};

function Compartments({ summary, title }: CompartmentsProps) {
  const [expandedCompartments, setExpandedCompartments] = useState<Record<string, boolean>>({});
  
  if (!summary || summary.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950 text-zinc-500">
        No compartments available
      </div>
    );
  }

  const toggleCompartment = (heading: string) => {
    setExpandedCompartments(prev => ({
      ...prev,
      [heading]: !prev[heading]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadSummary = () => {
    if (!summary) return;
    
    const fileName = `summary.md`;
    let content = '';
    
    summary.forEach(comp => {
      content += `# ${comp.heading}\n\n`;
      
      if (typeof comp.content === 'string') {
        content += `${comp.content}\n\n`;
      } else {
        comp.content.forEach(subComp => {
          content += `## ${subComp.heading}\n\n${subComp.content}\n\n`;
        });
      }
    });
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderSubCompartment = (subComp: SubCompartment, index: number) => {
    return (
      <div 
        key={`subcomp-${index}`} 
        className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg mb-4 overflow-hidden transition-all duration-300 shadow-md"
      >
        <div className="flex justify-between items-center p-3 bg-zinc-800/60">
          <h3 className="font-medium text-zinc-200">{subComp.heading}</h3>
          <button 
            onClick={() => copyToClipboard(subComp.content)}
            className="p-1.5 rounded-md hover:bg-zinc-700/70 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Copy content"
          >
            <Copy size={16} />
          </button>
        </div>
        <div className="p-4 text-zinc-300 leading-relaxed">
          {subComp.content}
        </div>
      </div>
    );
  };

  const renderCompartment = (comp: CompartmentType, index: number) => {
    const isExpanded = expandedCompartments[comp.heading] !== false; // Default to expanded
    
    return (
      <div 
        key={`comp-${index}`}
        className="bg-gradient-to-b from-zinc-900/90 to-zinc-900/50 backdrop-blur-sm border border-zinc-800/60 rounded-xl overflow-hidden shadow-lg mb-6 transition-all duration-300"
      >
        <div 
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-800/40 transition-colors"
          onClick={() => toggleCompartment(comp.heading)}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown size={20} className="text-zinc-400" />
            ) : (
              <ChevronRight size={20} className="text-zinc-400" />
            )}
            <h2 className="text-lg font-semibold text-zinc-100">{comp.heading}</h2>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(typeof comp.content === 'string' 
                ? comp.content 
                : comp.content.map(sc => `${sc.heading}\n${sc.content}`).join('\n\n')
              );
            }}
            className="p-1.5 rounded-md hover:bg-zinc-700/70 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Copy content"
          >
            <Copy size={16} />
          </button>
        </div>
        
        {isExpanded && (
          <div className="p-4 border-t border-zinc-800/60">
            {typeof comp.content === 'string' ? (
              <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {comp.content}
              </div>
            ) : (
              <div className="space-y-3">
                {comp.content.map((subComp, idx) => renderSubCompartment(subComp, idx))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto bg-zinc-950 text-zinc-300 custom-scrollbar">
      {/* Centered Save Button at the top */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-zinc-950/80 py-4 flex flex-col items-center border-b border-zinc-800/50">
        <button 
          onClick={downloadSummary}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-md hover:shadow-lg"
        >
          <Download size={16} />
          <span>Save Compartments</span>
        </button>
      </div>

      {/* Compartments Container */}
      <div className="p-6">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
            {title}
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2"></div>
        </div>

        {/* Compartments List */}
        <div className="space-y-6">
          {summary.map((compartment, index) => renderCompartment(compartment, index))}
        </div>
      </div>
    </div>
  );
}

export default Compartments;