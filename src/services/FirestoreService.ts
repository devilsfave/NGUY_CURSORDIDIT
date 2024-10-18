import { firestore as db } from '../Firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  orderBy,
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';

interface Prediction {
  [key: string]: number;
}

interface HistoryItem {
  date: string;
  prediction: Prediction;
  imageUri: string;
}

export interface Doctor extends DocumentData {
  id: string;
  role: string;
  verificationStatus: string;
  specialization?: string;
  location?: string;
  rating?: number;
  name?: string;
  email?: string;
  // Add any other properties that might be in the doctor document
}

interface DoctorFilter {
  specialization?: string;
  location?: string;
}

// Function to save analysis to Firestore
export const saveAnalysisToFirestore = async (prediction: Prediction, imageUri: string, userId: string): Promise<void> => {
  try {
    const historyItem: HistoryItem = {
      date: new Date().toISOString(),
      prediction,
      imageUri,
    };
    const userHistoryRef = collection(db, 'users', userId, 'analysisHistory');
    await addDoc(userHistoryRef, historyItem);
  } catch (error) {
    console.error('Error saving analysis to Firestore:', error);
    throw error;
  }
};

// Function to load analysis history from Firestore
export const loadAnalysisHistoryFromFirestore = async (userId: string): Promise<(HistoryItem & { id: string })[]> => {
  try {
    const userHistoryRef = collection(db, 'users', userId, 'analysisHistory');
    const q = query(userHistoryRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryItem & { id: string }));
  } catch (error) {
    console.error('Error loading analysis history from Firestore:', error);
    throw error;
  }
};

// Function to delete a specific analysis from Firestore
export const deleteAnalysisFromFirestore = async (userId: string, documentId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'analysisHistory', documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting analysis from Firestore:', error);
    throw error;
  }
};

// Function to delete all analyses from Firestore
export const deleteAllAnalysesFromFirestore = async (userId: string): Promise<void> => {
  try {
    const userHistoryRef = collection(db, 'users', userId, 'analysisHistory');
    const snapshot = await getDocs(userHistoryRef);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing analysis history from Firestore:', error);
    throw error;
  }
};

// Function to fetch unverified doctors from Firestore
export const fetchUnverifiedDoctors = async (filter: DoctorFilter = {}): Promise<Doctor[]> => {
  try {
    const constraints: QueryConstraint[] = [
      where('role', '==', 'doctor'),
      where('verificationStatus', '==', 'pending')
    ];

    if (filter.specialization) {
      constraints.push(where('specialization', '==', filter.specialization));
    }

    if (filter.location) {
      constraints.push(where('location', '==', filter.location));
    }

    const q = query(collection(db, 'users'), ...constraints);

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      role: doc.data().role || 'doctor',
      verificationStatus: doc.data().verificationStatus || 'pending',
      rating: doc.data().rating || 0,
    } as Doctor));
  } catch (error) {
    console.error('Error fetching unverified doctors:', error);
    throw error;
  }
};

// Function to verify a doctor in Firestore
export const verifyDoctorInFirestore = async (doctorId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', doctorId);
    await updateDoc(docRef, { verificationStatus: 'approved' });
  } catch (error) {
    console.error('Error verifying doctor:', error);
    throw error;
  }
};

// Function to search doctors
export const searchDoctors = async (searchTerm: string): Promise<Doctor[]> => {
  try {
    const doctorsRef = collection(db, 'users');
    const q = query(
      doctorsRef,
      where('role', '==', 'doctor'),
      where('verificationStatus', '==', 'approved'),
      where('specialization', '>=', searchTerm),
      where('specialization', '<=', searchTerm + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      role: doc.data().role || 'doctor',
      verificationStatus: doc.data().verificationStatus || 'approved',
    } as Doctor));
  } catch (error) {
    console.error('Error searching doctors:', error);
    throw error;
  }
};