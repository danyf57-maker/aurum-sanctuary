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
 * Handles nested Firestore operations: db.collection().doc().collection().add()
 */
function createMock(name: string): any {
    return new Proxy({}, {
        get: (target, prop) => {
            if (prop === 'then') return undefined;
            if (prop === 'settings') return () => { };

            // Return mock for chaining: collection/doc/collectionGroup
            if (prop === 'collection' || prop === 'doc' || prop === 'collectionGroup') {
                return (...args: any[]) => {
                    console.log(`[MOCK] ${name}.${String(prop)}(${args.join(', ')})`);
                    return createMock(name); // Return mock for chaining
                };
            }

            // Firestore operations that return promises
            if (prop === 'add' || prop === 'set' || prop === 'delete') {
                return (...args: any[]) => {
                    console.log(`[MOCK] ${name}.${String(prop)} called with`, args.length > 0 ? 'data' : 'no args');
                    return Promise.resolve({
                        id: `mock-${Date.now()}`,
                        path: 'mock/path',
                        writeTime: new Date()
                    });
                };
            }

            if (prop === 'update') {
                return (...args: any[]) => {
                    console.log(`[MOCK] ${name}.update called`);
                    return Promise.resolve({
                        writeTime: new Date()
                    });
                };
            }

            if (prop === 'get') {
                return (...args: any[]) => {
                    console.log(`[MOCK] ${name}.get called`);
                    return Promise.resolve({
                        id: `mock-doc-${Date.now()}`,
                        exists: true, // Changed to true to simulate existing document
                        data: () => ({
                            email: ALMA_EMAIL,
                            entryCount: 0,
                            uid: 'mock-uid',
                            displayName: 'Mock User',
                            createdAt: new Date(),
                            subscriptionStatus: 'free'
                        }),
                        ref: createMock(name)
                    });
                };
            }

            // Auth operations
            if (prop === 'verifySessionCookie' || prop === 'verifyIdToken') {
                return (...args: any[]) => {
                    console.log(`[MOCK] Auth.${String(prop)} called`);
                    return Promise.resolve({
                        uid: 'mock-uid-' + Date.now(),
                        email: ALMA_EMAIL
                    });
                };
            }

            if (prop === 'createSessionCookie') {
                return (...args: any[]) => {
                    console.log(`[MOCK] Auth.createSessionCookie called`);
                    return Promise.resolve('mock-session-cookie-' + Date.now());
                };
            }

            // Default properties
            if (prop === 'INTERNAL') return {};
            if (prop === 'options') return {};
            if (prop === 'name') return '[DEFAULT]-mock';

            // Catch-all for other methods
            return (...args: any[]) => {
                console.warn(`[MOCK] ${name}.${String(prop)} called (unhandled). Args:`, args.length);
                return Promise.resolve(createMock(name));
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
    const serviceAccount = getServiceAccount();
    const hasAdcHints =
        Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
        Boolean(process.env.GOOGLE_CLOUD_PROJECT) ||
        Boolean(process.env.K_SERVICE) ||
        Boolean(process.env.FUNCTION_TARGET) ||
        Boolean(process.env.GAE_ENV);
    const shouldUseMockInDev = process.env.NODE_ENV === 'development' && !serviceAccount && !hasAdcHints;

    if (shouldUseMockInDev) {
        console.warn('Firebase Admin: no service account/ADC detected in development. Using PROXY MOCKS.');
        app = createMock('App');
        auth = createMock('Auth');
        db = createMock('Firestore');
    } else {
        if (getApps().length > 0) {
            app = getApps()[0];
        } else {
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
    }
} catch (error) {
    console.warn("Firebase Admin failed to initialize. Using PROXY MOCKS.", error);
    app = createMock('App');
    auth = createMock('Auth');
    db = createMock('Firestore');
}

export { app, auth, db, db as firestore };
