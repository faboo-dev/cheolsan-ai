import { KnowledgeItem } from './types';

// ---------------------------------------------------------------------------
// 📂 AUTOMATIC DATA LOADER (Raw Mode)
// ---------------------------------------------------------------------------
// Stores list of files that failed to load
export let SKIPPED_FILES: string[] = [];

let dataFiles: Record<string, string> = {};

try {
  // ✨ MAGIC FIX: use query: '?raw'
  // 쉼표 오류가 있어도 빌드가 멈추지 않고 텍스트로 읽어옵니다.
  if ((import.meta as any).glob) {
    dataFiles = (import.meta as any).glob('./data/*.json', { eager: true, query: '?raw', import: 'default' });
  } else {
    console.error("Critical: import.meta.glob missing");
  }
} catch (e) {
  console.error("Failed to load data files:", e);
}

// ---------------------------------------------------------------------------
// 🔄 DATA PROCESSING (MERGE LOGIC)
// ---------------------------------------------------------------------------
export const INITIAL_KNOWLEDGE_BASE: KnowledgeItem[] = Object.entries(dataFiles).flatMap(([path, rawContent]) => {
  const filename = path.split('/').pop() || '';

  try {
    const content = JSON.parse(rawContent as string);
    
    // 📅 Date Parsing Logic (파일명에서 날짜 추출)
    // 예: 2512_filename.json -> 202512
    const dateMatch = filename.match(/^(\d{4,6})/);
    let dateCode = 0;
    
    if (dateMatch) {
      const rawDate = dateMatch[1];
      if (rawDate.length === 4) {
        dateCode = parseInt('20' + rawDate); 
      } else {
        dateCode = parseInt(rawDate);
      }
    }

    // 🧩 MERGE LOGIC (핵심 변경 사항)
    // 배열(자막 리스트)을 하나의 긴 텍스트로 합칩니다.
    let mergedText = "";
    let mainUrl = "";
    let mainTitle = filename.replace('.json', '');
    let type = filename.includes('youtube') ? 'youtube' : 'blog';

    if (Array.isArray(content)) {
      // 1. URL 찾기 (배열 중 하나라도 url이 있으면 가져옴)
      const itemWithUrl = content.find((c: any) => c.url || c.url_full || c.original_url);
      if (itemWithUrl) {
        mainUrl = itemWithUrl.url || itemWithUrl.url_full || itemWithUrl.original_url;
      }

      // 2. 텍스트 합치기
      // 타임스탬프가 있으면 [00:00] 형식으로 같이 넣어줍니다.
      mergedText = content.map((c: any) => {
        const time = c.timestamp_str ? `[${c.timestamp_str}] ` : '';
        const text = c.text || c.content || c.raw_content || '';
        return `${time}${text}`;
      }).join('\n'); // 줄바꿈으로 연결

      // 제목이 내부에 있다면 업데이트
      if (content[0]?.title) mainTitle = content[0].title;

    } else {
      // 객체인 경우
      mergedText = content.content || content.description || JSON.stringify(content);
      mainUrl = content.url || content.url_full || "";
      if (content.title) mainTitle = content.title;
    }

    // 파일 하나당 딱 1개의 아이템만 반환 (통파일)
    return [{
      id: filename,
      title: mainTitle,
      content: mergedText, // 전체 내용이 들어감
      type: type,
      url: mainUrl,
      dateCode: dateCode
    }];

  } catch (err) {
    // 🚨 파싱 실패 시 제외
    console.error(`Skipping broken file: ${filename}`);
    SKIPPED_FILES.push(filename);
    return [];
  }
}).sort((a, b) => (b.dateCode || 0) - (a.dateCode || 0)); // 최신순 정렬

// ---------------------------------------------------------------------------
// 🤖 SYSTEM PROMPT
// ---------------------------------------------------------------------------
export const SYSTEM_INSTRUCTION_TEMPLATE = `
당신은 '철산랜드' 유튜브 채널 및 블로그 콘텐츠를 기반으로 한 세부 여행 전문 AI 어시스턴트입니다.

*** 절대 규칙 (Anti-Hallucination Rules) ***
1. 답변은 반드시 아래 제공된 [Context] 데이터에 있는 내용만 우선적으로 사용해야 합니다.
2. [Context]에 있는 내용으로 답변할 때는 문장 끝에 [출처](링크)를 반드시 표기하세요.
3. [Context]에 "철산랜드 기록"과 관련된 정보가 전혀 없다면, "철산랜드 기록에는 해당 내용이 없습니다."라고 명확히 밝히고 일반 지식으로 넘어가세요.

*** 답변 구조 (다음 3가지 섹션으로 구분하여 출력) ***

### 1. 철산랜드 기록
- [Context]에 포함된 자막/본문 내용을 바탕으로 구체적으로 답변합니다.
- 예: "철산랜드 영상에 따르면, 썬마호핑의 가격은 2000페소입니다. [출처](링크)"
- 타임스탬프([00:00])가 있다면 포함해서 답변하세요.

### 2. AI 일반 지식
- [Context]에 없지만 여행에 도움이 되는 일반적인 상식(날씨, 입국 규정 등)을 제공합니다.

### 3. 최신 정보 (웹 검색)
- 가격 변동이나 최신 스케줄 확인이 필요하면 Google Search 도구를 사용하여 보완합니다.

---
[Context Data (철산랜드 기록)]
{{CONTEXT}}
---
`;
