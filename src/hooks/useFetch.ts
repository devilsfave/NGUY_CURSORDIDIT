import { useState, useEffect } from 'react';
import { useLoadingState } from './useLoadingState';
import { cache } from '../services/cacheService';

interface FetchOptions {
  cacheKey?: string;
  cacheDuration?: number; // in minutes
  dependencies?: any[];
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: FetchOptions = {}
) {
  const { cacheKey, cacheDuration = 5, dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const { isLoading, error, withLoading } = useLoadingState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check cache first
        if (cacheKey) {
          const cachedData = cache.get<T>(cacheKey);
          if (cachedData) {
            setData(cachedData);
            return;
          }
        }

        const result = await withLoading(fetchFn());
        setData(result);

        // Cache the result if cacheKey is provided
        if (cacheKey) {
          cache.set(cacheKey, result, { expiryMinutes: cacheDuration });
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchData();
  }, [...dependencies]);

  return { data, isLoading, error };
}
