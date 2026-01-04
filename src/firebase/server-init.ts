// IMPORTANT: This file should NOT have 'use client' at the top
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This is a SERVER-ONLY file.

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


// Initialize Firebase Admin SDK only once
const app = getApps().length
  ? getApp('__server__') // Use a named app to avoid conflicts with client SDK
  : initializeApp(
      serviceAccount
        ? { credential: cert(serviceAccount) }
        : undefined, // If no credentials, Admin SDK will try to use Application Default Credentials
      '__server__' // Named app
    );

const firestore = getFirestore(app);

export { app, firestore };
