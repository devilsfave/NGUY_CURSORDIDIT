import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { auth, db }from '../Firebase/config';

interface SystemStats {
  totalAppointments?: number;
  totalReports?: number;
  totalAnalyses?: number;
  totalUsers?: number;
  totalDoctors?: number;
  updatedAt?: Date;
  createdAt?: Date;
}

export const updateSystemStats = async (updates: SystemStats) => {
  try {
    const statsRef = doc(db, 'systemStats', 'global');
    const statsDoc = await getDoc(statsRef);

    if (!statsDoc.exists()) {
      // Initialize stats if they don't exist
      await setDoc(statsRef, {
        totalAppointments: updates.totalAppointments || 0,
        totalReports: updates.totalReports || 0,
        totalAnalyses: updates.totalAnalyses || 0,
        totalUsers: updates.totalUsers || 0,
        totalDoctors: updates.totalDoctors || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Update existing stats
      const updateData: any = {
        updatedAt: new Date()
      };

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'updatedAt' && key !== 'createdAt') {
          updateData[key] = increment(value);
        }
      });

      await setDoc(statsRef, updateData, { merge: true });
    }
    return true;
  } catch (error) {
    console.error('Error updating system stats:', error);
    return false;
  }
};
