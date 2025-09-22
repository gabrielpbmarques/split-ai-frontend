"use client";

import React, { memo } from "react";
import { useAgents } from "@/contexts/AgentsContext";
import { Select } from "@/components/ui/Select";
import { Bot, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AgentSelectorProps {
  selectedAgentId?: string;
  onAgentChange: (agentId: string) => void;
  className?: string;
}

export const AgentSelector = memo(function AgentSelector({ 
  selectedAgentId, 
  onAgentChange, 
  className 
}: AgentSelectorProps) {
  const { agents, loading: isLoading, error } = useAgents();

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Garantir que agents seja sempre um array
  const safeAgents = agents || [];
  
  const selectOptions = safeAgents.map(agent => ({
    value: agent.id,
    label: agent.name
  }));

  return (
    <div className={className}>
      <Select
        options={selectOptions}
        value={selectedAgentId || ""}
        onChange={(e) => onAgentChange(e.target.value)}
        placeholder={isLoading ? "Carregando agentes..." : "Escolha um agente"}
        disabled={isLoading || safeAgents.length === 0}
        className="rounded-2xl bg-white/5 backdrop-blur-sm border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer"
      />
      
      {!isLoading && safeAgents.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Nenhum agente disponível
        </p>
      )}
    </div>
  );
});
