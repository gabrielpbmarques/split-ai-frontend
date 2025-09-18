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

export function DiretrizesSection({ items, onAdd, onChangeKey, onChangeField, onRemove, submitting }: DiretrizesSectionProps) {
  const counts: Record<string, number> = {};
  items.forEach(i => {
    const k = (i.key || "").trim();
    if (!k) return;
    counts[k] = (counts[k] || 0) + 1;
  });

  return (
    <div className="space-y-2 md:col-span-2">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <label className="text-sm font-medium">Diretrizes</label>
          <span className="text-xs text-muted-foreground">{items.length}</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={submitting} className="text-xs">
          + Adicionar Diretriz
        </Button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 p-3 rounded-md border border-white/10">
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                {(() => {
                  const k = (item.key || "").trim();
                  const isEmpty = k.length === 0;
                  const isDup = !!k && (counts[k] || 0) > 1;
                  const errorId = `diretriz-key-error-${item.id}`;
                  return (
                    <>
                      <Input
                        value={item.key}
                        onChange={(e) => onChangeKey(item.id, e.target.value)}
                        placeholder="Nome da diretriz (ex: tom_comunicacao)"
                        disabled={submitting}
                        className={`text-xs ${isEmpty || isDup ? "border-red-500/60 focus-visible:ring-red-500/40" : ""}`}
                        aria-invalid={isEmpty || isDup || undefined}
                        aria-describedby={(isEmpty || isDup) ? errorId : undefined}
                      />
                      {(isEmpty || isDup) && (
                        <p id={errorId} className="mt-1 text-xs text-red-500">
                          {isEmpty ? "Informe um nome para a diretriz" : "Nome de diretriz duplicado"}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemove(item.id)}
                disabled={submitting}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs opacity-80">Descrição</label>
                <Input
                  value={item.descricao}
                  onChange={(e) => onChangeField(item.id, "descricao", e.target.value)}
                  placeholder="Ex: Fluxo de solução estruturado"
                  disabled={submitting}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1 md:col-span-1">
                <label className="text-xs opacity-80">Detalhes</label>
                <Textarea
                  value={item.detalhes}
                  onChange={(e) => onChangeField(item.id, "detalhes", e.target.value)}
                  placeholder="Detalhamento da diretriz..."
                  className="min-h-[60px] text-sm"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            Nenhuma diretriz adicionada. Clique em "Adicionar Diretriz" para começar.
          </div>
        )}
      </div>
    </div>
  );
}
