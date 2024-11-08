import { auth, db }from '../Firebase/config';
import { doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';

export const updateStats = async (updates: {
  totalAnalyses?: number;
  totalAppointments?: number;
  totalUsers?: number;
  totalDoctors?: number;
  totalReports?: number;
}) => {
  try {
    const statsRef = doc(db, 'systemStats', 'stats');
    const statsDoc = await getDoc(statsRef);

    if (!statsDoc.exists()) {
      // Initialize stats if they don't exist
      await setDoc(statsRef, {
        totalAnalyses: 0,
        totalAppointments: 0,
        totalUsers: 0,
        totalDoctors: 0,
        totalReports: 0,
        lastUpdated: new Date()
      });
    }

    const updateData: any = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value) updateData[key] = increment(value);
    });
    
    updateData.lastUpdated = new Date();
    
    await updateDoc(statsRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating stats:', error);
    return false;
  }
};