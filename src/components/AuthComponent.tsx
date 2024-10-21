'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';
import ButtonStyling from './ButtonStyling';
import { useAuth } from '../contexts/AuthContext';

const AuthComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { setUser } = useAuth();
  const router = useRouter();

  const setUserWithRole = (userData: any, role: string) => {
    const userWithRole = { ...userData, role };
    setUser(userWithRole);
    console.log('User logged in:', userWithRole);
    router.push('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto bg-[#171B26] p-8 rounded-lg shadow-md">
      <div className="flex justify-between mb-6">
        <ButtonStyling
          text="Login"
          onClick={() => setActiveTab('login')}
          variant={activeTab === 'login' ? 'primary' : 'secondary'}
        />
        <ButtonStyling
          text="Register"
          onClick={() => setActiveTab('register')}
          variant={activeTab === 'register' ? 'primary' : 'secondary'}
        />
      </div>
      {activeTab === 'login' ? (
        <LoginForm setUserWithRole={setUserWithRole} />
      ) : (
        <RegisterForm setUserWithRole={setUserWithRole} />
      )}
    </div>
  );
};

export default AuthComponent;
