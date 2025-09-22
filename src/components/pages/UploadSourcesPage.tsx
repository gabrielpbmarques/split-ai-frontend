'use client';

import React, { useState } from 'react';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useAgents } from '@/contexts/AgentsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/Select';
import { Loading } from '@/components/ui/Loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Link, CheckCircle, AlertCircle } from 'lucide-react';
import { AgentDetail, AgentListItem } from '@/types';

export function UploadSourcesPage() {
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [agentId, setAgentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const { token } = useAuth();
  const { agents: agentsData, loading: loadingAgents } = useAgents();
  
  // Garantir que agents seja sempre um array
  const agents = agentsData || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Por favor, insira uma URL válida');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiService.generateAgentSource({
        url: url.trim(),
        sourceType: sourceType || undefined,
        agentId: agentId || undefined
      }, token || undefined);

      setSuccess('Fonte de conhecimento processada com sucesso!');
      setUrl('');
      setSourceType('');
      setAgentId('');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar fonte de conhecimento');
    } finally {
      setIsLoading(false);
    }
  };

  const agentOptions = [
    { value: '', label: loadingAgents ? 'Carregando agentes...' : 'Selecione um agente (opcional)' },
    ...agents.map(agent => ({ value: agent.id, label: agent.name }))
  ];

  return (
    <div className="container mx-auto py-8 px-6">
      <Card variant="liquid" className="max-w-2xl mx-auto glass-reflect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Upload className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Upload de Fontes de Conhecimento</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="liquid-glass border-red-500/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="liquid-glass border-green-500/30 bg-green-500/10 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                URL da Fonte *
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="url"
                  type="url"
                  placeholder="https://exemplo.com/documento"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 rounded-xl liquid-glass border-0 focus:liquid-glass-strong"
                  disabled={isLoading}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Insira a URL completa do documento ou página web
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="sourceType" className="text-sm font-medium">
                Tipo da Fonte
              </label>
              <Input
                id="sourceType"
                type="text"
                placeholder="ex: documentação, artigo, manual"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="rounded-xl liquid-glass border-0 focus:liquid-glass-strong"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Descreva o tipo de conteúdo (opcional)
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="agentId" className="text-sm font-medium">
                Agente de Destino
              </label>
              <Select
                options={agentOptions}
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Selecione qual agente deve receber esta fonte de conhecimento (opcional)
              </p>
            </div>

            {agentId && (
              <div className="p-4 liquid-glass rounded-xl">
                <h4 className="font-medium text-sm mb-1">
                  {agents.find(a => a.id === agentId)?.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {agents.find(a => a.id === agentId)?.agent_identifier || 'Agente customizado'}
                </p>
              </div>
            )}
            
            <Button
              type="submit"
              variant="liquid-primary"
              className="w-full rounded-xl"
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loading size="sm" />
                  <span>Processando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Processar Fonte</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
