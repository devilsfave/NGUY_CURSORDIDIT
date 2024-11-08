import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppointmentCard from './AppointmentCard';
import { format } from 'date-fns';
import type { Appointment } from '../../types/appointment';
import { convertTimestampToDate } from '../../utils/dateUtils';

interface AppointmentListProps {
  appointments: Appointment[];
  onAttachAnalysis?: (id: string) => void;
  onAddNotes?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  userRole?: 'doctor' | 'patient' | 'admin';
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onAttachAnalysis,
  onAddNotes,
  onViewDetails,
  onConfirm,
  onCancel,
  onComplete,
  userRole
}) => {
  // Group appointments by date
  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = format(convertTimestampToDate(appointment.date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as { [key: string]: Appointment[] });

  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {appointments.length === 0 ? (
          <motion.div
            key="no-appointments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-[#9C9FA4]"
          >
            No appointments found
          </motion.div>
        ) : (
          <motion.div
            key="appointment-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {sortedDates.map((date) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-[#EFEFED]">
                  {format(new Date(date), 'MMMM d, yyyy')}
                </h3>
                <div className="space-y-4">
                  {groupedAppointments[date].map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      userRole={userRole}
                      onAddNotes={onAddNotes}
                      onViewDetails={onViewDetails}
                      onAttachAnalysis={onAttachAnalysis}
                      onConfirm={onConfirm}
                      onCancel={onCancel}
                      onComplete={onComplete}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AppointmentList;