import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ButtonStyling from '../ButtonStyling';
import { useAuth } from '../../contexts/AuthContext';

const AuthComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const { setUser } = useAuth();
  const router = useRouter();

  const setUserWithRole = (user: any, userRole: string) => {
    setUser({ ...user, role: userRole });
    router.push('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-[#171B26] rounded-lg shadow-lg">
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 ${activeTab === 'login' ? 'bg-[#3B82F6] text-white' : 'bg-[#262A36] text-[#9C9FA4]'} rounded-l-lg`}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button
          className={`flex-1 py-2 ${activeTab === 'register' ? 'bg-[#3B82F6] text-white' : 'bg-[#262A36] text-[#9C9FA4]'} rounded-r-lg`}
          onClick={() => setActiveTab('register')}
        >
          Register
        </button>
      </div>
      <div className="mb-4">
        <label className="block text-[#EFEFED] mb-2">Role:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'patient' | 'doctor')}
          className="w-full p-2 bg-[#262A36] text-[#EFEFED] rounded"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
      </div>
      {activeTab === 'login' ? (
        <LoginForm setUserWithRole={setUserWithRole} role={role} />
      ) : (
        <RegisterForm setUserWithRole={setUserWithRole} role={role} />
      )}
    </div>
  );
};

export default AuthComponent;