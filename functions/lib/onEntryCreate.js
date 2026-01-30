"use strict";
/**
 * Cloud Function: onEntryCreate
 *
 * Firestore Trigger: onCreate users/{uid}/entries/{entryId}
 *
 * Updates DerivedMemoryLite stats when a new entry is created.
 * This keeps the stats current for Mirror Chat without full processing.
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
exports.onEntryCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    admin.initializeApp();
}
const firestore = admin.firestore();
/**
 * onCreate trigger for entries subcollection
 *
 * Updates derivedMemory/lite stats:
 * - totalEntries
 * - avgWordsPerEntry
 * - lastEntryAt
 */
exports.onEntryCreate = functions.firestore
    .document('users/{uid}/entries/{entryId}')
    .onCreate(async (snap, context) => {
    const uid = context.params.uid;
    const entryData = snap.data();
    try {
        // Get current derivedMemory/lite
        const derivedMemoryRef = firestore.doc(`users/${uid}/derivedMemory/lite`);
        const derivedMemorySnap = await derivedMemoryRef.get();
        if (!derivedMemorySnap.exists) {
            // Initialize if doesn't exist (shouldn't happen, but defensive)
            await derivedMemoryRef.set({
                totalEntries: 1,
                avgWordsPerEntry: 0, // Can't calculate without decrypting
                lastEntryAt: entryData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
                labels: [],
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
        }
        const currentData = derivedMemorySnap.data();
        const newTotalEntries = (currentData.totalEntries || 0) + 1;
        // Update stats (note: avgWordsPerEntry requires decryption, done in Epic 5)
        await derivedMemoryRef.update({
            totalEntries: newTotalEntries,
            lastEntryAt: entryData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ DerivedMemoryLite updated for user: ${uid} (totalEntries: ${newTotalEntries})`);
    }
    catch (error) {
        console.error(`❌ Failed to update DerivedMemoryLite for user: ${uid}`, error);
        // Don't throw - this is non-critical
    }
});
//# sourceMappingURL=onEntryCreate.js.map