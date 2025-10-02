'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAgents } from '@/contexts/AgentsContext';
import { apiService } from '@/services/api';
import { ReportListItem, ReportSentiment, ReportType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui/Loading';
import { AlertCircle, Eye } from 'lucide-react';
import { AgentsMultiSelector } from '@/components/ui/agents-multi-selector';
import { SentimentSelector } from '@/components/ui/sentiment-selector';
import { TypeSelector } from '@/components/ui/type-selector';
import { DateSelector } from '@/components/ui/date-selector';

export function ReportsListPage() {
  const { token, isAuthenticated } = useAuth();
  const { agents } = useAgents();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [sentiment, setSentiment] = useState<ReportSentiment | ''>('');
  const [type, setType] = useState<ReportType | ''>('');
  const [agentIds, setAgentIds] = useState<string[]>([]);
  const [createdAt, setCreatedAt] = useState<string>('');

  const filters = useMemo(() => ({
    sentiment: sentiment || undefined,
    type: type || undefined,
    agent_ids: agentIds.length ? agentIds : undefined,
    created_at: createdAt ? new Date(createdAt).toISOString() : undefined,
  }), [sentiment, type, agentIds, createdAt]);

  const agentNameById = useMemo(() => {
    const map = new Map<string, string>();
    (agents || []).forEach(a => map.set(a.id, a.name));
    return map;
  }, [agents]);

  const friendlyType = (t?: string) => t === 'appointment' ? 'Agendamento' : t === 'order' ? 'Pedido' : t === 'faq' ? 'FAQ' : '—';
  const friendlySentiment = (s?: string) => s === 'positive' ? 'Positivo' : s === 'negative' ? 'Negativo' : s === 'neutral' ? 'Neutro' : '—';

  useEffect(() => {
    let mounted = true;
    async function fetchReports() {
      if (!token || !isAuthenticated) return;
      setLoading(true);
      setError('');
      try {
        const data = await apiService.listReports(token, filters);
        if (mounted) setReports(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Erro ao carregar reports');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchReports();
    return () => { mounted = false; };
  }, [token, isAuthenticated, filters]);

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Reports
        </h1>
      </div>

      <Card variant="liquid" className="glass-reflect mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SentimentSelector
              value={sentiment}
              onChange={setSentiment}
            />
            <TypeSelector
              value={type}
              onChange={setType}
            />
            <AgentsMultiSelector
              selectedAgentIds={agentIds}
              onChange={setAgentIds}
              className="w-full"
            />
            <DateSelector
              value={createdAt}
              onChange={setCreatedAt}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6 liquid-glass border-red-500/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card variant="liquid" className="glass-reflect">
        <CardHeader>
          <CardTitle>Lista de Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Loading /></div>
          ) : reports.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nenhum report encontrado</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((r) => (
                <Card key={r.id} variant="liquid" className="group hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-500 transition-colors">
                          {friendlyType(r.type)} • {friendlySentiment(r.sentiment)}
                        </h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Agente: {agentNameById.get(r.agent_id) || '—'}</div>
                          <div>Data: {new Date(r.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xs">RP</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-3 mb-4">{r.summary}</p>
                    <div className="flex justify-end">
                      <Link href={`/reports/${r.id}`}>
                        <Button variant="liquid" size="sm" className="flex items-center space-x-2 rounded-xl">
                          <Eye className="h-3 w-3" />
                          <span>Detalhes</span>
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
