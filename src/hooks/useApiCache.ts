'use client';

import { useState, useCallback, useRef } from 'react';
import { PERFORMANCE_CONFIG, performanceMonitor } from '@/config/performance';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface ApiCacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
}

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: ApiCacheOptions = {}
) {
  const { 
    ttl = PERFORMANCE_CONFIG.CACHE.DEFAULT_TTL, 
    staleWhileRevalidate = PERFORMANCE_CONFIG.CACHE.STALE_WHILE_REVALIDATE 
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const pendingRequestsRef = useRef<Map<string, Promise<T>>>(new Map());

  const getCachedData = useCallback((cacheKey: string): CacheEntry<T> | null => {
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.expiry) {
      cacheRef.current.delete(cacheKey);
      return null;
    }
    
    return cached;
  }, []);

  const setCachedData = useCallback((cacheKey: string, newData: T) => {
    const now = Date.now();
    cacheRef.current.set(cacheKey, {
      data: newData,
      timestamp: now,
      expiry: now + ttl
    });
  }, [ttl]);

  const fetchData = useCallback(async (forceRefresh = false): Promise<T> => {
    const cacheKey = key;
    
    // Check if there's already a pending request
    const pendingRequest = pendingRequestsRef.current.get(cacheKey);
    if (pendingRequest && !forceRefresh) {
      return pendingRequest;
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setData(cached.data);
        setError('');
        
        // If stale-while-revalidate is enabled and data is older than half TTL, refresh in background
        if (staleWhileRevalidate && (Date.now() - cached.timestamp) > ttl / 2) {
          // Background refresh without affecting UI state
          const backgroundRequest = fetcher()
            .then(newData => {
              setCachedData(cacheKey, newData);
              setData(newData);
              return newData;
            })
            .catch(() => cached.data) // Return cached data on error
            .finally(() => {
              pendingRequestsRef.current.delete(cacheKey);
            });
          
          pendingRequestsRef.current.set(cacheKey, backgroundRequest);
        }
        
        return cached.data;
      }
    }

    // No cache or force refresh - make new request
    setLoading(true);
    setError('');

    const request = fetcher()
      .then(newData => {
        setCachedData(cacheKey, newData);
        setData(newData);
        setError('');
        return newData;
      })
      .catch(err => {
        const errorMessage = err.message || 'Erro ao carregar dados';
        setError(errorMessage);
        
        // Try to return stale data if available
        const staleData = cacheRef.current.get(cacheKey);
        if (staleData) {
          setData(staleData.data);
          return staleData.data;
        }
        
        throw err;
      })
      .finally(() => {
        setLoading(false);
        pendingRequestsRef.current.delete(cacheKey);
      });

    pendingRequestsRef.current.set(cacheKey, request);
    return request;
  }, [key, fetcher, getCachedData, setCachedData, ttl, staleWhileRevalidate]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cacheRef.current.delete(key);
    pendingRequestsRef.current.delete(key);
  }, [key]);

  return {
    data,
    loading,
    error,
    fetchData,
    refresh,
    clearCache
  };
}
