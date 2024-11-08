import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../Firebase/config'; // Changed from firestore to db
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface PatientProfileFormProps {
  isEditing: boolean;
}

const PatientProfileForm: React.FC<PatientProfileFormProps> = ({ isEditing }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    dateOfBirth: '',
    gender: '',
    medicalHistory: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        if (!user?.uid) {
          throw new Error('User not authenticated');
        }

        const patientRef = doc(db, 'users', user.uid); // Changed from firestore to db
        const patientSnap = await getDoc(patientRef);

        if (patientSnap.exists()) {
          const patientData = patientSnap.data();
          setFormData(prevData => ({
            ...prevData,
            ...patientData
          }));
        } else {
          throw new Error('Patient profile does not exist');
        }
      } catch (error) {
        console.error('Error fetching patient profile:', error);
        toast.error('Failed to load profile data. Please try again.');
      }
    };

    fetchPatientProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'patient') {
      toast.error('Unauthorized operation');
      return;
    }
    setIsLoading(true);
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const patientRef = doc(db, 'users', user.uid); // Changed from firestore to db
      await setDoc(patientRef, {
        ...formData,
        role: 'patient',
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating patient profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-lg font-medium text-[#EFEFED]">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          className="w-full p-3 border rounded-lg bg-[#262A36] border-gray-600 text-[#EFEFED] placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          required
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="dateOfBirth" className="block text-lg font-medium text-[#EFEFED]">
          Date of Birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg bg-[#262A36] border-gray-600 text-[#EFEFED] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          required
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="gender" className="block text-lg font-medium text-[#EFEFED]">
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg bg-[#262A36] border-gray-600 text-[#EFEFED] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          required
          disabled={!isEditing}
        >
          <option value="">Select your gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="medicalHistory" className="block text-lg font-medium text-[#EFEFED]">
          Medical History
        </label>
        <textarea
          id="medicalHistory"
          name="medicalHistory"
          value={formData.medicalHistory}
          onChange={handleChange}
          placeholder="Enter any relevant medical history..."
          className="w-full p-3 border rounded-lg bg-[#262A36] border-gray-600 text-[#EFEFED] placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          rows={4}
          disabled={!isEditing}
        />
      </div>

      {isEditing && (
        <button 
          type="submit" 
          className="w-full p-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition duration-200 transform hover:scale-[1.02]"
          disabled={isLoading}
        >
          {isLoading ? 'Updating Profile...' : 'Save Changes'}
        </button>
      )}
    </form>
  );
};

export default PatientProfileForm;
