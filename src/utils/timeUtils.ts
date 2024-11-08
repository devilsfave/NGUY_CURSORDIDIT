import { parse, format, isWithinInterval } from 'date-fns';
import type { WeeklySchedule, DoctorAvailability, Appointment } from '../types/appointment';

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const isSlotAvailable = (date: Date, time: string, availability: DoctorAvailability | null): boolean => {
  if (!availability) return false;
  
  const dayOfWeek = format(date, 'EEEE') as keyof typeof availability.weeklySchedule;
  const daySchedule = availability.weeklySchedule.find(s => s.day === dayOfWeek);
  
  if (!daySchedule || !daySchedule.isAvailable) return false;
  
  const slotTime = timeToMinutes(time);
  const startTime = timeToMinutes(daySchedule.startTime);
  const endTime = timeToMinutes(daySchedule.endTime);
  
  return slotTime >= startTime && slotTime < endTime;
};

export const hasAppointmentConflict = (time: string, appointments: Appointment[]): boolean => {
  return appointments.some(appointment => appointment.time === time);
};

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];