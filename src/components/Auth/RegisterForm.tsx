import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../Firebase/config';
import ButtonStyling from '../ButtonStyling';
import FacebookLogin from './FacebookLogin';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  licenseNumber: string;
  specialization: string;
  location: string;
  adminCode?: string;
}

interface RegisterFormProps {
  setUserWithRole: (user: any, role: string) => void;
  role: 'patient' | 'doctor' | 'admin';
}

// Add interface for doctor data
interface DoctorRegistrationData {
  fullName: string;
  email: string;
  role: string;
  licenseNumber: string;
  specialization: string;
  location: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ setUserWithRole, role }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    licenseNumber: '',
    specialization: '',
    location: '',
    adminCode: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setError(null);
    setIsLoading(true);

    const { email, password, confirmPassword, fullName, licenseNumber, specialization, location, adminCode } = formData;

    // Input validation
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }
    if (role === 'doctor' && (!licenseNumber || !specialization || !location)) {
      setError('Doctors must provide all required details.');
      setIsLoading(false);
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });

      const userData = {
        fullName,
        email,
        role,
        createdAt: new Date(),
        ...(role === 'doctor' && { licenseNumber, specialization, location, verified: false }),
        ...(role === 'admin' && { adminCode }),
      };

      // Save user to 'users' collection
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Save user to role-specific collection
      await setDoc(doc(db, role === 'doctor' ? 'doctors' : 'patients', userCredential.user.uid), userData);

      // Set custom claims (role) for the user
      // Note: This should be done on the server-side for security reasons
      // For now, we'll just log a message
      console.log(`Role ${role} should be set for user ${userCredential.user.uid} on the server`);

      // Call setUserWithRole function
      setUserWithRole({ ...userData, uid: userCredential.user.uid }, role);
      alert(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully.${role === 'doctor' ? ' Verification is pending.' : ''}`);
    } catch (error) {
      console.error('Registration error:', error);
      setError((error as Error).message || 'An error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Update the function with proper typing
  const handleDoctorRegistration = async (data: DoctorRegistrationData) => {
    const doctorData = {
      ...data,
      verified: false,
      role: 'doctor' as const
    };
    return doctorData;
  };

  const validateRole = (role: string) => {
    return ['patient', 'doctor'].includes(role);
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
      <input
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Full Name"
        className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
        required
      />
      <input
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm Password"
        className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
        required
      />

      {role === 'doctor' && (
        <>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="License Number"
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
            required
          />
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            placeholder="Specialization"
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
            required
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
            required
          />
        </>
      )}

      {role === 'admin' && (
        <input
          type="text"
          name="adminCode"
          value={formData.adminCode || ''}
          onChange={handleChange}
          placeholder="Admin Registration Code"
          className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
          required
        />
      )}

      <ButtonStyling text="Register" onClick={() => handleSubmit()} disabled={isLoading} />
      
      {role !== 'admin' && (
        <div className="text-center mt-4">
          <p className="text-[#EFEFED]">OR</p>
          <FacebookLogin role={role} isRegistration={true} />
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}
      {isLoading && <p className="text-[#EFEFED]">Loading...</p>}
    </form>
  );
};

export default RegisterForm;
