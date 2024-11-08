'use client';

import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import DoctorDashboard from '../../../components/Dashboard/DoctorDashboard';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function DoctorDashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  
  if (!user || user.role !== 'doctor') {
    return null;
  }

  return <DoctorDashboard user={user} />;
}