import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import PatientRecords from '../../components/PatientRecordsComponent';
import { useRouter } from 'next/navigation';

const PatientRecordsPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  if (user.role !== 'doctor') {
    router.push('/dashboard');
    return null;
  }

  return (
    <DashboardLayout 
      user={user}
      title="Patient Records"
    >
      <PatientRecords />
    </DashboardLayout>
  );
};

export default PatientRecordsPage;