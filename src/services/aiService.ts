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
export async function askFortuneAI(query: string, context?: any): Promise<ChatResponse> {
  console.log('Calling Fortune AI API with query:', query);
  
  try {
    const response = await fetchWithAuth('/api/ai/fortune', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
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
export async function askDivinationAI(query: string, hexagramData?: any): Promise<ChatResponse> {
  console.log('Calling Divination AI API with query:', query);
  
  try {
    const response = await fetchWithAuth('/api/ai/divination', {
      method: 'POST',
      body: JSON.stringify({ query, context: hexagramData }),
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
