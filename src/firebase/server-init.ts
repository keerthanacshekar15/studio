// IMPORTANT: This file should NOT have 'use client' at the top
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a SERVER-ONLY file.

// Option 1: Initialize with service account credentials (preferred for server)
// This requires you to have the service account JSON file.
// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in your environment.
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('ascii'))
  : undefined;

const app = getApps().length
  ? getApp()
  : initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : { projectId: firebaseConfig.projectId });

const firestore = getFirestore(app);

export { app, firestore };
