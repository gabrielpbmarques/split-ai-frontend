'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AgentListItem } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from './AuthContext';
import { useApiCache } from '@/hooks/useApiCache';
import { PERFORMANCE_CONFIG } from '@/config/performance';

interface AgentsContextType {
  agents: AgentListItem[];
  loading: boolean;
  error: string;
  refreshAgents: () => Promise<void>;
  getAgentById: (id: string) => AgentListItem | undefined;
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

export function AgentsProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();

  // Memoized fetcher function to prevent unnecessary re-creations
  const agentsFetcher = useCallback(async () => {
    if (!token || !isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }
    return apiService.listAgents(token);
  }, [token, isAuthenticated]);

  // Use the optimized cache hook
  const {
    data,
    loading,
    error,
    fetchData,
    refresh: refreshAgents,
    clearCache
  } = useApiCache(
    `agents-${token}`, // Unique key per user
    agentsFetcher,
    {
      ttl: PERFORMANCE_CONFIG.CACHE.AGENTS_TTL,
      staleWhileRevalidate: PERFORMANCE_CONFIG.CACHE.STALE_WHILE_REVALIDATE
    }
  );

  // Garantir que agents seja sempre um array
  const agents = data || [];

  // Memoized agent lookup function
  const getAgentById = useCallback((id: string) => {
    return agents.find(agent => agent.id === id);
  }, [agents]);

  // Auto-fetch when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchData();
    } else {
      clearCache();
    }
  }, [isAuthenticated, token, fetchData, clearCache]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    agents,
    loading,
    error,
    refreshAgents: async () => {
      await refreshAgents();
    },
    getAgentById
  }), [agents, loading, error, refreshAgents, getAgentById]);

  return (
    <AgentsContext.Provider value={contextValue}>
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents() {
  const context = useContext(AgentsContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentsProvider');
  }
  return context;
}
