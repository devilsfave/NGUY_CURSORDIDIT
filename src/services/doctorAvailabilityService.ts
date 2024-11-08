import { auth, db } from '../Firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  Timestamp 
} from 'firebase/firestore'; // Added missing imports
import { format, parseISO, addMinutes } from 'date-fns';
import type { DoctorAvailability, TimeSlot } from '../types/appointment';

export const getAvailableTimeSlots = async (doctorId: string, date: string) => {
  try {
    const dayOfWeek = format(parseISO(date), 'EEEE');
    
    // Get doctor's weekly schedule
    const weeklyScheduleRef = doc(db, 'availability', doctorId);
    const weeklyScheduleSnap = await getDoc(weeklyScheduleRef);
    
    if (!weeklyScheduleSnap.exists()) {
      return [];
    }

    const availabilityData = weeklyScheduleSnap.data() as DoctorAvailability;
    const daySchedule = availabilityData.weeklySchedule.find(
      schedule => schedule.day === dayOfWeek && schedule.isAvailable
    );

    if (!daySchedule) {
      return [];
    }

    // Generate time slots based on schedule
    const slots: string[] = [];
    let currentTime = parseISO(`${date}T${daySchedule.startTime}`);
    const endTime = parseISO(`${date}T${daySchedule.endTime}`);

    while (currentTime < endTime) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime = addMinutes(currentTime, 30); // 30-minute intervals
    }

    // Get booked appointments for this date
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsQuery = query(
      appointmentsRef,
      where('doctorId', '==', doctorId),
      where('date', '==', date),
      where('status', 'in', ['confirmed', 'pending'])
    );

    const bookedAppointments = await getDocs(appointmentsQuery);
    const bookedTimes = bookedAppointments.docs.map(doc => doc.data().time);

    // Filter out booked slots
    return slots.filter(slot => !bookedTimes.includes(slot));
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};