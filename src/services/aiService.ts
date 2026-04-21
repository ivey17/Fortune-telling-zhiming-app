import { fetchWithAuth, clearApiCache } from './api';

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
  try {
    let fullContent = '';
    const stream = askAIStream('/api/ai/fortune', { query, context, title });
    for await (const chunk of stream) {
      fullContent += chunk;
    }
    return { content: fullContent };
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
  try {
    let fullContent = '';
    const stream = askAIStream('/api/ai/divination', { query, context: hexagramData, title });
    for await (const chunk of stream) {
      fullContent += chunk;
    }
    return { content: fullContent };
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
export async function saveDivination(lines: number[], interpretation: string, title?: string): Promise<string | undefined> {
  try {
    const res = await fetchWithAuth('/api/ai/save-divination', {
      method: 'POST',
      body: JSON.stringify({ lines, interpretation, title }),
    });
    return res.id;
  } catch (error) {
    console.error("Save Divination Error:", error);
    return undefined;
  }
}
/**
 * Streaming version of AI calls.
 */
export async function* askAIStream(endpoint: string, body: any): AsyncGenerator<string> {
  // Clear cache before starting a new AI request to ensure subsequent history fetches are fresh
  clearApiCache();
  
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error('Stream request failed');
  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let lastYieldTime = Date.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (buffer) yield buffer;
      break;
    }
    
    buffer += decoder.decode(value, { stream: true });
    
    if (Date.now() - lastYieldTime > 50) {
      yield buffer;
      buffer = "";
      lastYieldTime = Date.now();
    }
  }
}
