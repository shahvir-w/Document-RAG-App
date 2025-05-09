import { useState } from 'react';
import MainView from './components/MainView';
import LandingPage from './components/LandingPage';
import { uploadDocument, uploadText } from './services/api';
import { parseSummary, ParsedSummary } from './services/summaryParse';

type DocumentData = {
  id: string;
  name: string;
  type: string;
  title?: string;
  summary?: string;
  text?: string;
  pdfUrl?: string;
  userId?: string;
};


function App() {
  const [activeDocument, setActiveDocument] = useState<DocumentData | null>(null);
  const [parsedSummary, setParsedSummary] = useState<ParsedSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean>(false);
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
      const response: any = await uploadDocument(file, 
        (progress: number, message: string) => {
          setProcessingProgress(progress);
          setProcessingMessage(message);
        },
        (ready: boolean) => {
          setReady(ready);
        }
      );
      
      if (response) {
        const newDocument = {
          id: response.documentId,
          name: file.name,
          type: file.type,
          userId: response.userId,
          summary: response.summary,
          title: response.title,
          text: response.text,
          pdfUrl: file.type === 'application/pdf' ? URL.createObjectURL(file) : undefined
        };
        
        setActiveDocument(newDocument);
        const parsedSummary = parseSummary(response.summary || "");
        setParsedSummary(parsedSummary);

        console.log("text: ", newDocument.text);
        console.log("summary: ", newDocument.summary);
        console.log("title: ", newDocument.title);
        console.log("pdfUrl: ", newDocument.pdfUrl);

      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to process the document";
      setIsProcessing(false);
      setError(errorMessage);
      console.error(err);
    }
  };
  

  const handleTextSubmit = async (textContent: string) => {
    if (!textContent.trim()) return;
    
    if (textContent.length <= 3000) {
      setError("Text content must be longer than 3000 characters.");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage("");
    setError(null);
    
    try {
      const response: any = await uploadText(textContent, (progress, message) => {
        setProcessingProgress(progress);
        setProcessingMessage(message);
      }, (ready) => {
        setReady(ready);
      });
      
      if (response) {
        const newDocument = {
          id: response.documentId,
          name: "Text Document",
          type: "text/plain",
          userId: response.userId,
          title: response.title,
          summary: response.summary,
          text: response.text
        };
        
        setActiveDocument(newDocument);
        const parsedSummary = parseSummary(response.summary || "");
        setParsedSummary(parsedSummary);

        console.log("text: ", newDocument.text);
        console.log("userId: ", newDocument.userId);
        console.log("summary: ", newDocument.summary);
        console.log("title: ", newDocument.title);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to process the text";
      setError(errorMessage);
      setIsProcessing(false);
      console.error(err);
    }
  };
  
  const handleNewDocument = () => {
    setActiveDocument(null);
    setParsedSummary(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    setProcessingMessage("");
    setError(null);
    setReady(false);
  };

  return ready ? (
    <div className="min-h-screen relative overflow-hidden">
      <MainView 
        summary={parsedSummary || []}
        title={activeDocument?.title || ""}
        text={activeDocument?.text || ""}
        pdfUrl={activeDocument?.pdfUrl || ""}
        onNewDocument={handleNewDocument}
        userId={activeDocument?.userId || ""}
      />
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