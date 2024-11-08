import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DoctorAppointmentComponent from './DoctorAppointmentComponent';
import PatientAppointmentComponent from './PatientAppointmentComponent';
import { motion } from 'framer-motion';

const AppointmentsComponent = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-[#EFEFED] p-4"
      >
        Please log in to access appointments.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      {user.role === 'doctor' ? (
        <DoctorAppointmentComponent user={user} />
      ) : (
        <PatientAppointmentComponent user={user} />
      )}
    </motion.div>
  );
};

export default AppointmentsComponent;