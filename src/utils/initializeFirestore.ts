import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase/config';
import { updateAnalysisSchema } from '../scripts/updateAnalysisSchema';

export const initializeFirestore = async () => {
  try {
    // Check if initialization has already been done
    const initDoc = await getDoc(doc(db, 'system', 'init'));
    if (initDoc.exists()) {
      console.log('Firestore already initialized');
      return;
    }

    // Create users collection
    await setDoc(doc(db, 'users', 'placeholder'), {
      email: 'placeholder@example.com',
      role: 'patient',
      createdAt: new Date()
    });

    // Mark initialization as complete
    await setDoc(doc(db, 'system', 'init'), {
      initialized: true,
      timestamp: new Date()
    });

    // Run schema update for existing analyses
    await updateAnalysisSchema();

    console.log('Firestore collections initialized successfully');
  } catch (error) {
    console.error('Error initializing Firestore collections:', error);
    throw error;
  }
};

// Execute the function when the script is run directly
if (require.main === module) {
  initializeFirestore().then(() => process.exit());
}