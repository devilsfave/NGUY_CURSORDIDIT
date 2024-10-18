import { firestore as db } from '../Firebase/config';
import { collection, addDoc } from 'firebase/firestore';

interface AnalysisResult {
  userId: string;
  imageUrl: string;
  prediction: string;
  confidence: number;
  date: Date;
}

export async function saveToHistory(result: AnalysisResult) {
  try {
    const historyRef = collection(db, 'history');
    await addDoc(historyRef, result);
    console.log('Successfully saved to history');
  } catch (error) {
    console.error('Error saving to history:', error);
    throw new Error('Failed to save to history');
  }
}