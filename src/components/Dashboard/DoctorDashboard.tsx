import React, { useState, useEffect } from 'react';
import { firestore as db } from '../../Firebase/config';
import { collection, query, where, getDocs, Timestamp, updateDoc, doc, onSnapshot, addDoc } from 'firebase/firestore';
import ButtonStyling from '../ButtonStyling';
import AppointmentBooking from '../Appointments/AppointmentsComponent';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SubmitReportComponent from '../UserReport/SubmitReportComponent';

interface User {
  uid: string;
  name: string;
}

interface Appointment {
  id: string;
  patientName: string;
  date: Timestamp;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Availability {
  id: string;
  doctorId: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface DoctorDashboardProps {
  user: User;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isManagingAvailability, setIsManagingAvailability] = useState(false);
  const [newAvailabilityDay, setNewAvailabilityDay] = useState('Monday');
  const router = useRouter();

  useEffect(() => {
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsQuery = query(
      appointmentsRef,
      where('doctorId', '==', user.uid),
      where('date', '>=', new Date()),
      where('status', '==', 'scheduled')
    );

    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (querySnapshot) => {
      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Appointment));
      setUpcomingAppointments(appointments);
    });

    const availabilityRef = collection(db, 'availability');
    const availabilityQuery = query(availabilityRef, where('doctorId', '==', user.uid));

    const unsubscribeAvailability = onSnapshot(availabilityQuery, (querySnapshot) => {
      const availabilityData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Availability));
      setAvailability(availabilityData);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeAvailability();
    };
  }, [user.uid]);

  const handleViewPatientRecords = () => {
    router.push('/patient-records');
  };

  const handleManageAvailability = () => {
    setIsManagingAvailability(!isManagingAvailability);
  };

  const handleUpdateAvailability = async (availabilityId: string, newData: Partial<Availability>) => {
    try {
      const availabilityRef = doc(db, 'availability', availabilityId);
      await updateDoc(availabilityRef, newData);
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  const handleAddAvailability = async () => {
    try {
      const newAvailability: Omit<Availability, 'id'> = {
        doctorId: user.uid,
        day: newAvailabilityDay,
        startTime: '09:00',
        endTime: '17:00'
      };
      await addDoc(collection(db, 'availability'), newAvailability);
      setNewAvailabilityDay('Monday'); 
    } catch (error) {
      console.error('Error adding availability:', error);
      alert('Failed to add availability. Please try again.');
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status: 'completed' });
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Failed to complete appointment. Please try again.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-4xl mx-auto"
    >
      <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold mb-6 text-[#EFEFED]">
        Welcome, Dr. {user.name}
      </motion.h2>
      <motion.div variants={itemVariants} className="bg-[#171B26] p-4 md:p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-4 text-[#EFEFED]">Upcoming Appointments</h3>
        {upcomingAppointments.length > 0 ? (
          <ul className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <motion.li
                key={appointment.id}
                variants={itemVariants}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#262A36] p-4 rounded-lg"
              >
                <span className="text-[#EFEFED] mb-2 sm:mb-0">
                  {appointment.patientName} - {appointment.date.toDate().toLocaleString()}
                </span>
                <ButtonStyling text="Complete" onClick={() => handleCompleteAppointment(appointment.id)} variant="secondary" className="w-full sm:w-auto mt-2 sm:mt-0" />
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-[#EFEFED]">No upcoming appointments</p>
        )}
      </motion.div>
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <ButtonStyling text="View Patient Records" onClick={handleViewPatientRecords} className="w-full sm:w-auto" />
        <ButtonStyling text="Manage Availability" onClick={handleManageAvailability} className="w-full sm:w-auto" />
      </motion.div>
      
      {isManagingAvailability && (
        <motion.div
          variants={itemVariants}
          className="mt-6 bg-[#171B26] p-4 md:p-6 rounded-lg"
        >
          <h3 className="text-xl font-semibold mb-4 text-[#EFEFED]">Manage Availability</h3>
          {availability.map(slot => (
            <div key={slot.id} className="mb-4 bg-[#262A36] p-4 rounded-lg">
              <p className="text-[#EFEFED] mb-2">{slot.day}</p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => handleUpdateAvailability(slot.id, { startTime: e.target.value })}
                  className="bg-[#171B26] text-[#EFEFED] p-2 rounded"
                />
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => handleUpdateAvailability(slot.id, { endTime: e.target.value })}
                  className="bg-[#171B26] text-[#EFEFED] p-2 rounded"
                />
              </div>
            </div>
          ))}
          <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={newAvailabilityDay}
              onChange={(e) => setNewAvailabilityDay(e.target.value)}
              className="bg-[#171B26] text-[#EFEFED] p-2 rounded"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <ButtonStyling text="Add Availability" onClick={handleAddAvailability} className="w-full sm:w-auto" />
          </div>
        </motion.div>
      )}
      <motion.div variants={itemVariants} className="mt-6">
        <SubmitReportComponent />
      </motion.div>
    </motion.div>
  );
};

export default DoctorDashboard;
