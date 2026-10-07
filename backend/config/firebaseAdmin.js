const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

const serviceAccount = require(
  path.join(__dirname, 'serviceAccountKey.json')
);

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
      })
    : getApps()[0];

const firebaseAuth = getAuth(firebaseApp);

module.exports = firebaseAuth;