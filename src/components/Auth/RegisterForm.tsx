import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore as db } from '../../Firebase/config';
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
}

interface RegisterFormProps {
  setUserWithRole: (user: any, role: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ setUserWithRole }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    licenseNumber: '',
    specialization: '',
    location: '',
  });
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
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

    const { email, password, confirmPassword, fullName, licenseNumber, specialization, location } = formData;

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
        ...(role === 'doctor' && { licenseNumber, specialization, location, verified: false }),
      };

      // Save user to Firestore based on role (either 'doctors' or 'patients' collection)
      await setDoc(doc(db, role === 'doctor' ? 'doctors' : 'patients', userCredential.user.uid), userData);

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
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
      <div className="flex justify-center space-x-4 mb-4">
        <ButtonStyling
          text="Patient"
          onClick={() => setRole('patient')}
          variant={role === 'patient' ? 'primary' : 'secondary'}
        />
        <ButtonStyling
          text="Doctor"
          onClick={() => setRole('doctor')}
          variant={role === 'doctor' ? 'primary' : 'secondary'}
        />
      </div>

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

      <ButtonStyling text="Register" onClick={() => handleSubmit()} disabled={isLoading} />
      
      <div className="text-center mt-4">
        <p className="text-[#EFEFED]">Or register with</p>
        <FacebookLogin setUserWithRole={setUserWithRole} role={role} isRegistration={true} />
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {isLoading && <p className="text-[#EFEFED]">Loading...</p>}
    </form>
  );
};

export default RegisterForm;