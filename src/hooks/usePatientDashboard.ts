import { useState, useEffect, useCallback } from 'react';
import { auth, db }from '../Firebase/config';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { subscribeToAppointments } from '../services/realtimeUpdates';
import { subscribeToStats } from '../services/realtimeStatsService';
import { cache } from '../services/cacheService';
import { handleError } from '../utils/errorHandler';
import { toast } from 'react-toastify';
import { retryOperation } from '../utils/retryOperation';
import type { Analysis } from '@/types/analysis';
import type { Appointment, AppointmentStatus } from '@/types/appointment';
import type { PatientStats } from '@/types/stats';

const calculateAverageSeverity = (docs: any[]): number => {
  const severities = docs
    .map(doc => doc.data().severity)
    .filter(Boolean)
    .map(severity => {
      switch(severity.toLowerCase()) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
      }
    }) as (0 | 1 | 2 | 3)[];

  // Fix the reduce by explicitly typing the accumulator and return value
  const sum = severities.reduce((acc: number, curr: 0 | 1 | 2 | 3): number => acc + curr, 0);
  return severities.length > 0 ? Math.round((sum / severities.length) * 33.33) : 0;
};

export const usePatientDashboard = (userId: string) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState({ appointments: true, analyses: true });
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [stats, setStats] = useState<PatientStats>(() => ({
    totalAppointments: 0,
    completedAnalyses: 0,
    upcomingAppointments: 0,
    averageSeverity: 0,
    lastUpdated: new Date()
  }));

  const fetchAnalyses = useCallback(async (): Promise<Analysis[]> => {
    try {
      const analysesRef = collection(db, 'analyses');
      const q = query(
        analysesRef,
        where('patientId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          patientId: data.patientId,
          result: data.result,
          condition: data.condition,
          description: data.description,
          confidence: data.confidence,
          severity: data.severity,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt as Timestamp,
          doctorId: data.doctorId,
          attachedToAppointment: data.attachedToAppointment,
          appointmentId: data.appointmentId,
          attachedAt: data.attachedAt
        } as Analysis;
      });
    } catch (error) {
      await handleError(error, 'fetchAnalyses', {
        context: 'patient dashboard',
        additionalInfo: `User: ${userId}`
      });
      throw error;
    }
  }, [userId]);

  const fetchStats = useCallback(async (): Promise<PatientStats> => {
    try {
      const cacheKey = `patient_stats_${userId}`;
      const cachedStats = cache.get<PatientStats>(cacheKey);
      
      if (cachedStats) {
        return cachedStats;
      }

      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('patientId', '==', userId)
      );
      
      const analysesRef = collection(db, 'analyses');
      const analysesQuery = query(
        analysesRef,
        where('patientId', '==', userId)
      );

      const [appointmentsSnap, analysesSnap] = await Promise.all([
        getDocs(appointmentsQuery),
        getDocs(analysesQuery)
      ]);

      const stats: PatientStats = {
        totalAppointments: appointmentsSnap.size,
        completedAnalyses: analysesSnap.size,
        upcomingAppointments: appointmentsSnap.docs.filter(doc => 
          doc.data().date.toDate() > new Date() && doc.data().status !== 'cancelled'
        ).length,
        averageSeverity: calculateAverageSeverity(analysesSnap.docs),
        lastUpdated: new Date()
      };

      cache.set(cacheKey, stats, { expiryMinutes: 5 });
      return stats;
    } catch (error) {
      await handleError(error, 'fetchStats', {
        context: 'patient dashboard',
        additionalInfo: `User: ${userId}`
      });
      throw error;
    }
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    let unsubscribeAppointments: (() => void) | null = null;
    let unsubscribeStats: (() => void) | null = null;

    const loadData = async () => {
      try {
        if (!mounted) return;
        setLoading({ appointments: true, analyses: true });
        
        unsubscribeAppointments = subscribeToAppointments(
          userId,
          'patient',
          (appointments: Appointment[]) => {
            if (mounted) {
              setUpcomingAppointments(appointments.filter(apt => 
                apt.date > new Date() && apt.status !== 'cancelled'
              ));
              setLoading(prev => ({ ...prev, appointments: false }));
            }
          }
        );

        unsubscribeStats = subscribeToStats(
          userId,
          'patient',
          (newStats: PatientStats) => {
            if (mounted) {
              setStats(newStats);
            }
          }
        );

        const analyses = await fetchAnalyses();
        if (mounted) {
          setRecentAnalyses(analyses);
          setLoading(prev => ({ ...prev, analyses: false }));
        }
      } catch (error) {
        if (mounted) {
          setError('Failed to load dashboard data');
          setLoading({ appointments: false, analyses: false });
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
      if (unsubscribeAppointments) unsubscribeAppointments();
      if (unsubscribeStats) unsubscribeStats();
    };
  }, [userId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await retryOperation(async () => {
        const [analyses, newStats] = await Promise.all([
          fetchAnalyses(),
          fetchStats()
        ]);
        setRecentAnalyses(analyses);
        setStats(newStats);
        toast.success('Data refreshed successfully');
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    upcomingAppointments,
    recentAnalyses,
    loading,
    error,
    isRefreshing,
    stats,
    retryCount,
    setRetryCount,
    handleRefresh,
    fetchStats
  };
};