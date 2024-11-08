require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'dermaviosion-ai-firebase-adminsdk-hgsd9-a2c65aa3b8.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log('Firebase Config:', {
  projectId: serviceAccount.project_id,
  clientEmail: serviceAccount.client_email,
});

// Validation functions
const validateUserReport = (data) => {
  const requiredFields = ['userId', 'content', 'status'];
  const validStatuses = ['pending', 'resolved'];
  
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }
  
  if (!validStatuses.includes(data.status)) {
    throw new Error(`Invalid status: ${data.status}`);
  }
};

const validateAdminCode = (data) => {
  // Modified to handle both single codes and arrays of codes
  if (data.codes && Array.isArray(data.codes)) {
    if (data.codes.length === 0) throw new Error('Codes array cannot be empty');
    return;
  }
  
  if (data.code && typeof data.code === 'string') {
    if (typeof data.used !== 'boolean') {
      throw new Error('Invalid used status');
    }
    return;
  }
  
  throw new Error('Invalid admin code format');
};

const validateAppointment = (data) => {
  const requiredFields = ['patientId', 'doctorId', 'patientName', 'doctorName', 'date', 'time', 'status'];
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'scheduled'];
  
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }
  
  if (!validStatuses.includes(data.status)) {
    throw new Error(`Invalid status: ${data.status}`);
  }
};

async function initializeCollection(collectionName, docId, data, overwrite = false) {
  const docRef = db.collection(collectionName).doc(docId);
  const doc = await docRef.get();
  
  try {
    // Validate data based on collection type
    if (collectionName === 'userReports') {
      validateUserReport(data);
    }
    if (collectionName === 'adminCodes') {
      validateAdminCode(data);
    }
    if (collectionName === 'appointments') {
      validateAppointment(data);
    }

    if (!doc.exists) {
      await docRef.set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Created ${collectionName} document: ${docId}`);
    } else if (overwrite) {
      await docRef.set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`Updated ${collectionName} document: ${docId}`);
    } else {
      console.log(`${collectionName} document ${docId} already exists, preserving data...`);
    }
  } catch (error) {
    console.error(`Error processing ${collectionName}/${docId}:`, error);
    throw error;
  }
}

async function initializeFirestore() {
  try {
    console.log('Checking if Firestore is already initialized...');
    const initDoc = await db.collection('system').doc('init').get();

    // Updated collections with proper validation and structure
    const collections = [
      ['adminCodes', 'placeholder', {
        code: 'ADMIN123',
        used: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }],

      ['adminCodes', 'system_generated', {
        codes: ['ADMIN2024'],
        generatedBy: 'system',
        lastGenerated: admin.firestore.FieldValue.serverTimestamp()
      }],

      ['userReports', 'placeholder', {
        userId: 'placeholder_user_id',
        content: 'This is a placeholder report',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }],

      ['system', 'stats', {
        totalUsers: 0,
        totalDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        totalAnalyses: 0,
        pendingReports: 0,
        unverifiedDoctors: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }],

      ['system', 'settings', {
        adminEmailDomain: 'gmail.com',
        maxDailyAppointments: 20,
        appointmentDuration: 30,
        systemVersion: '1.0.0',
        maintenanceMode: false,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }]
    ];

    // Initialize all collections without overwriting existing data
    for (const [collection, docId, data] of collections) {
      await initializeCollection(collection, docId, data, false);
    }

    // Update system initialization status with version control
    const systemUpdate = {
      initialized: true,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      version: '2.3',
      collections: collections.map(([name]) => name.split('/')[0]),
      schema: {
        adminCodes: {
          version: '1.1',
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        },
        userReports: {
          version: '1.0',
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        },
        system: {
          version: '1.1',
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }
      }
    };

    await db.collection('system').doc('init').set(systemUpdate, { merge: true });
    console.log('Firestore collections initialized/updated successfully');
  } catch (error) {
    console.error('Error initializing/updating Firestore collections:', error);
    throw error;
  }
}

// Add error handling and retry logic
let retryCount = 0;
const MAX_RETRIES = 3;

const initializeWithRetry = async () => {
  try {
    await initializeFirestore();
    console.log('Firestore initialization/update process completed.');
    process.exit(0);
  } catch (error) {
    retryCount++;
    if (retryCount < MAX_RETRIES) {
      console.log(`Retry attempt ${retryCount} of ${MAX_RETRIES}...`);
      setTimeout(initializeWithRetry, 1000 * retryCount);
    } else {
      console.error('Max retries reached. Initialization failed:', error);
      process.exit(1);
    }
  }
};

console.log('Starting Firestore initialization/update process...');
initializeWithRetry();