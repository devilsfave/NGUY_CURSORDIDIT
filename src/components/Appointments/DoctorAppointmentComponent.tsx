import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppointments } from '../../contexts/AppointmentContext';
import ButtonStyling from '../ButtonStyling';
import DoctorAvailabilityComponent from './DoctorAvailabilityComponent';
import AppointmentList from './AppointmentList';
import PatientNotes from './PatientNotes';
import { User } from '../../contexts/AuthContext';
import { auth, db }from '../../Firebase/config';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import type { Appointment, AppointmentStatus } from '../../types/appointment';
import { convertTimestampToDate } from '../../utils/dateUtils';
import { format } from 'date-fns';

interface DoctorAppointmentComponentProps {
  user: User;
}

const DoctorAppointmentComponent: React.FC<DoctorAppointmentComponentProps> = ({ user }) => {
  const { appointments, loading, completeAppointment } = useAppointments();
  const [view, setView] = useState<'appointments' | 'availability'>('appointments');
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const handleStatusUpdate = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid
      });

      toast.success(`Appointment ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await completeAppointment(appointmentId);
      toast.success('Appointment completed successfully');
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error('Failed to complete appointment');
    }
  };

  const formatAppointmentDate = (date: Date | Timestamp) => {
    return format(convertTimestampToDate(date), 'PPP');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#EFEFED]">Doctor Dashboard</h2>
        <div className="flex gap-2">
          <ButtonStyling
            text="Appointments"
            onClick={() => setView('appointments')}
            variant={view === 'appointments' ? 'primary' : 'secondary'}
          />
          <ButtonStyling
            text="Availability"
            onClick={() => setView('availability')}
            variant={view === 'availability' ? 'primary' : 'secondary'}
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
            <p className="text-[#EFEFED] mt-4">Loading...</p>
          </motion.div>
        ) : view === 'appointments' ? (
          <motion.div
            key="appointments"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex gap-2 mb-4">
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
                <ButtonStyling
                  key={status}
                  text={status.charAt(0).toUpperCase() + status.slice(1)}
                  onClick={() => setFilter(status)}
                  variant={filter === status ? 'primary' : 'secondary'}
                />
              ))}
            </div>

            <AppointmentList
              appointments={filteredAppointments.map(apt => ({
                ...apt,
                formattedDate: formatAppointmentDate(apt.date)
              }))}
              onAddNotes={(id) => {
                const appointment = appointments.find(app => app.id === id);
                if (appointment) {
                  setSelectedAppointment(appointment);
                  setShowNotesModal(true);
                }
              }}
              onViewDetails={(id) => {
                const appointment = appointments.find(app => app.id === id);
                if (appointment) {
                  setSelectedAppointment(appointment);
                }
              }}
              onComplete={handleCompleteAppointment}
              onAttachAnalysis={undefined}
            />
          </motion.div>
        ) : (
          <DoctorAvailabilityComponent doctorId={user.uid} />
        )}
      </AnimatePresence>

      {showNotesModal && selectedAppointment && (
        <PatientNotes
          appointmentId={selectedAppointment.id}
          patientId={selectedAppointment.patientId}
          doctorId={user.uid}
          onClose={() => {
            setShowNotesModal(false);
            setSelectedAppointment(null);
          }}
          isDoctor={true}
          appointmentStatus={selectedAppointment.status}
        />
      )}
    </motion.div>
  );
};

export default DoctorAppointmentComponent;