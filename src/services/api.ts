import {
  AuthResponse,
  LoginRequest,
  QuestionRequest,
  GenerateSourceRequest,
  AgentDetail,
  CreateAgentRequest,
  UpdateAgentRequest,
} from '@/types';
import CryptoJS from 'crypto-js';

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:4001';
const AGI_BASE_URL = process.env.NEXT_PUBLIC_AGI_SERVICE_URL || 'http://localhost:4000';

class ApiService {
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }

  private encryptPassword(password: string): string {
    return CryptoJS.MD5(password).toString();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const deviceFingerprint = this.generateDeviceFingerprint();
    const encryptedPassword = this.encryptPassword(password);
    
    const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: encryptedPassword,
        deviceFingerprint
      } as LoginRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async askQuestion(question: string, token: string): Promise<ReadableStream<Uint8Array> | null> {
    const response = await fetch(`${AGI_BASE_URL}/support/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ question } as QuestionRequest),
    });

    if (!response.ok) {
      throw new Error('Failed to send question');
    }

    return response.body;
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

    return response.json();
  }

  async listAgents(token: string): Promise<AgentDetail[]> {
    const response = await fetch(`${AGI_BASE_URL}/agent`, {
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
    return json.data as AgentDetail[];
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
