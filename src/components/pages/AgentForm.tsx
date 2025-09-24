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
import { StepIndicator } from "@/components/ui/step-indicator";
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

const FORM_STEPS = [
  {
    title: "Configuração",
    description: "Identidade e modelo",
  },
  {
    title: "Instruções",
    description: "Contexto e diretrizes",
  },
  {
    title: "Parser",
    description: "Schema opcional",
  },
] as const;

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

  type DiretrizItem = { id: string; text: string };

  const [diretrizesList, setDiretrizesList] = useState<DiretrizItem[]>(() => {
    const list = Array.isArray(initial?.instructions?.diretrizes)
      ? (initial?.instructions?.diretrizes as string[])
      : [];
    return list.map((txt, idx) => ({ id: `dir::${idx}`, text: String(txt || "") }));
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
    const list = Array.isArray(initial?.instructions?.diretrizes)
      ? (initial?.instructions?.diretrizes as string[])
      : [];
    setDiretrizesList(list.map((txt, idx) => ({ id: `dir::${idx}`, text: String(txt || "") })));
    setCurrentStep(0);
  }, [initial]);

  const [currentStep, setCurrentStep] = useState(0);

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
    const instructions: AIInstructions = {
      ...(values.instructions || {}),
      context: values.instructions?.context || (values.instructions as any)?.contexto || "",
      diretrizes: diretrizesList
        .map((d) => (d.text || "").trim())
        .filter((s) => s.length > 0),
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
    const firstErrorId = formErrors.name
      ? "agent-name"
      : formErrors.temperature
      ? "agent-temperature"
      : parsedSchema === "__invalid__"
      ? "parser-schema"
      : null;
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

  const validateStep = () => {
    if (currentStep === 0) {
      if (!values.name.trim() || formErrors.temperature) {
        focusFirstError();
        return false;
      }
    }
    if (currentStep === 2 && parsedSchema === "__invalid__") {
      focusFirstError();
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep()) return;
    setCurrentStep((step) => Math.min(step + 1, FORM_STEPS.length - 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const addDiretriz = () => {
    const id = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setDiretrizesList((prev) => [...prev, { id, text: "" }]);
  };

  const updateDiretrizText = (id: string, text: string) => {
    setDiretrizesList((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
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

  const isLastStep = currentStep === FORM_STEPS.length - 1;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 mx-auto">
      <header className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Configurar Agente
        </h2>
        <p className="text-muted-foreground">
          Defina identidade, instruções e (opcionalmente) um parser para a saída.
        </p>
      </header>

      <StepIndicator steps={FORM_STEPS} currentStep={currentStep} />

      {(error || localError) && (
        <Alert variant="destructive" role="alert" aria-live="polite" className="liquid-glass border-red-500/30">
          <AlertDescription>{error || localError}</AlertDescription>
        </Alert>
      )}

      {currentStep === 0 ? (
        <Card variant="liquid" className="glass-reflect">
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
      ) : null}

      {currentStep === 1 ? (
        <Card variant="liquid" className="glass-reflect">
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
              onChangeText={updateDiretrizText}
              onRemove={removeDiretriz}
              submitting={submitting}
            />
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 2 ? (
        <Card variant="liquid" className="glass-reflect">
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
      ) : null}

      <div className="sticky bottom-4 z-10">
        <div className="mx-auto max-w-4xl rounded-2xl liquid-glass-strong px-4 py-3 shadow-liquid">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 md:gap-3">
              {currentStep > 0 ? (
                <Button variant="outline" size="lg" type="button" onClick={handlePrevStep} disabled={submitting}>
                  Voltar
                </Button>
              ) : null}
            </div>
            {isLastStep ? (
              <div className="flex flex-1 items-center justify-center gap-3">
                {!canSubmit && (
                  <span className="text-xs text-muted-foreground">
                    Verifique os campos obrigatórios e o JSON do parser.
                  </span>
                )}
                <Button
                  variant="liquid-primary"
                  className="w-full md:w-[60%]"
                  size="lg"
                  type="submit"
                  disabled={submitting || !canSubmit}
                >
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
            ) : (
              <div className="flex flex-1 justify-end">
                <Button variant="liquid-primary" size="lg" type="button" onClick={handleNextStep} disabled={submitting}>
                  Próximo
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

