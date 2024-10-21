import React, { useState, useEffect } from 'react';
import { signInWithFacebookCredential, firestore as db } from '../../Firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

declare const FB: any;

interface FacebookLoginProps {
  setUserWithRole: (user: { name: string | null; email: string | null }, role: string) => void;
  role: 'patient' | 'doctor';
  isRegistration: boolean;
}

const FacebookLogin: React.FC<FacebookLoginProps> = ({ setUserWithRole, role, isRegistration }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.fbAsyncInit = function() {
      FB.init({
        appId: '538566685170693',
        cookie: true,
        xfbml: true,
        version: 'v20.0'
      });
    };

    (function(d, s, id) {
      var js: HTMLScriptElement, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      }
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  const handleFacebookLogin = () => {
    setIsLoading(true);
    FB.login(function(response: fb.StatusResponse) {
      if (response.authResponse) {
        console.log('Facebook login successful:', response);
        responseFacebook(response.authResponse);
      } else {
        console.log('User cancelled login or did not fully authorize.');
        setIsLoading(false);
      }
    }, {scope: 'public_profile,email'});
  };

  const responseFacebook = async (authResponse: fb.AuthResponse) => {
    if (authResponse.accessToken) {
      try {
        const user = await signInWithFacebookCredential(authResponse.accessToken);
        console.log('User from Facebook login:', user);
        
        if (isRegistration) {
          const userDoc = await getDoc(doc(db, role === 'doctor' ? 'doctors' : 'patients', user.user.uid));
          
          if (userDoc.exists()) {
            console.log('User already exists:', userDoc.data());
            alert('User already exists. Please log in instead.');
            setIsLoading(false);
            return;
          }

          const userData = {
            fullName: user.user.displayName,
            email: user.user.email,
            role,
            ...(role === 'doctor' && { isVerified: false }),
          };
          await setDoc(doc(db, role === 'doctor' ? 'doctors' : 'patients', user.user.uid), userData);
          console.log('New user registered:', userData);
          alert(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully with Facebook.${role === 'doctor' ? ' Verification is pending.' : ''}`);
        } else {
          const userDoc = await getDoc(doc(db, role === 'doctor' ? 'doctors' : 'patients', user.user.uid));
          
          if (!userDoc.exists()) {
            console.log('User not found in', role === 'doctor' ? 'doctors' : 'patients', 'collection');
            alert(`No ${role} account found. Please register or choose the correct role.`);
            setIsLoading(false);
            return;
          }
          console.log('User logged in:', userDoc.data());
        }

        console.log('Setting user with role:', role);
        setUserWithRole(
          { name: user.user.displayName, email: user.user.email },
          role
        );
      } catch (error) {
        console.error('Facebook login error:', error);
        if (error instanceof Error) {
          alert(`An error occurred during Facebook login: ${error.message}`);
        } else {
          alert('An unknown error occurred during Facebook login. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Facebook login failed: No access token');
      alert('Facebook login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFacebookLogin}
      className="w-full p-2 bg-[#3b5998] text-white rounded flex items-center justify-center"
      disabled={isLoading}
    >
      {isLoading ? (
        'Loading...'
      ) : (
        <>
          <span className="mr-2 bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">f</span> Continue with Facebook
        </>
      )}
    </button>
  );
};

export default FacebookLogin;