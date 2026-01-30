"use strict";
/**
 * Cloud Function: onUserCreate
 *
 * Auth Trigger: onCreate user
 *
 * 1. Creates the user document in Firestore (users/{uid})
 *    - This is SERVER-SIDE creation to enforce Admin-Blind architecture.
 *    - The root user doc is READ-ONLY for the client.
 * 2. Initializes default settings (users/{uid}/settings/preferences)
 * 3. Initializes legal acceptance state (users/{uid}/settings/legal)
 * 4. Initializes DerivedMemoryLite (users/{uid}/derivedMemory/lite)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    admin.initializeApp();
}
const firestore = admin.firestore();
/**
 * onCreate auth trigger
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    const uid = user.uid;
    const email = user.email;
    const displayName = user.displayName;
    const photoURL = user.photoURL;
    try {
        const batch = firestore.batch();
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        // 1. Create Root User Document (Read-Only for Client)
        const userRef = firestore.doc(`users/${uid}`);
        batch.set(userRef, {
            uid,
            email,
            displayName,
            photoURL,
            createdAt: timestamp,
            stripeCustomerId: null,
            subscriptionStatus: 'free',
            entryCount: 0,
        });
        // 2. Initialize Preferences
        const prefsRef = firestore.doc(`users/${uid}/settings/preferences`);
        batch.set(prefsRef, {
            theme: 'system',
            language: 'fr',
            timezone: 'Europe/Paris', // Default, should be updated by client later
        });
        // 3. Initialize Legal Settings (Writable by Client)
        const legalRef = firestore.doc(`users/${uid}/settings/legal`);
        batch.set(legalRef, {
            termsAccepted: false,
            termsAcceptedAt: null,
            updatedAt: timestamp,
        });
        // 4. Initialize DerivedMemoryLite
        const memoryRef = firestore.doc(`users/${uid}/derivedMemory/lite`);
        batch.set(memoryRef, {
            totalEntries: 0,
            avgWordsPerEntry: 0,
            lastEntryAt: null,
            labels: [],
            updatedAt: timestamp,
        });
        await batch.commit();
        console.log(`✅ User document structure initialized for: ${uid}`);
    }
    catch (error) {
        console.error(`❌ Failed to initialize user structure for: ${uid}`, error);
        // We throw to alert Firebase that the function failed, 
        // though Auth creation itself cannot be rolled back easily.
        throw error;
    }
});
//# sourceMappingURL=onUserCreate.js.map