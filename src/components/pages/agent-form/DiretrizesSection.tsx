"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type DiretrizObj = { descricao: string; detalhes: string };
type DiretrizItem = { id: string; key: string; descricao: string; detalhes: string };

type DiretrizesSectionProps = {
  items: DiretrizItem[];
  onAdd: () => void;
  onChangeKey: (id: string, key: string) => void;
  onChangeField: (id: string, field: keyof DiretrizObj, value: string) => void;
  onRemove: (id: string) => void;
  submitting?: boolean;
};

export function DiretrizesSection({
  items,
  onAdd,
  onChangeKey,
  onChangeField,
  onRemove,
  submitting,
}: DiretrizesSectionProps) {
  // validação de chaves duplicadas
  const counts: Record<string, number> = {};
  for (const i of items) {
    const k = (i.key || "").trim();
    if (!k) continue;
    counts[k] = (counts[k] || 0) + 1;
  }

  return (
    <div className="space-y-6 md:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Diretrizes</h3>
          <p className="text-sm text-muted-foreground">
            Crie regras claras para comportamento e estilo do agente.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={submitting}
          className="text-xs"
        >
          + Adicionar diretriz
        </Button>
      </div>

      {/* Card principal */}
      <section className="rounded-xl border p-4 md:p-5">
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-sm font-medium">Itens</span>
          <span className="text-xs text-muted-foreground">{items.length}</span>
        </div>

        <div className="space-y-4" role="list" aria-label="Lista de diretrizes">
          {items.map((item) => {
            const k = (item.key || "").trim();
            const isEmpty = k.length === 0;
            const isDup = !!k && (counts[k] || 0) > 1;
            const keyInputId = `diretriz-key-${item.id}`;
            const keyErrorId = `diretriz-key-error-${item.id}`;

            return (
              <div
                key={item.id}
                role="listitem"
                className="rounded-lg border p-3 md:p-4"
              >
                {/* Linha da chave + remover */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-1">
                    <label htmlFor={keyInputId} className="text-sm font-medium">
                      Nome da diretriz
                    </label>
                    <Input
                      id={keyInputId}
                      value={item.key}
                      onChange={(e) => onChangeKey(item.id, e.target.value)}
                      placeholder="ex: tom_comunicacao"
                      disabled={submitting}
                      className={`text-sm ${
                        isEmpty || isDup
                          ? "border-red-500/60 focus-visible:ring-red-500/40"
                          : ""
                      }`}
                      aria-invalid={isEmpty || isDup || undefined}
                      aria-describedby={isEmpty || isDup ? keyErrorId : undefined}
                    />
                    {(isEmpty || isDup) && (
                      <p id={keyErrorId} className="text-xs text-red-500">
                        {isEmpty
                          ? "Informe um nome para a diretriz."
                          : "Nome de diretriz duplicado."}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Use um identificador curto (slug) para referência técnica.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                    disabled={submitting}
                    aria-label="Remover diretriz"
                    className="h-9 shrink-0 border-red-500/30 text-red-500 hover:text-red-700 hover:border-red-500/50"
                  >
                    ×
                  </Button>
                </div>

                {/* Campos de conteúdo */}
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor={`diretriz-desc-${item.id}`}>
                      Descrição
                    </label>
                    <Input
                      id={`diretriz-desc-${item.id}`}
                      value={item.descricao}
                      onChange={(e) =>
                        onChangeField(item.id, "descricao", e.target.value)
                      }
                      placeholder="Ex: Fluxo de solução estruturado"
                      disabled={submitting}
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Resumo curto e objetivo da regra.
                    </p>
                  </div>

                  <div className="space-y-1 md:col-span-1">
                    <label className="text-sm font-medium" htmlFor={`diretriz-det-${item.id}`}>
                      Detalhes
                    </label>
                    <Textarea
                      id={`diretriz-det-${item.id}`}
                      value={item.detalhes}
                      onChange={(e) =>
                        onChangeField(item.id, "detalhes", e.target.value)
                      }
                      placeholder="Detalhamento da diretriz..."
                      className="min-h-[84px] text-sm"
                      disabled={submitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Exemplos práticos, limitações e exceções.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhuma diretriz adicionada. Clique em <span className="font-medium">“Adicionar diretriz”</span> para começar.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
