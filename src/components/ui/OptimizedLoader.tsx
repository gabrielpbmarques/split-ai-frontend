'use client';

import React, { memo } from 'react';
import { Loading } from './Loading';

interface OptimizedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const OptimizedLoader = memo(function OptimizedLoader({ 
  size = 'md', 
  text = 'Carregando...', 
  className = '' 
}: OptimizedLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <Loading size={size} />
      {text && (
        <p className="text-sm text-muted-foreground mt-3 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
});

export const AgentsLoader = memo(function AgentsLoader() {
  return <OptimizedLoader text="Carregando agentes..." size="sm" />;
});

export const PageLoader = memo(function PageLoader() {
  return <OptimizedLoader text="Carregando página..." size="lg" className="min-h-[400px]" />;
});
