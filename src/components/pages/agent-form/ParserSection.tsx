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

export function ParserSection({ values, onChange, submitting, schemaInvalid }: ParserSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome</label>
        <Input
          value={values.parserName}
          onChange={(e) => onChange({ parserName: e.target.value })}
          placeholder="ex: message_data_parser"
          disabled={submitting}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição</label>
        <Input
          value={values.parserDescription}
          onChange={(e) => onChange({ parserDescription: e.target.value })}
          placeholder="Descrição do parser"
          disabled={submitting}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Schema (JSON)</label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => {
                try {
                  const parsed = JSON.parse(values.parserSchema || "");
                  onChange({ parserSchema: JSON.stringify(parsed, null, 2) });
                } catch {}
              }}
            >
              Formatar JSON
            </Button>
          </div>
        </div>
        <textarea
          value={values.parserSchema}
          onChange={(e) => onChange({ parserSchema: e.target.value })}
          className="w-full min-h-[140px] rounded-md border border-white/20 bg-transparent p-2 font-mono text-xs"
          placeholder={`{\n  \"type\": \"object\",\n  \"properties\": {\n    \"field\": { \"type\": \"string\" }\n  }\n}`}
          disabled={submitting}
        />
        {schemaInvalid && (
          <div className="text-xs text-red-500">JSON inválido</div>
        )}
      </div>
    </div>
  );
}
