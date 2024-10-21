'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EducationComponent from '../../components/Education/EducationComponent';
import { motion } from 'framer-motion';

const EducationPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-[#EFEFED] p-4"
      >
        Please log in to access educational resources.
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
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-6 text-[#EFEFED]"
      >
        Educational Resources
      </motion.h1>
      <EducationComponent />
    </motion.div>
  );
};

export default EducationPage;