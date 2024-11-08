'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../Firebase/config';
import { collection, query, where, onSnapshot, Timestamp, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import type { Appointment, AppointmentStatus } from '../types/appointment';
import { getDoctorAppointmentsForDate, getDoctorAvailability } from '../services/appointmentUtils';
import { isSlotAvailable, hasAppointmentConflict } from '../utils/timeUtils';

interface AppointmentContextType {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refreshAppointments: () => void;
  validateAppointmentSlot: (doctorId: string, date: Date, time: string) => Promise<void>;
  confirmAppointment: (appointmentId: string) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>;
  completeAppointment: (appointmentId: string) => Promise<void>; // Add this
}

export const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const validateAppointmentSlot = async (doctorId: string, date: Date, time: string) => {
    const existingAppointments = await getDoctorAppointmentsForDate(doctorId, date);
    const availability = await getDoctorAvailability(doctorId);
    
    // Check if slot is available
    if (!isSlotAvailable(date, time, availability)) {
      throw new Error('Selected time slot is not available');
    }

    // Check for conflicts
    if (hasAppointmentConflict(time, existingAppointments)) {
      throw new Error('Time slot already booked');
    }
  };

  const fetchAppointments = () => {
    if (!user) return;

    const appointmentsRef = collection(db, 'appointments');
    const q = user.role === 'doctor'
      ? query(appointmentsRef, where('doctorId', '==', user.uid))
      : query(appointmentsRef, where('patientId', '==', user.uid));

    return onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as Appointment[];

      setAppointments(appointmentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
      setLoading(false);
    });
  };

  useEffect(() => {
    const unsubscribe = fetchAppointments();
    return () => unsubscribe?.();
  }, [user]);

  const refreshAppointments = () => {
    setLoading(true);
    fetchAppointments();
  };

  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user?.uid || 'system'
      });
      refreshAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const completeAppointment = async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastModifiedBy: user?.uid || 'system'
      });
      refreshAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  };

  const confirmAppointment = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'confirmed');
  };

  const cancelAppointment = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'cancelled');
  };

  return (
    <AppointmentContext.Provider value={{ 
      appointments, 
      loading, 
      error, 
      refreshAppointments,
      validateAppointmentSlot,
      confirmAppointment,
      cancelAppointment,
      updateAppointmentStatus,
      completeAppointment  // Add this
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};