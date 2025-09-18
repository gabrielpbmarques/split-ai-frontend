'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { AgentDetail } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui/Loading';
import { Plus, Pencil, AlertCircle } from 'lucide-react';

export function AgentsListPage() {
  const { token, isAuthenticated } = useAuth();
  const [agents, setAgents] = useState<AgentDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!token || !isAuthenticated) return;
    try {
      setLoading(true);
      setError('');
      const list = await apiService.listAgents(token);
      setAgents(list);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar agentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, isAuthenticated]);

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Agentes</h1>
        <Link href="/agents/new">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Novo Agente</span>
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Lista de Agentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Loading /></div>
          ) : agents.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nenhum agente encontrado</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((a) => (
                <div key={a.id} className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.agentIdentifier || 'Sem identifier'}</div>
                      <div className="text-xs text-muted-foreground">Modelo: {a.model || '-'}</div>
                      <div className="text-xs text-muted-foreground">Temp: {a.temperature ?? '-'}</div>
                      <div className="text-xs text-muted-foreground">History: {a.withHistory ? 'sim' : 'não'}</div>
                    </div>
                    <Link href={`/agents/${a.id}`}>
                      <Button variant="secondary" size="sm" className="flex items-center space-x-2">
                        <Pencil className="h-3 w-3" />
                        <span>Editar</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
