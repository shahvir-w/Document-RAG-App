import { useState } from 'react';
import MainView from './components/MainView';
import LandingPage from './components/LandingPage';

function App() {
  const [activeDocument, setActiveDocument] = useState(null);

  const handleFileUpload = (file) => {
    setActiveDocument(file);
  };

  const handleTextSubmit = (textContent) => {
    if (textContent.trim()) {
      const blob = new Blob([textContent], { type: 'text/plain' });
      const file = new File([blob], 'document.txt', { type: 'text/plain' });
      setActiveDocument(file);
    }
  };

  return activeDocument ? (
    <div className="min-h-screen relative overflow-hidden">
      <MainView />
    </div>
  ) : (
    <LandingPage onFileUpload={handleFileUpload} onTextSubmit={handleTextSubmit} />
  );
}

export default App;
