import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../Firebase/config';
import { collection, addDoc, updateDoc, doc, getDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import ButtonStyling from '../ButtonStyling';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { User } from '../../contexts/AuthContext';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  selectedDoctor?: {
    id: string;
    name: string;
  };
  existingAppointment?: {
    id: string;
    date: Date;
    time: string;
    doctorId: string;
    doctorName: string;
    status: string;
    notes?: string;
  };
  onSuccess?: () => void;
}

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 9; hour < 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  user,
  selectedDoctor,
  existingAppointment,
  onSuccess
}) => {
  const [date, setDate] = useState(existingAppointment?.date ? format(existingAppointment.date, 'yyyy-MM-dd') : '');
  const [time, setTime] = useState(existingAppointment?.time || '');
  const [notes, setNotes] = useState(existingAppointment?.notes || '');
  const [loading, setLoading] = useState(false);
  const [patientName, setPatientName] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPatientName(userData.fullName || '');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!date || !time || !selectedDoctor || !patientName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (existingAppointment) {
        await updateDoc(doc(db, 'appointments', existingAppointment.id), {
          date: Timestamp.fromDate(new Date(date)),
          time,
          notes,
          updatedAt: serverTimestamp(),
          lastModifiedBy: user.uid
        });
      } else {
        await addDoc(collection(db, 'appointments'), {
          patientId: user.uid,
          patientName: patientName,
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          date: Timestamp.fromDate(new Date(date)),
          time,
          notes: notes || '',
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          confirmationSent: false,
          lastModifiedBy: 'system'
        });
      }

      toast.success(existingAppointment ? 'Appointment updated!' : 'Appointment booked!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-[#1F2937] rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-[#EFEFED] mb-4">
              {existingAppointment ? 'Update Appointment' : 'Book Appointment'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#EFEFED] mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full bg-[#374151] text-[#EFEFED] p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-[#EFEFED] mb-2">Time</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#374151] text-[#EFEFED] p-2 rounded"
                  required
                >
                  <option value="">Select a time</option>
                  {generateTimeSlots().map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#EFEFED] mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#374151] text-[#EFEFED] p-2 rounded"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <ButtonStyling
                  text="Cancel"
                  onClick={onClose}
                  variant="secondary"
                />
                <ButtonStyling
                  text={loading ? 'Saving...' : existingAppointment ? 'Update' : 'Book'}
                  onClick={() => handleSubmit()}
                  variant="primary"
                  disabled={loading}
                />
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentModal;