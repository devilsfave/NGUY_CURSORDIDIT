const admin = require('firebase-admin');
const serviceAccount = require('../../dermaviosion-ai-firebase-adminsdk-hgsd9-a2c65aa3b8.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateAnalysisSchema() {
  try {
    console.log('Starting analysis schema update...');
    
    const analysesRef = db.collection('analyses');
    console.log('Fetching existing analyses...');
    
    const snapshot = await analysesRef.get();
    console.log(`Found ${snapshot.size} analyses to update`);
    
    if (snapshot.empty) {
      console.log('No analyses to update');
      return;
    }

    const batch = db.batch();
    let updateCount = 0;
    
    snapshot.docs.forEach((document) => {
      const data = document.data();
      console.log(`Updating analysis: ${document.id}`);
      
      try {
        batch.update(document.ref, {
          attachedToAppointment: data.attachedToAppointment || false,
          appointmentId: data.appointmentId || null,
          attachedAt: data.attachedAt || null,
          patientId: data.patientId || data.userId,
          prediction: data.prediction || data.result || data.condition || '',
          conditionName: data.conditionName || data.condition || data.prediction || '',
          conditionDescription: data.conditionDescription || data.description || ''
        });
        updateCount++;
      } catch (error) {
        console.error(`Error updating document ${document.id}:`, error);
      }
    });
    
    if (updateCount > 0) {
      console.log(`Committing batch update for ${updateCount} documents...`);
      await batch.commit();
      console.log('Successfully updated analysis schema');
    } else {
      console.log('No documents needed updating');
    }
    
  } catch (error) {
    console.error('Error updating analysis schema:', error);
    throw error;
  }
}

// Verify connection before running update
async function verifyConnection() {
  try {
    const testRef = db.collection('system');
    await testRef.get();
    console.log('Firebase Admin connection verified');
    return true;
  } catch (error) {
    console.error('Firebase Admin connection failed:', error);
    return false;
  }
}

// Run the update with connection verification
async function run() {
  console.log('Verifying Firebase Admin connection...');
  
  const isConnected = await verifyConnection();
  if (!isConnected) {
    console.error('Cannot proceed without Firebase connection');
    process.exit(1);
  }

  try {
    await updateAnalysisSchema();
    console.log('Schema update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Schema update failed:', error);
    process.exit(1);
  }
}

// Start the process
run();