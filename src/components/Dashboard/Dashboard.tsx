import React, { useState, useEffect } from 'react';
import { firestore as db } from '../../Firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';

interface User {
  uid: string;
  name: string;
  role: 'patient' | 'doctor';
}

interface DashboardProps {
  user: {
    uid: string;
    name: string;
  };
}

// Simple inline LoadingSpinner component
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role as 'patient' | 'doctor');
        } else {
          console.error('User document not found');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user.uid]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (userRole === 'doctor') {
    return <DoctorDashboard user={user as User} />;
  } else if (userRole === 'patient') {
    return <PatientDashboard user={user as User} />;
  } else {
    return <div>Error: User role not found</div>;
  }
};

export default Dashboard;