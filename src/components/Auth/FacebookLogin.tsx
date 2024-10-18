import React from 'react';
import { signInWithFacebookCredential, firestore as db } from '../../Firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface FacebookLoginProps {
  setUserWithRole: (user: { name: string | null; email: string | null }, role: string) => void;
  role: 'patient' | 'doctor';
  isRegistration: boolean;
}

const FacebookLogin: React.FC<FacebookLoginProps> = ({ setUserWithRole, role, isRegistration }) => {
  const handleFacebookLogin = () => {
    if (typeof window !== 'undefined' && (window as any).FB) {
      (window as any).FB.login((response: fb.StatusResponse) => {
        if (response.authResponse) {
          responseFacebook(response.authResponse);
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      }, { scope: 'public_profile,email' });
    } else {
      console.error('Facebook SDK not loaded');
      alert('Facebook login is not available at the moment. Please try again later.');
    }
  };

  const responseFacebook = async (authResponse: fb.AuthResponse) => {
    if (authResponse.accessToken) {
      try {
        const user = await signInWithFacebookCredential(authResponse.accessToken);
        
        if (isRegistration) {
          // Check if user already exists
          const userDoc = await getDoc(doc(db, role === 'doctor' ? 'doctors' : 'patients', user.user.uid));
          
          if (userDoc.exists()) {
            alert('User already exists. Please log in instead.');
            return;
          }

          // Save new user to Firestore
          const userData = {
            fullName: user.user.displayName,
            email: user.user.email,
            role,
            ...(role === 'doctor' && { verified: false }),
          };
          await setDoc(doc(db, role === 'doctor' ? 'doctors' : 'patients', user.user.uid), userData);
          alert(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully with Facebook.${role === 'doctor' ? ' Verification is pending.' : ''}`);
        } else {
          // For login, check if user exists in the correct collection
          const userDoc = await getDoc(doc(db, role === 'doctor' ? 'doctors' : 'patients', user.user.uid));
          
          if (!userDoc.exists()) {
            alert(`No ${role} account found. Please register or choose the correct role.`);
            return;
          }
        }

        setUserWithRole(
          { name: user.user.displayName, email: user.user.email },
          role
        );
      } catch (error) {
        console.error('Facebook login error:', error);
        alert('An error occurred during Facebook login. Please try again.');
      }
    } else {
      alert('Facebook login failed. Please try again.');
    }
  };

  return (
    <button
      onClick={handleFacebookLogin}
      className="w-full p-2 bg-[#3b5998] text-white rounded flex items-center justify-center"
    >
      <span className="mr-2">🔵</span> Continue with Facebook
    </button>
  );
};

export default FacebookLogin;