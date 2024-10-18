'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthComponent from '../../components/AuthComponent';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#EFEFED]">Welcome to DermaVision</h1>
      <AuthComponent />
    </div>
  );
}