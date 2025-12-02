export enum Sender {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isThinking?: boolean;
  sources?: Source[];
  retrievedContext?: KnowledgeItem[]; // Added: To show what documents were used
}

export interface Source {
  title: string;
  url: string;
  timestamp?: string; // e.g., "123" for seconds
  type: 'youtube' | 'blog' | 'web';
}

export interface KnowledgeItem {
  id: string;
  type: 'youtube' | 'blog';
  title: string;
  content: string; // The text content extracted (simulated)
  url: string;
}

export enum ViewState {
  CHAT = 'CHAT',
  KNOWLEDGE = 'KNOWLEDGE',
  SETTINGS = 'SETTINGS'
}