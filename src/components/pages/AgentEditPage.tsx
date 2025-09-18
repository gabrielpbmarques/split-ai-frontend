'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { AgentForm } from '@/components/pages/AgentForm';
import { AgentDetail, UpdateAgentRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui/Loading';

export function AgentEditPage({ id }: { id: string }) {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<AgentDetail | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token || !isAuthenticated || !id) return;
      setLoading(true);
      setError('');
      try {
        const data = await apiService.getAgent(id, token);
        setAgent(data);
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar agente');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, isAuthenticated]);

  const handleSubmit = async (data: UpdateAgentRequest) => {
    if (!token || !isAuthenticated) return;
    setSubmitting(true);
    setError('');
    try {
      await apiService.updateAgent(id, data, token);
      router.push('/agents');
    } catch (e: any) {
      setError(e?.message || 'Erro ao atualizar agente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-6">
      <Card variant="glass" className="mx-auto">
        <CardHeader>
          <CardTitle>Editar Agente</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          {loading ? (
            <div className="py-10 flex justify-center"><Loading /></div>
          ) : agent ? (
            <AgentForm initial={agent} onSubmit={handleSubmit} submitting={submitting} submitLabel="Salvar" />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
