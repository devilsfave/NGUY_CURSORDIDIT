import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where, orderBy, updateDoc, doc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { auth, db }from '../../Firebase/config';
import { User } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ButtonStyling from '../ButtonStyling';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { DayOfWeek, DAYS_OF_WEEK } from '../../utils/timeUtils';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  notes?: string;
}

interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  rejected: number;
  todayTotal: number;
  upcomingTotal: number;
}

interface DoctorAvailability {
  doctorId: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
}

interface AdminAppointmentComponentProps {
  user: User;
}

const AdminAppointmentComponent: React.FC<AdminAppointmentComponentProps> = ({ user }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    rejected: 0,
    todayTotal: 0,
    upcomingTotal: 0
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [doctorAvailabilities, setDoctorAvailabilities] = useState<{ [key: string]: DoctorAvailability }>({});

  useEffect(() => {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAppointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as Appointment[];
      
      setAppointments(fetchedAppointments);
      updateStats(fetchedAppointments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const availabilityRef = collection(db, 'availability');
    
    const unsubscribe = onSnapshot(availabilityRef, (snapshot) => {
      const availabilities: { [key: string]: DoctorAvailability } = {};
      snapshot.docs.forEach(doc => {
        availabilities[doc.data().doctorId] = doc.data() as DoctorAvailability;
      });
      setDoctorAvailabilities(availabilities);
    });

    return () => unsubscribe();
  }, []);

  const updateStats = (appointments: Appointment[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      rejected: appointments.filter(a => a.status === 'rejected').length,
      todayTotal: appointments.filter(a => {
        const appointmentDate = new Date(a.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() === today.getTime();
      }).length,
      upcomingTotal: appointments.filter(a => {
        return a.date > today && a.status !== 'cancelled' && a.status !== 'rejected';
      }).length
    };

    setStats(stats);
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled' | 'rejected') => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      const appointmentDoc = await getDoc(appointmentRef);
      const appointment = appointmentDoc.data();

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (newStatus === 'confirmed') {
        const availabilityRef = doc(db, 'availability', appointment.doctorId);
        const availabilityDoc = await getDoc(availabilityRef);
        const availability = availabilityDoc.data();

        if (!availability) {
          throw new Error('Doctor availability not found');
        }

        const appointmentDate = appointment.date.toDate();
        const dayOfWeek = format(appointmentDate, 'EEEE') as DayOfWeek;
        const dayIndex = DAYS_OF_WEEK.indexOf(dayOfWeek);

        if (dayIndex === -1 || !availability.schedule[dayIndex]?.isAvailable) {
          toast.error('Doctor is not available on this day');
          return;
        }
      }

      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid
      });

      toast.success(`Appointment ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'approve' | 'reject' | 'delete') => {
    if (!user || user.role !== 'admin') return;
    
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      
      switch(action) {
        case 'approve':
          await updateDoc(appointmentRef, { 
            status: 'confirmed',
            lastModifiedBy: user.uid,
            updatedAt: serverTimestamp()
          });
          break;
        case 'reject':
          await updateDoc(appointmentRef, {
            status: 'rejected',
            lastModifiedBy: user.uid,
            updatedAt: serverTimestamp()
          });
          break;
        case 'delete':
          await deleteDoc(appointmentRef);
          break;
      }
      
      toast.success(`Appointment ${action}ed successfully`);
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      toast.error(`Failed to ${action} appointment`);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      case 'rejected': return 'bg-red-500/10 text-red-500';
      default: return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {[
        { label: 'Total', value: stats.total },
        { label: 'Pending', value: stats.pending },
        { label: 'Confirmed', value: stats.confirmed },
        { label: 'Cancelled', value: stats.cancelled },
        { label: 'Rejected', value: stats.rejected },
        { label: "Today's", value: stats.todayTotal },
        { label: 'Upcoming', value: stats.upcomingTotal }
      ].map(({ label, value }) => (
        <div key={label} className="bg-[#262A36] p-4 rounded-lg">
          <h4 className="text-sm text-[#9C9FA4]">{label}</h4>
          <p className="text-2xl font-bold text-[#EFEFED]">{value}</p>
        </div>
      ))}
    </div>
  );

  const renderDoctorAvailability = (doctorId: string) => {
    const availability = doctorAvailabilities[doctorId];
    if (!availability) return null;

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const availableDays = availability.daysOfWeek.map(day => daysOfWeek[day]).join(', ');

    return (
      <div className="mt-2 text-sm text-[#9C9FA4]">
        <p>Available: {availableDays}</p>
        <p>Hours: {availability.startTime} - {availability.endTime}</p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-[#171B26] rounded-lg"
    >
      <h2 className="text-2xl font-bold text-[#EFEFED] mb-6">Appointment Management</h2>
      
      {renderStats()}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#EFEFED]">Appointments List</h3>
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'cancelled', 'rejected'].map((status) => (
            <ButtonStyling
              key={status}
              text={status.charAt(0).toUpperCase() + status.slice(1)}
              onClick={() => setFilter(status as any)}
              variant={filter === status ? 'primary' : 'secondary'}
            />
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-[#EFEFED]">Loading appointments...</div>
      ) : (
        <AnimatePresence>
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#262A36] p-4 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[#EFEFED]">
                      Patient: {appointment.patientName}
                    </h3>
                    <p className="text-[#9C9FA4]">Doctor: Dr. {appointment.doctorName}</p>
                    <p className="text-[#9C9FA4]">
                      {appointment.date.toLocaleDateString()} at {appointment.time}
                    </p>
                    {appointment.notes && (
                      <p className="text-[#9C9FA4]">Notes: {appointment.notes}</p>
                    )}
                    {renderDoctorAvailability(appointment.doctorId)}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    {appointment.status === 'pending' && (
                      <div className="flex gap-2">
                        <ButtonStyling
                          text="Confirm"
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                          variant="success"
                        />
                        <ButtonStyling
                          text="Cancel"
                          onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                          variant="danger"
                        />
                        <ButtonStyling
                          text="Reject"
                          onClick={() => handleStatusUpdate(appointment.id, 'rejected')}
                          variant="danger"
                        />
                      </div>
                    )}
                    {user.role === 'admin' && (
                      <div className="flex gap-2">
                        <ButtonStyling
                          text="Approve"
                          onClick={() => handleAppointmentAction(appointment.id, 'approve')}
                          variant="success"
                        />
                        <ButtonStyling
                          text="Reject"
                          onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                          variant="danger"
                        />
                        <ButtonStyling
                          text="Delete"
                          onClick={() => handleAppointmentAction(appointment.id, 'delete')}
                          variant="danger"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {!loading && filteredAppointments.length === 0 && (
        <div className="text-center text-[#EFEFED] mt-4">
          No appointments found for the selected filter.
        </div>
      )}
    </motion.div>
  );
};

export default AdminAppointmentComponent;