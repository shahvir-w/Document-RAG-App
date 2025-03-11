import { Download } from "lucide-react";

function Summaries() {
  return (
    <div className="h-full overflow-auto p-4">
      {/* Save Summary Button */}
      <div className="flex justify-center mb-4">
        <button className="border rounded px-2 py-1 text-sm flex items-center gap-1 hover:bg-gray-100">
          <Download className="h-4 w-4" />
          Save Summary
        </button>
      </div>

      <div className="space-y-4 text-base">
        <p>
          The article provides a comprehensive review of Explainable Artificial Intelligence (
          <strong>XAI</strong>) methods for <strong>cyber security</strong> applications. It emphasizes the
          deficiencies of <strong>transparency</strong> and <strong>interpretability</strong> in existing AI
          techniques and the importance of incorporating <strong>XAI</strong> to create more explainable
          models while maintaining high accuracy. The article introduces a clear roadmap.
        </p>
        <p>
          XAI techniques are particularly important in cybersecurity contexts where understanding the
          reasoning behind threat detection is crucial. The paper discusses various XAI methods that can be
          applied to cybersecurity systems, including model-agnostic approaches and model-specific
          techniques for different types of machine learning algorithms.
        </p>
        <p>
          The authors highlight that while AI-based cybersecurity systems offer superior performance
          compared to traditional rule-based approaches, their black-box nature creates significant
          challenges for security professionals who need to understand, trust, and effectively manage these
          systems. Implementing XAI can bridge this gap while maintaining the high accuracy needed for
          effective threat detection.
        </p>
      </div>
    </div>
  );
}

export default Summaries;
