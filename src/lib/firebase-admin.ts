
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let firestore: Firestore;

if (getApps().length === 0) {
  try {
    const serviceAccount = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS as string
    );
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (e) {
    console.error('Firebase Admin SDK initialization error:', e);
    // Fallback for environments where GOOGLE_APPLICATION_CREDENTIALS might not be set
    // This allows the app to not crash instantly in certain local dev setups
    app = initializeApp();
  }
} else {
  app = getApps()[0];
}

firestore = getFirestore(app);

export { firestore };
