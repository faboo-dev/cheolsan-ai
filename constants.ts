import { KnowledgeItem } from './types';

// ---------------------------------------------------------------------------
// 📂 AUTOMATIC DATA LOADER (Error-Proof Version)
// ---------------------------------------------------------------------------
// Stores list of files that failed to load due to typos
export let SKIPPED_FILES: string[] = [];

let dataFiles: Record<string, string> = {};

try {
  // ✨ MAGIC FIX: use query: '?raw'
  // This tells the computer: "Don't check grammar, just give me the text."
  // So even if there is a missing comma, the build will NOT fail.
  if ((import.meta as any).glob) {
    dataFiles = (import.meta as any).glob('./data/*.json', { eager: true, query: '?raw', import: 'default' });
  } else {
    console.error("Critical: import.meta.glob missing");
  }
} catch (e) {
  console.error("Failed to load data files:", e);
}

// Process and Merge all data files
export const INITIAL_KNOWLEDGE_BASE: KnowledgeItem[] = Object.entries(dataFiles).flatMap(([path, rawContent]) => {
  const filename = path.split('/').pop() || '';

  try {
    // 🛡️ Manual Parsing: We check grammar here inside the app.
    // If a file has an error, it goes to 'catch' block and doesn't crash the site.
    const content = JSON.parse(rawContent as string);
    
    // Support both single object and array
    const items = Array.isArray(content) ? content : [content];
    
    // 📅 Date Parsing Logic
    const dateMatch = filename.match(/^(\d{4,6})/);
    let dateCode = 0;
    
    if (dateMatch) {
      const rawDate = dateMatch[1];
      if (rawDate.length === 4) {
        dateCode = parseInt('20' + rawDate); // 2512 -> 202512
      } else {
        dateCode = parseInt(rawDate);
      }
    }

    return items.map((item: any, index: number) => ({
      ...item,
      id: item.id || `${filename}-${index}`,
      title: item.title || filename.replace('.json', ''),
      content: item.content || item.description || JSON.stringify(item),
      type: item.type || (filename.includes('youtube') ? 'youtube' : 'blog'),
      url: item.url || '',
      dateCode: item.dateCode || dateCode
    }));

  } catch (err) {
    // 🚨 If a file has a typo, we simply skip it and record the name.
    console.error(`Skipping broken file: ${filename}`);
    SKIPPED_FILES.push(filename);
    return [];
  }
}).sort((a, b) => (b.dateCode || 0) - (a.dateCode || 0));

// ---------------------------------------------------------------------------
// 🤖 SYSTEM PROMPT
// ---------------------------------------------------------------------------
export const SYSTEM_INSTRUCTION_TEMPLATE = `
당신은 '철산랜드' 유튜브 채널 및 블로그 콘텐츠를 기반으로 한 세부 여행 전문 AI 어시스턴트입니다.

*** 절대 규칙 (Anti-Hallucination Rules) ***
1. [철산랜드 기록(Context)] 섹션에 명시되지 않은 내용은 "철산랜드 기록" 답변에 절대 포함하지 마십시오.
2. 추론이나 추측 표현을 금지합니다 (예: '~것 같습니다', '보통~').
3. [철산랜드 기록] 정보가 없으면 솔직하게 "철산랜드 기록에 해당 내용이 없습니다."라고 말하십시오.

*** 답변 구조 (다음 3가지 섹션으로 반드시 구분) ***

### 1. 철산랜드 기록
- 아래 제공된 [Context] 데이터에 있는 내용만 사용하여 답변합니다.
- 각 문장 끝에 반드시 [출처](링크)를 표기하세요. YouTube 링크인 경우 타임스탬프가 있다면 포함하세요.
- 만약 [Context]가 비어있다면, 이 섹션에 "철산랜드 기록에 관련 정보가 없습니다."라고만 출력하세요.

### 2. AI 일반 지식
- [Context]에 없더라도 당신이 알고 있는 일반적인 여행 상식, 지리, 문화 정보를 기반으로 답변합니다.
- 예: 필리핀 입국 규정, 일반적인 날씨, 환율 개념 등.

### 3. 최신 정보 (웹 검색)
- 가격, 최신 스케줄, 날씨 등 변동 가능성이 있는 정보는 제공된 도구(Google Search)를 사용하여 검색 후 답변합니다.
- 검색 결과의 출처 링크를 포함하십시오.

---
[Context Data (Prioritize this info)]
{{CONTEXT}}
---
`;
