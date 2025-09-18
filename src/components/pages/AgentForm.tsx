"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loading } from "@/components/ui/Loading";

import { AgentDetail, CreateAgentRequest, UpdateAgentRequest, AIInstructions, AIInstructionsDiretrizes } from "@/types";

type AgentFormValues = {
  name: string;
  agentIdentifier: string;
  model: string;
  temperature: string;
  withHistory: boolean;
  instructions: AIInstructions;
  parserName: string;
  parserDescription: string;
  parserSchema: string;
};

type AgentFormProps = {
  initial?: Partial<AgentDetail>;
  submitting?: boolean;
  error?: string;
  submitLabel?: string;
  onSubmit: (data: CreateAgentRequest | UpdateAgentRequest) => Promise<void> | void;
};

export function AgentForm({ initial, submitting, error, submitLabel = "Salvar", onSubmit }: AgentFormProps) {
  const [values, setValues] = useState<AgentFormValues>({
    name: initial?.name || "",
    agentIdentifier: initial?.agentIdentifier || "",
    model: (initial?.model as string) || "",
    temperature: initial?.temperature !== null && initial?.temperature !== undefined ? String(initial?.temperature) : "",
    withHistory: Boolean(initial?.withHistory),
    instructions: initial?.instructions || {},
    parserName: initial?.parser?.name || "",
    parserDescription: initial?.parser?.description || "",
    parserSchema: initial?.parser?.schema ? JSON.stringify(initial?.parser?.schema, null, 2) : "",
  });

  const normalizeDiretrizes = (diretrizes: any): AIInstructionsDiretrizes => {
    if (!diretrizes || typeof diretrizes !== 'object') return {};
    
    const normalized: AIInstructionsDiretrizes = {};
    Object.entries(diretrizes).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Se for um objeto, tenta extrair uma propriedade comum ou serializa
        const obj = value as any;
        if ('value' in obj) {
          normalized[key] = String(obj.value || '');
        } else if ('description' in obj) {
          normalized[key] = String(obj.description || '');
        } else if ('content' in obj) {
          normalized[key] = String(obj.content || '');
        } else {
          // Se não encontrar propriedades conhecidas, serializa como JSON legível
          try {
            normalized[key] = JSON.stringify(value, null, 2);
          } catch {
            normalized[key] = String(value);
          }
        }
      } else {
        normalized[key] = String(value || '');
      }
    });
    
    return normalized;
  };

  const [diretrizes, setDiretrizes] = useState<AIInstructionsDiretrizes>(
    normalizeDiretrizes(initial?.instructions?.diretrizes)
  );

  useEffect(() => {
    setValues({
      name: initial?.name || "",
      agentIdentifier: initial?.agentIdentifier || "",
      model: (initial?.model as string) || "",
      temperature: initial?.temperature !== null && initial?.temperature !== undefined ? String(initial?.temperature) : "",
      withHistory: Boolean(initial?.withHistory),
      instructions: initial?.instructions || {},
      parserName: initial?.parser?.name || "",
      parserDescription: initial?.parser?.description || "",
      parserSchema: initial?.parser?.schema ? JSON.stringify(initial?.parser?.schema, null, 2) : "",
    });
    setDiretrizes(normalizeDiretrizes(initial?.instructions?.diretrizes));
  }, [initial]);

  const parsedSchema = useMemo(() => {
    if (!values.parserSchema.trim()) return null;
    try {
      return JSON.parse(values.parserSchema);
    } catch {
      return "__invalid__" as any;
    }
  }, [values.parserSchema]);

  const canSubmit = useMemo(() => {
    if (!values.name.trim()) return false;
    if (values.temperature && isNaN(Number(values.temperature))) return false;
    if (parsedSchema === "__invalid__") return false;
    return true;
  }, [values.name, values.temperature, parsedSchema]);

  const buildPayload = (): CreateAgentRequest | UpdateAgentRequest => {
    const instructions = {
      ...values.instructions,
      diretrizes: Object.keys(diretrizes).length > 0 ? diretrizes : undefined,
    };

    const base = {
      name: values.name.trim(),
      agentIdentifier: values.agentIdentifier.trim() || null,
      model: values.model.trim() || null,
      temperature: values.temperature === "" ? null : Number(values.temperature),
      withHistory: Boolean(values.withHistory),
      instructions,
      parser: values.parserName.trim()
        ? {
            name: values.parserName.trim(),
            description: values.parserDescription.trim(),
            schema: parsedSchema || null,
          }
        : null,
    } as CreateAgentRequest;
    return base;
  };

  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!canSubmit) return;
    try {
      await onSubmit(buildPayload());
    } catch (e: any) {
      setLocalError(e?.message || "Erro ao salvar");
    }
  };

  const setInstructionField = (key: keyof AIInstructions, value: string) => {
    setValues((v) => ({ ...v, instructions: { ...(v.instructions || {}), [key]: value } }));
  };

  const addDiretriz = () => {
    const newKey = `diretriz_${Date.now()}`;
    setDiretrizes((prev) => ({ ...prev, [newKey]: "" }));
  };

  const updateDiretriz = (oldKey: string, newKey: string, value: any) => {
    setDiretrizes((prev) => {
      const updated = { ...prev };
      if (oldKey !== newKey && updated[oldKey] !== undefined) {
        delete updated[oldKey];
      }
      // Força conversão para string, mesmo que seja um objeto
      const stringValue = typeof value === 'string' ? value : 
        typeof value === 'object' && value !== null ? 
          JSON.stringify(value, null, 2) : 
          String(value || '');
      updated[newKey] = stringValue;
      return updated;
    });
  };

  const removeDiretriz = (key: string) => {
    setDiretrizes((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || localError) && (
        <Alert variant="destructive">
          <AlertDescription>{error || localError}</AlertDescription>
        </Alert>
      )}

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Informações do Agente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Nome *</label>
            <Input
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              placeholder="Ex: Suporte"
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Identifier</label>
            <Input
              value={values.agentIdentifier}
              onChange={(e) => setValues((v) => ({ ...v, agentIdentifier: e.target.value }))}
              placeholder="ex: support"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Modelo</label>
            <Input
              value={values.model}
              onChange={(e) => setValues((v) => ({ ...v, model: e.target.value }))}
              placeholder="ex: gpt-4o-mini"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Temperatura</label>
            <Input
              value={values.temperature}
              onChange={(e) => setValues((v) => ({ ...v, temperature: e.target.value }))}
              placeholder="ex: 0.5"
              disabled={submitting}
              inputMode="decimal"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="withHistory"
              type="checkbox"
              checked={values.withHistory}
              onChange={(e) => setValues((v) => ({ ...v, withHistory: e.target.checked }))}
              disabled={submitting}
              className="h-4 w-4"
            />
            <label htmlFor="withHistory" className="text-sm font-medium">Manter histórico</label>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Contexto</label>
            <textarea
              value={values.instructions?.contexto || values.instructions?.context || ""}
              onChange={(e) => setInstructionField("contexto", e.target.value)}
              className="w-full min-h-[90px] rounded-md border border-white/20 bg-transparent p-2"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Objetivo</label>
            <textarea
              value={values.instructions?.objetivo || ""}
              onChange={(e) => setInstructionField("objetivo", e.target.value)}
              className="w-full min-h-[90px] rounded-md border border-white/20 bg-transparent p-2"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Diretrizes</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDiretriz}
                disabled={submitting}
                className="text-xs"
              >
                + Adicionar Diretriz
              </Button>
            </div>
            <div className="space-y-3">
              {Object.entries(diretrizes).map(([key, value]) => {
                // Debug: vamos ver o que está chegando aqui
                if (typeof value === 'object') {
                  console.error(`PROBLEMA ENCONTRADO - Diretriz "${key}" é um objeto:`, value);
                }
                
                const safeValue = typeof value === 'string' ? value : 
                  typeof value === 'object' && value !== null ? 
                    JSON.stringify(value, null, 2) : 
                    String(value || '');
                
                return (
                  <div key={key} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={key.startsWith('diretriz_') ? '' : key}
                        onChange={(e) => updateDiretriz(key, e.target.value || key, safeValue)}
                        placeholder="Nome da diretriz (ex: tom_comunicacao)"
                        disabled={submitting}
                        className="text-xs"
                      />
                      <textarea
                        value={safeValue}
                        onChange={(e) => updateDiretriz(key, key, e.target.value)}
                        placeholder="Descrição da diretriz..."
                        className="w-full min-h-[60px] rounded-md border border-white/20 bg-transparent p-2 text-sm"
                        disabled={submitting}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDiretriz(key)}
                      disabled={submitting}
                      className="text-red-500 hover:text-red-700 mt-1"
                    >
                      ×
                    </Button>
                  </div>
                );
              })}
              {Object.keys(diretrizes).length === 0 && (
                <div className="text-sm text-gray-500 italic">
                  Nenhuma diretriz adicionada. Clique em "Adicionar Diretriz" para começar.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Parser (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={values.parserName}
              onChange={(e) => setValues((v) => ({ ...v, parserName: e.target.value }))}
              placeholder="ex: message_data_parser"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input
              value={values.parserDescription}
              onChange={(e) => setValues((v) => ({ ...v, parserDescription: e.target.value }))}
              placeholder="Descrição do parser"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Schema (JSON)</label>
            <textarea
              value={values.parserSchema}
              onChange={(e) => setValues((v) => ({ ...v, parserSchema: e.target.value }))}
              className="w-full min-h-[140px] rounded-md border border-white/20 bg-transparent p-2 font-mono text-xs"
              placeholder={`{\n  "type": "object",\n  "properties": {\n    "field": { "type": "string" }\n  }\n}`}
              disabled={submitting}
            />
            {parsedSchema === "__invalid__" && (
              <div className="text-xs text-red-500">JSON inválido</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting || !canSubmit}>
          {submitting ? (
            <div className="flex items-center space-x-2">
              <Loading size="sm" />
              <span>Salvando...</span>
            </div>
          ) : (
            <span>{submitLabel}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
