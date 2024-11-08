export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'pending';

export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    patientName: string;
    doctorName: string;
    date: Date;
    time: string;
    status: AppointmentStatus;
    attachedAnalysisId?: string;
    notes?: string;
  }