import {BackendSearchResponse} from '../types/zenodo';
import {logError} from './utils.ts';

// --- API HELPERS ---
export const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || '';

export interface SearchRequest {
    messages: Array<{
        role: 'user';
        content: string;
    }>;
    model: string;
}

export const searchWithBackend = async (query: string, model: string = 'mistralai/mistral-large-latest'): Promise<BackendSearchResponse> => {
    const requestBody: SearchRequest = {
        messages: [
            {
                role: 'user',
                content: query
            }
        ],
        model: model
    };

    try {
        const response = await fetch(`${BACKEND_API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: BackendSearchResponse = await response.json();
        return data;
    } catch (error) {
        logError(error, 'Search API');
        throw error;
    }
};

// --- API & HISTORY HELPERS ---
export const ZENODO_API_URL = 'https://zenodo.org/api/records';