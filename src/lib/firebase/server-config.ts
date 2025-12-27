import { initializeApp, getApps, getApp, FirebaseApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, Firestore } from "firebase-admin/firestore";

// This is a workaround for Vercel when serializing service account credentials
const serviceAccount: ServiceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

function getAdminApp(): FirebaseApp {
    if (getApps().some(app => app.name === 'admin')) {
        return getApp('admin');
    }
    return initializeApp({
        credential: cert(serviceAccount)
    }, 'admin');
}

function getDb(): Firestore {
    return getAdminFirestore(getAdminApp());
}

const db: Firestore = getDb();

export { getAdminApp, db };
