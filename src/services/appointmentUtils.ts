import { auth, db }from '../Firebase/config';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { startOfDay, endOfDay } from 'date-fns';
import type { Appointment, DoctorAvailability } from '../types/appointment';

export const getDoctorAppointmentsForDate = async (doctorId: string, date: Date): Promise<Appointment[]> => {
  const appointmentsRef = collection(db, 'appointments');
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const appointmentsSnap = await getDocs(
    query(
      appointmentsRef,
      where('doctorId', '==', doctorId),
      where('date', '>=', Timestamp.fromDate(dayStart)),
      where('date', '<=', Timestamp.fromDate(dayEnd)),
      where('status', 'in', ['confirmed', 'scheduled', 'pending'])
    )
  );

  return appointmentsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Appointment[];
};

export const getDoctorAvailability = async (doctorId: string): Promise<DoctorAvailability | null> => {
  const availabilitySnap = await getDocs(
    query(collection(db, 'availability'), where('doctorId', '==', doctorId))
  );

  if (availabilitySnap.empty) return null;
  return availabilitySnap.docs[0].data() as DoctorAvailability;
};