import { Timestamp } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';

export const convertTimestampToDate = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

export const formatAppointmentDate = (date: Timestamp | Date, formatStr: string = 'PPpp'): string => {
  const dateObj = convertTimestampToDate(date);
  return format(dateObj, formatStr);
};

export const formatFirestoreDate = (date: Date | string): Timestamp => {
  if (typeof date === 'string') {
    return Timestamp.fromDate(parseISO(date));
  }
  return Timestamp.fromDate(date);
};