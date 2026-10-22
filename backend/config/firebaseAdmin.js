const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (parseError) {
    throw new Error(
      'Invalid FIREBASE_SERVICE_ACCOUNT_JSON environment variable: ' +
        parseError.message
    );
  }
} else {
  // Check custom path, Render default secret file path, or local folder
  const candidatePaths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH &&
      path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
    '/etc/secrets/serviceAccountKey.json',
    path.join(__dirname, 'serviceAccountKey.json'),
  ].filter(Boolean);

  const foundPath = candidatePaths.find((p) => fs.existsSync(p));

  if (!foundPath) {
    throw new Error(
      'Firebase service account credentials not found. ' +
        'Set FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON string) or FIREBASE_SERVICE_ACCOUNT_PATH (file path).'
    );
  }

  serviceAccount = JSON.parse(fs.readFileSync(foundPath, 'utf8'));
}

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
      })
    : getApps()[0];

const firebaseAuth = getAuth(firebaseApp);

module.exports = firebaseAuth;
