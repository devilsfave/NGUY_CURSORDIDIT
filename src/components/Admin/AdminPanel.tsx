import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { firestore as db } from '../../Firebase/config';
import ButtonStyling from '../ButtonStyling';
import { User } from 'firebase/auth';

interface Doctor {
  id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
}

interface AdminPanelProps {
  user: User;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnverifiedDoctors();
  }, []);

  const loadUnverifiedDoctors = async () => {
    try {
      const q = query(collection(db, 'doctors'), where('isVerified', '==', false));
      const querySnapshot = await getDocs(q);
      const unverifiedDoctors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
      setDoctors(unverifiedDoctors);
    } catch (error) {
      console.error('Error loading unverified doctors:', error);
      alert('Failed to load unverified doctors.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (doctorId: string) => {
    try {
      await updateDoc(doc(db, 'doctors', doctorId), { isVerified: true });
      alert('Doctor verified successfully.');
      loadUnverifiedDoctors();
    } catch (error) {
      console.error('Error verifying doctor:', error);
      alert('Failed to verify doctor.');
    }
  };

  const handleRejectDoctor = async (doctorId: string) => {
    try {
      await deleteDoc(doc(db, 'doctors', doctorId));
      alert('Doctor rejected and deleted successfully.');
      loadUnverifiedDoctors();
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      alert('Failed to reject doctor.');
    }
  };

  if (loading) {
    return <div className="text-center text-[#EFEFED]">Loading...</div>;
  }

  return (
    <div className="p-4 bg-[#171B26] text-[#EFEFED]">
      <h2 className="text-2xl font-bold mb-4">Unverified Doctors</h2>
      {doctors.length === 0 ? (
        <p>No unverified doctors available</p>
      ) : (
        <div>
          {doctors.map(doctor => (
            <div key={doctor.id} className="mb-4 p-2 border border-[#262A36] rounded">
              <h3 className="text-lg font-bold">{doctor.fullName}</h3>
              <p>{doctor.email}</p>
              <div className="mt-2 flex space-x-2">
                <ButtonStyling 
                  text="Verify" 
                  onClick={() => handleVerifyDoctor(doctor.id)} 
                  className="bg-green-500 hover:bg-green-600"
                />
                <ButtonStyling 
                  text="Reject" 
                  onClick={() => handleRejectDoctor(doctor.id)} 
                  className="bg-red-500 hover:bg-red-600"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;