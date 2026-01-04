// IMPORTANT: This file should NOT have 'use client' at the top
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// This is a SERVER-ONLY file.

// Define a type for our singleton object
type FirebaseAdminServices = {
  app: App;
  firestore: Firestore;
};

// Use a global symbol to store the singleton instance.
// This is robust against module re-evaluation in serverless environments.
const FB_ADMIN_SINGLETON_KEY = Symbol.for('firebase.admin.singleton');

// Extend the NodeJS.Global interface to declare our custom global property
declare global {
  var [FB_ADMIN_SINGLETON_KEY]: FirebaseAdminServices | undefined;
}

function getAdminServices(): FirebaseAdminServices {
  // If the singleton instance already exists, return it.
  if (global[FB_ADMIN_SINGLETON_KEY]) {
    return global[FB_ADMIN_SINGLETON_KEY]!;
  }

  // This logic is designed to work in a server environment like Vercel or Firebase Functions.
  // It safely attempts to parse the service account credentials from an environment variable.
  let serviceAccount;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      serviceAccount = JSON.parse(
        Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('ascii')
      );
    } catch (e) {
      console.error('Error parsing GOOGLE_APPLICATION_CREDENTIALS, Firebase Admin might not be initialized correctly.', e);
    }
  }

  // Check if the default app is already initialized
  const apps = getApps();
  const app = apps.length
    ? apps[0]!
    : initializeApp(
        serviceAccount
          ? { credential: cert(serviceAccount) }
          : undefined // If no credentials, Admin SDK will try to use Application Default Credentials
      );

  const firestore = getFirestore(app);

  // Create the singleton instance and store it on the global object.
  const singletonInstance: FirebaseAdminServices = { app, firestore };
  global[FB_ADMIN_SINGLETON_KEY] = singletonInstance;

  return singletonInstance;
}

// Export the firestore instance by calling the singleton accessor
const { firestore, app } = getAdminServices();

export { firestore, app };
