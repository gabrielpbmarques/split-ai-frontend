"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ParserValues = {
  parserName: string;
  parserDescription: string;
  parserSchema: string;
};

type ParserSectionProps = {
  values: ParserValues;
  onChange: (patch: Partial<ParserValues>) => void;
  submitting?: boolean;
  schemaInvalid?: boolean;
};

export function ParserSection({
  values,
  onChange,
  submitting,
  schemaInvalid,
}: ParserSectionProps) {
  const nameId = "parser-name";
  const descId = "parser-description";
  const schemaId = "parser-schema";
  const schemaHelpId = "parser-schema-help";
  const schemaErrId = "parser-schema-error";

  const schemaLen = (values.parserSchema || "").length;

  return (
    <div className="space-y-6 md:col-span-2">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold">Parser de Dados</h3>
        <p className="text-sm text-muted-foreground">
          Defina nome, descrição e o schema JSON que o agente vai usar para interpretar dados.
        </p>
      </div>

      {/* Card: Identificação */}
      <section className="rounded-xl border p-4 md:p-5">
        <div className="mb-4">
          <h4 className="text-sm font-medium">Identificação</h4>
          <p className="text-xs text-muted-foreground">
            Informações básicas do parser.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor={nameId} className="text-sm font-medium">
              Nome
            </label>
            <Input
              id={nameId}
              value={values.parserName}
              onChange={(e) => onChange({ parserName: e.target.value })}
              placeholder="ex: message_data_parser"
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Identificador curto (slug) do parser.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor={descId} className="text-sm font-medium">
              Descrição
            </label>
            <Input
              id={descId}
              value={values.parserDescription}
              onChange={(e) => onChange({ parserDescription: e.target.value })}
              placeholder="Descrição do parser"
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Resumo objetivo do que o parser extrai.
            </p>
          </div>
        </div>
      </section>

      {/* Card: Schema */}
      <section className="rounded-xl border p-4 md:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <label htmlFor={schemaId} className="text-sm font-medium">
              Schema (JSON)
            </label>
            <p id={schemaHelpId} className="text-xs text-muted-foreground">
              Informe um JSON válido (ex.: JSON Schema ou estrutura esperada).
            </p>
          </div>

          {/* Status + ações */}
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                schemaInvalid
                  ? "bg-red-500/10 text-red-600"
                  : "bg-emerald-500/10 text-emerald-600"
              }`}
              aria-live="polite"
            >
              {schemaInvalid ? "JSON inválido" : "JSON válido"}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => {
                try {
                  const parsed = JSON.parse(values.parserSchema || "");
                  onChange({ parserSchema: JSON.stringify(parsed, null, 2) });
                } catch {
                  /* silencia formatador se inválido */
                }
              }}
            >
              Formatar JSON
            </Button>
          </div>
        </div>

        <div className="relative">
          <textarea
            id={schemaId}
            aria-describedby={`${schemaHelpId} ${schemaInvalid ? schemaErrId : ""}`}
            value={values.parserSchema}
            onChange={(e) => onChange({ parserSchema: e.target.value })}
            className={`w-full min-h-[200px] rounded-md border bg-transparent p-3 font-mono text-xs leading-5 ${
              schemaInvalid
                ? "border-red-500/60 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                : "border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
            }`}
            placeholder={`{\n  "type": "object",\n  "properties": {\n    "field": { "type": "string" }\n  },\n  "required": ["field"]\n}`}
            disabled={submitting}
            spellCheck={false}
          />
          <div className="mt-2 flex items-center justify-between">
            {schemaInvalid ? (
              <div id={schemaErrId} className="text-xs text-red-500">
                JSON inválido
              </div>
            ) : <span />}
            <span className="text-xs text-muted-foreground tabular-nums">
              {schemaLen} caracteres
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
