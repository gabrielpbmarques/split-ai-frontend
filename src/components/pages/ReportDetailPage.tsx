'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAgents } from '@/contexts/AgentsContext';
import { apiService } from '@/services/api';
import { ReportDetail } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui/Loading';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export function ReportDetailPage({ id }: { id: string }) {
  const { token, isAuthenticated } = useAuth();
  const { agents } = useAgents();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const agentNameById = useMemo(() => {
    const map = new Map<string, string>();
    (agents || []).forEach(a => map.set(a.id, a.name));
    return map;
  }, [agents]);

  const friendlyType = (t?: string) => t === 'appointment' ? 'Agendamento' : t === 'order' ? 'Pedido' : t === 'faq' ? 'FAQ' : '—';
  const friendlySentiment = (s?: string) => s === 'positive' ? 'Positivo' : s === 'negative' ? 'Negativo' : s === 'neutral' ? 'Neutro' : '—';

  useEffect(() => {
    let mounted = true;
    async function fetchReport() {
      if (!token || !isAuthenticated) return;
      setLoading(true);
      setError('');
      try {
        const data = await apiService.getReport(id, token);
        if (mounted) setReport(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Erro ao carregar detalhes do report');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchReport();
    return () => { mounted = false; };
  }, [id, token, isAuthenticated]);

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Detalhes do Report
        </h1>
        <Link href="/reports">
          <Button variant="liquid" className="rounded-2xl flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 liquid-glass border-red-500/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="py-10 flex justify-center"><Loading /></div>
      ) : !report ? (
        <div className="text-sm text-muted-foreground">Nenhum dado para exibir</div>
      ) : (
        <div className="space-y-6">
          <Card variant="liquid" className="glass-reflect">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
                <div><span className="font-medium text-foreground">Agente:</span> {agentNameById.get(report.agent_id) || '—'}</div>
                <div><span className="font-medium text-foreground">Tipo:</span> {friendlyType(report.type)}</div>
                <div><span className="font-medium text-foreground">Sentimento:</span> {friendlySentiment(report.sentiment)}</div>
                <div><span className="font-medium text-foreground">Criado em:</span> {new Date(report.created_at).toLocaleString()}</div>
                <div><span className="font-medium text-foreground">Atualizado em:</span> {new Date(report.updated_at).toLocaleString()}</div>
              </div>
              <p className="text-foreground/90 whitespace-pre-wrap">{report.summary}</p>
            </CardContent>
          </Card>

          {report.insights && (
            <Card variant="liquid" className="glass-reflect">
              <CardHeader>
                <CardTitle>Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm whitespace-pre-wrap break-words">{report.insights}</pre>
              </CardContent>
            </Card>
          )}

          {report.return && (
            <Card variant="liquid" className="glass-reflect">
              <CardHeader>
                <CardTitle>Retorno</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm whitespace-pre-wrap break-words">{report.return}</pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
