import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { auth, db }from '../../Firebase/config';
import ButtonStyling from '../ButtonStyling';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  verified: boolean;
  location?: string;
  experience?: string;
  licenseNumber?: string;
  rating?: number;
  availableDays?: string[];
}

interface DoctorListComponentProps {
  onDoctorSelect: (doctorId: string, doctorName: string) => void;
}

const DoctorListComponent: React.FC<DoctorListComponentProps> = ({ onDoctorSelect }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const DOCTORS_PER_PAGE = 10;

  const fetchDoctors = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'users'),
        where('role', '==', 'doctor'),
        where('verified', '==', true),
        orderBy('fullName'),
        limit(DOCTORS_PER_PAGE)
      );

      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const doctorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === DOCTORS_PER_PAGE);

      if (loadMore) {
        setDoctors(prev => [...prev, ...doctorsData]);
      } else {
        setDoctors(doctorsData);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = specializationFilter === 'all' || doctor.specialization === specializationFilter;
    const matchesLocation = locationFilter === 'all' || doctor.location === locationFilter;
    return matchesSearch && matchesSpecialization && matchesLocation;
  });

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 rounded bg-[#171B26] text-[#EFEFED] border border-[#3F4354]"
        />
        <select
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
          className="p-2 rounded bg-[#171B26] text-[#EFEFED] border border-[#3F4354]"
        >
          <option value="all">All Specializations</option>
          <option value="dermatologist">Dermatologist</option>
          <option value="general">General Practitioner</option>
        </select>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="p-2 rounded bg-[#171B26] text-[#EFEFED] border border-[#3F4354]"
        >
          <option value="all">All Locations</option>
          <option value="remote">Remote</option>
          <option value="local">Local</option>
        </select>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#171B26] p-4 rounded-lg"
            >
              <h3 className="text-lg font-semibold text-[#EFEFED] mb-2">{doctor.fullName}</h3>
              <p className="text-[#9C9FA4] mb-1">{doctor.specialization}</p>
              {doctor.location && (
                <p className="text-[#9C9FA4] mb-1">{doctor.location}</p>
              )}
              {doctor.experience && (
                <p className="text-[#9C9FA4] mb-1">{doctor.experience} years experience</p>
              )}
              <ButtonStyling
                text="Book Appointment"
                onClick={() => onDoctorSelect(doctor.id, doctor.fullName)}
                variant="primary"
                className="w-full mt-4"
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {loading && (
        <div className="text-center mt-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#EFEFED]"></div>
        </div>
      )}

      {hasMore && !loading && (
        <div className="mt-4 text-center">
          <ButtonStyling
            text="Load More"
            onClick={() => fetchDoctors(true)}
            variant="secondary"
          />
        </div>
      )}

      {!loading && filteredDoctors.length === 0 && (
        <div className="text-center text-[#EFEFED] mt-4">
          No doctors found matching your criteria.
        </div>
      )}
    </motion.section>
  );
};

export default DoctorListComponent;