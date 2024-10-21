import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp, onSnapshot } from 'firebase/firestore';
import { firestore as db } from '../../Firebase/config';
import ButtonStyling from '../ButtonStyling';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable, SwipeEventData } from 'react-swipeable';

interface User {
  uid: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  date: Timestamp;
  time: string;
}

interface AppointmentBookingProps {
  user: User;
  doctorId?: string;
  doctorName?: string;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ user, doctorId, doctorName }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  
  const searchParams = useSearchParams();
  const routerDoctorId = searchParams?.get('doctorId') ?? '';
  const routerDoctorName = searchParams?.get('doctorName') ?? '';

  const finalDoctorId = doctorId || routerDoctorId;
  const finalDoctorName = doctorName || routerDoctorName;

  const fetchAvailableTimeSlots = useCallback(async () => {
    try {
      const availabilityRef = collection(db, 'availability');
      const q = query(availabilityRef, 
        where('doctorId', '==', finalDoctorId),
        where('day', '==', new Date(date).toLocaleDateString('en-US', { weekday: 'long' }))
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const availabilityData = querySnapshot.docs[0].data();
        const startTime = availabilityData.startTime;
        const endTime = availabilityData.endTime;
        
        const slots = generateTimeSlots(startTime, endTime);
        const bookedSlots = await getBookedTimeSlots();
        
        const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));
        setAvailableTimeSlots(availableSlots);
      } else {
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available time slots:', error);
    }
  }, [date, finalDoctorId]);

  useEffect(() => {
    if (!user.uid) return;

    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAppointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      } as Appointment));
      setAppointments(fetchedAppointments);
    }, (error) => {
      console.error('Error fetching appointments:', error);
    });

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    if (date && finalDoctorId) {
      fetchAvailableTimeSlots();
    }
  }, [date, finalDoctorId, fetchAvailableTimeSlots]);

  const generateTimeSlots = (startTime: string, endTime: string) => {
    const slots = [];
    let currentTime = new Date(`2000-01-01T${startTime}`);
    const endDateTime = new Date(`2000-01-01T${endTime}`);

    while (currentTime < endDateTime) {
      slots.push(currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  };

  const getBookedTimeSlots = async () => {
    const q = query(collection(db, 'appointments'), 
      where('doctorId', '==', finalDoctorId),
      where('date', '==', new Date(date))
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().time);
  };

  const handleBookAppointment = async () => {
    if (!date || !time) {
      alert('Please select both date and time.');
      return;
    }

    if (!finalDoctorId) {
      alert('Please select a doctor before booking an appointment.');
      return;
    }

    try {
      const appointmentData = {
        doctorId: finalDoctorId,
        doctorName: finalDoctorName,
        userId: user.uid,
        date: Timestamp.fromDate(new Date(date)),
        time,
      };

      await addDoc(collection(db, 'appointments'), appointmentData);

      alert(`Appointment booked with Dr. ${finalDoctorName || finalDoctorId} on ${date} at ${time}.`);
      setDate('');
      setTime('');
      fetchAvailableTimeSlots();
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment.');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'appointments', id));
      alert('Appointment canceled successfully.');
    } catch (error) {
      console.error('Error canceling appointment:', error);
      alert('Failed to cancel appointment.');
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData: SwipeEventData) => {
      const appointmentId = (eventData.event.target as HTMLElement).getAttribute('data-id');
      if (appointmentId) {
        handleCancelAppointment(appointmentId);
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-[#171B26] rounded-lg max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4 text-[#EFEFED]">
        {finalDoctorId 
          ? `Book Appointment with Dr. ${finalDoctorName || finalDoctorId}`
          : 'Book Appointment'}
      </h2>
      <div className="flex flex-col space-y-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
        />
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
        >
          <option value="">Select time</option>
          {availableTimeSlots.map(slot => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </div>
      <ButtonStyling text="Book Appointment" onClick={handleBookAppointment} className="w-full mt-4" />

      <h3 className="text-xl font-semibold mt-6 mb-2 text-[#EFEFED]">Your Appointments:</h3>
      <AnimatePresence>
        {appointments.map((appointment) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2 p-2 bg-[#262A36] rounded flex flex-col sm:flex-row justify-between items-start sm:items-center"
            {...(swipeHandlers as any)}
            data-id={appointment.id}
          >
            <div className="mb-2 sm:mb-0">
              <p className="text-[#EFEFED]">
                Dr. {appointment.doctorName || appointment.doctorId}
              </p>
              <p className="text-[#9C9FA4] text-sm">
                {appointment.date.toDate().toLocaleDateString()} at {appointment.time}
              </p>
            </div>
            <ButtonStyling text="Cancel" onClick={() => handleCancelAppointment(appointment.id)} variant="secondary" className="w-full sm:w-auto" />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default AppointmentBooking;
