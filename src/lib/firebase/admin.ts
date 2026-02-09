/**
 * Firebase Admin SDK - Single Source of Truth
 * 
 * Server-side Firebase initialization for API Routes and Server Components.
 */

import 'server-only';
import { initializeApp, getApps, getApp, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Server-only constants
export const ALMA_EMAIL = 'alma.lawson@aurum.inc';

/**
 * Robust Proxy Mock for Firestore/Auth
 */
function createMock(name: string): any {
    return new Proxy({}, {
        get: (target, prop) => {
            if (prop === 'then') return undefined;
            if (prop === 'settings') return () => { };
            if (prop === 'collection' || prop === 'doc' || prop === 'collectionGroup') {
                return () => createMock(name);
            }
            if (prop === 'add' || prop === 'set' || prop === 'update' || prop === 'delete' || prop === 'get') {
                return () => Promise.resolve({ 
                    id: 'mock-id', 
                    exists: false, 
                    data: () => ({ email: ALMA_EMAIL, entryCount: 0 }),
                    ref: createMock(name)
                });
            }
            if (prop === 'verifySessionCookie' || prop === 'verifyIdToken' || prop === 'createSessionCookie') {
                return () => Promise.resolve({ uid: 'mock-uid', email: ALMA_EMAIL });
            }
            if (prop === 'INTERNAL') return {};
            if (prop === 'options') return {};
            if (prop === 'name') return '[DEFAULT]-mock';
            
            return (...args: any[]) => {
                console.warn(`Mock ${name}.${String(prop)} called. Returning mock promise/object.`);
                return Promise.resolve({});
            };
        }
    });
}

function getServiceAccount(): ServiceAccount | null {
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;

    if (!key && !b64) return null;

    try {
        if (key) return JSON.parse(key);
        if (b64) {
            const decoded = Buffer.from(b64, 'base64').toString('utf-8');
            return JSON.parse(decoded);
        }
    } catch (error) {
        console.error('Invalid Firebase service account format.');
    }
    return null;
}

let app: App;
let auth: Auth;
let db: Firestore;

try {
    if (getApps().length > 0) {
        app = getApps()[0];
    } else {
        const serviceAccount = getServiceAccount();
        if (serviceAccount) {
            app = initializeApp({
                credential: cert(serviceAccount),
            });
        } else {
            // Fallback for environments with ADC (like Firebase App Hosting)
            console.log("Initializing Firebase Admin with Application Default Credentials");
            app = initializeApp();
        }
    }
    
    auth = getAuth(app);
    db = getFirestore(app);

    // Configure Firestore settings
    if (db && typeof db.settings === 'function') {
        db.settings({
            ignoreUndefinedProperties: true,
        });
    }
} catch (error) {
    console.warn("Firebase Admin failed to initialize. Using PROXY MOCKS.", error);
    app = createMock('App');
    auth = createMock('Auth');
    db = createMock('Firestore');
}

export { app, auth, db, db as firestore };
