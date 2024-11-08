'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DoctorProfileForm from '../../components/Profile/DoctorProfileForm';
import PatientProfileForm from '../../components/Profile/PatientProfileForm';
import AdminProfileForm from '../../components/Profile/AdminProfileForm';
import { useRouter } from 'next/navigation';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {user.role === 'doctor' ? (
        <DoctorProfileForm isEditing={isEditing} />
      ) : user.role === 'patient' ? (
        <PatientProfileForm isEditing={isEditing} />
      ) : user.role === 'admin' ? (
        <AdminProfileForm isEditing={isEditing} />
      ) : (
        <p>Invalid user role</p>
      )}
      <button 
        className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? 'Cancel Editing' : 'Edit Profile'}
      </button>
    </div>
  );
};

export default ProfilePage;
