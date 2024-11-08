import { useState, useEffect } from 'react';
import { subscribeToStats } from '../services/realtimeStatsService';
import { getDashboardStats } from '../services/dashboardStatsService';
import { handleError } from '../utils/errorHandler';
import type { PatientStats, DoctorStats, AdminStats } from '../types/stats';

type StatsType = PatientStats | DoctorStats | AdminStats;

export function useRealtimeStats<T extends StatsType>(
  userId: string,
  role: 'doctor' | 'patient' | 'admin'
) {
  const [stats, setStats] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const freshStats = await getDashboardStats(userId, role);
      setStats(freshStats as T);
    } catch (error) {
      handleError(error, `refreshing ${role} stats`);
      setError('Failed to refresh statistics');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const setupSubscription = async () => {
      try {
        // Initial load
        const initialStats = await getDashboardStats(userId, role);
        if (mounted) {
          setStats(initialStats as T);
          setLoading(false);
        }

        // Set up real-time updates
        unsubscribe = subscribeToStats(userId, role, (newStats) => {
          if (mounted) {
            setStats(newStats as T);
          }
        });
      } catch (error) {
        if (mounted) {
          handleError(error, `setting up ${role} stats subscription`);
          setError('Failed to load statistics');
          setLoading(false);
        }
      }
    };

    setupSubscription();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [userId, role]);

  return { stats, loading, error, isRefreshing, handleRefresh };
}