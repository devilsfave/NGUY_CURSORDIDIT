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
  role: 'patient' | 'doctor';
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.fullName });

      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        role,
        ...(role === 'doctor' && {
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization,
          location: formData.location,
          isVerified: false,
        }),
      };

      await setDoc(doc(db, role === 'doctor' ? 'doctors' : 'patients', user.uid), userData);

      setUserWithRole(user, role);
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Failed to register. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
        className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
        className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
      />
      <input
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm Password"
        required
        className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
      />
      <input
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Full Name"
        required
        className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
      />
      {role === 'doctor' && (
        <>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="License Number"
            required
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
          />
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            placeholder="Specialization"
            required
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            required
            className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
          />
        </>
      )}
      <ButtonStyling text="Register" type="submit" />
      <FacebookLogin setUserWithRole={setUserWithRole} role={role} isRegistration={true} />
    </form>
  );
};

export default RegisterForm;