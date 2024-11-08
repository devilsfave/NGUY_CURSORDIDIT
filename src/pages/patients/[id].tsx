import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { auth, db }from '../../Firebase/config';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { handleError } from '../../utils/errorHandler';
import { motion } from 'framer-motion';
import ButtonStyling from '../../components/ButtonStyling';
import { FiCalendar, FiClock, FiActivity, FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import { cache } from '../../services/cacheService';
import SectionLoader from '../../components/common/SectionLoader';
import { useRouter } from 'next/navigation';
import PatientNotes from '../../components/Appointments/PatientNotes';
import Image from 'next/image';

interface PatientDetails {
  id: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  medicalHistory?: string[];
  allergies?: string[];
}

interface Analysis {
  id: string;
  condition: string;
  conditionName?: string;
  confidence: number;
  createdAt: Date;
  imageUrl: string;
  severity: string;
  date?: Date;
}

interface Appointment {
  id: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  diagnosis?: string;
  attachedAnalysisId?: string;
}

const PatientDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analyses' | 'appointments'>('overview');

  // Add early return if no user
  if (!user) {
    router.push('/login'); // Redirect to login if no user
    return null;
  }

  useEffect(() => {
    const fetchPatientData = async () => {
      if (user.role !== 'doctor' || !params?.id) {
        setError('Unauthorized access or invalid patient');
        setLoading(false);
        return;
      }

      try {
        const patientId = params.id as string;
        const cacheKey = `patient_details_${patientId}`;
        const cachedData = cache.get<{
          patient: PatientDetails;
          analyses: Analysis[];
          appointments: Appointment[];
        }>(cacheKey);

        if (cachedData) {
          setPatient(cachedData.patient);
          setAnalyses(cachedData.analyses);
          setAppointments(cachedData.appointments);
          setLoading(false);
          return;
        }

        // Fetch patient details
        const patientDoc = await getDoc(doc(db, 'users', patientId));
        if (!patientDoc.exists()) {
          throw new Error('Patient not found');
        }

        const patientData = {
          id: patientDoc.id,
          ...patientDoc.data()
        } as PatientDetails;

        // Fetch analyses
        const analysesQuery = query(
          collection(db, 'analyses'),
          where('userId', '==', patientId),
          orderBy('createdAt', 'desc')
        );
        const analysesSnapshot = await getDocs(analysesQuery);
        const analysesData = analysesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate()
        })) as Analysis[];

        // Fetch appointments
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('patientId', '==', patientId),
          where('doctorId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        })) as Appointment[];

        setPatient(patientData);
        setAnalyses(analysesData);
        setAppointments(appointmentsData);

        cache.set(cacheKey, {
          patient: patientData,
          analyses: analysesData,
          appointments: appointmentsData
        }, { expiryMinutes: 5 });

      } catch (error) {
        handleError(error, 'fetching patient details');
        setError('Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user, params?.id]);

  if (loading) return <SectionLoader />;
  if (error) return <div className="p-6 bg-red-500/10 text-red-500 rounded-lg">{error}</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#9C9FA4] hover:text-[#EFEFED] mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Patient Records
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#EFEFED]">{patient.displayName}</h1>
            <p className="text-[#9C9FA4] mt-1">{patient.email}</p>
          </div>
          <ButtonStyling
            text="Schedule Appointment"
            onClick={() => router.push(`/appointments/schedule?patientId=${patient.id}`)}
            className="mt-4 sm:mt-0"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 border-b border-[#3F4354]">
          {(['overview', 'analyses', 'appointments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 ${
                activeTab === tab
                  ? 'text-[#EFEFED] border-b-2 border-blue-500'
                  : 'text-[#9C9FA4]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6">
          <div className="bg-[#262A36] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-[#EFEFED] mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[#9C9FA4]">Phone Number</p>
                <p className="text-[#EFEFED]">{patient.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-[#9C9FA4]">Date of Birth</p>
                <p className="text-[#EFEFED]">{patient.dateOfBirth || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-[#9C9FA4]">Gender</p>
                <p className="text-[#EFEFED]">{patient.gender || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {patient.medicalHistory && (
            <div className="bg-[#262A36] p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-[#EFEFED] mb-4">Medical History</h2>
              <ul className="list-disc list-inside text-[#EFEFED]">
                {patient.medicalHistory.map((item, index) => (
                  <li key={index} className="mb-2">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {patient.allergies && (
            <div className="bg-[#262A36] p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-[#EFEFED] mb-4">Allergies</h2>
              <ul className="list-disc list-inside text-[#EFEFED]">
                {patient.allergies.map((allergy, index) => (
                  <li key={index} className="mb-2">{allergy}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analyses' && (
        <div className="grid gap-4">
          {analyses.map((analysis) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#262A36] p-6 rounded-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#EFEFED]">
                    {analysis.conditionName || analysis.condition}
                  </h3>
                  <p className="text-[#9C9FA4]">
                    {format(analysis.date || analysis.createdAt, 'MMMM d, yyyy')}
                  </p>
                </div>
                <ButtonStyling
                  text="View Details"
                  onClick={() => router.push(`/analyses/${analysis.id}`)}
                  variant="secondary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[#9C9FA4]">Confidence</p>
                  <p className="text-[#EFEFED]">{analysis.confidence.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-[#9C9FA4]">Severity</p>
                  <p className={`text-[#EFEFED] font-semibold ${
                    analysis.severity === 'high' ? 'text-red-500' :
                    analysis.severity === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}
                  </p>
                </div>
              </div>
              {analysis.imageUrl && (
                <div className="mt-4 relative h-48 bg-[#171B26] rounded-lg overflow-hidden">
                  <Image
                    src={analysis.imageUrl}
                    alt={analysis.conditionName || analysis.condition}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              )}
            </motion.div>
          ))}
          {analyses.length === 0 && (
            <div className="text-center py-8 text-[#9C9FA4]">
              No analyses found for this patient
            </div>
          )}
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#262A36] p-6 rounded-lg"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-[#EFEFED]">
                  {format(appointment.date, 'MMMM d, yyyy')} at {appointment.time}
                </h3>
                <p className={`text-sm ${
                  appointment.status === 'completed' ? 'text-green-500' :
                  appointment.status === 'cancelled' ? 'text-red-500' :
                  'text-blue-500'
                }`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </p>
              </div>

              {appointment.diagnosis && (
                <div className="mb-4">
                  <p className="text-[#9C9FA4]">Diagnosis</p>
                  <p className="text-[#EFEFED]">{appointment.diagnosis}</p>
                </div>
              )}

              <PatientNotes
                appointmentId={appointment.id}
                patientId={patient.id}
                doctorId={user.uid}
                isDoctor={true}
                readOnly={appointment.status === 'completed'}
                appointmentStatus={appointment.status}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PatientDetailsPage;