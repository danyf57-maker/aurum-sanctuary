import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth, db, isAdminEmail } from "@/lib/firebase/admin";
import { logger } from "@/lib/logger/safe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    const sessionCookie = (await cookies()).get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    if (!isAdminEmail(decoded.email)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Lazy-load delete sentinels to keep the shared admin module build-safe.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { FieldValue } = require("firebase-admin/firestore") as {
      FieldValue: { delete: () => unknown };
    };

    const snapshot = await db
      .collection("users")
      .where("trialOrigin", "==", "app_no_card")
      .get();

    const now = new Date();
    const targets = snapshot.docs.filter((doc) => {
      const data = doc.data() as { subscriptionId?: string | null };
      return !data.subscriptionId;
    });

    await Promise.all(
      targets.map((doc) =>
        doc.ref.set(
          {
            subscriptionStatus: "free",
            billingPhase: "legacy_trial_migrated",
            trialMigratedAt: now,
            updatedAt: now,
            trialConsumedAt: FieldValue.delete(),
            trialStartedAt: FieldValue.delete(),
            subscriptionTrialEndsAt: FieldValue.delete(),
            trialOrigin: FieldValue.delete(),
            trialConfiguredDays: FieldValue.delete(),
          },
          { merge: true }
        )
      )
    );

    logger.infoSafe("Legacy no-card trials migrated", {
      migratedCount: targets.length,
    });

    return NextResponse.json({
      migrated: true,
      migratedCount: targets.length,
    });
  } catch (error) {
    logger.errorSafe("Failed to migrate legacy no-card trials", error);
    return NextResponse.json(
      { message: "Migration failed" },
      { status: 500 }
    );
  }
}
