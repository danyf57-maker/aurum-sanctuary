import { NextRequest, NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { verifyOnboardingToken } from "@/lib/onboarding/token";

function safeTarget(target: string) {
  try {
    const url = new URL(target);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid") || "";
  const eid = request.nextUrl.searchParams.get("eid") || "";
  const token = request.nextUrl.searchParams.get("token") || "";
  const target = request.nextUrl.searchParams.get("target") || "";
  const fallback = process.env.NEXT_PUBLIC_APP_URL || "https://aurumdiary.com";

  try {
    const verified = verifyOnboardingToken(token);
    const safe = safeTarget(target);
    if (
      verified &&
      verified.uid === uid &&
      verified.eid === eid &&
      verified.kind === "click" &&
      verified.target === target &&
      safe
    ) {
      await trackServerEvent("onboarding_email_link_clicked", {
        userId: uid,
        path: "/api/onboarding/click",
        params: {
          email_id: eid,
          target_url: safe,
        },
      });
      return NextResponse.redirect(safe, 302);
    }
  } catch {
    // fallback below
  }

  return NextResponse.redirect(fallback, 302);
}

