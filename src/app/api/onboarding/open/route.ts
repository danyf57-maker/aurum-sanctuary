import { NextRequest, NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { verifyOnboardingToken } from "@/lib/onboarding/token";

const PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
  "base64"
);

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid") || "";
  const eid = request.nextUrl.searchParams.get("eid") || "";
  const token = request.nextUrl.searchParams.get("token") || "";

  try {
    const verified = verifyOnboardingToken(token);
    if (verified && verified.uid === uid && verified.eid === eid && verified.kind === "open") {
      await trackServerEvent("onboarding_email_opened", {
        userId: uid,
        path: "/api/onboarding/open",
        params: {
          email_id: eid,
        },
      });
    }
  } catch {
    // pixel must always return 200
  }

  return new NextResponse(PIXEL_GIF, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

