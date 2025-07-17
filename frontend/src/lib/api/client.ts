import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for error handling
apiClient.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            console.error('API Error:', error.response.data);
            return Promise.reject(error.response.data);
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error:', error.request);
            return Promise.reject(new Error('Network error occurred'));
        } else {
            // Error in request configuration
            console.error('Request Error:', error.message);
            return Promise.reject(error);
        }
    }
);

// API endpoints
export const api = {
    // File upload
    upload: {
        initializeUpload: async (params: {
            filename: string;
            total_chunks: number;
            total_size: number;
        }) => {
            const response = await apiClient.post('/upload/initialize', params);
            return response.data;
        },

        uploadChunk: async (formData: FormData) => {
            const response = await apiClient.post('/upload/chunk', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },

        finalizeUpload: async (fileId: string) => {
            const response = await apiClient.post('/upload/finalize', { file_id: fileId });
            return response.data;
        },
    },
    
    // Transcription
    transcription: {
        transcribe: async (fileId: string, language?: string) => {
            const response = await apiClient.post('/transcribe/transcribe', {
                file_id: fileId,
                language,
            });
            return response.data;
        },

        saveCorrection: async (fileId: string, correction: {
            segment_index: number;
            original_text: string;
            corrected_text: string;
        }) => {
            const response = await apiClient.post('/transcribe/correction', {
                file_id: fileId,
                ...correction,
            });
            return response.data;
        },
    },
    
    // Summary
    summary: {
        summarize: async (fileId: string, language?: string) => {
            const response = await apiClient.post('/summarize', {
                file_id: fileId,
                language,
            });
            return response.data;
        },
    },
    
    // Export
    export: {
        exportTranscription: async (fileId: string, format: string, includeSummary: boolean = false, language?: string) => {
            const response = await apiClient.post('/export', {
                file_id: fileId,
                format,
                include_summary: includeSummary,
                language,
            }, {
                responseType: 'blob',
            });
            return response.data;
        },
    },
};

export default apiClient; 