'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileComponent from '../../components/Profile/ProfileComponent';
import { useRouter } from 'next/navigation';
import { User as FirebaseUser } from 'firebase/auth';

interface User extends FirebaseUser {
  name?: string;
}

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#EFEFED]">Your Profile</h1>
      <ProfileComponent user={user as User} setUser={setUser as (user: User | null) => void} />
    </div>
  );
};

export default ProfilePage;