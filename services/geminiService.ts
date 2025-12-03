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

  // 검색어를 단어 단위로 쪼갬
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  
  const scoredItems = knowledgeBase.map(item => {
    let score = 0;
    // 제목과 내용 전체를 검색 대상으로 함
    const contentLower = (item.title + " " + item.content).toLowerCase();
    
    terms.forEach(term => {
      // 1. 단순 포함 여부 (기본 점수)
      if (contentLower.includes(term)) {
        score += 5; // 점수를 크게 줌 (파일 안에 단어가 있기만 하면 됨)
      }
      
      // 2. 제목에 포함되면 가산점
      if (item.title.toLowerCase().includes(term)) {
        score += 10;
      }

      // 3. 동의어 처리
      if (['가격', '비용', '얼마', '페소'].includes(term)) {
        if (contentLower.includes('가격') || contentLower.includes('비용')) score += 3;
      }
      if (['준비물', '챙길거', '필수'].includes(term)) {
        if (contentLower.includes('준비물')) score += 3;
      }
    });

    return { item, score };
  });

  // 점수가 높은 순 + 최신순 정렬
  const relevantItems = scoredItems
    .filter(entry => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // 관련성 우선
      }
      return (b.item.dateCode || 0) - (a.item.dateCode || 0); // 그 다음 최신순
    })
    .map(entry => entry.item);

  // 문서 하나하나가 매우 길어졌으므로(전체 자막), 상위 3개만 보내도 충분함.
  // 너무 많이 보내면 토큰 낭비.
  return relevantItems.slice(0, 3);
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
=== DOCUMENT START ===
Title: ${item.title} (Date: ${item.dateCode || 'Unknown'})
URL: ${item.url}
Type: ${item.type}
Content:
${item.content}
=== DOCUMENT END ===
    `).join('\n\n');
  } else {
    contextString = "검색된 철산랜드 기록이 없습니다.";
  }

  const systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE.replace('{{CONTEXT}}', contextString);

  try {
    // Context Window가 큰 모델 사용 (gemini-2.5-flash)
    const model = 'gemini-2.5-flash'; 
    
    const chat = genAI.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // 사실 기반 답변을 위해 낮음 유지
        tools: [{ googleSearch: {} }] // 최신 정보 보완용
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
