'use client';

import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { motion } from 'framer-motion';
import ErrorBoundary from '../../../components/common/ErrorBoundary';
import SectionLoader from '../../../components/common/SectionLoader';

export default function DoctorAnalysisPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SectionLoader text="Loading..." />;
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-red-500">
        Please log in to view analysis history
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4"
      >
        <h1 className="text-2xl font-bold mb-6">Analysis History</h1>
        {/* Add your analysis history component here */}
      </motion.div>
    </ErrorBoundary>
  );
}