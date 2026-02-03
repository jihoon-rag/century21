
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFollowUpDraft = async (customerName: string, context: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a professional and friendly follow-up SMS/Email draft for a real estate client named ${customerName}. Context: ${context}. Keep it under 200 characters if it's for SMS. Language: Korean.`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
};

export const analyzeLeads = async (leadsData: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these real estate leads and identify the top 3 priorities. Data: ${JSON.stringify(leadsData)}. Provide reasoning for each. Format as JSON with fields: { priorities: [{ name: string, reason: string, score: number }] }. Language: Korean.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          priorities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ['name', 'reason', 'score']
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{"priorities":[]}');
};
