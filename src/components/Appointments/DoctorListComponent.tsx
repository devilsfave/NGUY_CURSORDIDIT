import React, { useState, useEffect } from 'react';
import ButtonStyling from '../ButtonStyling';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  verified: boolean;
}

interface DoctorListComponentProps {
  onDoctorSelect: (doctorId: string, doctorName: string) => void;
}

const sampleDoctors: Doctor[] = [
  { id: '1', name: 'Dr. FINN DYCH', specialty: 'Dermatology', verified: true },
  { id: '2', name: 'Dr. STEWART CONNOR', specialty: 'Dermatology', verified: true },
  { id: '3', name: 'Dr. KELVIN ASOMANIN', specialty: 'Dermatology', verified: true },
];

const DoctorListComponent: React.FC<DoctorListComponentProps> = ({ onDoctorSelect }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(sampleDoctors);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="doctor-list" className="my-8">
      <h2 className="text-2xl font-bold mb-4 text-[#EFEFED]">Select a Doctor</h2>
      <input
        type="text"
        placeholder="Search doctors..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 bg-[#262A36] text-[#EFEFED] rounded"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-[#262A36] p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-[#EFEFED]">{doctor.name}</h3>
            <p className="text-[#EFEFED] mb-2">{doctor.specialty}</p>
            <ButtonStyling
              text="Select"
              onClick={() => onDoctorSelect(doctor.id, doctor.name)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default DoctorListComponent;