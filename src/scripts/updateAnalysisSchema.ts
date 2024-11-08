import { auth, db }from '../Firebase/config';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

export async function updateAnalysisSchema() {
  try {
    const analysesRef = collection(db, 'analyses');
    const snapshot = await getDocs(analysesRef);
    
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      batch.update(doc.ref, {
        attachedToAppointment: data.attachedToAppointment || false,
        appointmentId: data.appointmentId || null,
        attachedAt: data.attachedAt || null,
        patientId: data.patientId || data.userId,
        // Map legacy fields to new ones
        prediction: data.prediction || data.result || data.condition,
        conditionName: data.conditionName || data.condition,
        conditionDescription: data.conditionDescription || data.description
      });
    });
    
    await batch.commit();
    console.log('Successfully updated analysis schema');
  } catch (error) {
    console.error('Error updating analysis schema:', error);
    throw error;
  }
}