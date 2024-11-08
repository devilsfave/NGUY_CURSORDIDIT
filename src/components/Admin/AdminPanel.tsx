import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  setDoc, 
  getCountFromServer,
  getDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db }from '../../Firebase/config';
import ButtonStyling from '../ButtonStyling';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../contexts/AuthContext';
import { updateSystemStats } from '../../utils/systemStats';

interface Doctor {
  id: string;
  fullName: string;
  email: string;
  verified: boolean;
  licenseNumber: string;
  specialization: string;
  location: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SystemStats {
  totalUsers: number;
  totalDoctors: number;
  totalAnalyses: number;
  totalAppointments: number;
  totalReports: number;
  lastUpdated?: Date;
}

interface UserReport {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
}

interface AdminPanelProps {
  user: User;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [unverifiedDoctors, setUnverifiedDoctors] = useState<Doctor[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [adminCode, setAdminCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          setError('Unauthorized access: Admin privileges required');
          setLoading(false);
          return;
        }

        setIsAdmin(true);
        const unsubscribeDoctors = loadUnverifiedDoctors();
        const unsubscribeStats = loadSystemStats();
        const unsubscribeReports = loadUserReports();
        await loadAllDoctors();
        await updateSystemStats();
        setLoading(false);

        return () => {
          if (unsubscribeDoctors) unsubscribeDoctors();
          if (unsubscribeStats) unsubscribeStats();
          if (unsubscribeReports) unsubscribeReports();
        };
      } catch (error) {
        console.error('Error checking admin access:', error);
        setError('Failed to verify admin access');
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user.uid]);

  const getCountFromCollection = async (collectionName: string) => {
    try {
      const snapshot = await getCountFromServer(collection(db, collectionName));
      return snapshot.data().count;
    } catch (error) {
      console.error(`Error getting count from ${collectionName}:`, error);
      return 0;
    }
  };

  const updateSystemStats = async () => {
    try {
      const [usersCount, doctorsCount, analysesCount, appointmentsCount, reportsCount] = await Promise.all([
        getCountFromCollection('users'),
        getCountFromCollection('doctors'),
        getCountFromCollection('analyses'),
        getCountFromCollection('appointments'),
        getCountFromCollection('userReports')
      ]);

      const statsRef = doc(db, 'systemStats', 'stats');
      await setDoc(statsRef, {
        totalUsers: usersCount,
        totalDoctors: doctorsCount,
        totalAnalyses: analysesCount,
        totalAppointments: appointmentsCount,
        totalReports: reportsCount,
        lastUpdated: serverTimestamp()
      });

      setSystemStats({
        totalUsers: usersCount,
        totalDoctors: doctorsCount,
        totalAnalyses: analysesCount,
        totalAppointments: appointmentsCount,
        totalReports: reportsCount
      });
    } catch (error) {
      console.error('Error updating system stats:', error);
      setError('Failed to update system statistics');
    }
  };

  const loadUnverifiedDoctors = () => {
    try {
      const doctorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'doctor'),
        where('verified', '==', false)
      );

      return onSnapshot(doctorsQuery, (snapshot) => {
        const doctors = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as Doctor[];
        setUnverifiedDoctors(doctors);
      });
    } catch (error) {
      console.error('Error loading unverified doctors:', error);
      setError('Failed to load unverified doctors');
      return () => {};
    }
  };

  const loadSystemStats = () => {
    try {
      return onSnapshot(doc(db, 'systemStats', 'stats'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSystemStats({
            ...data,
            lastUpdated: data.lastUpdated?.toDate()
          } as SystemStats);
        }
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
      setError('Failed to load system statistics');
      return () => {};
    }
  };

  const loadUserReports = () => {
    try {
      const reportsQuery = query(
        collection(db, 'userReports'),
        where('status', '==', 'pending')
      );

      return onSnapshot(reportsQuery, (snapshot) => {
        const reports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate()
        })) as UserReport[];
        setUserReports(reports);
      });
    } catch (error) {
      console.error('Error loading user reports:', error);
      setError('Failed to load user reports');
      return () => {};
    }
  };

  const loadAllDoctors = async () => {
    try {
      const doctorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'doctor')
      );
      const snapshot = await getDocs(doctorsQuery);
      const doctors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setAllDoctors(doctors);
    } catch (error) {
      console.error('Error loading all doctors:', error);
      setError('Failed to load doctors list');
    }
  };

  const handleVerifyDoctor = async (doctorId: string) => {
    try {
      const doctorRef = doc(db, 'users', doctorId);
      await updateDoc(doctorRef, {
        verified: true,
        verifiedAt: serverTimestamp(),
        verifiedBy: user.uid
      });

      // Update system stats
      await updateSystemStats();

      setError('Doctor verified successfully');
    } catch (error) {
      console.error('Error verifying doctor:', error);
      setError('Failed to verify doctor');
    }
  };

  const handleRejectDoctor = async (doctorId: string) => {
    try {
      const doctorRef = doc(db, 'users', doctorId);
      await deleteDoc(doctorRef);
      setError('Doctor rejected and removed successfully');
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      setError('Failed to reject doctor');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      const reportRef = doc(db, 'userReports', reportId);
      await updateDoc(reportRef, {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        resolvedBy: user.uid
      });
      setError('Report marked as resolved');
    } catch (error) {
      console.error('Error resolving report:', error);
      setError('Failed to resolve report');
    }
  };

  const generateAdminCode = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const codeRef = doc(db, 'adminCodes', code);
      await setDoc(codeRef, {
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        used: false
      });
      setAdminCode(code);
    } catch (error) {
      console.error('Error generating admin code:', error);
      setError('Failed to generate admin code');
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAllDoctors(),
        updateSystemStats()
      ]);
      setError('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          className="h-16 w-16 border-t-4 border-blue-500 border-solid rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center text-[#EFEFED] p-4">
        {error || 'Unauthorized access'}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-[#171B26] rounded-lg max-w-7xl mx-auto"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-4 rounded ${
            error.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}
        >
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6 bg-[#262A36] p-4 rounded-lg"
      >
        <h3 className="text-xl font-semibold mb-4 text-[#EFEFED]">System Statistics</h3>
        {systemStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[#171B26] p-3 rounded">
              <p className="text-[#EFEFED]">Total Users: {systemStats.totalUsers}</p>
            </div>
            <div className="bg-[#171B26] p-3 rounded">
              <p className="text-[#EFEFED]">Total Doctors: {systemStats.totalDoctors}</p>
            </div>
            <div className="bg-[#171B26] p-3 rounded">
              <p className="text-[#EFEFED]">Total Analyses: {systemStats.totalAnalyses}</p>
            </div>
            <div className="bg-[#171B26] p-3 rounded">
              <p className="text-[#EFEFED]">Total Appointments: {systemStats.totalAppointments}</p>
            </div>
            <div className="bg-[#171B26] p-3 rounded">
              <p className="text-[#EFEFED]">Total Reports: {systemStats.totalReports}</p>
            </div>
          </div>
        )}
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h3 className="text-xl font-semibold mb-2 text-[#EFEFED]">Unverified Doctors</h3>
        <AnimatePresence>
          {unverifiedDoctors.length === 0 ? (
            <p className="text-[#EFEFED]">No unverified doctors at the moment.</p>
          ) : (
            unverifiedDoctors.map(doctor => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-[#262A36] p-4 rounded-lg mb-2"
              >
                <h4 className="text-lg font-semibold text-[#EFEFED]">{doctor.fullName}</h4>
                <p className="text-[#EFEFED]">Email: {doctor.email}</p>
                <p className="text-[#EFEFED]">License Number: {doctor.licenseNumber}</p>
                <p className="text-[#EFEFED]">Specialization: {doctor.specialization}</p>
                <p className="text-[#EFEFED]">Location: {doctor.location}</p>
                <div className="mt-2">
                  <ButtonStyling text="Verify" onClick={() => handleVerifyDoctor(doctor.id)} className="mr-2" />
                  <ButtonStyling text="Reject" onClick={() => handleRejectDoctor(doctor.id)} variant="secondary" />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h3 className="text-xl font-semibold mb-2 text-[#EFEFED]">All Doctors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allDoctors.map(doctor => (
            <div key={doctor.id} className="bg-[#262A36] p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-[#EFEFED]">{doctor.fullName}</h4>
              <p className="text-[#EFEFED]">Email: {doctor.email}</p>
              <p className="text-[#EFEFED]">Status: {doctor.verified ? 'Verified' : 'Unverified'}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
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

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mb-6"
      >
        <h3 className="text-xl font-semibold mb-2 text-[#EFEFED]">Generate Admin Code</h3>
        <ButtonStyling text="Generate Code" onClick={generateAdminCode} className="mb-2" />
        {adminCode && (
          <p className="text-[#EFEFED]">Generated Admin Code: {adminCode}</p>
        )}
      </motion.div>

      <ButtonStyling text="Refresh Data" onClick={refreshData} className="mb-4" />
    </motion.div>
  );
};

export default AdminPanel;