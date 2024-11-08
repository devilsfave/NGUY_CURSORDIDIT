import React from 'react';
import { motion } from 'framer-motion';
import ButtonStyling from '../ButtonStyling';
import { FiClock, FiCalendar, FiUser, FiFileText, FiCheck } from 'react-icons/fi';
import type { Appointment, AppointmentStatus } from '../../types/appointment';
import { formatAppointmentDate } from '../../utils/dateUtils';
import { getStatusColor } from '../../types/appointment';

export interface AppointmentCardProps {
  appointment: Appointment;
  userRole?: 'doctor' | 'patient' | 'admin';
  onAddNotes?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onAttachAnalysis?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  userRole,
  onAddNotes,
  onViewDetails,
  onAttachAnalysis,
  onConfirm,
  onCancel,
  onComplete
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#262A36] p-6 rounded-lg shadow-lg"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FiUser className="text-[#9C9FA4]" />
            <h3 className="text-lg font-semibold text-[#EFEFED]">
              {userRole === 'doctor' ? appointment.patientName : appointment.doctorName}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-[#9C9FA4]" />
            <p className="text-[#9C9FA4]">
              {formatAppointmentDate(appointment.date)}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <FiClock className="text-[#9C9FA4]" />
            <p className="text-[#9C9FA4]">{appointment.time}</p>
          </div>

          {appointment.notes && (
            <div className="flex items-center space-x-2">
              <FiFileText className="text-[#9C9FA4]" />
              <p className="text-[#9C9FA4] truncate max-w-xs">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>

          {appointment.attachedAnalysisId && (
            <span className="text-green-500 flex items-center text-sm">
              <FiCheck className="mr-1" /> Analysis Attached
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-4">
        {userRole === 'doctor' && appointment.status === 'pending' && (
          <>
            <ButtonStyling
              text="Confirm"
              onClick={() => onConfirm?.(appointment.id)}
              variant="primary"
            />
            <ButtonStyling
              text="Cancel"
              onClick={() => onCancel?.(appointment.id)}
              variant="secondary"
            />
          </>
        )}

        {userRole === 'doctor' && appointment.status === 'confirmed' && (
          <ButtonStyling
            text="Complete"
            onClick={() => onComplete?.(appointment.id)}
            variant="primary"
            disabled={!appointment.attachedAnalysisId}
          />
        )}

        {onAttachAnalysis && userRole === 'doctor' && !appointment.attachedAnalysisId && (
          <ButtonStyling
            text="Attach Analysis"
            onClick={() => onAttachAnalysis(appointment.id)}
            variant="secondary"
          />
        )}

        {onViewDetails && (
          <ButtonStyling
            text="View Details"
            onClick={() => onViewDetails(appointment.id)}
            variant="secondary"
          />
        )}

        {onAddNotes && (
          <ButtonStyling
            text="Add Notes"
            onClick={() => onAddNotes(appointment.id)}
            variant="secondary"
          />
        )}
      </div>
    </motion.div>
  );
};

export default AppointmentCard;