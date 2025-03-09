import React from 'react';

const BlockSummary: React.FC = () => {
  // Mock data for demonstration
  const blocks = [
    { id: 1, title: 'Introduction', content: 'Overview of the main concepts...' },
    { id: 2, title: 'Methodology', content: 'Detailed explanation of methods...' },
    { id: 3, title: 'Results', content: 'Analysis of findings...' },
  ];

  return (
    <div className="h-full p-6 overflow-y-auto custom-scrollbar">
      <div className="grid gap-6">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="block-container relative bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm
                     before:absolute before:inset-0 before:rounded-xl before:border before:border-blue-500/20 before:scale-[1.01]
                     before:animate-pulse before:opacity-50"
          >
            <h3 className="text-xl font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {block.title}
            </h3>
            <p className="text-gray-400">{block.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlockSummary;