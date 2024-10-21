import React, { useState, useEffect } from 'react';
import { firestore as db } from '../../Firebase/config';
import ButtonStyling from '../ButtonStyling';
import { collection, query, where, getDocs, Timestamp, onSnapshot } from 'firebase/firestore';
import AppointmentBooking from '../Appointments/AppointmentsComponent';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import SubmitReportComponent from '../UserReport/SubmitReportComponent';

interface User {
  uid: string;
  name: string;
}

interface Appointment {
  id: string;
  doctorName: string;
  date: Timestamp;
}

interface Doctor {
  id: string;
  name: string;
}

interface PatientDashboardProps {
  user: User;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const router = useRouter();

  useEffect(() => {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('patientId', '==', user.uid),
      where('date', '>=', new Date())
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Appointment));
      setUpcomingAppointments(appointments);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleBookAppointment = async () => {
    try {
      const doctorsRef = collection(db, 'doctors');
      const q = query(doctorsRef, where('isVerified', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doctorDoc = querySnapshot.docs[0];
        setSelectedDoctor({ id: doctorDoc.id, name: doctorDoc.data().fullName });
      } else {
        console.error('No verified doctors found');
        alert('No doctors are currently available for booking. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      alert('An error occurred while fetching doctor data. Please try again.');
    }
  };

  const handleViewAnalysisHistory = () => {
    router.push('/analysis-history');
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
        Welcome, {user.name}
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
                  Dr. {appointment.doctorName} - {appointment.date.toDate().toLocaleString()}
                </span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-[#EFEFED]">No upcoming appointments</p>
        )}
      </motion.div>
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <ButtonStyling text="Book Appointment" onClick={handleBookAppointment} className="w-full sm:w-auto" />
        <ButtonStyling text="View Analysis History" onClick={handleViewAnalysisHistory} className="w-full sm:w-auto" />
      </motion.div>
      {selectedDoctor && (
        <motion.div variants={itemVariants} className="mt-6">
          <AppointmentBooking user={user} doctorId={selectedDoctor.id} doctorName={selectedDoctor.name} />
        </motion.div>
      )}
      <motion.div variants={itemVariants} className="mt-6">
        <SubmitReportComponent />
      </motion.div>
    </motion.div>
  );
};

export default PatientDashboard;
