export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  data: {
    token: string;
    user: User;
  };
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceFingerprint: string;
}

export interface QuestionRequest {
  question: string;
}

export interface GenerateSourceRequest {
  url: string;
  sourceType?: string;
  agentId?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export type AgentType = 'support' | 'message_data_parser' | 'extract_document';

export interface Agent {
  id: AgentType;
  name: string;
  description: string;
}
