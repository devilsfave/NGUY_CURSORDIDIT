import React, { useState, useEffect } from 'react';
import { firestore as db } from '../../Firebase/config';
import { collection, query, where, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore';
import ButtonStyling from '../ButtonStyling';
import AppointmentBooking from '../Appointments/AppointmentsComponent';
import { useRouter } from 'next/navigation';

interface User {
  uid: string;
  name: string;
}

interface Appointment {
  id: string;
  patientName: string;
  date: Timestamp;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Availability {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface DoctorDashboardProps {
  user: User;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isManagingAvailability, setIsManagingAvailability] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('doctorId', '==', user.uid),
        where('date', '>=', new Date()),
        where('status', '==', 'scheduled')
      );

      const querySnapshot = await getDocs(q);
      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Appointment));
      setUpcomingAppointments(appointments);
    };

    const fetchAvailability = async () => {
      const availabilityRef = collection(db, 'availability');
      const q = query(availabilityRef, where('doctorId', '==', user.uid));

      const querySnapshot = await getDocs(q);
      const availabilityData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Availability));
      setAvailability(availabilityData);
    };

    fetchAppointments();
    fetchAvailability();
  }, [user.uid]);

  const handleViewPatientRecords = () => {
    router.push('/patient-records');
  };

  const handleManageAvailability = () => {
    setIsManagingAvailability(!isManagingAvailability);
  };

  const handleUpdateAvailability = async (availabilityId: string, newData: Partial<Availability>) => {
    try {
      const availabilityRef = doc(db, 'availability', availabilityId);
      await updateDoc(availabilityRef, newData);
      // Refresh availability data
      const updatedAvailability = availability.map(a => 
        a.id === availabilityId ? { ...a, ...newData } : a
      );
      setAvailability(updatedAvailability);
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status: 'completed' });
      // Remove the completed appointment from the list
      setUpcomingAppointments(prev => prev.filter(a => a.id !== appointmentId));
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Failed to complete appointment. Please try again.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-[#EFEFED]">Welcome, Dr. {user.name}</h2>
      <div className="bg-[#171B26] p-4 rounded-lg mb-4">
        <h3 className="text-xl font-semibold mb-2 text-[#EFEFED]">Upcoming Appointments</h3>
        {upcomingAppointments.length > 0 ? (
          <ul>
            {upcomingAppointments.map(appointment => (
              <li key={appointment.id} className="mb-2 text-[#EFEFED] flex justify-between items-center">
                <span>{appointment.patientName} - {appointment.date.toDate().toLocaleString()}</span>
                <ButtonStyling text="Complete" onClick={() => handleCompleteAppointment(appointment.id)} variant="secondary" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#EFEFED]">No upcoming appointments</p>
        )}
      </div>
      <ButtonStyling text="View Patient Records" onClick={handleViewPatientRecords} />
      <ButtonStyling text="Manage Availability" onClick={handleManageAvailability} />
      
      {isManagingAvailability && (
        <div className="mt-4 bg-[#171B26] p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 text-[#EFEFED]">Manage Availability</h3>
          {availability.map(slot => (
            <div key={slot.id} className="mb-2 flex items-center">
              <span className="text-[#EFEFED] mr-2">{slot.day}:</span>
              <input 
                type="time" 
                value={slot.startTime} 
                onChange={(e) => handleUpdateAvailability(slot.id, { startTime: e.target.value })}
                className="mr-2 bg-[#262A36] text-[#EFEFED] rounded p-1"
              />
              <input 
                type="time" 
                value={slot.endTime} 
                onChange={(e) => handleUpdateAvailability(slot.id, { endTime: e.target.value })}
                className="bg-[#262A36] text-[#EFEFED] rounded p-1"
              />
            </div>
          ))}
        </div>
      )}
      
      <AppointmentBooking 
        user={user}
        doctorId={user.uid}
        doctorName={user.name}
      />
    </div>
  );
};

export default DoctorDashboard;