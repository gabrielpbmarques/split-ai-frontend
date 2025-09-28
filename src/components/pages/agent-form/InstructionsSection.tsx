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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label htmlFor="agent-context" className="text-sm font-medium">
            Contexto
          </label>
          <Textarea
            id="agent-context"
            value={values.context || ""}
            onChange={(e) => onChange("context", e.target.value)}
            placeholder="Ex: Suporte ao cliente para dúvidas de faturamento"
            disabled={submitting}
            className="min-h-[120px] text-sm liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="agent-objetivo" className="text-sm font-medium">
            Objetivo
          </label>
          <Textarea
            id="agent-objetivo"
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
