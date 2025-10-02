'use client';

import React, { memo } from 'react';
import { ReportType } from '@/types';

interface TypeSelectorProps {
  value: ReportType | '';
  onChange: (value: ReportType | '') => void;
  className?: string;
}

export const TypeSelector = memo(function TypeSelector({ 
  value, 
  onChange, 
  className 
}: TypeSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ReportType | '')}
      className={`w-full liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2 ${className || ''}`}
    >
      <option value="">Tipo</option>
      <option value="appointment">Agendamento</option>
      <option value="order">Pedido</option>
      <option value="faq">FAQ</option>
    </select>
  );
});
