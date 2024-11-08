import React, { useState, useEffect } from 'react';
import { User } from '../../contexts/AuthContext';
import { auth, db } from '../../Firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import ButtonStyling from '../ButtonStyling';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiAlertCircle } from 'react-icons/fi';
import { 
  WeeklySchedule, 
  DoctorAvailability,
  DEFAULT_WEEKLY_SCHEDULE 
} from '../../types/appointment';

interface DoctorAvailabilityProps {
  doctorId?: string;
  doctorName?: string | null;
  user?: User;
  className?: string;
}

const DoctorAvailabilityComponent: React.FC<DoctorAvailabilityProps> = ({
  doctorId,
  doctorName,
  user,
  className = ''
}) => {
  const [schedule, setSchedule] = useState<WeeklySchedule[]>(DEFAULT_WEEKLY_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!doctorId) {
        setLoading(false);
        setError('Doctor ID is required');
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, 'availability', doctorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as DoctorAvailability;
          setSchedule(data.weeklySchedule);
        } else {
          setSchedule(DEFAULT_WEEKLY_SCHEDULE);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('Failed to load schedule');
        toast.error('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [doctorId]);

  const handleTimeChange = (index: number, field: keyof WeeklySchedule, value: string | number | boolean) => {
    const newSchedule = [...schedule];
    newSchedule[index] = {
      ...newSchedule[index],
      [field]: value
    };
    setSchedule(newSchedule);
  };

  const handleSaveSchedule = async () => {
    if (!doctorId) {
      toast.error('Doctor ID is required');
      return;
    }

    try {
      const docRef = doc(db, 'availability', doctorId);
      await setDoc(docRef, {
        doctorId,
        weeklySchedule: schedule,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      toast.success('Schedule updated successfully');
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  if (loading) {
    return (
      <motion.div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EFEFED]"></div>
      </motion.div>
    );
  }

  return (
    <motion.div className={`container mx-auto p-4 ${className}`}>
      <h2 className="text-2xl font-bold text-[#EFEFED] mb-6">Set Your Weekly Availability</h2>
      
      {schedule.map((slot, index) => (
        <div key={slot.day} className="mb-6 bg-[#171B26] p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-[#EFEFED] w-32">{slot.day}</h3>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={slot.isAvailable}
                  onChange={(e) => handleTimeChange(index, 'isAvailable', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-500"
                />
                <span className="ml-2 text-[#EFEFED]">Working Day</span>
              </label>
            </div>
          </div>
          
          {slot.isAvailable && (
            <div className="ml-32 flex items-center space-x-4 bg-[#262A36] p-3 rounded">
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                className="bg-[#1F2937] text-[#EFEFED] p-2 rounded"
              />
              
              <span className="text-[#9C9FA4]">to</span>
              
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                className="bg-[#1F2937] text-[#EFEFED] p-2 rounded"
              />

              <input
                type="number"
                value={slot.maxAppointments}
                onChange={(e) => handleTimeChange(index, 'maxAppointments', parseInt(e.target.value))}
                min="1"
                max="20"
                className="w-20 bg-[#1F2937] text-[#EFEFED] p-2 rounded"
                placeholder="Max"
              />
            </div>
          )}
        </div>
      ))}
      
      <ButtonStyling
        text="Save Schedule"
        onClick={handleSaveSchedule}
        variant="primary"
        className="mt-6"
      />
    </motion.div>
  );
};

export default DoctorAvailabilityComponent;