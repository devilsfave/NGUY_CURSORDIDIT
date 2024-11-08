import { Timestamp } from 'firebase/firestore';

export interface Analysis {
  id: string;
  userId: string;
  patientId: string;
  result: string;
  condition: string;
  description?: string;
  confidence: number;
  severity: string;
  imageUrl: string;
  createdAt: Timestamp;
  doctorId?: string;
}