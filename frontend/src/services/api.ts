import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const uploadDocument = async (file: File, onProgressUpdate: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // First phase: Track upload progress
      const response = await api.post('/document/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            // Only use 0-50% range for the upload phase
            const uploadPercent = Math.round((progressEvent.loaded * 50) / progressEvent.total);
            onProgressUpdate(uploadPercent);
          }
        }
      });
      
      const documentId = response.data.documentId;
      console.log(documentId);
      /*

      // Second phase: Track processing progress with SSE
      const eventSource = new EventSource(`${API_BASE_URL}/documents/${documentId}/progress`);
      
      // Handle processing progress updates
      eventSource.addEventListener('progress', (event) => {
        const data = JSON.parse(event.data);
        // Scale processing progress to 50-100% range (after upload completes)
        const processingPercent = 50 + (data.progress / 2);
        onProgressUpdate(processingPercent);
      });
      
      // Handle completion
      eventSource.addEventListener('complete', () => {
        onProgressUpdate(100);
        eventSource.close();
      });
      
      // Handle errors
      eventSource.addEventListener('error', () => {
        eventSource.close();
      });
      */

      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
};

export const uploadText = async (textContent: string, onProgressUpdate: (progress: number) => void) => {
    try {
      // Initial call to start processing
      const response = await api.post('/document/upload-text', { content: textContent });
      const documentId = response.data.documentId;
      console.log(documentId);
      
      /*
      // Set up SSE connection
      const eventSource = new EventSource(`${API_BASE_URL}/documents/${documentId}/progress`);
      
      // Handle progress updates
      eventSource.addEventListener('progress', (event) => {
        const data = JSON.parse(event.data);
        onProgressUpdate(data.progress);
      });
      
      // Handle completion
      eventSource.addEventListener('complete', () => {
        eventSource.close();
      });
      
      // Handle errors
      eventSource.addEventListener('error', () => {
        eventSource.close();
      });
      */
      return response.data;
    } catch (error) {
      console.error('Error uploading text:', error);
      throw error;
    }
  };

export default api;