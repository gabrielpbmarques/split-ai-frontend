'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { AgentForm } from '@/components/pages/AgentForm';
import { CreateAgentRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AgentCreatePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: CreateAgentRequest) => {
    if (!token || !isAuthenticated) return;
    setSubmitting(true);
    setError('');
    try {
      await apiService.createAgent(data, token);
      router.push('/agents');
    } catch (e: any) {
      setError(e?.message || 'Erro ao criar agente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-6">
      <Card variant="glass" className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Novo Agente</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          <AgentForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Criar" />
        </CardContent>
      </Card>
    </div>
  );
}
