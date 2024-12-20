import React, { useState, useEffect } from 'react';
import ButtonStyling from '../ButtonStyling';
import Link from 'next/link';
import { auth, db } from '../../Firebase/config'; // Changed from firestore to db
import { signOut, updateProfile } from 'firebase/auth'; 
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { User as FirebaseUser } from 'firebase/auth';
import DoctorProfileForm from './DoctorProfileForm';
import PatientProfileForm from './PatientProfileForm';
import AdminProfileForm from './AdminProfileForm'; 

interface User extends FirebaseUser {
  name?: string;
}

interface ProfileComponentProps {
  user: User;
  setUser: (user: User | null) => void;
  role: 'patient' | 'doctor' | 'admin';
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ user, setUser, role }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.displayName || user.name || '');
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error("Error logging out:", error);
      alert('An error occurred while logging out. Please try again.');
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: editedName });
        await updateDoc(doc(db, 'users', user.uid), { displayName: editedName }); // Changed from firestore to db
        setUser({ ...user, displayName: editedName });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('An error occurred while updating your profile. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="text-center text-[#EFEFED]">Loading...</div>;
  }

  return (
    <section id="profile" className="my-8 bg-[#262A36] p-4 rounded-lg">
      <div className="p-4 rounded-lg bg-[#171B26]">
        <img 
          src={user.photoURL || 'https://via.placeholder.com/150'} 
          alt="Profile" 
          className="w-24 h-24 rounded-full mb-4"
        />
        {isEditing ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="bg-[#262A36] text-[#EFEFED] p-2 rounded mb-2"
          />
        ) : (
          <h3 className="text-lg text-[#EFEFED]">
            Welcome, {user.displayName || user.name || 'User'}!
          </h3>
        )}
        <p className="text-[#9C9FA4]">{user.email}</p>
        
        <div className="mt-4 space-y-2">
          {isEditing ? (
            <ButtonStyling text="Save Profile" onClick={handleSaveProfile} />
          ) : (
            <ButtonStyling text="Edit Profile" onClick={handleEditProfile} />
          )}
          <button 
            className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <Link href="/terms-of-service" className="text-blue-500 hover:underline block">
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="text-blue-500 hover:underline block">
            Privacy Policy
          </Link>
        </div>
        
        {role === 'doctor' && <DoctorProfileForm isEditing={isEditing} />}
        {role === 'patient' && <PatientProfileForm isEditing={isEditing} />}
        {role === 'admin' && <AdminProfileForm isEditing={isEditing} />}
      </div>
    </section>
  );
};

export default ProfileComponent;
