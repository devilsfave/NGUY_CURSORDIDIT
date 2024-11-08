export interface BaseStats {
  lastUpdated: Date;
}

export interface PatientStats extends BaseStats {
  totalAppointments: number;
  completedAnalyses: number;
  upcomingAppointments: number;
  averageSeverity: number;
}

export interface DoctorStats extends BaseStats {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  averageRating: number;
  totalAnalyses: number;
}

export interface AdminStats extends BaseStats {
  pendingAppointments: number;
  unverifiedDoctors: number;
  pendingReports: number;
  recentAnalyses: number;
}