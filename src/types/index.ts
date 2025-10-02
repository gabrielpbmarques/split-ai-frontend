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
  deviceFingerprint?: string;
}

export interface QuestionRequest {
  question: string;
  agentId: string;
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

export interface AIInstructions {
  contexto?: string;
  context?: string;
  objetivo?: string;
  diretrizes?: string[];
}

export interface AgentDetail {
  id: string;
  name: string;
  agentIdentifier: string | null;
  model: string | null;
  temperature: number | null;
  withHistory: boolean;
  parser: {
    name: string | null;
    description: string | null;
    schema: any;
  } | null;
  instructions: AIInstructions | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateAgentRequest {
  name: string;
  agentIdentifier?: string | null;
  model?: string | null;
  temperature?: number | null;
  withHistory?: boolean;
  instructions: AIInstructions;
  parser?: {
    name: string;
    description: string;
    schema: any;
  } | null;
}

export interface UpdateAgentRequest {
  name?: string;
  agentIdentifier?: string | null;
  model?: string | null;
  temperature?: number | null;
  withHistory?: boolean;
  instructions?: AIInstructions;
  parser?: {
    name: string;
    description: string;
    schema: any;
  } | null;
}

export interface AgentListItem {
  id: string;
  agent_identifier: string | null;
  name: string;
}

export type ReportSentiment = 'positive' | 'negative' | 'neutral';
export type ReportType = 'appointment' | 'order' | 'faq';

export interface ReportDetail {
  id: string;
  session_id: string;
  agent_id: string;
  organization_id: string | null;
  type: ReportType;
  sentiment: ReportSentiment;
  summary: string;
  insights: string | null;
  return: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ReportListItem extends ReportDetail {}
