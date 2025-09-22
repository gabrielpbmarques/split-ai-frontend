'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { AgentDetail, AgentListItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui/Loading';
import { Plus, Pencil, AlertCircle } from 'lucide-react';

export function AgentsListPage() {
  const { token, isAuthenticated } = useAuth();
  const [agents, setAgents] = useState<AgentListItem[]>([]);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Agentes
        </h1>
        <Link href="/agents/new">
          <Button variant="liquid-primary" className="flex items-center space-x-2 rounded-2xl">
            <Plus className="h-4 w-4" />
            <span>Novo Agente</span>
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 liquid-glass border-red-500/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card variant="liquid" className="glass-reflect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span>Lista de Agentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Loading /></div>
          ) : agents.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nenhum agente encontrado</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((a) => (
                <Card key={a.id} variant="liquid" className="group hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-500 transition-colors">
                          {a.name}
                        </h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            ID: {a.agent_identifier || 'Sem identifier'}
                          </div>
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xs">AI</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Link href={`/agents/${a.id}`}>
                        <Button variant="liquid" size="sm" className="flex items-center space-x-2 rounded-xl">
                          <Pencil className="h-3 w-3" />
                          <span>Editar</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
