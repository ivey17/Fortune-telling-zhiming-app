import { fetchWithAuth } from './api';

export interface ChatMessage {
  role: 'user' | 'model' | 'ai';
  content: string;
}

export interface ChatResponse {
  content: string;
  tokensUsed?: number;
}

/**
 * Sends a query to the AI regarding Today's Fortune.
 */
export async function askFortuneAI(query: string, context?: any, title?: string): Promise<ChatResponse> {
  console.log('Calling Fortune AI API with query:', query);
  
  try {
    const response = await fetchWithAuth('/api/ai/fortune', {
      method: 'POST',
      body: JSON.stringify({ query, context, title }),
    });
    return {
      content: response.content,
      tokensUsed: response.tokensUsed || 0
    };
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      content: "天机混沌，请稍后再试。",
      tokensUsed: 0
    };
  }
}

/**
 * Sends a query to the AI regarding Divination/I-Ching results.
 */
export async function askDivinationAI(query: string, hexagramData?: any, title?: string): Promise<ChatResponse> {
  console.log('Calling Divination AI API with query:', query);
  
  try {
    const response = await fetchWithAuth('/api/ai/divination', {
      method: 'POST',
      body: JSON.stringify({ query, context: hexagramData, title }),
    });
    return {
      content: response.content,
      tokensUsed: response.tokensUsed || 0
    };
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      content: "天机混沌，请稍后再试。",
      tokensUsed: 0
    };
  }
}

/**
 * Saves a divination result to history.
 */
export async function saveDivination(lines: number[], interpretation: string, title?: string): Promise<void> {
  try {
    await fetchWithAuth('/api/ai/save-divination', {
      method: 'POST',
      body: JSON.stringify({ lines, interpretation, title }),
    });
  } catch (error) {
    console.error("Save Divination Error:", error);
  }
}
/**
 * Streaming version of AI calls.
 */
export async function* askAIStream(endpoint: string, body: any): AsyncGenerator<string> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error('Stream request failed');
  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}
