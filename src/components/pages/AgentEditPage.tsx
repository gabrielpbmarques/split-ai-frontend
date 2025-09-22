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
      <Card variant="liquid" className="mx-auto glass-reflect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">✏️</span>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Editar Agente
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6">
              <Alert variant="destructive" className="liquid-glass border-red-500/30">
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
