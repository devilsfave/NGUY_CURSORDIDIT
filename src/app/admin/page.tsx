'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminPanel from '../../components/Admin/AdminPanel';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const AdminPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else if (user.email !== 'herbertyeboah123@gmail.com') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.email !== 'herbertyeboah123@gmail.com') {
    return null;
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
        Admin Dashboard
      </motion.h1>
      <AdminPanel user={{ email: user.email || '' }} />
    </motion.div>
  );
};

export default AdminPage;