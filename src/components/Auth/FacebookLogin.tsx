import React from 'react';
import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../Firebase/config';
import { useAuth, User } from '../../contexts/AuthContext';

interface FacebookLoginProps {
  role: 'patient' | 'doctor' | 'admin';
  isRegistration: boolean;
}

const FacebookLogin: React.FC<FacebookLoginProps> = ({ role, isRegistration }) => {
  const { setUser } = useAuth();

  const handleFacebookLogin = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (!result.user) throw new Error('No user data returned');

      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists() && !isRegistration) {
        throw new Error('No account found. Please register first.');
      }

      if (userDoc.exists() && isRegistration) {
        throw new Error('Account already exists. Please login instead.');
      }

      // For registration, create new user document
      if (isRegistration) {
        const userData: User = {
          uid: result.user.uid,
          email: result.user.email,
          role: role,
          fullName: result.user.displayName || 'Facebook User',
          name: result.user.displayName || 'Facebook User',
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          emailVerified: result.user.emailVerified
        };

        // Save to users collection with additional Firestore fields
        await setDoc(doc(db, 'users', result.user.uid), {
          ...userData,
          createdAt: new Date(),
          authProvider: 'facebook'
        });

        // Save to role-specific collection
        await setDoc(doc(db, role === 'doctor' ? 'doctors' : 'patients', result.user.uid), {
          ...userData,
          createdAt: new Date(),
          authProvider: 'facebook'
        });

        setUser(userData);
      } else {
        // For login, verify role
        const userData = userDoc.data() as User;
        if (userData?.role !== role) {
          throw new Error(`This account is not registered as a ${role}. Please use the correct login form.`);
        }
        setUser(userData);
      }

    } catch (error) {
      console.error('Facebook login error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during Facebook login');
    }
  };

  // Don't show Facebook login for admin role
  if (role === 'admin') return null;

  return (
    <button
      onClick={handleFacebookLogin}
      className="bg-[#1877F2] text-white py-2 px-4 rounded-lg hover:bg-[#166FE5] transition-colors w-full flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.989 4.388 10.952 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 22.952 24 17.989 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
      {isRegistration ? 'Sign up with Facebook' : 'Login with Facebook'}
    </button>
  );
};

export default FacebookLogin;