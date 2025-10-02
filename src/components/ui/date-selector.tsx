'use client';

import React, { memo } from 'react';

interface DateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const DateSelector = memo(function DateSelector({ 
  value, 
  onChange, 
  className,
  placeholder = "Selecionar data"
}: DateSelectorProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2 ${className || ''}`}
    />
  );
});
