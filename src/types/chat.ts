export interface Attachment {
  type: string;
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: Attachment[];
}

export interface ChatConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
  apiKey: string;
  saveHistory: boolean;
  privateMode: boolean;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export interface Folder {
  id: string;
  name: string;
  children: Folder[];
  chats: Chat[];
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'document' | 'audio';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface ChatFolder {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  chats: ChatConversation[];
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  folderId?: string;
  settings: {
    temperature: number;
    topP: number;
    maxTokens: number;
    model: string;
  };
}

export interface ChatSettings {
  temperature: number;
  topP: number;
  maxTokens: number;
  model: string;
  saveHistory: boolean;
  privateMode: boolean;
}

export interface TokenUsage {
  available: number;
  used: number;
  total: number;
  renewalDate: Date;
} 