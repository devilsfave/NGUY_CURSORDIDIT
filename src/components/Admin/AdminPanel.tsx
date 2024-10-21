import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, onSnapshot, setDoc, getCountFromServer } from 'firebase/firestore';
import { firestore as db } from '../../Firebase/config';
import ButtonStyling from '../ButtonStyling';
import { motion, AnimatePresence } from 'framer-motion';

interface Doctor {
  id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
}

interface SystemStats {
  totalUsers: number;
  totalDoctors: number;
  totalAnalyses: number;
}

interface UserReport {
  id: string;
  userId: string;
  content: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
}

interface AdminPanelProps {
  user: {
    email: string;
  };
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [unverifiedDoctors, setUnverifiedDoctors] = useState<Doctor[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    if (user.email !== 'herbertyeboah123@gmail.com') {
      return;
    }

    const unsubscribeDoctors = loadUnverifiedDoctors();
    const unsubscribeStats = loadSystemStats();
    const unsubscribeReports = loadUserReports();
    loadAllDoctors();

    return () => {
      unsubscribeDoctors();
      unsubscribeStats();
      unsubscribeReports();
    };
  }, [user.email]);

  const loadUnverifiedDoctors = () => {
    const q = query(collection(db, 'doctors'), where('isVerified', '==', false));
    return onSnapshot(q, (querySnapshot) => {
      const doctors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Doctor));
      setUnverifiedDoctors(doctors);
    }, (error) => {
      console.error('Error loading unverified doctors:', error);
    });
  };

  const loadSystemStats = () => {
    return onSnapshot(doc(db, 'systemStats', 'stats'), (snapshot) => {
      if (snapshot.exists()) {
        setSystemStats(snapshot.data() as SystemStats);
      } else {
        createSystemStatsDocument();
      }
    }, (error) => {
      console.error('Error loading system stats:', error);
    });
  };

  const createSystemStatsDocument = async () => {
    try {
      const initialStats: SystemStats = {
        totalUsers: 0,
        totalDoctors: 0,
        totalAnalyses: 0
      };
      await setDoc(doc(db, 'systemStats', 'stats'), initialStats);
    } catch (error) {
      console.error('Error creating system stats document:', error);
    }
  };

  const updateSystemStats = async () => {
    try {
      const usersCount = await getCountFromCollection('users');
      const doctorsCount = await getCountFromCollection('doctors');
      const analysesCount = await getCountFromCollection('analyses');

      await updateDoc(doc(db, 'systemStats', 'stats'), {
        totalUsers: usersCount,
        totalDoctors: doctorsCount,
        totalAnalyses: analysesCount
      });
    } catch (error) {
      console.error('Error updating system stats:', error);
    }
  };

  const getCountFromCollection = async (collectionName: string) => {
    const snapshot = await getCountFromServer(collection(db, collectionName));
    return snapshot.data().count;
  };

  const loadUserReports = () => {
    const q = query(collection(db, 'userReports'), where('status', '==', 'pending'));
    return onSnapshot(q, (querySnapshot) => {
      const reports = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      } as UserReport));
      setUserReports(reports);
    }, (error) => {
      console.error('Error loading user reports:', error);
    });
  };

  const loadAllDoctors = async () => {
    try {
      const doctorsRef = collection(db, 'doctors');
      const q = query(doctorsRef);
      const querySnapshot = await getDocs(q);
      const doctors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Doctor));
      setAllDoctors(doctors);
      console.log('All doctors:', doctors);
    } catch (error) {
      console.error('Error loading all doctors:', error);
    }
  };

  const handleVerifyDoctor = async (doctorId: string) => {
    try {
      await updateDoc(doc(db, 'doctors', doctorId), { isVerified: true });
      alert('Doctor verified successfully.');
      await updateSystemStats();
    } catch (error) {
      console.error('Error verifying doctor:', error);
      alert('Failed to verify doctor.');
    }
  };

  const handleRejectDoctor = async (doctorId: string) => {
    try {
      await deleteDoc(doc(db, 'doctors', doctorId));
      alert('Doctor rejected and deleted successfully.');
      await updateSystemStats();
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      alert('Failed to reject doctor.');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'userReports', reportId), { status: 'resolved' });
      alert('Report marked as resolved.');
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Failed to resolve report.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4 text-[#EFEFED]">Admin Panel</h2>
      
      {systemStats && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#262A36] p-4 rounded-lg mb-6"
        >
          <h3 className="text-xl font-semibold mb-2 text-[#EFEFED]">System Statistics</h3>
          <p className="text-[#EFEFED]">Total Users: {systemStats.totalUsers}</p>
          <p className="text-[#EFEFED]">Total Doctors: {systemStats.totalDoctors}</p>
          <p className="text-[#EFEFED]">Total Analyses: {systemStats.totalAnalyses}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h3 className="text-xl font-semibold mb-2 text-[#EFEFED]">Unverified Doctors</h3>
        <AnimatePresence>
          {unverifiedDoctors.map(doctor => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-[#262A36] p-4 rounded-lg mb-2"
            >
              <p className="text-[#EFEFED]">{doctor.fullName} - {doctor.email}</p>
              <div className="mt-2">
                <ButtonStyling text="Verify" onClick={() => handleVerifyDoctor(doctor.id)} className="mr-2" />
                <ButtonStyling text="Reject" onClick={() => handleRejectDoctor(doctor.id)} variant="secondary" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-6"
      >
        <h3 className="text-xl font-semibold mb-2 text-[#EFEFED]">All Doctors</h3>
        <ul className="space-y-2">
          {allDoctors.map(doctor => (
            <li key={doctor.id} className="bg-[#262A36] p-2 rounded">
              <p className="text-[#EFEFED]">{doctor.fullName} - {doctor.email} (Verified: {doctor.isVerified ? 'Yes' : 'No'})</p>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-xl font-semibold mb-2 text-[#EFEFED]">User Reports</h3>
        <AnimatePresence>
          {userReports.map(report => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-[#262A36] p-4 rounded-lg mb-2"
            >
              <p className="text-[#EFEFED]">User ID: {report.userId}</p>
              <p className="text-[#EFEFED]">Content: {report.content}</p>
              <p className="text-[#EFEFED]">Status: {report.status}</p>
              <p className="text-[#EFEFED]">Created At: {report.createdAt.toLocaleString()}</p>
              {report.status === 'pending' && (
                <ButtonStyling text="Mark as Resolved" onClick={() => handleResolveReport(report.id)} className="mt-2" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AdminPanel;