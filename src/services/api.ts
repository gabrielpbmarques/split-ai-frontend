import {
  AuthResponse,
  LoginRequest,
  QuestionRequest,
  GenerateSourceRequest,
  AgentDetail,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentListItem,
} from '@/types';

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:4000';
const AGI_BASE_URL = process.env.NEXT_PUBLIC_AGI_SERVICE_URL || 'http://localhost:4000';

class ApiService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      } as LoginRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }

    const json = await response.json();
    const data = json?.data ?? { token: json?.token, user: json?.user };
    return {
      data,
      message: json?.message ?? '',
    } as AuthResponse;
  }

  async askQuestion(question: string, agentId: string, token: string): Promise<ReadableStream<Uint8Array> | null> {
    const response = await fetch(`${AGI_BASE_URL}/support/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ question, agentId } as QuestionRequest),
    });

    if (!response.ok) {
      throw new Error('Failed to send question');
    }

    return response.body;
  }

  async createSession(agentId: string, token: string): Promise<void> {
    const response = await fetch(`${AGI_BASE_URL}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ agent_id: agentId }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create session');
    }
  }

  async generateAgentSource(data: GenerateSourceRequest, token?: string): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${AGI_BASE_URL}/agent/generate-source`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to generate agent source');
    }

    const contentType = response.headers.get('content-type') || '';
    if (response.status === 204) {
      return null;
    }
    const text = await response.text();
    if (!text) {
      return null;
    }
    if (contentType.includes('application/json')) {
      return JSON.parse(text);
    }
    return text;
  }

  async listAgents(token: string): Promise<AgentListItem[]> {
    const response = await fetch(`${AGI_BASE_URL}/agent/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to list agents');
    }

    const json = await response.json();
    return json as AgentListItem[];
  }

  async getAgent(idOrIdentifier: string, token: string): Promise<AgentDetail> {
    const response = await fetch(`${AGI_BASE_URL}/agent/${idOrIdentifier}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to get agent');
    }

    const json = await response.json();
    return json.data as AgentDetail;
  }

  async createAgent(data: CreateAgentRequest, token: string): Promise<{ id: string }> {
    const response = await fetch(`${AGI_BASE_URL}/agent/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create agent');
    }

    return response.json();
  }

  async updateAgent(idOrIdentifier: string, data: UpdateAgentRequest, token: string): Promise<{ id: string }> {
    const response = await fetch(`${AGI_BASE_URL}/agent/${idOrIdentifier}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update agent');
    }

    return response.json();
  }
}

export const apiService = new ApiService();
