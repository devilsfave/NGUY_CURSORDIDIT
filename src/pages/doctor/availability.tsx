'use client';

import React, { useState, useEffect } from 'react';
import { auth, db }from '../../Firebase/config';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ButtonStyling from '../../components/ButtonStyling';
import { handleError } from '../../utils/errorHandler';
import { format, addDays, parseISO, isAfter } from 'date-fns';

interface TimeSlot {
  id?: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
}

const DoctorAvailability = () => {
  const { user } = useAuth();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    if (!user?.uid) return;
    fetchAvailability();
  }, [user]);

  const fetchAvailability = async () => {
    try {
      const availabilityRef = collection(db, 'availability');
      const q = query(
        availabilityRef,
        where('doctorId', '==', user?.uid),
        where('date', '>=', format(new Date(), 'yyyy-MM-dd'))
      );

      const snapshot = await getDocs(q);
      const slots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeSlot[];

      setAvailableSlots(slots);
    } catch (error) {
      handleError(error, 'fetching availability');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const newSlot = {
        doctorId: user?.uid,
        date: selectedDate,
        startTime,
        endTime
      };

      await addDoc(collection(db, 'availability'), newSlot);
      toast.success('Availability added successfully');
      fetchAvailability();
      setSelectedDate('');
      setStartTime('09:00');
      setEndTime('17:00');
    } catch (error) {
      handleError(error, 'adding availability');
    }
  };

  const removeTimeSlot = async (slotId: string) => {
    try {
      await deleteDoc(doc(db, 'availability', slotId));
      toast.success('Availability removed successfully');
      fetchAvailability();
    } catch (error) {
      handleError(error, 'removing availability');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-2xl font-bold text-[#EFEFED] mb-6">Manage Availability</h1>

      <div className="bg-[#262A36] p-6 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[#9C9FA4] mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full p-2 bg-[#171B26] rounded-lg text-[#EFEFED]"
            />
          </div>
          <div>
            <label className="block text-[#9C9FA4] mb-2">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 bg-[#171B26] rounded-lg text-[#EFEFED]"
            />
          </div>
          <div>
            <label className="block text-[#9C9FA4] mb-2">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 bg-[#171B26] rounded-lg text-[#EFEFED]"
            />
          </div>
          <div className="flex items-end">
            <ButtonStyling
              text="Add Availability"
              onClick={addTimeSlot}
              variant="primary"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {availableSlots.map((slot) => (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#262A36] p-4 rounded-lg flex items-center justify-between"
          >
            <div>
              <div className="text-[#EFEFED] font-semibold">
                {format(parseISO(slot.date), 'MMMM d, yyyy')}
              </div>
              <div className="text-[#9C9FA4]">
                {slot.startTime} - {slot.endTime}
              </div>
            </div>
            <ButtonStyling
              text="Remove"
              onClick={() => removeTimeSlot(slot.id!)}
              variant="danger"
            />
          </motion.div>
        ))}

        {availableSlots.length === 0 && !loading && (
          <div className="text-center py-8 text-[#9C9FA4]">
            No availability slots set
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DoctorAvailability;