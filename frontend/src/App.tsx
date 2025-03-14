import { useState } from 'react';
import MainView from './components/MainView';
import LandingPage from './components/LandingPage';
import { uploadDocument, uploadText } from './services/api';

type DocumentData = {
  id: string;
  name: string;
  type: string;
  title?: string | null;
};

function App() {
  const [activeDocument, setActiveDocument] = useState<DocumentData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const isValidFileType = (file: File): boolean => {
    const acceptedTypes = [
      'application/pdf', 
      'text/markdown', 
      'text/plain',
      'text/md'
    ];
    return acceptedTypes.includes(file.type) || 
           file.name.endsWith('.md') || 
           file.name.endsWith('.txt') || 
           file.name.endsWith('.pdf');
  };

  
  const handleFileUpload = async (file: File) => {
    if (!isValidFileType(file)) {
      setError("Please upload a PDF, MD, or TXT file.");
      return;
    }
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage("");
    setError(null);
    
    try {
      const response: any = await uploadDocument(file, (progress, message) => {
        setProcessingProgress(progress);
        if (message) setProcessingMessage(message);
      });
      
      if (response) {
        setActiveDocument({
          id: response.documentId,
          name: file.name,
          type: file.type,
        });
      }
    } catch (err) {
      setError("Failed to process the document. Please try again.");
      console.error(err);
    }
  };
  

  const handleTextSubmit = async (textContent: string) => {
    if (!textContent.trim()) return;
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);
    
    try {
      const response = await uploadText(textContent, (progress) => {
        setProcessingProgress(progress);
      });
      
      setActiveDocument({
        id: response.documentId,
        name: "Text Document",
        type: "text/plain",
        title: textContent.substring(0, 30) + "..."
      });
    } catch (err) {
      setError("Failed to process the text. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };
  

  return processingProgress === 100 ? (
    <div className="min-h-screen relative overflow-hidden">
      <MainView/>
    </div>
  ) : (
    <LandingPage 
      onFileUpload={handleFileUpload}
      onTextSubmit={handleTextSubmit}
      isProcessing={isProcessing}
      uploadProgress={processingProgress}
      processingMessage={processingMessage}
      error={error}
    />
  );
}

export default App;