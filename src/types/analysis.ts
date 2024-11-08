import { Timestamp } from 'firebase/firestore';

export interface Analysis {
    id: string;
    userId: string;
    imageUrl: string;
    prediction: string;
    confidence: number;  // This should always be stored as a percentage (0-100)
    severity: 'Low' | 'Medium' | 'High' | 'Normal';
    conditionName: string;
    conditionDescription?: string;
    date: Timestamp;
    createdAt: Timestamp;
    type?: 'analysis' | 'consultation';
    attachedToAppointment?: boolean;
    appointmentId?: string;
    attachedAt?: Timestamp;
    patientId?: string;
    doctorId?: string;
    analysisResult?: string;
    notes?: string;
    // Backward compatibility fields
    result?: string;
    condition?: string;
    description?: string;
}

// Remove formatConfidence from here since we have it in utils/confidenceFormatter.ts

export const getSeverityColor = (severity: string): string => {
    const normalizedSeverity = severity.toLowerCase();
    switch(normalizedSeverity) {
        case 'high': return 'text-red-500';
        case 'medium': return 'text-yellow-500';
        case 'low': return 'text-green-500';
        case 'normal': return 'text-blue-500';
        default: return 'text-gray-500';
    }
};

export const normalizeSeverity = (severity: string): 'Low' | 'Medium' | 'High' | 'Normal' => {
    const normalized = severity.toLowerCase();
    switch(normalized) {
        case 'high': return 'High';
        case 'medium': return 'Medium';
        case 'low': return 'Low';
        case 'normal': return 'Normal';
        default: return 'Normal';
    }
};

export const normalizeConfidence = (confidence: number | string): number => {
  if (typeof confidence === 'string') {
    return parseFloat(confidence);
  }
  return confidence > 1 ? confidence : confidence * 100;
};