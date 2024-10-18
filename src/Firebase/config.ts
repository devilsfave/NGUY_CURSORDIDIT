import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Firestore } from 'firebase/firestore';
import { getAuth, FacebookAuthProvider, signInWithPopup, Auth, UserCredential } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  firestore = getFirestore(app);
  auth = getAuth(app);
} else {
  app = getApps()[0];
  firestore = getFirestore(app);
  auth = getAuth(app);
}

export { firestore, auth };

export const signInWithFacebookCredential = async (accessToken: string): Promise<UserCredential> => {
  const credential = FacebookAuthProvider.credential(accessToken);
  return signInWithPopup(auth, new FacebookAuthProvider());
};

export const saveAnalysisToFirestore = async (prediction: Record<string, number>, imageUri: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('No authenticated user');
  }

  const analysisRef = doc(firestore, 'users', auth.currentUser.uid, 'analyses', new Date().toISOString());
  await setDoc(analysisRef, {
    prediction,
    imageUri,
    timestamp: new Date()
  });
};