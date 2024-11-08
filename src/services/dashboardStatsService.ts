import { auth, db }from '../Firebase/config';
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { cache } from './cacheService';
import { handleError } from '../utils/errorHandler';
import type { PatientStats, DoctorStats, AdminStats, BaseStats } from '../types/stats';
import type { Analysis } from '../types/analysis';

export const getDashboardStats = async (userId: string, role: 'doctor' | 'patient' | 'admin') => {
  const cacheKey = `${role}_stats_${userId}`;
  const cachedStats = cache.get<PatientStats | DoctorStats | AdminStats>(cacheKey);
  
  if (cachedStats && cachedStats.lastUpdated && (Date.now() - cachedStats.lastUpdated.getTime() < 30000)) {
    return cachedStats;
  }

  try {
    let stats: PatientStats | DoctorStats | AdminStats;
    const now = new Date();

    switch (role) {
      case 'patient':
        const [patientAppointments, patientAnalyses] = await Promise.all([
          getDocs(query(collection(db, 'appointments'), where('patientId', '==', userId))),
          getDocs(query(collection(db, 'analyses'), where('userId', '==', userId)))
        ]);

        const analyses = patientAnalyses.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            confidence: Math.min(Math.round(Number(data.confidence)), 100),
            severity: data.severity || 'unknown',
            id: doc.id,
            createdAt: data.createdAt,
            patientId: data.patientId || data.userId,
          } as Analysis;
        });

        const severities = analyses
          .map(analysis => analysis.severity)
          .filter(Boolean)
          .map(severity => {
            const sev = severity.toString().toLowerCase();
            switch(sev) {
              case 'high': return 3;
              case 'medium': return 2;
              case 'low': return 1;
              default: return 0;
            }
          });

        const severitySum = severities.reduce((acc: number, curr: number) => acc + curr, 0);
        const averageSeverity = severities.length > 0
          ? Math.round((severitySum / severities.length) * 33.33)
          : 0;

        stats = {
          totalAppointments: patientAppointments.size,
          completedAnalyses: analyses.length,
          upcomingAppointments: patientAppointments.docs.filter(doc => 
            doc.data().date.toDate() > now && doc.data().status !== 'cancelled'
          ).length,
          averageSeverity,
          lastUpdated: now
        } as PatientStats;
        break;

      case 'doctor':
        // First check analytics collection for cached stats
        const analyticsRef = doc(db, 'doctorAnalytics', userId);
        const analyticsSnap = await getDoc(analyticsRef);

        if (analyticsSnap.exists()) {
          stats = analyticsSnap.data() as DoctorStats;
        } else {
          // If no cached stats, calculate them
          const [doctorAppointments, doctorAnalyses, doctorRatings] = await Promise.all([
            getDocs(query(collection(db, 'appointments'), where('doctorId', '==', userId))),
            getDocs(query(collection(db, 'analyses'), where('doctorId', '==', userId))),
            getDocs(query(collection(db, 'doctorRatings'), where('doctorId', '==', userId)))
          ]);

          const ratings = doctorRatings.docs.map(doc => doc.data().rating);
          
          stats = {
            totalPatients: new Set(doctorAppointments.docs.map(doc => doc.data().patientId)).size,
            totalAppointments: doctorAppointments.size,
            completedAppointments: doctorAppointments.docs.filter(doc => doc.data().status === 'completed').length,
            pendingAppointments: doctorAppointments.docs.filter(doc => doc.data().status === 'pending').length,
            averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
            totalAnalyses: doctorAnalyses.size,
            lastUpdated: now
          } as DoctorStats;
        }
        break;

      case 'admin':
        // First check system stats collection
        const statsRef = doc(db, 'systemStats', 'stats');
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
          stats = statsSnap.data() as AdminStats;
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
        
          const [
            pendingAppointments,
            unverifiedDoctors,
            pendingReports,
            recentAnalyses
          ] = await Promise.all([
            getDocs(query(
              collection(db, 'appointments'),
              where('status', '==', 'pending')
            )),
            getDocs(query(
              collection(db, 'users'),
              where('role', '==', 'doctor'),
              where('verified', '==', false)
            )),
            getDocs(query(
              collection(db, 'userReports'),
              where('status', '==', 'pending')
            )),
            getDocs(query(
              collection(db, 'analyses'),
              where('createdAt', '>=', yesterday)
            ))
          ]);
        
          stats = {
            pendingAppointments: pendingAppointments.size,
            unverifiedDoctors: unverifiedDoctors.size,
            pendingReports: pendingReports.size,
            recentAnalyses: recentAnalyses.size,
            lastUpdated: now
          } as AdminStats;
        }
        break;
    }

    cache.set(cacheKey, stats, { expiryMinutes: 1 });
    return stats;
  } catch (error) {
    handleError(error, `fetching ${role} dashboard stats`);
    return cachedStats || null;
  }
};