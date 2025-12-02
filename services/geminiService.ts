import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_TEMPLATE } from '../constants';
import { KnowledgeItem } from '../types';

let genAI: GoogleGenAI | null = null;

export const initializeGemini = () => {
  const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY;
  if (apiKey) {
    genAI = new GoogleGenAI({ apiKey });
  }
};

const retrieveRelevantDocuments = (query: string, knowledgeBase: KnowledgeItem[]): KnowledgeItem[] => {
  if (!query) return [];

  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  
  const scoredItems = knowledgeBase.map(item => {
    let score = 0;
    const contentLower = (item.title + " " + item.content).toLowerCase();
    
    terms.forEach(term => {
      // Basic Keyword Matching
      if (contentLower.includes(term)) score += 2;
      
      // Basic Synonyms
      if (term === '얼마' || term === '비용' || term === '가격') {
        if (contentLower.includes('가격') || contentLower.includes('비용') || contentLower.includes('페소')) score += 1;
      }
      if (term === '준비물' || term === '챙길거') {
        if (contentLower.includes('준비물') || contentLower.includes('필수')) score += 1;
      }
    });

    return { item, score };
  });

  // 🔥 Smart Sorting Logic
  // 1. Filter out irrelevant items (score > 0)
  // 2. Sort by SCORE (Relevance) first
  // 3. If scores are equal, sort by DATE (Recency) -> This ensures v2512 beats v2401
  const relevantItems = scoredItems
    .filter(entry => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher relevance wins
      }
      return (b.item.dateCode || 0) - (a.item.dateCode || 0); // Newer content wins
    })
    .map(entry => entry.item);

  // Return top 4 items to give enough context
  return relevantItems.slice(0, 4);
};

export const generateResponse = async (
  prompt: string,
  knowledgeBase: KnowledgeItem[],
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
) => {
  if (!genAI) {
    initializeGemini();
    if (!genAI) throw new Error("API Key not found. Please set VITE_API_KEY.");
  }

  const relevantDocs = retrieveRelevantDocuments(prompt, knowledgeBase);

  let contextString = "";
  if (relevantDocs.length > 0) {
    contextString = relevantDocs.map(item => `
---
Title: ${item.title}
DateCode: ${item.dateCode} (Higher is newer)
Type: ${item.type}
URL: ${item.url}
Content: ${item.content}
---
    `).join('\n');
  } else {
    contextString = "관련된 철산랜드 기록이 없습니다.";
  }

  const systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE.replace('{{CONTEXT}}', contextString);

  try {
    const model = 'gemini-2.5-flash'; 
    
    const chat = genAI.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
        tools: [{ googleSearch: {} }]
      },
      history: history 
    });

    const result = await chat.sendMessage({
      message: prompt
    });

    const responseText = result.text;
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    return {
      text: responseText,
      groundingChunks,
      relevantDocs
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
