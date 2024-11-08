require('dotenv').config({ path: '.env.local' });
const { getFirebaseAdmin } = require('./firebaseAdmin');
const { exportData } = require('./exportFirestore');

const admin = getFirebaseAdmin();
const db = admin.firestore();

console.log('Firebase Admin initialized successfully');

async function safeUpdate() {
  try {
    console.log('Starting safe update process...');
    
    // First, create a backup
    console.log('Creating backup...');
    await exportData();
    console.log('Backup completed successfully');

    // Then, update only necessary fields
    console.log('Starting to update documents...');
    const batch = db.batch();

    // Update appointment schema without overwriting data
    console.log('Fetching appointments collection...');
    const appointments = await db.collection('appointments').get();
    console.log(`Found ${appointments.size} appointments to process`);

    let updateCount = 0;
    appointments.forEach(doc => {
      const data = doc.data();
      const updates = {};
      
      // Only add fields if they don't exist
      if (!data.hasOwnProperty('confirmationSent')) {
        updates.confirmationSent = false;
        console.log(`Adding confirmationSent to document ${doc.id}`);
      }
      if (!data.hasOwnProperty('lastModifiedBy')) {
        updates.lastModifiedBy = 'system';
        console.log(`Adding lastModifiedBy to document ${doc.id}`);
      }
      if (!data.hasOwnProperty('completedAt')) {
        updates.completedAt = null;
        console.log(`Adding completedAt to document ${doc.id}`);
      }
      
      if (Object.keys(updates).length > 0) {
        batch.update(doc.ref, updates);
        updateCount++;
      }
    });

    console.log(`Preparing to update ${updateCount} documents`);

    if (updateCount > 0) {
      console.log('Committing batch updates...');
      await batch.commit();
      console.log(`Successfully updated ${updateCount} documents`);
    } else {
      console.log('No updates needed - all documents are up to date');
    }

    console.log('Safe update completed successfully');
    return updateCount;
  } catch (error) {
    console.error('Error during safe update:', error);
    throw error;
  }
}

// Run with retry logic
let retryCount = 0;
const MAX_RETRIES = 3;

const updateWithRetry = async () => {
  try {
    const updatedCount = await safeUpdate();
    console.log(`Update process completed. Updated ${updatedCount} documents.`);
    process.exit(0);
  } catch (error) {
    console.error('Error occurred:', error);
    retryCount++;
    if (retryCount < MAX_RETRIES) {
      console.log(`Retry attempt ${retryCount} of ${MAX_RETRIES}...`);
      setTimeout(updateWithRetry, 1000 * retryCount);
    } else {
      console.error('Max retries reached. Update failed:', error);
      process.exit(1);
    }
  }
};

console.log('Starting Firestore safe update process...');
updateWithRetry();