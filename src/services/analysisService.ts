import { auth, db }from '../Firebase/config';
import { collection, doc, serverTimestamp, writeBatch, Timestamp, deleteDoc } from 'firebase/firestore';
import { updateStats } from './statsService';
import { saveToHistory } from '../utils/saveToHistory';
import type { Analysis } from '../types/analysis';
import type { Condition } from '../utils/severityCalculator';
import { formatConfidence } from '../utils/confidenceFormatter';
import { cache } from './cacheService';

type AnalysisDataBase = Omit<Analysis, 'severity' | 'id' | 'createdAt' | 'patientId'>;

interface AnalysisData extends AnalysisDataBase {
  result: Condition;
  severity?: string;
  condition: string;
  description: string;
  prediction: Condition;
}

export const saveAnalysisResults = async (analysisData: AnalysisData, user: any) => {
  try {
    const batch = writeBatch(db);
    
    // Format confidence once and use it consistently
    const formattedConfidence = formatConfidence(analysisData.confidence);
    
    // Save to analyses collection with original prediction and result
    const analysisRef = doc(collection(db, 'analyses'));
    batch.set(analysisRef, {
      userId: user.uid,
      patientId: user.uid,
      imageUrl: analysisData.imageUrl,
      prediction: analysisData.prediction,
      result: analysisData.result,
      confidence: formattedConfidence,
      severity: analysisData.severity || 'unknown',
      condition: analysisData.condition,
      description: analysisData.description,
      createdAt: serverTimestamp(),
      type: 'analysis',
      attachedToAppointment: false,
      attachedAt: null,
      appointmentId: null
    });

    await batch.commit();

    // Create history entry with original prediction
    const historyData = {
      userId: user.uid,
      imageUrl: analysisData.imageUrl,
      prediction: analysisData.prediction as Condition,
      confidence: formattedConfidence,
      timestamp: new Date(),
      severity: analysisData.severity,
      analysisResult: analysisData.description
    };

    // Update system stats and save to history
    await Promise.all([
      updateStats({ totalAnalyses: 1 }),
      saveToHistory(historyData)
    ]);
    
    return true;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

export const deleteAnalysis = async (analysisId: string, userId: string) => {
  try {
    const analysisRef = doc(db, 'users', userId, 'analyses', analysisId);
    await deleteDoc(analysisRef);
    
    // Clear the cache using the existing remove method
    cache.remove(`analyses_${userId}`);
    
    return true;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
};