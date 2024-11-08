import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, UserCredential } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '../../Firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import ButtonStyling from '../ButtonStyling';
import FacebookLogin from './FacebookLogin';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  role: 'patient' | 'doctor' | 'admin';
  onUserAuthenticated: (user: any, role: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ role, onUserAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('User authenticated:', userCredential.user.uid);

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      console.log('User document exists:', userDoc.exists());
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data:', userData);

        if (userData && userData.role === role) {
          console.log('User role matches:', role);
          onUserAuthenticated(userCredential.user, role);
        } else {
          console.log('User role mismatch. Expected:', role, 'Actual:', userData?.role);
          throw new Error(`This account is not registered as a ${role}. Please use the correct login form.`);
        }
      } else {
        console.log('User document does not exist');
        throw new Error('User data not found. Please contact support.');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (err instanceof FirebaseError) {
        setError(`Firebase error (${err.code}): ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message || 'An error occurred during login.');
      } else {
        setError('An unknown error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email to reset the password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent!');
      setError(null);
    } catch (err) {
      setError('Failed to send password reset email.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 pl-10 bg-[#262A36] text-[#EFEFED] rounded"
          required
        />
        <span className="absolute left-3 top-2 text-[#EFEFED]">📧</span>
      </div>

      <div className="relative">
        <input
          type={isPasswordVisible ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 pl-10 pr-10 bg-[#262A36] text-[#EFEFED] rounded"
          required
        />
        <span className="absolute left-3 top-2 text-[#EFEFED]">🔒</span>
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-2 text-[#EFEFED]"
        >
          {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <ButtonStyling text={`Login as ${role}`} disabled={isLoading} />

      {isLoading && <p className="text-center text-[#EFEFED]">Loading...</p>}

      <div className="text-center mt-4">
        <p className="text-[#EFEFED]">OR</p>
        <FacebookLogin role={role} isRegistration={false} />
      </div>

      <p className="text-center text-[#EFEFED] mt-4">
        Don't have an account? <Link href="/register" className="text-[#3B82F6]">Sign up</Link>
      </p>

      <p 
        className="text-center text-[#3B82F6] mt-2 cursor-pointer" 
        onClick={handlePasswordReset}
      >
        Forgot Password?
      </p>
    </form>
  );
}

export default LoginForm;
