import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (!getApps().length) {
  const serviceAccount = require('../../secrets/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

export const adminDb = admin.firestore();