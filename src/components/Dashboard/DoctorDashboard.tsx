import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../Firebase/config';
import { collection, query, where, Timestamp, updateDoc, doc, getDocs } from 'firebase/firestore';
import ButtonStyling from '../ButtonStyling';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import DoctorAvailabilityComponent from '../Appointments/DoctorAvailabilityComponent';
import { subscribeToAppointments } from '../../services/realtimeUpdates';
import RefreshButton from '../common/RefreshButton';
import AttachAnalysisModal from '../Appointments/AttachAnalysisModal';
import { StatCard } from './shared/DashboardStats';
import { cache } from '../../services/cacheService';
import { handleError } from '../../utils/errorHandler';
import SectionLoader from '../common/SectionLoader';
import ErrorBoundary from '../common/ErrorBoundary';
import { useAppointments } from '../../contexts/AppointmentContext';
import { 
  FiUsers, 
  FiClock, 
  FiCheckCircle, 
  FiStar, 
  FiBarChart2, 
  FiPercent, 
  FiActivity,
  FiCalendar 
} from 'react-icons/fi';
import type { Appointment } from '../../types/appointment';
import Link from 'next/link';
import { getDashboardStats } from '../../services/dashboardStatsService';
import { subscribeToStats } from '../../services/realtimeStatsService';
import type { DoctorStats } from '../../types/stats';
import { formatConfidence } from '../../utils/confidenceFormatter';
import { formatAppointmentDate } from '../../utils/dateUtils';
import SubmitReportComponent from '../UserReport/SubmitReportComponent';

interface DoctorDashboardProps {
  user: User;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<DoctorStats>({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    averageRating: 0,
    totalAnalyses: 0,
    lastUpdated: new Date()
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isManagingAvailability, setIsManagingAvailability] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const router = useRouter();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { confirmAppointment, cancelAppointment } = useAppointments();

  const fetchDoctorStats = async () => {
    try {
      const newStats = await getDashboardStats(user.uid, 'doctor');
      if (newStats) {
        setStats(newStats as DoctorStats);
      }
    } catch (error) {
      handleError(error, 'fetching doctor stats');
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      await confirmAppointment(appointmentId);
      toast.success('Appointment confirmed');
      await fetchDoctorStats();
      await handleRefresh();
    } catch (error) {
      toast.error('Failed to confirm appointment');
      handleError(error, 'confirming appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      await cancelAppointment(appointmentId);
      toast.success('Appointment cancelled');
      await fetchDoctorStats();
      await handleRefresh();
    } catch (error) {
      toast.error('Failed to cancel appointment');
      handleError(error, 'cancelling appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointment: Appointment) => {
    try {
      if (!appointment.attachedAnalysisId) {
        toast.warning('Please attach an analysis before completing the appointment');
        return;
      }

      const appointmentRef = doc(db, 'appointments', appointment.id);
      await updateDoc(appointmentRef, {
        status: 'completed',
        completedAt: Timestamp.now()
      });

      toast.success('Appointment marked as completed');
      await handleRefresh();
    } catch (error) {
      await handleError(error, 'completing appointment');
    }
  };

  const handleAttachAnalysis = (appointmentId: string, patientId: string) => {
    setSelectedAppointment(upcomingAppointments.find(apt => apt.id === appointmentId) || null);
    setShowAttachModal(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchDoctorStats();
      await fetchUpcomingAppointments();
      toast.success('Dashboard refreshed');
    } catch (error) {
      await handleError(error, 'refreshing dashboard');
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('doctorId', '==', user.uid),
        where('status', 'in', ['pending', 'confirmed']),
        where('date', '>=', Timestamp.now())
      );
      
      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      setUpcomingAppointments(appointments);
    } catch (error) {
      handleError(error, 'fetching upcoming appointments');
    }
  };

  useEffect(() => {
    let mounted = true;
    let unsubscribeStats: (() => void) | null = null;

    const setupSubscriptions = async () => {
      try {
        unsubscribeStats = subscribeToStats(user.uid, 'doctor', (newStats) => {
          if (mounted) {
            setStats(newStats as DoctorStats);
            setLoading(false);
          }
        });

        // Set up appointments subscription
        const unsubscribeAppointments = subscribeToAppointments(
          user.uid,
          'doctor',
          (appointments) => {
            if (mounted) {
              setUpcomingAppointments(appointments);
            }
          }
        );

        unsubscribeRef.current = () => {
          if (unsubscribeStats) unsubscribeStats();
          if (unsubscribeAppointments) unsubscribeAppointments();
        };
      } catch (error) {
        if (mounted) {
          handleError(error, 'setting up subscriptions');
          setError('Failed to load dashboard data');
        }
      }
    };

    setupSubscriptions();
    fetchUpcomingAppointments();

    return () => {
      mounted = false;
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [user.uid]);

  if (loading) {
    return <SectionLoader text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 p-4 md:p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#EFEFED]">Doctor Dashboard</h2>
          <RefreshButton 
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<FiUsers className="w-6 h-6" />}
            title="Total Patients"
            value={stats.totalPatients}
          />
          <StatCard
            icon={<FiClock className="w-6 h-6" />}
            title="Pending Appointments"
            value={stats.pendingAppointments}
          />
          <StatCard
            icon={<FiCheckCircle className="w-6 h-6" />}
            title="Completed Appointments"
            value={stats.completedAppointments}
          />
          <StatCard
            icon={<FiStar className="w-6 h-6" />}
            title="Average Rating"
            value={stats.averageRating}
          />
          <StatCard
            icon={<FiBarChart2 className="w-6 h-6" />}
            title="Total Analyses"
            value={stats.totalAnalyses}
          />
          <StatCard
            icon={<FiPercent className="w-6 h-6" />}
            title="Success Rate"
            value={stats.totalAppointments > 0 
              ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
              : 0
            }
          />
        </div>

        {/* Navigation buttons */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <Link href="/patient-records">
            <ButtonStyling
              text="Patient Records"
              variant="secondary"
              className="w-full"
              icon={<FiUsers />}
            />
          </Link>
          <Link href="/appointments">
            <ButtonStyling
              text="View Appointments"
              variant="secondary"
              className="w-full"
              icon={<FiCalendar />}
            />
          </Link>
          <Link href="/doctor/availability">
            <ButtonStyling
              text="Manage Availability"
              variant="secondary"
              className="w-full"
              icon={<FiClock />}
            />
          </Link>
          <Link href="/analyses/doctor">
            <ButtonStyling
              text="Analysis History"
              variant="secondary"
              className="w-full"
              icon={<FiActivity />}
            />
          </Link>
        </motion.div>

        {/* Report Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          {showReportForm ? (
            <SubmitReportComponent />
          ) : (
            <ButtonStyling
              text="Submit Medical Report"
              onClick={() => setShowReportForm(true)}
              variant="secondary"
              className="w-full"
            />
          )}
        </motion.div>

        {/* Rest of the component remains the same... */}
        
        <motion.div className="bg-[#262A36] p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[#EFEFED]">Upcoming Appointments</h3>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <motion.div
                  key={`appointment-${appointment.id}-${index}`}
                  className="bg-[#171B26] p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-[#EFEFED]">{appointment.patientName}</h4>
                      <p className="text-[#9C9FA4]">
                        {formatAppointmentDate(appointment.date, 'PPP')} at {appointment.time}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <ButtonStyling
                        text={appointment.attachedAnalysisId ? "View Analysis" : "Attach Analysis"}
                        onClick={() => handleAttachAnalysis(appointment.id, appointment.patientId)}
                        variant="secondary"
                      />
                      <ButtonStyling
                        text="Complete"
                        onClick={() => handleCompleteAppointment(appointment)}
                        variant="primary"
                        disabled={!appointment.attachedAnalysisId}
                      />
                      <ButtonStyling
                        text="Confirm"
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        variant="success"
                        disabled={appointment.status !== 'pending'}
                      />
                      <ButtonStyling
                        text="Cancel"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        variant="danger"
                        disabled={appointment.status !== 'pending'}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-[#9C9FA4]">No upcoming appointments</p>
          )}
        </motion.div>

        {/* Availability Management */}
        {isManagingAvailability && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <DoctorAvailabilityComponent 
              user={user}
              doctorId={user.uid}
              doctorName={user.name || user.displayName}
            />
          </motion.div>
        )}

        {/* Analysis Modal */}
        <AnimatePresence>
          {showAttachModal && selectedAppointment && (
            <AttachAnalysisModal
              isOpen={showAttachModal}
              appointmentId={selectedAppointment.id}
              patientId={selectedAppointment.patientId}
              onClose={() => setShowAttachModal(false)}
              onSuccess={(analysisId: string) => {
                toast.success('Analysis attached successfully');
                setShowAttachModal(false);
                handleRefresh();
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ErrorBoundary>
  );
};

export default DoctorDashboard;