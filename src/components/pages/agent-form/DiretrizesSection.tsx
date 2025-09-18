"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type DiretrizItem = { id: string; text: string };

type DiretrizesSectionProps = {
  items: DiretrizItem[];
  onAdd: () => void;
  onChangeText: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  submitting?: boolean;
};

export function DiretrizesSection({
  items,
  onAdd,
  onChangeText,
  onRemove,
  submitting,
}: DiretrizesSectionProps) {
  return (
    <div className="space-y-6 md:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Diretrizes</h3>
          <p className="text-sm text-muted-foreground">
            Liste regras claras de comportamento e estilo do agente.
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
            const textId = `diretriz-text-${item.id}`;

            return (
              <div
                key={item.id}
                role="listitem"
                className="rounded-lg border p-3 md:p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-1">
                    <label htmlFor={textId} className="text-sm font-medium">
                      Diretriz
                    </label>
                    <Textarea
                      id={textId}
                      value={item.text}
                      onChange={(e) => onChangeText(item.id, e.target.value)}
                      placeholder="Ex: Responda sempre de forma clara e objetiva, evitando jargões."
                      disabled={submitting}
                      className="min-h-[84px] text-sm"
                    />
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

