import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db }from '../../Firebase/config';
import ButtonStyling from '../ButtonStyling';

interface DoctorProfileFormProps {
  isEditing: boolean;
}

const DoctorProfileForm: React.FC<DoctorProfileFormProps> = ({ isEditing }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    location: '',
    verified: false,
    email: user?.email || '',
    uid: user?.uid || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      setError(null);
      try {
        if (!user?.uid) {
          throw new Error('User not authenticated');
        }

        const doctorRef = doc(db, 'doctors', user.uid);
        const doctorSnap = await getDoc(doctorRef);

        if (doctorSnap.exists()) {
          const doctorData = doctorSnap.data();
          setFormData(prevData => ({
            ...prevData,
            ...doctorData
          }));
        } else {
          // If doctor document doesn't exist, create it with basic info
          const basicDoctorData = {
            fullName: user.displayName || '',
            email: user.email || '',
            uid: user.uid,
            verified: false,
            createdAt: new Date().toISOString()
          };
          await setDoc(doctorRef, basicDoctorData);
          setFormData(prevData => ({
            ...prevData,
            ...basicDoctorData
          }));
        }
      } catch (error) {
        console.error('Error fetching doctor profile:', error);
        setError('Failed to load profile data. Please try again.');
        toast.error('Failed to load profile data. Please try again.');
      }
    };

    fetchDoctorProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const doctorRef = doc(db, 'doctors', user.uid);
      await setDoc(doctorRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      setError('Failed to update profile. Please try again.');
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-100 rounded">
        {error}
        <ButtonStyling 
          text="Retry" 
          onClick={() => window.location.reload()} 
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-[#EFEFED] text-sm font-medium">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
            required
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="specialization" className="block text-[#EFEFED] text-sm font-medium">
            Specialization
          </label>
          <input
            id="specialization"
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            placeholder="e.g., Dermatologist"
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
            required
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="licenseNumber" className="block text-[#EFEFED] text-sm font-medium">
            License Number
          </label>
          <input
            id="licenseNumber"
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="Enter your medical license number"
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
            required
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="experience" className="block text-[#EFEFED] text-sm font-medium">
            Years of Experience
          </label>
          <input
            id="experience"
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Years of medical practice"
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
            required
            min="0"
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="block text-[#EFEFED] text-sm font-medium">
            Location
          </label>
          <input
            id="location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, Country"
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
            required
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-[#EFEFED] text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded cursor-not-allowed"
            disabled
          />
        </div>
      </div>
      
      {isEditing && (
        <ButtonStyling 
          text={isLoading ? "Updating..." : "Update Profile"}
          onClick={() => handleSubmit(new Event('click') as unknown as React.MouseEvent)}
          disabled={isLoading}
          className="w-full mt-6"
        />
      )}
    </form>
  );
};

export default DoctorProfileForm;
