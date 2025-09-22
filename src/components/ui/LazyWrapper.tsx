'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { PageLoader } from './OptimizedLoader';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function LazyWrapper({ 
  children, 
  fallback = <PageLoader />, 
  errorFallback 
}: LazyWrapperProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Higher-order component for lazy loading pages
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode,
  errorFallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyWrapper fallback={fallback} errorFallback={errorFallback}>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
}

// Preload function for better UX
export function preloadComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>
) {
  const componentImport = importFunc();
  return componentImport;
}
