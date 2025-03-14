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
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          // Scale upload progress to 0-20% range
          const uploadPercent = Math.round((progressEvent.loaded * 20) / progressEvent.total);
          onProgressUpdate(uploadPercent, "Uploading document...");
        }
      }
    });
    
    const taskId = response.data.taskId;
    console.log("Upload completed, taskId:", taskId);
    
    // Second phase: Track processing progress with SSE
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${API_BASE_URL}/document/progress/${taskId}`);
      let currentProgress = 20; // Start at 20% after upload
      const processedMessages = new Set(); // Track which messages we've seen
      
      eventSource.onmessage = (event) => {
        const message = event.data;
        console.log("Progress update:", message);
        
        // Only increment progress if we haven't seen this message before
        if (!processedMessages.has(message)) {
          processedMessages.add(message);
          
          // Don't increment for error messages
          if (!message.includes("Error")) {
            currentProgress = Math.min(currentProgress + 20, 100);
          }
          
          // Handle different messages
          switch (message) {
            case "Splitting text into vectors...":
            case "Text split into vectors successfully!":
            case "Creating summary...":
            case "Summary created successfully!":
              onProgressUpdate(currentProgress, message);
              break;
            case "Summary created successfully!":
              onProgressUpdate(100, "Processing complete!");
              eventSource.close();
              resolve(response.data);
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
    
  } catch (error) {
    console.error('Error uploading document:', error);
    onProgressUpdate(0, "Upload failed");
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