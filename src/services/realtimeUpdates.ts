import { auth, db }from '../Firebase/config';
import { 
  collection, 
  query, 
  where, 
  Timestamp, 
  orderBy, 
  onSnapshot, 
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { handleError } from '../utils/errorHandler';
import type { Analysis } from '../types/analysis';
import type { Appointment, AppointmentStatus } from '../types/appointment';

type UpdateCallback<T> = (data: T[]) => void;
type ErrorCallback = (error: Error) => void;

interface SubscriptionConfig {
  userId: string;
  role: 'doctor' | 'patient';
  onError?: ErrorCallback;
}

const handleSnapshot = <T>(
  snapshot: QuerySnapshot<DocumentData>,
  callback: UpdateCallback<T>,
  transform: (doc: DocumentData) => T
) => {
  try {
    const data = snapshot.docs.map(doc => transform({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  } catch (error) {
    handleError(error, 'processing snapshot');
    callback([]);
  }
};

export const subscribeToAppointments = (
  userId: string,
  role: 'patient' | 'doctor' | 'admin',
  callback: (appointments: Appointment[]) => void
) => {
  const appointmentsRef = collection(db, 'appointments');
  let q = query(appointmentsRef);

  // Apply appropriate filters based on role
  if (role === 'doctor') {
    q = query(q, where('doctorId', '==', userId));
  } else if (role === 'patient') {
    q = query(q, where('patientId', '==', userId));
  }

  // Add ordering
  q = query(q, orderBy('date', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    })) as Appointment[];

    callback(appointments);
  });
};

export const subscribeToAvailability = (
  doctorId: string,
  callback: UpdateCallback<any>
) => {
  if (!doctorId) {
    console.error('No doctorId provided to subscribeToAvailability');
    callback([]);
    return () => {};
  }

  const availabilityRef = collection(db, 'availability');
  const availabilityQuery = query(
    availabilityRef,
    where('doctorId', '==', doctorId),
    where('date', '>=', new Date().toISOString().split('T')[0])
  );

  let unsubscribed = false;

  const unsubscribe = onSnapshot(
    availabilityQuery,
    (snapshot) => {
      if (!unsubscribed) {
        handleSnapshot(snapshot, callback, (data) => data);
      }
    },
    (error) => {
      console.error('Error in availability subscription:', error);
      if (!unsubscribed) {
        callback([]);
      }
    }
  );

  return () => {
    unsubscribed = true;
    unsubscribe();
  };
};

export const subscribeToAnalyses = (
  patientId: string,
  callback: (analyses: Analysis[]) => void,
  filterAttached: boolean = false
) => {
  const q = query(
    collection(db, 'analyses'),
    where('patientId', '==', patientId),
    where('attachedToAppointment', '==', filterAttached)
  );

  return onSnapshot(q, (snapshot) => {
    const analyses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Analysis[];
    callback(analyses);
  });
};