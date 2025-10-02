'use client';

import React, { memo } from 'react';
import { ReportSentiment } from '@/types';

interface SentimentSelectorProps {
  value: ReportSentiment | '';
  onChange: (value: ReportSentiment | '') => void;
  className?: string;
}

export const SentimentSelector = memo(function SentimentSelector({ 
  value, 
  onChange, 
  className 
}: SentimentSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ReportSentiment | '')}
      className={`w-full liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2 ${className || ''}`}
    >
      <option value="">Sentimento</option>
      <option value="positive">Positivo</option>
      <option value="negative">Negativo</option>
      <option value="neutral">Neutro</option>
    </select>
  );
});
