import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { trackServerEvent } from "@/lib/analytics/server";
import { verifyOnboardingToken } from "@/lib/onboarding/token";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid") || "";
  const eid = request.nextUrl.searchParams.get("eid") || "";
  const token = request.nextUrl.searchParams.get("token") || "";

  let success = false;

  try {
    const verified = verifyOnboardingToken(token);
    if (verified && verified.uid === uid && verified.eid === eid && verified.kind === "unsubscribe") {
      const now = Timestamp.now();
      await Promise.all([
        db.collection("users").doc(uid).collection("settings").doc("preferences").set(
          {
            marketingUnsubscribedAt: now,
            updatedAt: now,
          },
          { merge: true }
        ),
        db.collection("users").doc(uid).collection("onboarding").doc("state").set(
          {
            unsubscribedAt: new Date().toISOString(),
            stoppedAt: new Date().toISOString(),
            stoppedReason: "unsubscribed",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ),
        trackServerEvent("onboarding_email_unsubscribed", {
          userId: uid,
          path: "/api/onboarding/unsubscribe",
          params: { email_id: eid },
        }),
      ]);
      success = true;
    }
  } catch {
    success = false;
  }

  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Désinscription Aurum</title>
</head>
<body style="font-family:Arial,sans-serif;background:#f8f7f4;color:#1c1917;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #ede9e1;border-radius:12px;padding:24px;">
    <h1 style="margin-top:0;font-size:24px;">Aurum Diary</h1>
    ${
      success
        ? "<p>Tu es bien désinscrit(e) des emails d'onboarding et communications marketing.</p>"
        : "<p>Le lien est invalide ou expiré. Si besoin, contacte hello@aurumdiary.com.</p>"
    }
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://aurumdiary.com"}">Retour à Aurum</a></p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
    status: success ? 200 : 400,
  });
}

