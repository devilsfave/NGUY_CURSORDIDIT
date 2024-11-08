import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp, limit } from 'firebase/firestore';
import { auth, db } from '../../Firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import ButtonStyling from '../ButtonStyling';
import Link from 'next/link';
import { User } from '@/types/user';
import RefreshButton from '../common/RefreshButton';
import PatientNotes from '../Appointments/PatientNotes';
import { toast } from 'react-toastify';
import ErrorBoundary from '../common/ErrorBoundary';
import SectionLoader from '../common/SectionLoader';
import { handleError } from '../../utils/errorHandler';
import { FiCalendar, FiBarChart2, FiFileText } from 'react-icons/fi';
import { StatCard } from './shared/DashboardStats';
import type { Appointment } from '../../types/appointment';
import type { Analysis } from '../../types/analysis';
import type { PatientStats } from '../../types/stats';
import { formatAppointmentDate } from '../../utils/dateUtils';
import SubmitReportComponent from '../UserReport/SubmitReportComponent';
import { convertTimestampToDate } from '../../utils/dateUtils';
import { format } from 'date-fns';

const calculateAverageSeverity = (docs: any[]): number => {
  const severities = docs
    .map(doc => doc.data().severity)
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

  const sum = severities.reduce((acc: number, curr: number) => acc + curr, 0);
  return severities.length > 0 ? Math.round((sum / severities.length) * 33.33) : 0;
};

const StatsSection: React.FC<{ stats: PatientStats; user: User }> = ({ stats, user }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
      title="Total Appointments"
      value={stats.totalAppointments}
      icon={<FiCalendar className="w-6 h-6" />}
    />
    <StatCard
      title="Completed Analyses"
      value={stats.completedAnalyses}
      icon={<FiBarChart2 className="w-6 h-6" />}
    />
    <StatCard
      title="Upcoming Appointments"
      value={stats.upcomingAppointments}
      icon={<FiCalendar className="w-6 h-6" />}
    />
    <StatCard
      title="Average Severity"
      value={stats.averageSeverity}
      icon={<FiBarChart2 className="w-6 h-6" />}
    />
  </div>
);

const AppointmentsSection: React.FC<{
  appointments: Appointment[];
  onRefresh: () => void;
  isRefreshing: boolean;
  user: User;
  onViewNotes: (appointment: Appointment) => void;
  onCancelAppointment: (appointmentId: string) => void;
}> = ({ appointments, onRefresh, isRefreshing, user, onViewNotes, onCancelAppointment }) => (
  <div className="bg-[#171B26] p-4 rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold text-[#EFEFED]">Upcoming Appointments</h3>
      <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
    </div>
    {appointments.length > 0 ? (
      <ul className="space-y-4">
        {appointments.map(appointment => (
          <li key={appointment.id} className="bg-[#262A36] p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#EFEFED] font-medium">{appointment.doctorName}</p>
                <p className="text-[#9C9FA4]">{formatAppointmentDate(appointment.date)}</p>
              </div>
              <div className="flex gap-2">
                <ButtonStyling
                  text="View Notes"
                  onClick={() => onViewNotes(appointment)}
                  variant="secondary"
                />
                <ButtonStyling
                  text="Cancel"
                  onClick={() => onCancelAppointment(appointment.id)}
                  variant="danger"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-[#9C9FA4]">No upcoming appointments</p>
    )}
  </div>
);

const AnalysesSection: React.FC<{ analyses: Analysis[] }> = ({ analyses }) => (
  <div className="bg-[#171B26] p-4 rounded-lg">
    <h3 className="text-xl font-semibold mb-4 text-[#EFEFED]">Recent Analyses</h3>
    {analyses.length > 0 ? (
      <ul className="space-y-4">
        {analyses.map(analysis => (
          <li key={analysis.id} className="bg-[#262A36] p-4 rounded-lg">
            <p className="text-[#EFEFED] font-medium">
              {analysis.condition || 'No condition specified'}
            </p>
            <p className="text-[#9C9FA4]">
              {format(convertTimestampToDate(analysis.createdAt), 'PPpp')}
            </p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-[#9C9FA4]">No recent analyses</p>
    )}
  </div>
);

const PatientDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<PatientStats>({
    totalAppointments: 0,
    completedAnalyses: 0,
    upcomingAppointments: 0,
    averageSeverity: 0,
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchDashboardData = async () => {
    try {
      // Fetch appointments
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('patientId', '==', user.uid),
        where('date', '>=', new Date()),
        orderBy('date', 'asc')
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointments = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as Appointment[];
      setUpcomingAppointments(appointments);

      // Fetch analyses
      const analysesRef = collection(db, 'analyses');
      const analysesQuery = query(
        analysesRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const analysesSnapshot = await getDocs(analysesQuery);
      const analyses = analysesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Analysis[];
      setRecentAnalyses(analyses);

      // Calculate stats
      setStats({
        totalAppointments: appointments.length,
        completedAnalyses: analyses.length,
        upcomingAppointments: appointments.filter(apt => apt.status !== 'cancelled').length,
        averageSeverity: calculateAverageSeverity(analysesSnapshot.docs),
        lastUpdated: new Date()
      });

      setLoading(false);
    } catch (error) {
      handleError(error, 'fetching dashboard data');
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.uid]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboardData();
      toast.success('Dashboard refreshed');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        updatedAt: new Date()
      });
      await fetchDashboardData();
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      handleError(error, 'cancelling appointment');
      toast.error('Failed to cancel appointment');
    }
  };

  const handleViewNotes = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowNotes(true);
  };

  const handleCloseNotes = () => {
    setShowNotes(false);
    setSelectedAppointment(null);
  };

  if (loading) {
    return <SectionLoader text="Loading dashboard..." />;
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 p-4 md:p-6"
      >
        <StatsSection stats={stats} user={user} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AppointmentsSection
            appointments={upcomingAppointments}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            user={user}
            onViewNotes={handleViewNotes}
            onCancelAppointment={handleCancelAppointment}
          />

          <AnalysesSection analyses={recentAnalyses} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/appointments" className="w-full">
            <ButtonStyling 
              text="Book Appointment" 
              className="w-full"
              icon={<FiCalendar className="mr-2" />}
            />
          </Link>
          <Link href="/analyses/new" className="w-full">
            <ButtonStyling 
              text="New Analysis" 
              className="w-full"
              icon={<FiBarChart2 className="mr-2" />}
            />
          </Link>
          <ButtonStyling 
            text={showReportForm ? "Hide Report Form" : "Submit Report"}
            onClick={() => setShowReportForm(!showReportForm)}
            className="w-full"
            icon={<FiFileText className="mr-2" />}
          />
        </div>

        <AnimatePresence>
          {showReportForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <SubmitReportComponent />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showNotes && selectedAppointment && (
            <PatientNotes
              appointmentId={selectedAppointment.id}
              patientId={user.uid}
              isOpen={showNotes}
              onClose={handleCloseNotes}
              isDoctor={false}
              appointmentStatus={selectedAppointment.status}
            />
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mt-4"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </ErrorBoundary>
  );
};

export default PatientDashboard;