'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AppointmentBooking from '../../components/Appointments/AppointmentsComponent';
import DoctorListComponent from '../../components/Appointments/DoctorListComponent';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; name: string } | null>(null);

  if (!user) {
    return <div className="text-center text-[#EFEFED]">Please log in to view appointments.</div>;
  }

  const handleDoctorSelect = (doctorId: string, doctorName: string) => {
    setSelectedDoctor({ id: doctorId, name: doctorName });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#EFEFED]">Appointments</h1>
      {!selectedDoctor ? (
        <DoctorListComponent onDoctorSelect={handleDoctorSelect} />
      ) : (
        <AppointmentBooking user={user} doctorId={selectedDoctor.id} doctorName={selectedDoctor.name} />
      )}
    </div>
  );
};

export default AppointmentsPage;