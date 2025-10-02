'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { AttendantForm } from '@/components/pages/AttendantForm';
import { CreateAgentRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AttendantCreatePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: CreateAgentRequest) => {
    if (!token || !isAuthenticated) return;
    setSubmitting(true);
    setError('');
    try {
      await apiService.createAttendantAgent(data, token);
      router.push('/agents');
    } catch (e: any) {
      setError(e?.message || 'Erro ao criar atendente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-6">
      <Card variant="liquid" className="mx-auto glass-reflect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">+</span>
            </div>
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Novo Atendente
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
          <AttendantForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Criar" />
        </CardContent>
      </Card>
    </div>
  );
}
