import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db }from '../../Firebase/config';
import { collection, query, where, getDocs, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { handleError } from '../../utils/errorHandler';
import { motion } from 'framer-motion';
import ButtonStyling from '../../components/ButtonStyling';
import { FiCalendar, FiClock, FiUser, FiArrowLeft } from 'react-icons/fi';
import { format, addMinutes, isAfter, isBefore, parseISO, addDays } from 'date-fns';
import { toast } from 'react-toastify';
import { DoctorAvailability, TimeSlot } from '../../types/appointment';
import { formatFirestoreDate, convertTimestampToDate } from '../../utils/dateUtils';
import { useAppointments } from '../../contexts/AppointmentContext';

const generateNextWeekDates = (weeklySchedule: any[]) => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) { // Next 2 weeks
    const date = addDays(today, i);
    const dayName = format(date, 'EEEE');
    const daySlot = weeklySchedule.find((slot: any) => 
      slot.day === dayName && slot.isAvailable
    );
    
    if (daySlot) {
      dates.push(format(date, 'yyyy-MM-dd'));
    }
  }
  
  return dates;
};

const ScheduleAppointment = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { validateAppointmentSlot } = useAppointments();

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?.uid) {
        router.push('/login');
        return;
      }

      try {
        const patientId = searchParams?.get('patientId');
        if (!patientId) {
          throw new Error('Patient ID is required');
        }

        // Fetch patient details
        const patientDoc = await getDoc(doc(db, 'users', patientId));
        if (!patientDoc.exists()) {
          throw new Error('Patient not found');
        }
        setPatientDetails(patientDoc.data());

        // First check specific date availability
        const specificDateQuery = query(
          collection(db, 'availability'),
          where('doctorId', '==', user.uid),
          where('date', '>=', format(new Date(), 'yyyy-MM-dd'))
        );

        const specificDateSnapshot = await getDocs(specificDateQuery);
        const specificDates = specificDateSnapshot.docs.map(doc => doc.data().date);

        // Then check weekly availability
        const weeklyAvailabilityRef = doc(db, 'availability', user.uid);
        const weeklyAvailabilitySnap = await getDoc(weeklyAvailabilityRef);
        
        let weeklyDates: string[] = [];
        if (weeklyAvailabilitySnap.exists()) {
          const weeklySchedule = weeklyAvailabilitySnap.data().timeSlots || [];
          weeklyDates = generateNextWeekDates(weeklySchedule);
        }

        // Combine and sort all available dates
        const allDates = Array.from(new Set([...specificDates, ...weeklyDates])).sort();
        setAvailableDates(allDates);

        if (allDates.length > 0) {
          setSelectedDate(allDates[0]);
          await generateTimeSlots(allDates[0]);
        }

      } catch (error) {
        handleError(error, 'fetching availability');
        toast.error('Failed to load available slots');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [user, router, searchParams]);

  const generateTimeSlots = async (date: string) => {
    try {
      const availabilitySnapshot = await getDocs(query(
        collection(db, 'availability'),
        where('doctorId', '==', user?.uid)
      ));

      const doctorAvailability = availabilitySnapshot.docs[0]?.data() as DoctorAvailability;
      
      if (!doctorAvailability?.weeklySchedule) {
        setTimeSlots([]);
        return;
      }

      const dayOfWeek = format(parseISO(date), 'EEEE');
      const daySchedule = doctorAvailability.weeklySchedule.find(
        schedule => schedule.day.toLowerCase() === dayOfWeek.toLowerCase()
      );

      if (!daySchedule || !daySchedule.isAvailable) {
        setTimeSlots([]);
        return;
      }

      // Generate 30-minute slots between start and end time
      const slots: TimeSlot[] = [];
      let currentTime = parseISO(`${date}T${daySchedule.startTime}`);
      const endTime = parseISO(`${date}T${daySchedule.endTime}`);

      while (isBefore(currentTime, endTime)) {
        slots.push({
          time: format(currentTime, 'HH:mm'),
          available: true
        });
        currentTime = addMinutes(currentTime, 30);
      }

      // Check existing appointments
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('doctorId', '==', user?.uid),
        where('date', '==', formatFirestoreDate(parseISO(date)))
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const bookedTimes = appointmentsSnapshot.docs.map(doc => doc.data().time);

      // Mark booked slots as unavailable
      const availableSlots = slots.map(slot => ({
        ...slot,
        available: !bookedTimes.includes(slot.time)
      }));

      setTimeSlots(availableSlots);

    } catch (error) {
      handleError(error, 'generating time slots');
      toast.error('Failed to load time slots');
    }
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    await generateTimeSlots(date);
  };

  const handleSchedule = async () => {
    if (!user) {
      toast.error('Please log in to schedule an appointment');
      router.push('/login');
      return;
    }

    try {
      setIsValidating(true);
      setValidationError(null);

      // Convert string date to Date object
      const appointmentDate = parseISO(selectedDate);
      
      await validateAppointmentSlot(user.uid, appointmentDate, selectedTime);

      const appointmentData = {
        patientId: user.uid,
        doctorId: user.uid,
        patientName: user.displayName || 'Anonymous',
        doctorName: user.displayName || 'Doctor',
        date: formatFirestoreDate(appointmentDate), // Convert to Firestore timestamp
        time: selectedTime,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'appointments'), appointmentData);

      toast.success('Appointment scheduled successfully');
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule appointment';
      setValidationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  // Early return if no user
  if (!user) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EFEFED]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <button
        onClick={() => router.back()}
        className="flex items-center text-[#9C9FA4] hover:text-[#EFEFED] mb-6"
      >
        <FiArrowLeft className="mr-2" /> Back
      </button>

      <div className="bg-[#262A36] rounded-lg p-6">
        <h1 className="text-2xl font-bold text-[#EFEFED] mb-6">Schedule Appointment</h1>

        {patientDetails && (
          <div className="mb-6 p-4 bg-[#171B26] rounded-lg">
            <div className="flex items-center text-[#EFEFED]">
              <FiUser className="mr-2" />
              <span>Patient: {patientDetails.displayName}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-[#EFEFED] mb-4">Select Date</h2>
            <div className="space-y-2">
              {availableDates.map(date => (
                <button
                  key={date}
                  onClick={() => handleDateChange(date)}
                  className={`w-full p-3 rounded-lg transition-colors ${
                    selectedDate === date
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#171B26] text-[#EFEFED] hover:bg-[#1F2937]'
                  }`}
                >
                  {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#EFEFED] mb-4">Select Time</h2>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map(slot => (
                <button
                  key={slot.time}
                  onClick={() => setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg transition-colors ${
                    !slot.available
                      ? 'bg-gray-500 text-gray-400 cursor-not-allowed'
                      : selectedTime === slot.time
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#171B26] text-[#EFEFED] hover:bg-[#1F2937]'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <ButtonStyling
            text={loading || isValidating ? 'Scheduling...' : 'Schedule Appointment'}
            onClick={handleSchedule}
            disabled={loading || isValidating || !selectedDate || !selectedTime}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduleAppointment;