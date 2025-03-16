import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ParsedSummary, Compartment as CompartmentType, SubCompartment } from "../services/summaryParse";

type CompartmentsProps = {
  summary: ParsedSummary;
};

function Compartments({ summary }: CompartmentsProps) {
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

  const renderContent = (content: string) => (
    <div 
      className="text-zinc-300 [&_ul]:space-y-2 [&_ul]:my-4 [&_li]:leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );

  const renderSubCompartment = (subComp: SubCompartment, index: number) => (
    <div key={index} className="mb-4">
      <div className="p-3 border border-zinc-600">
        <div className="flex items-center">
          <h3 className="text-zinc-200 font-medium">{subComp.heading}</h3>
        </div>
        <div className="mt-3 pl-4">
          {renderContent(subComp.content)}
        </div>
      </div>
    </div>
  );

  const renderCompartment = (compartment: CompartmentType, index: number) => {
    const isExpanded = expandedCompartments[compartment.heading] !== false;

    return (
      <div key={index} className="mb-6 bg-zinc-800/30 p-4 full-border comp-background">
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => toggleCompartment(compartment.heading)}
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-zinc-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-zinc-500" />
          )}
          <h2 className="text-lg font-semibold text-zinc-200 ml-2">
            {compartment.heading}
          </h2>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {typeof compartment.content === 'string' ? (
              renderContent(compartment.content)
            ) : (
              compartment.content.map((subComp, idx) => 
                renderSubCompartment(subComp, idx)
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto p-4 bg-zinc-950 text-zinc-300 custom-scrollbar">
      {/* Compartments */}
      <div className="px-4">
        {summary.map((compartment, index) => renderCompartment(compartment, index))}
      </div>
    </div>
  );
}

export default Compartments;