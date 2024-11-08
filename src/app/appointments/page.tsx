'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DoctorAppointmentComponent from '../../components/Appointments/DoctorAppointmentComponent';
import PatientAppointmentComponent from '../../components/Appointments/PatientAppointmentComponent';
import { motion } from 'framer-motion';

const AppointmentsPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6 text-[#EFEFED]">Appointments</h1>
      {user.role === 'doctor' ? (
        <DoctorAppointmentComponent user={user} />
      ) : (
        <PatientAppointmentComponent user={user} />
      )}
    </motion.div>
  );
};

export default AppointmentsPage;