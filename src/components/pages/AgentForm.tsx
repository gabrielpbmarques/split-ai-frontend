"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
    return Object.entries(norm).map(([k, v], idx) => ({
      id: `${k || "diretriz"}::${idx}`,
      key: k,
      descricao: v.descricao,
      detalhes: v.detalhes,
    }));
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
    setDiretrizesList(entries.map(([k, v], idx) => ({ id: `${k || "diretriz"}::${idx}`, key: k, descricao: v.descricao, detalhes: v.detalhes })));
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
    const used: Record<string, number> = {};
    diretrizesList.forEach((item) => {
      let baseKey = (item.key || "diretriz").trim() || "diretriz";
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
  const formRef = useRef<HTMLFormElement | null>(null);

  const focusFirstError = () => {
    const firstErrorId = formErrors.name ? "agent-name" : parsedSchema === "__invalid__" ? "parser-schema" : null;
    if (firstErrorId) {
      const el = document.getElementById(firstErrorId);
      if (el?.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLElement | null)?.focus?.();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!canSubmit) {
      focusFirstError();
      return;
    }
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

  const schemaStatus =
    parsedSchema === "__invalid__"
      ? { label: "JSON inválido", cls: "bg-red-500/10 text-red-600" }
      : values.parserSchema.trim().length
      ? { label: "JSON válido", cls: "bg-emerald-500/10 text-emerald-600" }
      : null;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 mx-auto">
      {/* Page header */}
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Configurar Agente</h2>
        <p className="text-sm text-muted-foreground">
          Defina identidade, instruções e (opcionalmente) um parser para a saída.
        </p>
      </header>

      {(error || localError) && (
        <Alert variant="destructive" role="alert" aria-live="polite">
          <AlertDescription>{error || localError}</AlertDescription>
        </Alert>
      )}

      {/* Card: Informações do Agente */}
      <Card variant="glass" className="shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Informações do Agente</CardTitle>
          <CardDescription>Dados básicos e comportamento.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
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

      {/* Card: Instruções & Diretrizes */}
      <Card variant="glass" className="shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Instruções</CardTitle>
          <CardDescription>Contexto, objetivo e regras de atuação.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-6">
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

      {/* Card: Parser */}
      <Card variant="glass" className="shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Parser (opcional)</CardTitle>
              <CardDescription>Estruture a saída com um schema JSON.</CardDescription>
            </div>
            {schemaStatus && (
              <span className={`rounded-full px-2 py-1 text-xs ${schemaStatus.cls}`}>
                {schemaStatus.label}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-2">
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

      {/* Sticky footer */}
      <div className="sticky bottom-4 z-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-input bg-background/80 backdrop-blur-md px-4 py-3 shadow-xl">
          <div className="flex items-center justify-center gap-3">
            {!canSubmit && (
              <span className="text-xs text-muted-foreground">
                Verifique os campos obrigatórios e o JSON do parser.
              </span>
            )}
            <Button className="w-[60%]" size="lg" type="submit" disabled={submitting || !canSubmit}>
              {submitting ? (
                <div className="flex items-center gap-2">
                  <Loading size="sm" />
                  <span>Salvando...</span>
                </div>
              ) : (
                <span>{submitLabel}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
