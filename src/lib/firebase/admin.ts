/**
 * Firebase Admin SDK - Single Source of Truth
 *
 * Important:
 * We avoid top-level imports from firebase-admin/* to prevent build-time crashes
 * in environments where optional JWT dependencies break during Next.js page-data collection.
 */

import "server-only";
import type { App, ServiceAccount } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

export const PRIMARY_ADMIN_EMAIL = "danyf57@gmail.com";
export const ALMA_EMAIL = "alma.lawson@aurum.inc";
export const ADMIN_EMAILS = [PRIMARY_ADMIN_EMAIL] as const;

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}

function createMock(name: string): any {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === "then") return undefined;
        if (prop === "settings") return () => {};
        if (prop === "collection" || prop === "doc" || prop === "collectionGroup") {
          return () => createMock(name);
        }
        if (prop === "add" || prop === "set" || prop === "update" || prop === "delete" || prop === "get") {
          return () =>
            Promise.resolve({
              id: "mock-id",
              exists: false,
              data: () => ({ email: PRIMARY_ADMIN_EMAIL, entryCount: 0 }),
              ref: createMock(name),
            });
        }
        if (prop === "verifySessionCookie" || prop === "verifyIdToken" || prop === "createSessionCookie") {
          return () => Promise.reject(new Error("Firebase Admin Auth unavailable"));
        }
        if (prop === "INTERNAL") return {};
        if (prop === "options") return {};
        if (prop === "name") return "[DEFAULT]-mock";

        return () => Promise.resolve({});
      },
    }
  );
}

function getServiceAccount(): ServiceAccount | null {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;

  if (!key && !b64) return null;

  try {
    const normalize = (raw: any): ServiceAccount => ({
      projectId: raw?.projectId || raw?.project_id,
      clientEmail: raw?.clientEmail || raw?.client_email,
      privateKey: String(raw?.privateKey || raw?.private_key || "").replace(/\\n/g, "\n"),
    });

    if (key) return normalize(JSON.parse(key));
    if (b64) {
      const decoded = Buffer.from(b64.trim(), "base64").toString("utf-8");
      return normalize(JSON.parse(decoded));
    }
  } catch {
    console.error("Invalid Firebase service account format.");
  }

  return null;
}

let app: App;
let auth: Auth;
let db: Firestore;
const ADMIN_APP_NAME = "aurum-admin";

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const adminAppModule = require("firebase-admin/app") as {
    initializeApp: (...args: any[]) => App;
    getApps: () => App[];
    getApp: (name?: string) => App;
    cert: (serviceAccount: ServiceAccount) => any;
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const adminFirestoreModule = require("firebase-admin/firestore") as {
    getFirestore: (app?: App) => Firestore;
  };

  let isNewApp = false;
  const serviceAccount = getServiceAccount();

  if (adminAppModule.getApps().some((existing) => existing.name === ADMIN_APP_NAME)) {
    app = adminAppModule.getApp(ADMIN_APP_NAME);
  } else if (serviceAccount) {
    const projectId = serviceAccount.projectId;
    app = adminAppModule.initializeApp(
      {
        credential: adminAppModule.cert(serviceAccount),
        projectId,
      },
      ADMIN_APP_NAME
    );
    isNewApp = true;
  } else {
    app = adminAppModule.initializeApp({}, ADMIN_APP_NAME);
    isNewApp = true;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const adminAuthModule = require("firebase-admin/auth") as { getAuth: (app: App) => Auth };
    auth = adminAuthModule.getAuth(app);
  } catch {
    console.warn("Firebase Admin Auth failed to initialize. Using PROXY MOCK.");
    auth = createMock("Auth");
  }

  db = adminFirestoreModule.getFirestore(app);
  if (isNewApp && db && typeof db.settings === "function") {
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {
      // settings can only be called once
    }
  }
} catch (error) {
  console.warn("Firebase Admin failed to initialize. Using PROXY MOCKS.", error);
  app = createMock("App");
  auth = createMock("Auth");
  db = createMock("Firestore");
}

export { app, auth, db, db as firestore };
