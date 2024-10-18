'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminPanel from '../../components/Admin/AdminPanel';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/auth');
    return null;
  }

  if (user.email !== 'herbertyeboah123@gmail.com') {
    router.push('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#EFEFED]">Admin Dashboard</h1>
      <AdminPanel user={user} />
    </div>
  );
};

export default AdminPage;