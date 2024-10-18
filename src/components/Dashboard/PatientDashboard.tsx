import React, { useState, useEffect } from 'react';
import { firestore as db } from '../../Firebase/config';
import ButtonStyling from '../ButtonStyling';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import AppointmentBooking from '../Appointments/AppointmentsComponent';

interface User {
  uid: string;
  name: string;
}

interface Appointment {
  id: string;
  doctorName: string;
  date: Timestamp;
}

interface Doctor {
  id: string;
  name: string;
}

interface PatientDashboardProps {
  user: User;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('patientId', '==', user.uid),
        where('date', '>=', new Date())
      );

      const querySnapshot = await getDocs(q);
      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Appointment));
      setUpcomingAppointments(appointments);
    };

    fetchAppointments();
  }, [user.uid]);

  const handleBookAppointment = () => {
    // In a real application, you would fetch the actual doctor data here
    setSelectedDoctor({ id: 'someDocId', name: 'John Doe' });
  };

  const handleViewAnalysisHistory = () => {
    // Implement navigation to analysis history
    console.log('Navigating to analysis history');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-[#EFEFED]">Welcome, {user.name}</h2>
      <div className="bg-[#171B26] p-4 rounded-lg mb-4">
        <h3 className="text-xl font-semibold mb-2 text-[#EFEFED]">Upcoming Appointments</h3>
        {upcomingAppointments.length > 0 ? (
          <ul>
            {upcomingAppointments.map(appointment => (
              <li key={appointment.id} className="mb-2 text-[#EFEFED]">
                {appointment.doctorName} - {appointment.date.toDate().toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#EFEFED]">No upcoming appointments</p>
        )}
      </div>
      <ButtonStyling text="Book New Appointment" onClick={handleBookAppointment} />
      <ButtonStyling text="View Skin Analysis History" onClick={handleViewAnalysisHistory} />
      
      {selectedDoctor && (
        <AppointmentBooking 
          user={user} 
          doctorId={selectedDoctor.id} 
          doctorName={selectedDoctor.name} 
        />
      )}
    </div>
  );
};

export default PatientDashboard;