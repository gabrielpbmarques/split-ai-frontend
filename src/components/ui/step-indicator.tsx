"use client";

import React from "react";
import { cn } from "@/lib/utils";

type StepIndicatorStep = {
  title: string;
  description?: string;
};

type StepIndicatorProps = {
  steps: readonly StepIndicatorStep[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <ol className={`grid gap-3 md:grid-cols-${steps.length}`}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <li
            key={`${step.title}-${index}`}
            className={cn(
              "relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all",
              isActive && "border-blue-500/30 bg-blue-500/5 shadow-lg",
              isCompleted && !isActive && "border-emerald-500/30 bg-emerald-500/5"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white",
                isCompleted || isActive
                  ? "bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg"
                  : "bg-white/10 text-muted-foreground"
              )}
              aria-hidden
            >
              {isCompleted && !isActive ? "✓" : index + 1}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{step.title}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
