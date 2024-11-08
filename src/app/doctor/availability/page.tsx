'use client';

import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import DoctorAvailabilityComponent from '../../../components/Appointments/DoctorAvailabilityComponent';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function DoctorAvailabilityPage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  
  if (!user || user.role !== 'doctor') {
    return null;
  }

  return <DoctorAvailabilityComponent doctorId={user.uid} />;
}