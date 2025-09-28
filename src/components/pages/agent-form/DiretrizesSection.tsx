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
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="liquid"
          size="sm"
          onClick={onAdd}
          disabled={submitting}
          className="text-xs"
        >
          + Adicionar diretriz
        </Button>
      </div>

      <div className="space-y-4" role="list" aria-label="Lista de diretrizes">
        {items.map((item) => {
          const textId = `diretriz-text-${item.id}`;
          return (
            <div key={item.id} role="listitem" className="space-y-2">
              <label htmlFor={textId} className="text-sm font-medium">
                Diretriz
              </label>
              <div className="flex items-start gap-3">
                <Textarea
                  id={textId}
                  value={item.text}
                  onChange={(e) => onChangeText(item.id, e.target.value)}
                  placeholder="Ex: Responda sempre de forma clara e objetiva."
                  disabled={submitting}
                  className="min-h-[84px] text-sm liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
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
          <div className="liquid-glass rounded-lg border-dashed border-2 border-border/30 p-6 text-center text-sm text-muted-foreground">
            Nenhuma diretriz. Use “Adicionar diretriz”.
          </div>
        )}
      </div>
    </div>
  );
}
