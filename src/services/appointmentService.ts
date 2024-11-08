import { auth, db }from '../Firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc,
  addDoc, 
  Timestamp,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  addMinutes, 
  format, 
  parse, 
  isBefore, 
  isAfter,
  parseISO,
  startOfDay,
  endOfDay 
} from 'date-fns';
import { updateStats } from './statsService';
import { handleError } from '../utils/errorHandler';
import type { 
  Appointment, 
  DoctorAvailability, 
  TimeSlot, 
  AppointmentStatus 
} from '../types/appointment';

interface CreateAppointmentData {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
}

export const createAppointment = async (data: CreateAppointmentData): Promise<string> => {
  try {
    // Validate time slot availability
    const slots = await getAvailableTimeSlots(data.doctorId, data.date);
    const selectedSlot = slots.find(slot => slot.time === data.time);

    if (!selectedSlot || !selectedSlot.available) {
      throw new Error('Selected time slot is not available');
    }

    const appointmentData: Omit<Appointment, 'id'> = {
      ...data,
      status: 'scheduled',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      date: Timestamp.fromDate(parseISO(data.date)),
      confirmationSent: false,
      lastModifiedBy: 'system'
    };

    const appointmentRef = await addDoc(collection(db, 'appointments'), appointmentData);
    
    // Update stats
    await updateStats({ totalAppointments: 1 });

    return appointmentRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getAvailableTimeSlots = async (doctorId: string, date: string): Promise<TimeSlot[]> => {
  try {
    // Get doctor's availability
    const availabilitySnap = await getDocs(
      query(collection(db, 'availability'), where('doctorId', '==', doctorId))
    );

    if (availabilitySnap.empty) {
      throw new Error('No availability found for this doctor');
    }

    const availability = availabilitySnap.docs[0].data() as DoctorAvailability;
    const selectedDay = format(parseISO(date), 'EEEE');
    
    // Check custom dates first
    const customDate = availability.customDates?.find(d => d.date === date);
    if (customDate) {
      return customDate.timeSlots;
    }

    // Fall back to weekly schedule
    const daySchedule = availability.weeklySchedule.find(
      schedule => schedule.day.toLowerCase() === selectedDay.toLowerCase()
    );

    if (!daySchedule || !daySchedule.isAvailable) {
      return [];
    }

    // Get existing appointments
    const appointmentsSnap = await getDocs(
      query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctorId),
        where('date', '>=', startOfDay(parseISO(date))),
        where('date', '<=', endOfDay(parseISO(date)))
      )
    );

    const bookedTimes = appointmentsSnap.docs.map(doc => doc.data().time);

    // Generate time slots
    const slots: TimeSlot[] = [];
    let currentTime = parse(daySchedule.startTime, 'HH:mm', new Date());
    const endTime = parse(daySchedule.endTime, 'HH:mm', new Date());

    while (isBefore(currentTime, endTime)) {
      const timeString = format(currentTime, 'HH:mm');
      
      // Check break time
      const isDuringBreak = daySchedule.breakTime && 
        isAfter(currentTime, parse(daySchedule.breakTime.start, 'HH:mm', new Date())) &&
        isBefore(currentTime, parse(daySchedule.breakTime.end, 'HH:mm', new Date()));

      const appointmentsAtTime = bookedTimes.filter(time => time === timeString).length;

      slots.push({
        time: timeString,
        available: !isDuringBreak && appointmentsAtTime < daySchedule.maxAppointments
      });

      currentTime = addMinutes(currentTime, 30); // 30-minute slots
    }

    return slots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string, 
  status: AppointmentStatus,
  updatedBy: string
): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status,
      updatedAt: serverTimestamp(),
      lastModifiedBy: updatedBy
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

export const getDoctorAppointments = async (doctorId: string): Promise<Appointment[]> => {
  try {
    const appointmentsSnap = await getDocs(
      query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctorId),
        where('status', 'in', ['scheduled', 'confirmed'])
      )
    );

    return appointmentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    throw error;
  }
};

export const getPatientAppointments = async (patientId: string): Promise<Appointment[]> => {
  try {
    const appointmentsSnap = await getDocs(
      query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId)
      )
    );

    return appointmentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting patient appointments:', error);
    throw error;
  }
};