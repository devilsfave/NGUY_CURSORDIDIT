'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminPanel from '../../components/Admin/AdminPanel';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const AdminPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(true);
      router.push('/auth');
    } else if (user.email !== 'herbertyeboah123@gmail.com') {
      setError('You do not have permission to access this page.');
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-[#EFEFED] text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

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
      <AdminPanel user={user} />
    </motion.div>
  );
};

export default AdminPage;
