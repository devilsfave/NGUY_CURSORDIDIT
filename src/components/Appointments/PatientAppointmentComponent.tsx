import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppointments } from '../../contexts/AppointmentContext';
import DoctorListComponent from './DoctorListComponent';
import AppointmentList from './AppointmentList';
import AppointmentModal from './AppointmentModal';
import AttachAnalysisModal from './AttachAnalysisModal';
import ButtonStyling from '../ButtonStyling';
import type { Appointment } from '../../types/appointment';
import { User } from '../../contexts/AuthContext';
import { subscribeToAppointments } from '../../services/realtimeUpdates';
import { convertTimestampToDate } from '../../utils/dateUtils';

interface PatientAppointmentComponentProps {
  user: User;
}

const PatientAppointmentComponent: React.FC<PatientAppointmentComponentProps> = ({ user }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [view, setView] = useState<'list' | 'booking' | 'history'>('list');
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; name: string } | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupSubscription = () => {
      try {
        unsubscribeRef.current = subscribeToAppointments(
          user.uid,
          'patient',
          (updatedAppointments) => {
            if (!mounted) return;
            setAppointments(updatedAppointments);
            setLoading(false);
          }
        );
      } catch (error) {
        if (mounted) {
          console.error('Error setting up appointments subscription:', error);
          setError('Failed to load appointments');
          setLoading(false);
        }
      }
    };

    setupSubscription();

    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user.uid]);

  const handleDoctorSelect = (doctorId: string, doctorName: string) => {
    setSelectedDoctor({ id: doctorId, name: doctorName });
    setShowAppointmentModal(true);
  };

  const handleAttachAnalysis = (appointmentId: string) => {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowAnalysisModal(true);
    }
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment({
      ...appointment,
      date: convertTimestampToDate(appointment.date)
    });
    setShowAppointmentModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#EFEFED]">Appointments</h2>
        <div className="flex gap-2">
          <ButtonStyling
            text="Find Doctor"
            onClick={() => setView('list')}
            variant={view === 'list' ? 'primary' : 'secondary'}
          />
          <ButtonStyling
            text="My Appointments"
            onClick={() => setView('history')}
            variant={view === 'history' ? 'primary' : 'secondary'}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EFEFED] mx-auto"></div>
            <p className="text-[#EFEFED] mt-4">Loading appointments...</p>
          </motion.div>
        ) : view === 'list' ? (
          <DoctorListComponent onDoctorSelect={handleDoctorSelect} />
        ) : (
          <AppointmentList
            appointments={appointments}
            onAttachAnalysis={handleAttachAnalysis}
            onAddNotes={(id) => {
              const appointment = appointments.find(app => app.id === id);
              if (appointment) {
                setSelectedAppointment(appointment);
                setShowAppointmentModal(true);
              }
            }}
            onViewDetails={(id) => {
              const appointment = appointments.find(app => app.id === id);
              if (appointment) {
                setSelectedAppointment(appointment);
                setShowAppointmentModal(true);
              }
            }}
          />
        )}
      </AnimatePresence>

      {showAppointmentModal && (
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
          }}
          user={user}
          selectedDoctor={selectedDoctor || undefined}
          existingAppointment={selectedAppointment ? {
            ...selectedAppointment,
            date: convertTimestampToDate(selectedAppointment.date)
          } : undefined}
          onSuccess={() => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
            setView('history');
          }}
        />
      )}

      {showAnalysisModal && selectedAppointment && (
        <AttachAnalysisModal
          isOpen={showAnalysisModal}
          appointmentId={selectedAppointment.id}
          patientId={user.uid}
          onClose={() => {
            setShowAnalysisModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            setShowAnalysisModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </motion.div>
  );
};

export default PatientAppointmentComponent;