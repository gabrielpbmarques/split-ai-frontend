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

export function InstructionsSection({ values, onChange, submitting }: InstructionsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium">Contexto</label>
        <p className="text-xs text-muted-foreground">Explique o cenário onde o agente atuará.</p>
        <Textarea
          value={values.context || ""}
          onChange={(e) => onChange("context", e.target.value)}
          placeholder="Ex: Suporte ao cliente para dúvidas de faturamento"
          disabled={submitting}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium">Objetivo</label>
        <p className="text-xs text-muted-foreground">Defina a meta principal do agente.</p>
        <Textarea
          value={values.objetivo || ""}
          onChange={(e) => onChange("objetivo", e.target.value)}
          placeholder="Ex: Resolver tickets em até 3 interações"
          disabled={submitting}
        />
      </div>
    </div>
  );
}
