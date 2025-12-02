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
  retrievedContext?: KnowledgeItem[];
}

export interface Source {
  title: string;
  url: string;
  timestamp?: string;
  type: 'youtube' | 'blog' | 'web';
}

export interface KnowledgeItem {
  id: string;
  type: string; // Flexible type (youtube, blog, etc)
  title: string;
  content: string;
  url?: string;
  dateCode?: number; // YYYYMM format for sorting (e.g., 202512)
  [key: string]: any; // Allow other fields from JSON
}

export enum ViewState {
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS'
}
