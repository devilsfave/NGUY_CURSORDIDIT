import { Timestamp } from 'firebase/firestore';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'scheduled';

export interface TimeSlot {
  time: string;
  available: boolean;
  maxAppointments?: number;
}

export interface DailyAvailability {
  date: string;
  timeSlots: TimeSlot[];
}

export interface WeeklySchedule {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxAppointments: number;
  breakTime?: {
    start: string;
    end: string;
  };
}

export interface DoctorAvailability {
  id?: string;
  doctorId: string;
  weeklySchedule: WeeklySchedule[];
  customDates?: DailyAvailability[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: Date | Timestamp;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  attachedAnalysisId?: string;
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  lastModifiedBy?: string;
  confirmationSent?: boolean;
}

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule[] = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true, maxAppointments: 1 },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true, maxAppointments: 1 },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true, maxAppointments: 1 },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true, maxAppointments: 1 },
  { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true, maxAppointments: 1 },
  { day: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: false, maxAppointments: 1 },
  { day: 'Sunday', startTime: '09:00', endTime: '13:00', isAvailable: false, maxAppointments: 1 }
];

export const getStatusColor = (status: AppointmentStatus): string => {
  switch (status) {
    case 'confirmed': return 'text-green-500 bg-green-500/10';
    case 'cancelled': return 'text-red-500 bg-red-500/10';
    case 'completed': return 'text-blue-500 bg-blue-500/10';
    case 'scheduled': return 'text-purple-500 bg-purple-500/10';
    default: return 'text-yellow-500 bg-yellow-500/10';
  }
};