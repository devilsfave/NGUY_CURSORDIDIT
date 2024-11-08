import React, { useState, useEffect } from 'react';
import { User } from '../../contexts/AuthContext';
import AdminPanel from '../Admin/AdminPanel';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db }from '../../Firebase/config';
import { StatCard } from './shared/DashboardStats';
import RefreshButton from '../common/RefreshButton';
import { cache } from '../../services/cacheService';
import { handleError } from '../../utils/errorHandler';
import SectionLoader from '../common/SectionLoader';
import { FiClock, FiUserX, FiFlag, FiBarChart2, FiPlus, FiList } from 'react-icons/fi';
import { subscribeToStats } from '../../services/realtimeStatsService';
import type { AdminStats } from '../../types/stats';
import ButtonStyling from '../ButtonStyling';
import { useRouter } from 'next/navigation';

interface AdminDashboardProps {
  user: User;
}

interface DashboardStats {
  pendingAppointments: number;
  unverifiedDoctors: number;
  pendingReports: number;
  recentAnalyses: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats>({
    pendingAppointments: 0,
    unverifiedDoctors: 0,
    pendingReports: 0,
    recentAnalyses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const fetchDashboardStats = async () => {
    try {
      const cacheKey = 'admin_dashboard_stats';
      const cachedStats = cache.get<DashboardStats>(cacheKey);
      
      if (cachedStats) {
        setStats(cachedStats);
        return;
      }

      // Fetch pending appointments
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('status', '==', 'pending')
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const pendingAppointments = appointmentsSnapshot.size;

      // Fetch unverified doctors
      const doctorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'doctor'),
        where('verified', '==', false)
      );
      const doctorsSnapshot = await getDocs(doctorsQuery);
      const unverifiedDoctors = doctorsSnapshot.size;

      // Fetch pending reports
      const reportsQuery = query(
        collection(db, 'userReports'),
        where('status', '==', 'pending')
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const pendingReports = reportsSnapshot.size;

      // Fetch recent analyses (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const analysesQuery = query(
        collection(db, 'analyses'),
        where('createdAt', '>=', yesterday)
      );
      const analysesSnapshot = await getDocs(analysesQuery);
      const recentAnalyses = analysesSnapshot.size;

      setStats({
        pendingAppointments,
        unverifiedDoctors,
        pendingReports,
        recentAnalyses
      });

      cache.set(cacheKey, stats);
    } catch (error) {
      await handleError(error, 'fetching dashboard stats');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboardStats();
    } catch (error) {
      await handleError(error, 'refreshing dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let unsubscribeStats: (() => void) | null = null;

    const setupSubscriptions = async () => {
      try {
        unsubscribeStats = subscribeToStats(user.uid, 'admin', (newStats) => {
          if (mounted) {
            setStats(newStats as AdminStats);
            setLoading(false);
          }
        });
      } catch (error) {
        if (mounted) {
          handleError(error, 'setting up stats subscription');
          setError('Failed to load statistics');
        }
      }
    };

    setupSubscriptions();

    return () => {
      mounted = false;
      if (unsubscribeStats) unsubscribeStats();
    };
  }, [user.uid]);

  const handleNewAnalysis = () => {
    router.push('/analyses/new');
  };

  const handleViewAnalyses = () => {
    router.push('/analyses/admin');
  };

  if (loading) {
    return <SectionLoader text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-[#171B26]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#EFEFED]">Admin Dashboard</h1>
          <div className="flex gap-4">
            <ButtonStyling
              text="New Analysis"
              onClick={handleNewAnalysis}
              icon={<FiPlus />}
            />
            <ButtonStyling
              text="View Analyses"
              onClick={handleViewAnalyses}
              icon={<FiList />}
              variant="secondary"
            />
            <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            key={`admin-${user.uid}-pending-appointments`}
            icon={<FiClock className="w-6 h-6" />}
            title="Pending Appointments"
            value={stats.pendingAppointments}
          />
          <StatCard
            key={`admin-${user.uid}-unverified-doctors`}
            icon={<FiUserX className="w-6 h-6" />}
            title="Unverified Doctors"
            value={stats.unverifiedDoctors}
          />
          <StatCard
            key={`admin-${user.uid}-pending-reports`}
            icon={<FiFlag className="w-6 h-6" />}
            title="Pending Reports"
            value={stats.pendingReports}
          />
          <StatCard
            key={`admin-${user.uid}-recent-analyses`}
            icon={<FiBarChart2 className="w-6 h-6" />}
            title="Recent Analyses"
            value={stats.recentAnalyses}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        <AdminPanel user={user} />
      </motion.div>
    </div>
  );
};

export default AdminDashboard;