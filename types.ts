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
  type: string; 
  title: string;
  content: string;
  url?: string;
  dateCode?: number; 
  [key: string]: any; 
}

export enum ViewState {
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS'
}
