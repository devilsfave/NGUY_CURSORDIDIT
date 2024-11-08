import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  name?: string;
  displayName?: string;
  role: 'patient' | 'doctor' | 'admin';
  verified?: boolean;
}

export interface Analysis {
  id: string;
  result: string;
  createdAt: Date;
  condition: string;
  confidence: number;
  prediction?: string;
  severity?: string;
  imageUrl?: string;
  patientId: string;
  doctorId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  attachedAnalysisId?: string;
  notes?: string;
}

export interface PatientStats {
  totalAppointments: number;
  completedAnalyses: number;
  upcomingAppointments: number;
  averageSeverity: number;
}

export interface DoctorStats {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  averageRating: number;
  totalAnalyses: number;
}