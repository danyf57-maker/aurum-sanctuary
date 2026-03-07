import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BouncePayload = {
  email?: string;
  bounceType?: string;
};

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.ONBOARDING_BOUNCE_SECRET || "";
    const provided = request.headers.get("x-onboarding-bounce-secret") || "";
    if (!secret || provided !== secret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as BouncePayload;
    const email = String(body.email || "").trim().toLowerCase();
    const bounceType = String(body.bounceType || "hard").toLowerCase();
    if (!email) {
      return NextResponse.json({ message: "Missing email" }, { status: 400 });
    }

    if (bounceType !== "hard") {
      return NextResponse.json({ success: true, ignored: true });
    }

    const usersSnap = await db.collection("users").where("email", "==", email).limit(20).get();
    const now = new Date();
    const updates = usersSnap.docs.map((userDoc: any) =>
      Promise.all([
        userDoc.ref.collection("settings").doc("preferences").set(
          {
            invalidEmailAt: now,
            updatedAt: now,
          },
          { merge: true }
        ),
        userDoc.ref.collection("onboarding").doc("state").set(
          {
            invalidEmailAt: new Date().toISOString(),
            stoppedAt: new Date().toISOString(),
            stoppedReason: "hard_bounce",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ),
      ])
    );

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      matchedUsers: usersSnap.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Bounce processing failed", error: message }, { status: 500 });
  }
}
