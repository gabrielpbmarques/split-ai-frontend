"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { Select } from "@/components/ui/Select";
import { AgentListItem } from "@/types";
import { Bot, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AgentSelectorProps {
  selectedAgentId?: string;
  onAgentChange: (agentId: string) => void;
  className?: string;
}

export function AgentSelector({ 
  selectedAgentId, 
  onAgentChange, 
  className 
}: AgentSelectorProps) {
  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadAgents = async () => {
      if (!token || !isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const agentsList = await apiService.listAgents(token);
        setAgents(agentsList);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar agentes");
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, [token, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const selectOptions = agents.map(agent => ({
    value: agent.id,
    label: agent.name
  }));

  return (
    <div className={className}>
      <div className="flex items-center space-x-2 mb-2">
        <Bot className="h-4 w-4 text-muted-foreground" />
        <label className="text-sm font-medium text-muted-foreground">
          Selecionar Agente
        </label>
      </div>
      
      <Select
        options={selectOptions}
        value={selectedAgentId || ""}
        onChange={(e) => onAgentChange(e.target.value)}
        placeholder={isLoading ? "Carregando agentes..." : "Escolha um agente"}
        disabled={isLoading || agents.length === 0}
        className="rounded-2xl bg-white/5 backdrop-blur-sm border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
      />
      
      {!isLoading && agents.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Nenhum agente disponível
        </p>
      )}
    </div>
  );
}
