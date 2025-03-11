import { useState } from "react";
import { Book, FileText } from "lucide-react";

interface DocumentViewProps {
  title: string;
}

function DocumentView({ title }: DocumentViewProps) {
  const [viewMode, setViewMode] = useState<"text" | "pdf">("text");

  return (
    <div className="w-2/5 overflow-auto border-r border-zinc-700 custom-scrollbar">
      {/* View Toggle */}
      <div className="sticky top-0 bg-zinc-950 z-10 p-4 border-b border-zinc-700 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            className={`flex items-center px-3 py-2 text-sm font-medium border rounded-l-md ${
              viewMode === "text" ? "custom-background full-border text-purple-100" : "bg-zinc-800 border-zinc-700 text-zinc-300"
            } transition-colors`}
            onClick={() => setViewMode("text")}
          >
            <Book className="h-4 w-4 mr-2" />
            Text View
          </button>
          <button
            className={`flex items-center px-3 py-2 text-sm font-medium border rounded-r-md border-l-0 ${
              viewMode === "pdf" ? "custom-background full-border text-purple-100" : "bg-zinc-800 border-zinc-700 text-zinc-300"
            } transition-colors`}
            onClick={() => setViewMode("pdf")}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF View
          </button>
        </div>
      </div>

      {/* Document View Container */}
      <div className="p-4">
        {viewMode === "text" ? (
          <div className="border border-zinc-700 rounded-md p-4 bg-zinc-900 h-full overflow-auto custom-scrollbar">
            <h2 className="text-xl font-bold mb-4 text-zinc-100">Abstract</h2>
            <p className="mb-4 text-zinc-300">
              This survey presents a comprehensive review of current literature on Explainable Artificial
              Intelligence (XAI) methods for cyber security applications. Due to the rapid development of Internet-
              connected systems and Artificial Intelligence in recent years, Artificial Intelligence including
              Machine Learning (ML) and Deep Learning (DL) has been widely utilized in the fields of cyber security
              including intrusion detection, malware detection, and spam filtering.
            </p>
            <p className="mb-4 text-zinc-300">
              However, although Artificial Intelligence-based approaches for the detection and defense of cyber
              attacks and threats are more advanced and efficient compared to the conventional signature-based and
              rule-based cyber security strategies, most ML-based techniques and DL-based techniques are deployed in
              the "black-box" manner, meaning that security experts and customers are unable to explain how the
              procedures reach particular conclusions.
            </p>
            <p className="mb-4 text-zinc-300">
              The deficiencies of transparencies and interpretability of existing Artificial Intelligence techniques
              would decrease human users' confidence in the reliability of the defense against cyber-attacks,
              especially in current situations where cyber attacks become increasingly diverse and complicated.
            </p>
            <p className="mb-4 text-zinc-300">
              Therefore, it is essential to apply XAI in the establishment of cyber security models to create more
              explainable models while maintaining high accuracy and allowing human users to comprehend, trust, and
              manage the next generation of cyber defense mechanisms.
            </p>
            <h2 className="text-xl font-bold mt-6 mb-4 text-zinc-100">1. Introduction</h2>
            <p className="mb-4 text-zinc-300">
              Artificial Intelligence (AI) has been widely applied in various fields including cyber security. The
              rapid development of AI techniques, especially Machine Learning (ML) and Deep Learning (DL), has
              significantly improved the performance of cyber security systems in detecting and defending against
              cyber attacks.
            </p>
            <p className="mb-4 text-zinc-300">
              However, most AI-based cyber security systems operate as "black boxes," making it difficult for
              security experts and users to understand how these systems make decisions. This lack of transparency
              and interpretability has raised concerns about the reliability and trustworthiness of AI-based cyber
              security systems.
            </p>
            <p className="mb-4 text-zinc-300">
              Explainable Artificial Intelligence (XAI) aims to address these concerns by making AI systems more
              transparent and interpretable. XAI techniques enable users to understand how AI systems make
              decisions, which is crucial for building trust in these systems.
            </p>
            <h2 className="text-xl font-bold mt-6 mb-4 text-zinc-100">2. Background</h2>
            <p className="mb-4 text-zinc-300">
              The field of cyber security has evolved significantly over the past few decades. Traditional cyber
              security approaches relied on signature-based and rule-based methods, which were effective against
              known threats but struggled to detect novel attacks.
            </p>
            <p className="mb-4 text-zinc-300">
              With the increasing sophistication of cyber attacks, AI-based approaches have become essential for
              effective cyber security. ML and DL techniques can detect patterns and anomalies that might indicate
              cyber attacks, even if these attacks have not been seen before.
            </p>
          </div>
        ) : (
          <div className="border border-zinc-700 rounded-md bg-zinc-900 h-full overflow-auto custom-scrollbar">
            {/* Simple PDF-like View */}
            <div className="p-8 max-w-3xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8 border-b border-zinc-700 pb-4">
                <div className="text-sm text-zinc-400 mb-1">IEEE Access</div>
                <div className="text-xs text-zinc-500">Digital Object Identifier 10.1109/ACCESS.2022.3204001</div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <div className="inline-block bg-orange-900/30 text-orange-400 px-4 py-1 text-sm mb-4">TOPICAL REVIEW</div>
                <h1 className="text-xl font-bold mb-4 text-zinc-100">{title}</h1>
                <div className="text-sm text-zinc-400">
                  <p>ZHIBO ZHANG, HUSSAM AL HAMADI, ERNESTO DAMIANI, CHAN YEOB YEUN, AND FATMA TAHER</p>
                </div>
              </div>

              {/* Abstract */}
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-2 text-zinc-100">ABSTRACT</h2>
                <p className="text-sm mb-3 text-zinc-300">
                  This survey presents a comprehensive review of current literature on Explainable Artificial
                  Intelligence (XAI) methods for cyber security applications. Due to the rapid development of
                  Internet-connected systems and Artificial Intelligence in recent years, Artificial Intelligence
                  including Machine Learning (ML) and Deep Learning (DL) has been widely utilized in the fields of
                  cyber security including intrusion detection, malware detection, and spam filtering.
                </p>
                <p className="text-sm mb-3 text-zinc-300">
                  However, although Artificial Intelligence-based approaches for the detection and defense of cyber
                  attacks and threats are more advanced and efficient compared to the conventional signature-based
                  and rule-based cyber security strategies, most ML-based techniques and DL-based techniques are
                  deployed in the "black-box" manner, meaning that security experts and customers are unable to
                  explain how the procedures reach particular conclusions.
                </p>
                <p className="text-sm mb-3 text-zinc-300">
                  The deficiencies of transparencies and interpretability of existing Artificial Intelligence
                  techniques would decrease human users' confidence in the reliability of the defense against
                  cyber-attacks, especially in current situations where cyber attacks become increasingly diverse
                  and complicated.
                </p>
                <p className="text-sm text-zinc-300">
                  Therefore, it is essential to apply XAI in the establishment of cyber security models to create
                  more explainable models while maintaining high accuracy and allowing human users to comprehend,
                  trust, and manage the next generation of cyber defense mechanisms.
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-2 text-zinc-100">I. INTRODUCTION</h2>
                <p className="text-sm mb-3 text-zinc-300">
                  Artificial Intelligence (AI) has been widely applied in various fields including cyber security.
                  The rapid development of AI techniques, especially Machine Learning (ML) and Deep Learning (DL),
                  has significantly improved the performance of cyber security systems in detecting and defending
                  against cyber attacks.
                </p>
                <p className="text-sm mb-3 text-zinc-300">
                  However, most AI-based cyber security systems operate as "black boxes," making it difficult for
                  security experts and users to understand how these systems make decisions. This lack of
                  transparency and interpretability has raised concerns about the reliability and trustworthiness of
                  AI-based cyber security systems.
                </p>
                <p className="text-sm text-zinc-300">
                  Explainable Artificial Intelligence (XAI) aims to address these concerns by making AI systems more
                  transparent and interpretable. XAI techniques enable users to understand how AI systems make
                  decisions, which is crucial for building trust in these systems.
                </p>
              </div>

              {/* Background */}
              <div>
                <h2 className="text-lg font-bold mb-2 text-zinc-100">II. BACKGROUND</h2>
                <p className="text-sm mb-3 text-zinc-300">
                  The field of cyber security has evolved significantly over the past few decades. Traditional cyber
                  security approaches relied on signature-based and rule-based methods, which were effective against
                  known threats but struggled to detect novel attacks.
                </p>
                <p className="text-sm text-zinc-300">
                  With the increasing sophistication of cyber attacks, AI-based approaches have become essential for
                  effective cyber security. ML and DL techniques can detect patterns and anomalies that might
                  indicate cyber attacks, even if these attacks have not been seen before.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentView;