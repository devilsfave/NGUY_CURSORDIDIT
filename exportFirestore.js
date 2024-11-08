const fs = require('fs');
const path = require('path');
const { getFirebaseAdmin } = require('./firebaseAdmin');

const admin = getFirebaseAdmin();
const firestore = admin.firestore();

async function exportData() {
  const backup = {};
  const collections = await firestore.listCollections();
  
  for (const collection of collections) {
    console.log(`Exporting collection: ${collection.id}`);
    backup[collection.id] = {};
    
    const snapshot = await collection.get();
    snapshot.forEach(doc => {
      backup[collection.id][doc.id] = doc.data();
    });
  }

  // Save backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, `backup_${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`Backup saved to: ${backupPath}`);
  
  return backup;
}

module.exports = { exportData };

// Only run if called directly
if (require.main === module) {
  exportData().catch(console.error);
}