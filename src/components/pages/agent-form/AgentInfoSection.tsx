"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

type AgentInfoValues = {
  name: string;
  agentIdentifier: string;
  model: string;
  temperature: string;
  withHistory: boolean;
};

type AgentInfoSectionProps = {
  values: AgentInfoValues;
  onChange: (patch: Partial<AgentInfoValues>) => void;
  submitting?: boolean;
  errors?: { name?: string; temperature?: string };
};

export function AgentInfoSection({
  values,
  onChange,
  submitting,
  errors,
}: AgentInfoSectionProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="agent-name">
              Nome *
            </label>
            <Input
              id="agent-name"
              value={values.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Ex: Suporte"
              disabled={submitting}
              required
              className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              aria-invalid={Boolean(errors?.name) || undefined}
              aria-describedby={errors?.name ? "agent-name-error" : undefined}
            />
            {errors?.name && (
              <p id="agent-name-error" className="text-xs text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="agent-identifier">
              Identifier
            </label>
            <Input
              id="agent-identifier"
              value={values.agentIdentifier}
              onChange={(e) => onChange({ agentIdentifier: e.target.value })}
              placeholder="ex: support"
              disabled={submitting}
              className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="agent-model">
              Modelo
            </label>
            <Input
              id="agent-model"
              value={values.model}
              onChange={(e) => onChange({ model: e.target.value })}
              placeholder="ex: gpt-4o-mini"
              disabled={submitting}
              className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            <label className="text-sm font-medium" htmlFor="agent-temperature">
              Temperatura
            </label>
            <div className="flex items-center gap-3">
              <Slider
                value={values.temperature || "0"}
                onChange={(e) =>
                  onChange({
                    temperature: (e.target as HTMLInputElement).value,
                  })
                }
                min={0}
                max={2}
                step={0.1}
                disabled={submitting}
                className={
                  errors?.temperature ? "focus-visible:ring-red-500/40" : undefined
                }
                aria-invalid={Boolean(errors?.temperature) || undefined}
                aria-describedby={
                  errors?.temperature ? "agent-temperature-error" : undefined
                }
                id="agent-temperature"
              />
              <span className="w-12 text-right text-sm tabular-nums md:hidden">
                {Number(values.temperature || 0).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>0</span>
              <span>1</span>
              <span>2</span>
            </div>
            {errors?.temperature && (
              <p id="agent-temperature-error" className="text-xs text-red-500">
                {errors.temperature}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="withHistory"
              type="checkbox"
              checked={values.withHistory}
              onChange={(e) => onChange({ withHistory: e.target.checked })}
              disabled={submitting}
              className="h-4 w-4 rounded border-border/50 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
            <label htmlFor="withHistory" className="text-sm font-medium">
              Manter histórico
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
