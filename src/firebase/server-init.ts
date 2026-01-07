
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';
// We need to use require here because firebase-admin service account credentials
// are not available in the browser.
// Using a dynamic require prevents Next.js from trying to bundle it for the client.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

interface FirebaseAdminServices {
  app: App;
  firestore: Firestore;
}

export function initializeFirebase(): FirebaseAdminServices {
  if (getApps().length > 0) {
    const app = getApp();
    return {
      app,
      firestore: getFirestore(app),
    };
  }

  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Cannot initialize Firebase Admin SDK.');
  }

  const app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
  });

  const firestore = getFirestore(app);

  return {
    app,
    firestore,
  };
}
