export interface User {
    uid: string;
    email: string;
    name?: string;
    displayName?: string;
    role: 'patient' | 'doctor' | 'admin';
    verified?: boolean;
  }