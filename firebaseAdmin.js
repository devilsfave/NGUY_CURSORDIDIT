const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'dermaviosion-ai-firebase-adminsdk-hgsd9-a2c65aa3b8.json');
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase only if it hasn't been initialized
function getFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return admin;
}

module.exports = { getFirebaseAdmin };