import { auth, db } from '../Firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { calculateSeverity, getConditionInfo } from './severityCalculator';
import { formatConfidence } from './confidenceFormatter';
import type { Condition } from './severityCalculator';

interface AnalysisResult {
  userId: string;
  imageUrl: string;
  prediction: Condition;
  confidence: number;
  severity?: string;
  analysisResult?: string;
}

export async function saveToHistory(result: AnalysisResult) {
  try {
    // Only save to history collection, as analyses are handled by analysisService
    const historyRef = collection(db, 'history');
    
    const severity = result.severity || calculateSeverity(result.prediction as Condition, result.confidence);
    const conditionInfo = getConditionInfo(result.prediction as Condition);
    
    // Use the common confidence formatter
    const formattedConfidence = formatConfidence(result.confidence);
    
    const historyData = {
      userId: result.userId,
      patientId: result.userId,
      imageUrl: result.imageUrl,
      prediction: result.prediction,
      confidence: formattedConfidence,
      severity,
      conditionName: conditionInfo.name,
      conditionDescription: conditionInfo.description,
      date: serverTimestamp(),
      createdAt: serverTimestamp(),
      type: 'analysis',
      attachedToAppointment: false,
      appointmentId: null,
      attachedAt: null
    };

    // Only save to history collection
    const historyDoc = await addDoc(historyRef, historyData);

    console.log('Successfully saved to history');
    return { ...historyData, id: historyDoc.id };
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error;
  }
}