import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadDocument = async (file: File, onProgressUpdate: (progress: number, message: string) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    // First phase: Track upload progress
    onProgressUpdate(0, "Starting upload...");
    const response = await api.post('/document/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 7000, // 7 seconds timeout
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const uploadPercent = Math.round((progressEvent.loaded * 20) / progressEvent.total);
          onProgressUpdate(uploadPercent, "Uploading document...");
        }
      }
    });
    
    const taskId = response.data.taskId;
    console.log("Upload completed, taskId:", taskId);
    
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${API_BASE_URL}/document/progress/${taskId}`);
      let currentProgress = 20;
      const processedMessages = new Set();
      let documentText = '';
      
      eventSource.onmessage = (event) => {
        let message = event.data;
        console.log("Progress update:", message);
        
        try {
          // Try to parse the message as JSON
          const jsonMessage = JSON.parse(message);
          if (jsonMessage.status && jsonMessage.summary && jsonMessage.title) {
            // This is our summary completion message
            currentProgress = 100;
            onProgressUpdate(currentProgress, jsonMessage.status);

            setTimeout(() => {
              onProgressUpdate(currentProgress, "Creating compartments...");
            }, 1000);

            eventSource.close();
            resolve({
              ...response.data,
              summary: jsonMessage.summary,
              title: jsonMessage.title,
              text: documentText
            });
            return;
          }
          if (jsonMessage.status && jsonMessage.text) {
            // Store the document text
            documentText = jsonMessage.text;
            onProgressUpdate(currentProgress, jsonMessage.status);

            setTimeout(() => {
              onProgressUpdate(currentProgress, "Creating compartments...");
            }, 2500);
            
            return;
          }
        } catch (e) {
          // Not a JSON message, handle as regular status update
          message = event.data;
        }
        
        if (!processedMessages.has(message)) {
          processedMessages.add(message);
          
          if (!message.includes("Error")) {
            currentProgress = Math.min(currentProgress + 20, 100);
          }
          
          switch (message) {
            case "Splitting text into vectors...":
              onProgressUpdate(currentProgress, message);
              break;
            case "Storing vectors...":
              onProgressUpdate(currentProgress, message);
              break;
            case "Creating compartments...":
              onProgressUpdate(currentProgress, message);
              break;
            default:
              if (message.includes("Error")) {
                eventSource.close();
                reject(new Error(message));
              }
          }
        }
      };
      
      eventSource.onerror = (error) => {
        console.error("EventSource error:", error);
        eventSource.close();
        reject(new Error("Connection error"));
      };
    });
    
  } catch (error: any) {
    console.error('Error uploading document:', error);
    if (error.code === 'ECONNABORTED') {
      onProgressUpdate(0, "Server took too long to respond. Please try again");
    } else {
      onProgressUpdate(0, "Upload failed");
    }
    throw error;
  }
};

export const uploadText = async (textContent: string, onProgressUpdate: (progress: number, message?: string) => void) => {
  try {
    onProgressUpdate(0, "Starting text processing...");
    
    const response = await api.post('/document/upload-text', { content: textContent });
    const documentId = response.data.documentId;
    
    // In a real implementation, you'd set up SSE here too
    // For now, just complete the progress
    onProgressUpdate(100, "Text processing complete");
    
    return response.data;
  } catch (error) {
    console.error('Error uploading text:', error);
    onProgressUpdate(0, "Text processing failed");
    throw error;
  }
};

export default api;