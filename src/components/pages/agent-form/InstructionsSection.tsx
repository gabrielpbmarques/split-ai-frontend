"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";

type Instructions = {
  context?: string;
  objetivo?: string;
};

type InstructionsSectionProps = {
  values: Instructions;
  onChange: (key: keyof Instructions, value: string) => void;
  submitting?: boolean;
};

export function InstructionsSection({
  values,
  onChange,
  submitting,
}: InstructionsSectionProps) {
  const contextId = "agent-context";
  const contextDescId = "agent-context-desc";
  const objetivoId = "agent-objetivo";
  const objetivoDescId = "agent-objetivo-desc";

  const len = (s?: string) => (s ? s.length : 0);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h4 className="text-base font-medium text-foreground">Instruções do Agente</h4>
        <p className="text-sm text-muted-foreground">
          Descreva o cenário de atuação e a meta principal.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Contexto */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label htmlFor={contextId} className="text-sm font-medium">
              Contexto
            </label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {len(values.context)} caracteres
            </span>
          </div>
          <p id={contextDescId} className="text-xs text-muted-foreground">
            Explique o cenário onde o agente atuará.
          </p>
          <Textarea
            id={contextId}
            aria-describedby={contextDescId}
            value={values.context || ""}
            onChange={(e) => onChange("context", e.target.value)}
            placeholder="Ex: Suporte ao cliente para dúvidas de faturamento"
            disabled={submitting}
            className="min-h-[120px] text-sm liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {/* Objetivo */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label htmlFor={objetivoId} className="text-sm font-medium">
              Objetivo
            </label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {len(values.objetivo)} caracteres
            </span>
          </div>
          <p id={objetivoDescId} className="text-xs text-muted-foreground">
            Defina a meta principal do agente.
          </p>
          <Textarea
            id={objetivoId}
            aria-describedby={objetivoDescId}
            value={values.objetivo || ""}
            onChange={(e) => onChange("objetivo", e.target.value)}
            placeholder="Ex: Resolver tickets em até 3 interações"
            disabled={submitting}
            className="min-h-[120px] text-sm liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
}
