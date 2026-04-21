import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function interpretHexagram(lines: number[]) {
  // lines is array of 6 numbers (6, 7, 8, or 9) from bottom to top
  const lineDescriptions = lines.map(l => {
    if (l === 6) return "老阴 (动)";
    if (l === 7) return "少阳";
    if (l === 8) return "少阴";
    if (l === 9) return "老阳 (动)";
    return "";
  }).reverse().join(', '); // traditionally bottom to top, but users read top down usually in list? No, 1st line is bottom.

  const prompt = `你是一位精通易经命理的大师。我的起卦结果（从初爻到上爻）为：${lineDescriptions}。
请给出专业且极其精炼的解析（总字数必须在250字以内）。
要求包含：
1. 【卦名】：完整卦名及卦象。
2. 【基本卦义】：核心哲学逻辑。
3. 【详细解读】：事态现状、潜在危机、最终契机。
4. 【大师指引】：3条具体的实操建议。

语言风格：优雅、神秘。请务必言简意赅。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Interpretation error:", error);
    return "天机暂时不泄，请静心再试。";
  }
}

export async function chatAboutFortune(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: "你是一位精通易经命理、八字、风水的大师，名叫‘知命’。请用专业、从容、慈悲且富有洞察力的语言与用户交流。你的回答应该简短精炼，富有哲理。",
        maxOutputTokens: 300,
        temperature: 0.8,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "天机混沌，请稍后再叙。";
  }
}
