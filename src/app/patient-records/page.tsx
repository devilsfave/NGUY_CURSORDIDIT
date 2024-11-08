'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db }from '../../Firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import SectionLoader from '../../components/common/SectionLoader';
import { handleError } from '../../utils/errorHandler';

interface PatientRecord {
  id: string;
  name: string;
  email: string;
  lastVisit?: Date;
  totalVisits: number;
  totalAnalyses: number;
}

const PatientRecordsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    if (!user) return;

    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, where('doctorId', '==', user.uid));
      const snapshot = await getDocs(q);

      const patientMap = new Map<string, PatientRecord>();

      snapshot.docs.forEach(doc => {
        const appointment = doc.data();
        const patientId = appointment.patientId;

        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            id: patientId,
            name: appointment.patientName,
            email: appointment.patientEmail || '',
            lastVisit: appointment.date?.toDate(),
            totalVisits: 1,
            totalAnalyses: appointment.attachedAnalysisId ? 1 : 0
          });
        } else {
          const record = patientMap.get(patientId)!;
          record.totalVisits++;
          if (appointment.attachedAnalysisId) {
            record.totalAnalyses++;
          }
          if (appointment.date?.toDate() > record.lastVisit!) {
            record.lastVisit = appointment.date.toDate();
          }
        }
      });

      setPatients(Array.from(patientMap.values()));
    } catch (error) {
      handleError(error, 'fetching patient records');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <SectionLoader text="Loading patient records..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-2xl font-bold text-[#EFEFED] mb-6">Patient Records</h1>

      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9C9FA4]" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#262A36] text-[#EFEFED] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#262A36] p-6 rounded-lg"
          >
            <h3 className="text-xl font-semibold text-[#EFEFED] mb-2">{patient.name}</h3>
            <p className="text-[#9C9FA4] mb-4">{patient.email}</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[#9C9FA4]">Last Visit</p>
                <p className="text-[#EFEFED]">
                  {patient.lastVisit ? patient.lastVisit.toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[#9C9FA4]">Total Visits</p>
                <p className="text-[#EFEFED]">{patient.totalVisits}</p>
              </div>
              <div>
                <p className="text-[#9C9FA4]">Total Analyses</p>
                <p className="text-[#EFEFED]">{patient.totalAnalyses}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-[#9C9FA4]">
            No patients found
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PatientRecordsPage;