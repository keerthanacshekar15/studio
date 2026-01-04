
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let firestore: Firestore;

if (!getApps().length) {
  // This initializes the app using Application Default Credentials
  // It's the recommended way for server environments like Cloud Run / App Hosting
  app = initializeApp();
} else {
  app = getApps()[0];
}

firestore = getFirestore(app);

export { firestore };
