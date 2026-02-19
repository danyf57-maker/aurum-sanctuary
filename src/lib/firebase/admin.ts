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
export const PRIMARY_ADMIN_EMAIL = 'danyf57@gmail.com';
export const ALMA_EMAIL = 'alma.lawson@aurum.inc';
export const ADMIN_EMAILS = [PRIMARY_ADMIN_EMAIL] as const;

export function isAdminEmail(email?: string | null) {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase() as typeof ADMIN_EMAILS[number]);
}

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
                    data: () => ({ email: PRIMARY_ADMIN_EMAIL, entryCount: 0 }),
                    ref: createMock(name)
                });
            }
            if (prop === 'verifySessionCookie' || prop === 'verifyIdToken' || prop === 'createSessionCookie') {
                return () => Promise.resolve({ uid: 'mock-uid', email: PRIMARY_ADMIN_EMAIL });
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
        const normalizeServiceAccount = (raw: any): ServiceAccount => {
            return {
                projectId: raw?.projectId || raw?.project_id,
                clientEmail: raw?.clientEmail || raw?.client_email,
                privateKey: String(raw?.privateKey || raw?.private_key || '').replace(/\\n/g, '\n'),
            };
        };

        if (key) {
            return normalizeServiceAccount(JSON.parse(key));
        }
        if (b64) {
            const decoded = Buffer.from(b64.trim(), 'base64').toString('utf-8');
            return normalizeServiceAccount(JSON.parse(decoded));
        }
    } catch (error) {
        console.error('Invalid Firebase service account format.');
    }
    return null;
}

let app: App;
let auth: Auth;
let db: Firestore;
const ADMIN_APP_NAME = 'aurum-admin';

try {
    let isNewApp = false;
    const serviceAccount = getServiceAccount();

    // Use a named admin app to avoid accidentally reusing another default app
    // created without the expected credentials during local dev/HMR.
    if (getApps().some((existing) => existing.name === ADMIN_APP_NAME)) {
        app = getApp(ADMIN_APP_NAME);
    } else if (serviceAccount) {
        const projectId =
            (serviceAccount as ServiceAccount & { project_id?: string }).project_id ||
            serviceAccount.projectId;
        app = initializeApp(
            {
                credential: cert(serviceAccount),
                projectId,
            },
            ADMIN_APP_NAME
        );
        isNewApp = true;
    } else {
        // Fallback for environments with ADC (like Firebase App Hosting)
        console.log("Initializing Firebase Admin with Application Default Credentials");
        app = initializeApp({}, ADMIN_APP_NAME);
        isNewApp = true;
    }
    
    auth = getAuth(app);
    db = getFirestore(app);

    // Configure Firestore only on fresh init.
    // Calling settings() after Firestore has been used throws and must not break real DB access.
    if (isNewApp && db && typeof db.settings === 'function') {
        try {
            db.settings({
                ignoreUndefinedProperties: true,
            });
        } catch (error) {
            console.warn("Firestore settings skipped (already initialized).");
        }
    }
} catch (error) {
    console.warn("Firebase Admin failed to initialize. Using PROXY MOCKS.", error);
    app = createMock('App');
    auth = createMock('Auth');
    db = createMock('Firestore');
}

export { app, auth, db, db as firestore };
