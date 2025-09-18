"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loading } from "@/components/ui/Loading";
import { AgentInfoSection } from "@/components/pages/agent-form/AgentInfoSection";
import { InstructionsSection } from "@/components/pages/agent-form/InstructionsSection";
import { DiretrizesSection } from "@/components/pages/agent-form/DiretrizesSection";
import { ParserSection } from "@/components/pages/agent-form/ParserSection";

import { AgentDetail, CreateAgentRequest, UpdateAgentRequest, AIInstructions } from "@/types";

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

  type DiretrizObj = { descricao: string; detalhes: string };
  type DiretrizItem = { id: string; key: string; descricao: string; detalhes: string };

  const normalizeDiretrizes = (raw: any): Record<string, DiretrizObj> => {
    if (!raw || typeof raw !== "object") return {};
    const normalized: Record<string, DiretrizObj> = {};
    Object.entries(raw).forEach(([key, value]) => {
      if (typeof value === "string") {
        let parsed: any = null;
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = null;
        }
        if (parsed && typeof parsed === "object") {
          normalized[key] = {
            descricao: String(parsed.descricao || parsed.description || ""),
            detalhes: String(parsed.detalhes || parsed.details || ""),
          };
        } else {
          normalized[key] = { descricao: "", detalhes: String(value || "") };
        }
      } else if (typeof value === "object" && value !== null) {
        const obj = value as any;
        normalized[key] = {
          descricao: String(obj.descricao || obj.description || ""),
          detalhes: String(obj.detalhes || obj.details || ""),
        };
      } else {
        normalized[key] = { descricao: "", detalhes: String(value || "") };
      }
    });
    return normalized;
  };

  const [diretrizesList, setDiretrizesList] = useState<DiretrizItem[]>(() => {
    const norm = normalizeDiretrizes(initial?.instructions?.diretrizes);
    const entries = Object.entries(norm);
    return entries.map(([k, v], idx) => ({ id: `${k || 'diretriz'}::${idx}`, key: k, descricao: v.descricao, detalhes: v.detalhes }));
  });

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
  const norm = normalizeDiretrizes(initial?.instructions?.diretrizes);
  const entries = Object.entries(norm);
  setDiretrizesList(entries.map(([k, v], idx) => ({ id: `${k || 'diretriz'}::${idx}`, key: k, descricao: v.descricao, detalhes: v.detalhes })));
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

  const formErrors = useMemo(() => {
    return {
      name: !values.name.trim() ? "Nome é obrigatório" : undefined,
      temperature:
        values.temperature && isNaN(Number(values.temperature))
          ? "Temperatura deve ser numérica"
          : undefined,
    } as { name?: string; temperature?: string };
  }, [values.name, values.temperature]);

  const buildPayload = (): CreateAgentRequest | UpdateAgentRequest => {
    const diretrizesPayload: Record<string, { descricao: string; detalhes: string }> = {};
    // Ensure stable and unique keys when building the payload
    const used: Record<string, number> = {};
    diretrizesList.forEach((item) => {
      let baseKey = (item.key || "diretriz").trim() || "diretriz";
      // avoid temporary autogenerated keys leaking into payload
      if (baseKey.startsWith("diretriz_") && (item.key || "").trim() === "") {
        baseKey = "diretriz";
      }
      if (used[baseKey] === undefined && !(baseKey in diretrizesPayload)) {
        used[baseKey] = 0;
      } else {
        used[baseKey] = (used[baseKey] || 0) + 1;
      }
      const finalKey = used[baseKey] ? `${baseKey}_${used[baseKey]}` : baseKey;
      diretrizesPayload[finalKey] = { descricao: item.descricao || "", detalhes: item.detalhes || "" };
    });

    const instructions: AIInstructions = {
      ...(values.instructions || {}),
      context: values.instructions?.context || (values.instructions as any)?.contexto || "",
  diretrizes: Object.keys(diretrizesPayload).length > 0 ? (diretrizesPayload as any) : undefined,
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
    const id = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setDiretrizesList((prev) => [...prev, { id, key: "", descricao: "", detalhes: "" }]);
  };

  const updateDiretrizKey = (id: string, newKey: string) => {
    setDiretrizesList((prev) => prev.map((item) => (item.id === id ? { ...item, key: newKey } : item)));
  };

  const updateDiretrizField = (id: string, field: keyof DiretrizObj, value: string) => {
    setDiretrizesList((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeDiretriz = (id: string) => {
    setDiretrizesList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
      {(error || localError) && (
        <Alert variant="destructive">
          <AlertDescription>{error || localError}</AlertDescription>
        </Alert>
      )}

      <Card variant="glass" className="shadow-xl">
        <CardHeader>
          <CardTitle>Informações do Agente</CardTitle>
          <CardDescription>Defina os dados básicos e o comportamento do agente.</CardDescription>
        </CardHeader>
        <CardContent>
          <AgentInfoSection
            values={{
              name: values.name,
              agentIdentifier: values.agentIdentifier,
              model: values.model,
              temperature: values.temperature,
              withHistory: values.withHistory,
            }}
            onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
            submitting={submitting}
            errors={formErrors}
          />
        </CardContent>
      </Card>

      <Card variant="glass" className="shadow-xl">
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
          <CardDescription>Contextualize a missão do agente e detalhe diretrizes de atuação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InstructionsSection
            values={{
              context: values.instructions?.context || (values.instructions as any)?.contexto || "",
              objetivo: values.instructions?.objetivo || "",
            }}
            onChange={(k, v) => setInstructionField(k as any, v)}
            submitting={submitting}
          />
          <DiretrizesSection
            items={diretrizesList}
            onAdd={addDiretriz}
            onChangeKey={updateDiretrizKey}
            onChangeField={updateDiretrizField}
            onRemove={removeDiretriz}
            submitting={submitting}
          />
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Parser (opcional)</CardTitle>
          <CardDescription>Use um parser para estruturar a saída do agente com base em um JSON Schema.</CardDescription>
        </CardHeader>
        <CardContent>
          <ParserSection
            values={{
              parserName: values.parserName,
              parserDescription: values.parserDescription,
              parserSchema: values.parserSchema,
            }}
            onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
            submitting={submitting}
            schemaInvalid={parsedSchema === "__invalid__"}
          />
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10">
        <div className="flex justify-end rounded-2xl border border-input bg-background/80 backdrop-blur-md px-4 py-3 shadow-xl">
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
      </div>
    </form>
  );
}
