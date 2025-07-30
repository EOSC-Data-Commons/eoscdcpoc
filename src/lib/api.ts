import { BackendSearchResponse } from '../types/zenodo';

// --- API HELPERS ---
export const BACKEND_API_URL = '/api';

export interface SearchRequest {
  messages: Array<{
    role: 'user';
    content: string;
  }>;
  model: string;
}

export const searchWithBackend = async (query: string): Promise<BackendSearchResponse> => {
  const requestBody: SearchRequest = {
    messages: [
      {
        role: 'user',
        content: query
      }
    ],
    model: 'mistral-medium-latest'
  };

  try {
    const response = await fetch(`${BACKEND_API_URL}/search`, {
      method: 'POST',
      headers: {
        'Authorization': 'SECRET_KEY',
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
    console.error('Search API error:', error);
    throw error;
  }
};

// --- API & HISTORY HELPERS ---
export const ZENODO_API_URL = 'https://zenodo.org/api/records';