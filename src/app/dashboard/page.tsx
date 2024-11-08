'use client';

import React from 'react';
import Dashboard from '../../components/Dashboard/Dashboard';
import { useAuth } from '../../contexts/AuthContext';
import SectionLoader from '../../components/common/SectionLoader';

const DashboardPage = () => {
  const { loading } = useAuth();

  if (loading) {
    return <SectionLoader text="Loading dashboard..." />;
  }

  return <Dashboard />;
};

export default DashboardPage;
