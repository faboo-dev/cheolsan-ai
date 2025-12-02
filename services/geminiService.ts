import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_TEMPLATE } from '../constants';
import { KnowledgeItem } from '../types';

let genAI: GoogleGenAI | null = null;

export const initializeGemini = () => {
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    genAI = new GoogleGenAI({ apiKey });
  }
};

// Simple Client-side RAG Simulation
// In a real app, this would be a vector similarity search on the server/database.
const retrieveRelevantDocuments = (query: string, knowledgeBase: KnowledgeItem[]): KnowledgeItem[] => {
  if (!query) return [];

  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  
  // Score items based on term frequency
  const scoredItems = knowledgeBase.map(item => {
    let score = 0;
    const contentLower = (item.title + " " + item.content).toLowerCase();
    
    terms.forEach(term => {
      // Simple Keyword Matching
      if (contentLower.includes(term)) score += 2; // Exact match is good
      
      // Very basic synonym expansion (hardcoded for demo)
      if (term === '얼마' || term === '비용' || term === '가격') {
        if (contentLower.includes('가격') || contentLower.includes('비용') || contentLower.includes('페소')) score += 1;
      }
      if (term === '준비물' || term === '챙길거') {
        if (contentLower.includes('준비물') || contentLower.includes('필수')) score += 1;
      }
    });

    return { item, score };
  });

  // Filter items with score > 0 and sort by score descending
  const relevantItems = scoredItems
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.item);

  // Return top 3 items to keep context focused
  return relevantItems.slice(0, 3);
};

export const generateResponse = async (
  prompt: string,
  knowledgeBase: KnowledgeItem[],
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
) => {
  if (!genAI) {
    initializeGemini();
    if (!genAI) throw new Error("API Key not found in environment.");
  }

  // 1. Retrieve Relevant Context (RAG)
  // Instead of sending the whole DB, we only send what matches the user's query.
  // This drastically reduces hallucinations by limiting the scope.
  const relevantDocs = retrieveRelevantDocuments(prompt, knowledgeBase);

  let contextString = "";
  if (relevantDocs.length > 0) {
    contextString = relevantDocs.map(item => `
---
Title: ${item.title}
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
    
    // We create a new chat session for each turn in this simple demo to ensure 
    // the system instruction (context) is updated with the *latest* retrieval results.
    const chat = genAI.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Very low temperature for high factual accuracy
        tools: [{ googleSearch: {} }] // Enable Google Search
      },
      history: history 
    });

    const result = await chat.sendMessage({
      message: prompt
    });

    // Extract text
    const responseText = result.text;
    
    // Extract grounding metadata (search results) if any
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    return {
      text: responseText,
      groundingChunks,
      relevantDocs // Return this so the UI can show what was used
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};