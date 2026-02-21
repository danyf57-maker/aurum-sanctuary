import "server-only";
import { App, ServiceAccount, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

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
    console.error("Invalid Firebase service account format for admin-db.");
  }

  return null;
}

let app: App;
let db: Firestore;
const ADMIN_DB_APP_NAME = "aurum-admin-db";

if (getApps().some((existing) => existing.name === ADMIN_DB_APP_NAME)) {
  app = getApp(ADMIN_DB_APP_NAME);
} else {
  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    const projectId =
      (serviceAccount as ServiceAccount & { project_id?: string }).project_id ||
      serviceAccount.projectId;
    app = initializeApp(
      {
        credential: cert(serviceAccount),
        projectId,
      },
      ADMIN_DB_APP_NAME
    );
  } else {
    app = initializeApp({}, ADMIN_DB_APP_NAME);
  }
}

db = getFirestore(app);

try {
  db.settings({
    ignoreUndefinedProperties: true,
  });
} catch {
  // settings can only be called once per instance
}

export { db, db as firestore };

