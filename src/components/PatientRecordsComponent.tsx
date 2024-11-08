import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db }from '../Firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { handleError } from '../utils/errorHandler';
import { useRouter } from 'next/navigation';
import { cache } from '../services/cacheService';
import SectionLoader from './common/SectionLoader';

interface PatientRecord {
  patientId: string;
  fullName: string;
  email: string;
  gender?: string;
  dateOfBirth?: string;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  lastUpdated?: any;
}

const PatientRecords = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user || user.role !== 'doctor') {
        router.push('/dashboard');
        return;
      }

      try {
        // Try to get cached data first
        const cacheKey = `patient_records_${user.uid}`;
        const cachedData = cache.get<PatientRecord[]>(cacheKey);
        
        if (cachedData) {
          setPatients(cachedData);
          setLoading(false);
          return;
        }

        // Query users with role 'patient'
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'patient'));
        const querySnapshot = await getDocs(q);

        // Get patient records for each patient
        const patientData = await Promise.all(
          querySnapshot.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            const recordRef = doc(db, 'patientRecords', userDoc.id);
            const recordSnap = await getDoc(recordRef);
            const recordData = recordSnap.data();

            return {
              patientId: userDoc.id,
              fullName: userData.fullName || 'N/A',
              email: userData.email,
              gender: userData.gender,
              dateOfBirth: userData.dateOfBirth,
              medicalHistory: userData.medicalHistory,
              allergies: recordData?.allergies || [],
              medications: recordData?.medications || [],
              lastUpdated: recordData?.lastUpdated || null
            };
          })
        );

        // Simple cache set without options
        cache.set(cacheKey, patientData);
        setPatients(patientData);
      } catch (error) {
        handleError(error, 'fetching patient records');
        toast.error('Failed to load patient records');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user, router]);

  if (loading) {
    return <SectionLoader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-2xl font-bold text-[#EFEFED] mb-6">Patient Records</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <motion.div
            key={patient.patientId}
            whileHover={{ scale: 1.02 }}
            className="bg-[#262A36] p-6 rounded-lg shadow-lg cursor-pointer hover:bg-[#2F3441] transition-colors duration-200"
            onClick={() => router.push(`/patients/${patient.patientId}`)}
          >
            <h2 className="text-xl font-semibold text-[#EFEFED] mb-4">{patient.fullName}</h2>
            <div className="space-y-2 text-[#9C9FA4]">
              <p><span className="font-medium">Email:</span> {patient.email}</p>
              {patient.gender && <p><span className="font-medium">Gender:</span> {patient.gender}</p>}
              {patient.dateOfBirth && (
                <p><span className="font-medium">Date of Birth:</span> {patient.dateOfBirth}</p>
              )}
              {patient.medicalHistory && (
                <p><span className="font-medium">Medical History:</span> {patient.medicalHistory}</p>
              )}
              {patient.allergies && patient.allergies.length > 0 && (
                <p><span className="font-medium">Allergies:</span> {patient.allergies.join(', ')}</p>
              )}
              {patient.medications && patient.medications.length > 0 && (
                <p><span className="font-medium">Medications:</span> {patient.medications.join(', ')}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {patients.length === 0 && (
        <div className="text-center py-8 text-[#9C9FA4]">
          No patient records found
        </div>
      )}
    </motion.div>
  );
};

export default PatientRecords;