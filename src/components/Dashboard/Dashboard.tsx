import React, { useState, useEffect } from 'react';
import { firestore as db } from '../../Firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import { motion } from 'framer-motion';

interface User {
  uid: string;
  name: string;
  role: 'patient' | 'doctor';
}

interface DashboardProps {
  user: {
    uid: string;
    name: string;
    role?: 'patient' | 'doctor';
  };
}

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <motion.div
      className="h-16 w-16 border-t-4 border-blue-500 border-solid rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user && user.role) {
          // User already has a role, no need to fetch from Firestore
          setIsLoading(false);
        } else if (user) {
          // Fetch user data from Firestore if role is not present
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            user.role = userData.role as 'patient' | 'doctor';
          } else {
            console.error('User document not found');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !user.role) {
    return <div className="text-center text-[#EFEFED]">Error: User role not found</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-8"
    >
      {user.role === 'doctor' ? (
        <DoctorDashboard user={user as User} />
      ) : (
        <PatientDashboard user={user as User} />
      )}
    </motion.div>
  );
};

export default Dashboard;