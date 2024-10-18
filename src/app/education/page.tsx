'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EducationComponent from '../../components/Education/EducationComponent';

const EducationPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center text-[#EFEFED]">Please log in to access educational resources.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#EFEFED]">Educational Resources</h1>
      <EducationComponent />
    </div>
  );
};

export default EducationPage;