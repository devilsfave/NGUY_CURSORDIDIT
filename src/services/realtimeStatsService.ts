import { auth, db }from '../Firebase/config';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { cache } from './cacheService';
import { handleError } from '../utils/errorHandler';
import type { PatientStats, DoctorStats, AdminStats } from '../types/stats';
import { debounce } from 'lodash';
import { getDashboardStats } from './dashboardStatsService';

// Define the generic StatsCallback type
export type StatsCallback<T extends PatientStats | DoctorStats | AdminStats> = (stats: T) => void;

// Create specific callback types for each role
type PatientStatsCallback = StatsCallback<PatientStats>;
type DoctorStatsCallback = StatsCallback<DoctorStats>;
type AdminStatsCallback = StatsCallback<AdminStats>;

// Update the subscribeToStats function to be role-specific
export function subscribeToStats(userId: string, role: 'patient', callback: PatientStatsCallback): () => void;
export function subscribeToStats(userId: string, role: 'doctor', callback: DoctorStatsCallback): () => void;
export function subscribeToStats(userId: string, role: 'admin', callback: AdminStatsCallback): () => void;
export function subscribeToStats(
  userId: string,
  role: 'patient' | 'doctor' | 'admin',
  callback: PatientStatsCallback | DoctorStatsCallback | AdminStatsCallback
): () => void {
  try {
    let isSubscribed = true;
    const debouncedCallback = debounce(async () => {
      if (!isSubscribed) return;
      try {
        const newStats = await getDashboardStats(userId, role);
        if (newStats && isSubscribed) {
          callback(newStats as any); // Type assertion needed due to overloads
        }
      } catch (error) {
        handleError(error, `updating ${role} stats`);
      }
    }, 1000);

    // First try to subscribe to cached analytics collection
    const analyticsCollections = {
      doctor: 'doctorAnalytics',
      patient: 'patientStats',
      admin: 'systemStats'
    };

    const analyticsRef = doc(db, analyticsCollections[role], role === 'admin' ? 'stats' : userId);
    const analyticsUnsubscribe = onSnapshot(analyticsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as any);
        return;
      }
    }, (error) => {
      handleError(error, `subscribing to ${role} analytics`);
    });

    // Set up real-time queries for source collections
    const queries = [];
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    switch (role) {
      case 'patient':
        queries.push(
          query(collection(db, 'appointments'), where('patientId', '==', userId)),
          query(collection(db, 'analyses'), where('userId', '==', userId))
        );
        break;

      case 'doctor':
        queries.push(
          query(collection(db, 'appointments'), where('doctorId', '==', userId)),
          query(collection(db, 'analyses'), where('doctorId', '==', userId)),
          query(collection(db, 'doctorRatings'), where('doctorId', '==', userId))
        );
        break;

      case 'admin':
        queries.push(
          query(collection(db, 'appointments'), where('status', '==', 'pending')),
          query(collection(db, 'users'), where('role', '==', 'doctor'), where('verified', '==', false)),
          query(collection(db, 'userReports'), where('status', '==', 'pending')),
          query(collection(db, 'analyses'), where('createdAt', '>=', yesterday))
        );
        break;
    }

    const queryUnsubscribes = queries.map(q => {
      try {
        return onSnapshot(q, () => {
          debouncedCallback();
        }, (error) => {
          handleError(error, `subscribing to ${role} collection query`);
        });
      } catch (error) {
        handleError(error, `setting up ${role} query subscription`);
        return () => {};
      }
    });

    // Return cleanup function that unsubscribes from all listeners
    return () => {
      isSubscribed = false;
      analyticsUnsubscribe();
      queryUnsubscribes.forEach(unsub => unsub());
      debouncedCallback.cancel();
    };

  } catch (error) {
    handleError(error, `subscribing to ${role} stats`);
    return () => {}; // Return empty cleanup function on error
  }
};

// Export all necessary types
export type {
  PatientStatsCallback,
  DoctorStatsCallback,
  AdminStatsCallback
};