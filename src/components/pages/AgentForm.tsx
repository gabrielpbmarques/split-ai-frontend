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

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

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
    setTouchedFields(new Set()); // Reset touched fields when initial data changes
  }, [initial]);

  const handleFieldChange = (fieldName: string, patch: Partial<AgentFormValues>) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    setValues((v) => ({ ...v, ...patch }));
  };

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
      name: touchedFields.has('name') && !values.name.trim() ? "Nome é obrigatório" : undefined,
      temperature:
        touchedFields.has('temperature') && values.temperature && isNaN(Number(values.temperature))
          ? "Temperatura deve ser numérica"
          : undefined,
    } as { name?: string; temperature?: string };
  }, [values.name, values.temperature, touchedFields]);

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
    
    // Mark all fields as touched when submitting
    setTouchedFields(prev => new Set(prev).add('name').add('temperature'));
    
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
      // Mark fields as touched when trying to advance
      setTouchedFields(prev => new Set(prev).add('name').add('temperature'));
      
      if (!values.name.trim() || (values.temperature && isNaN(Number(values.temperature)))) {
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

      {currentStep === 0 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">Informações do Agente</h3>
            <p className="text-sm text-muted-foreground">Dados básicos e comportamento.</p>
          </div>
          
          <AgentInfoSection
            values={{
              name: values.name,
              agentIdentifier: values.agentIdentifier,
              model: values.model,
              temperature: values.temperature,
              withHistory: values.withHistory,
            }}
            onChange={(patch) => {
              // Mark relevant fields as touched
              if (patch.name !== undefined) setTouchedFields(prev => new Set(prev).add('name'));
              if (patch.temperature !== undefined) setTouchedFields(prev => new Set(prev).add('temperature'));
              setValues((v) => ({ ...v, ...patch }));
            }}
            submitting={submitting}
            errors={formErrors}
          />
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">Instruções</h3>
            <p className="text-sm text-muted-foreground">Contexto, objetivo e regras de atuação.</p>
          </div>
          
          <div className="space-y-6">
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
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Parser (opcional)</h3>
              <p className="text-sm text-muted-foreground">Estruture a saída com um schema JSON.</p>
            </div>
            {schemaStatus && (
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${schemaStatus.cls}`}>
                {schemaStatus.label}
              </span>
            )}
          </div>
          
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
        </div>
      )}

      {/* Navegação do Formulário */}
      <div className="mt-8 pt-6 border-t border-border/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                size="lg" 
                type="button" 
                onClick={handlePrevStep} 
                disabled={submitting}
                className="liquid-glass border-0 hover:liquid-glass-strong"
              >
                Voltar
              </Button>
            )}
          </div>
          
          {isLastStep ? (
            <div className="flex flex-col items-center gap-3 md:flex-row md:flex-1 md:justify-center">
              {!canSubmit && (
                <span className="text-xs text-muted-foreground text-center">
                  Verifique os campos obrigatórios e o JSON do parser.
                </span>
              )}
              <Button
                variant="liquid-primary"
                className="w-full md:w-auto md:min-w-[200px]"
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
            <div className="flex justify-end md:flex-1">
              <Button 
                variant="liquid-primary" 
                size="lg" 
                type="button" 
                onClick={handleNextStep} 
                disabled={submitting}
                className="w-full md:w-auto md:min-w-[120px]"
              >
                Próximo
              </Button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

