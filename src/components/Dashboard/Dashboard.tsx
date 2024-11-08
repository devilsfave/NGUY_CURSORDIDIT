import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';
import SectionLoader from '../common/SectionLoader';
import DashboardLayout from './shared/DashboardLayout';
import { Timestamp } from 'firebase/firestore';
import type { User } from '@/types/user';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) return <SectionLoader text="Loading dashboard..." />;
  if (!user) return <div className="text-center text-[#EFEFED] p-4">Please log in to access the dashboard.</div>;

  const enrichUserData = (userData: any): User => {
    return {
      uid: userData.uid || '',
      email: userData.email || '',
      role: userData.role || 'patient',
      createdAt: userData.createdAt || Timestamp.now(),
      updatedAt: userData.updatedAt || new Date().toISOString(),
      fullName: userData.fullName || '',
      displayName: userData.displayName || null,
      verified: userData.verified || false,
      licenseNumber: userData.licenseNumber || undefined,
      specialization: userData.specialization || undefined,
      location: userData.location || undefined,
      gender: userData.gender || undefined,
      dateOfBirth: userData.dateOfBirth || undefined,
      medicalHistory: userData.medicalHistory || undefined
    };
  };

  switch (user.role) {
    case 'patient':
      return (
        <DashboardLayout 
          key={`patient-dashboard-${user.uid}`}
          user={enrichUserData(user)}
          title="Patient Dashboard"
        >
          <PatientDashboard user={enrichUserData(user)} />
        </DashboardLayout>
      );
    case 'doctor':
      return (
        <DashboardLayout 
          key={`doctor-dashboard-${user.uid}`}
          user={enrichUserData(user)}
          title="Doctor Dashboard"
        >
          <DoctorDashboard user={enrichUserData(user)} />
        </DashboardLayout>
      );
    case 'admin':
      return (
        <DashboardLayout 
          key={`admin-dashboard-${user.uid}`}
          user={enrichUserData(user)}
          title="Admin Dashboard"
        >
          <AdminDashboard user={enrichUserData(user)} />
        </DashboardLayout>
      );
    default:
      return null;
  }
};

export default Dashboard;