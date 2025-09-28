"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/Select";

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
  const hasSchema = (values.parserSchema || "").trim().length > 0;

  type JsonType =
    | "string"
    | "number"
    | "integer"
    | "boolean"
    | "array"
    | "object";
  type FieldItem = {
    id: string;
    key: string;
    type: JsonType;
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enumStr?: string;
    minimum?: number;
    maximum?: number;
    multipleOf?: number;
    enumNum?: string;
    itemsType?: Exclude<JsonType, "array" | "object">;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
  };
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState<Record<string, boolean>>({});

  const TYPE_OPTIONS = [
    { value: "string", label: "string" },
    { value: "number", label: "number" },
    { value: "integer", label: "integer" },
    { value: "boolean", label: "boolean" },
    { value: "array", label: "array" },
    { value: "object", label: "object" },
  ];

  const buildSchemaFromFields = (items: FieldItem[]) => {
    if (!items.length) return "";
    const properties: Record<string, any> = {};
    const required: string[] = [];
    items.forEach((f) => {
      const key = f.key.trim();
      if (!key) return;
      let prop: any;
      if (f.type === "array") {
        prop = { type: "array", items: { type: f.itemsType || "string" } };
        if (typeof f.minItems === "number") prop.minItems = f.minItems;
        if (typeof f.maxItems === "number") prop.maxItems = f.maxItems;
        if (typeof f.uniqueItems === "boolean")
          prop.uniqueItems = f.uniqueItems;
      } else {
        prop = { type: f.type };
        if (f.type === "string") {
          if (typeof f.minLength === "number") prop.minLength = f.minLength;
          if (typeof f.maxLength === "number") prop.maxLength = f.maxLength;
          if ((f.pattern || "").trim()) prop.pattern = f.pattern;
          const enums = (f.enumStr || "")
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          if (enums.length) prop.enum = enums;
        }
        if (f.type === "number" || f.type === "integer") {
          if (typeof f.minimum === "number") prop.minimum = f.minimum;
          if (typeof f.maximum === "number") prop.maximum = f.maximum;
          if (typeof f.multipleOf === "number") prop.multipleOf = f.multipleOf;
          const enums = (f.enumNum || "")
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .map((s) =>
              f.type === "integer" ? parseInt(s, 10) : parseFloat(s)
            )
            .filter((n) => !Number.isNaN(n));
          if (enums.length) prop.enum = enums;
        }
      }
      properties[key] = prop;
      if (f.required) required.push(key);
    });
    if (!Object.keys(properties).length) return "";
    const obj: any = { type: "object", properties };
    if (required.length) obj.required = required;
    return JSON.stringify(obj, null, 2);
  };

  const parseFieldsFromSchema = (schemaStr: string): FieldItem[] => {
    try {
      const obj = JSON.parse(schemaStr);
      if (
        obj &&
        obj.type === "object" &&
        obj.properties &&
        typeof obj.properties === "object"
      ) {
        const req: string[] = Array.isArray(obj.required) ? obj.required : [];
        const keys = Object.keys(obj.properties);
        return keys.map((k, idx) => {
          const p: any = obj.properties[k] || {};
          const t = (
            typeof p.type === "string" ? p.type : "string"
          ) as JsonType;
          const base: FieldItem = {
            id: `fld_${idx}_${k}`,
            key: k,
            type: t,
            required: req.includes(k),
          };
          if (t === "string") {
            if (typeof p.minLength === "number") base.minLength = p.minLength;
            if (typeof p.maxLength === "number") base.maxLength = p.maxLength;
            if (typeof p.pattern === "string") base.pattern = p.pattern;
            if (Array.isArray(p.enum))
              base.enumStr = p.enum.map((v: any) => String(v)).join(", ");
          }
          if (t === "number" || t === "integer") {
            if (typeof p.minimum === "number") base.minimum = p.minimum;
            if (typeof p.maximum === "number") base.maximum = p.maximum;
            if (typeof p.multipleOf === "number")
              base.multipleOf = p.multipleOf;
            if (Array.isArray(p.enum))
              base.enumNum = p.enum.map((v: any) => String(v)).join(", ");
          }
          if (t === "array") {
            if (p.items && typeof p.items === "object")
              base.itemsType = (p.items.type as any) || "string";
            if (typeof p.minItems === "number") base.minItems = p.minItems;
            if (typeof p.maxItems === "number") base.maxItems = p.maxItems;
            if (typeof p.uniqueItems === "boolean")
              base.uniqueItems = p.uniqueItems;
          }
          return base;
        });
      }
    } catch {}
    return [];
  };

  useEffect(() => {
    const parsed = parseFieldsFromSchema(values.parserSchema || "");
    if (parsed.length) setFields(parsed);
    if (!values.parserSchema && fields.length === 0) setFields([]);
  }, [values.parserSchema]);

  useEffect(() => {
    const next = buildSchemaFromFields(fields);
    if (next !== (values.parserSchema || "")) onChange({ parserSchema: next });
  }, [fields]);

  const addField = () => {
    const id = `fld_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setFields((prev) => [
      ...prev,
      { id, key: "", type: "string", required: false },
    ]);
  };

  const updateField = (id: string, patch: Partial<FieldItem>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleAdvanced = (id: string) => {
    setAdvancedOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
              className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
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
              className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Campos do schema</span>
          {hasSchema ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                schemaInvalid
                  ? "bg-red-500/10 text-red-600"
                  : "bg-emerald-500/10 text-emerald-600"
              }`}
              aria-live="polite"
            >
              {schemaInvalid ? "JSON inválido" : "JSON válido"}
            </span>
          ) : null}
        </div>

        <div className="space-y-6">
          {fields.map((f) => (
            <div key={f.id} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chave</label>
                <Input
                  value={f.key}
                  onChange={(e) => updateField(f.id, { key: e.target.value })}
                  placeholder="ex: customerId"
                  disabled={submitting}
                  className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <Select
                    value={f.type}
                    onChange={(e) =>
                      updateField(f.id, {
                        type: (e.target as HTMLSelectElement).value as any,
                      })
                    }
                    options={TYPE_OPTIONS}
                    placeholder="tipo"
                    disabled={submitting}
                    className="bg-background/90"
                  />
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={f.required}
                      onChange={(e) =>
                        updateField(f.id, { required: e.target.checked })
                      }
                      disabled={submitting}
                      className="h-4 w-4 rounded border-border/50 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                    Obrigatório
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {(f.type === "string" ||
                    f.type === "number" ||
                    f.type === "integer") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdvanced(f.id)}
                    >
                      {advancedOpen[f.id]
                        ? "Ocultar opções"
                        : "Opções avançadas"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeField(f.id)}
                    disabled={submitting}
                    className="border-red-500/30 text-red-500 hover:text-red-700 hover:border-red-500/50"
                    aria-label="Remover campo"
                  >
                    ×
                  </Button>
                </div>
              </div>

              {f.type === "string" && advancedOpen[f.id] && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      type="number"
                      placeholder="minLength"
                      value={typeof f.minLength === "number" ? f.minLength : ""}
                      onChange={(e) =>
                        updateField(f.id, {
                          minLength:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                      disabled={submitting}
                      className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Input
                      type="number"
                      placeholder="maxLength"
                      value={typeof f.maxLength === "number" ? f.maxLength : ""}
                      onChange={(e) =>
                        updateField(f.id, {
                          maxLength:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                      disabled={submitting}
                      className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Input
                      placeholder="pattern (regex)"
                      value={f.pattern || ""}
                      onChange={(e) =>
                        updateField(f.id, { pattern: e.target.value })
                      }
                      disabled={submitting}
                      className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Input
                      placeholder="enum (valores, separados, por, vírgula)"
                      value={f.enumStr || ""}
                      onChange={(e) =>
                        updateField(f.id, { enumStr: e.target.value })
                      }
                      disabled={submitting}
                      className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

              {(f.type === "number" || f.type === "integer") &&
                advancedOpen[f.id] && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Input
                        type="number"
                        placeholder="mínimo"
                        value={typeof f.minimum === "number" ? f.minimum : ""}
                        onChange={(e) =>
                          updateField(f.id, {
                            minimum:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        disabled={submitting}
                        className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Input
                        type="number"
                        placeholder="máximo"
                        value={typeof f.maximum === "number" ? f.maximum : ""}
                        onChange={(e) =>
                          updateField(f.id, {
                            maximum:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        disabled={submitting}
                        className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Input
                        type="number"
                        placeholder="múltiplo de"
                        step="any"
                        value={
                          typeof f.multipleOf === "number" ? f.multipleOf : ""
                        }
                        onChange={(e) =>
                          updateField(f.id, {
                            multipleOf:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        disabled={submitting}
                        className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Input
                        placeholder="enum numérico (ex: 1, 2, 3)"
                        value={f.enumNum || ""}
                        onChange={(e) =>
                          updateField(f.id, { enumNum: e.target.value })
                        }
                        disabled={submitting}
                        className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                )}

              {f.type === "array" && (
                <div className="space-y-3">
                  <div>
                    <Select
                      value={f.itemsType || "string"}
                      onChange={(e) =>
                        updateField(f.id, {
                          itemsType: (e.target as HTMLSelectElement)
                            .value as any,
                        })
                      }
                      options={TYPE_OPTIONS.filter(
                        (o) => o.value !== "array" && o.value !== "object"
                      )}
                      placeholder="tipo dos itens"
                      disabled={submitting}
                      className="bg-background/90"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="mín. itens"
                      value={typeof f.minItems === "number" ? f.minItems : ""}
                      onChange={(e) =>
                        updateField(f.id, {
                          minItems:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                      disabled={submitting}
                      className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="máx. itens"
                      value={typeof f.maxItems === "number" ? f.maxItems : ""}
                      onChange={(e) =>
                        updateField(f.id, {
                          maxItems:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                      disabled={submitting}
                      className="liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(f.uniqueItems)}
                        onChange={(e) =>
                          updateField(f.id, { uniqueItems: e.target.checked })
                        }
                        disabled={submitting}
                        className="h-4 w-4 rounded border-border/50 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                      Itens únicos
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {fields.length === 0 && (
          <div className="liquid-glass rounded-lg border-dashed border-2 border-border/30 p-6 text-center text-sm text-muted-foreground">
            Nenhum campo adicionado.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="liquid"
          size="sm"
          onClick={addField}
          disabled={submitting}
        >
          + Adicionar campo
        </Button>
      </div>
    </div>
  );
}
