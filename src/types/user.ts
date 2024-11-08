import { Timestamp } from 'firebase/firestore';

export interface User {
    uid: string;
    role: 'patient' | 'doctor' | 'admin';
    fullName?: string;
    displayName?: string | null;
    email: string;
    createdAt: Timestamp;
    updatedAt: string;
    verified?: boolean;
    licenseNumber?: string;
    specialization?: string;
    location?: string;
    gender?: string;
    dateOfBirth?: string;
    medicalHistory?: string;
}

export interface Doctor extends User {
    role: 'doctor';
}

export {};