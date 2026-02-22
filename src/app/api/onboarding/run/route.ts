import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { runOnboardingSequence } from "@/lib/onboarding/runner";
import { isAdminEmail, auth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const bearer = request.headers.get("authorization") || "";
    const token = bearer.startsWith("Bearer ") ? bearer.slice(7) : "";
    const expected = process.env.ONBOARDING_RUN_SECRET || "";

    let authorized = false;
    if (expected && token && token === expected) {
      authorized = true;
    } else {
      const sessionCookie = (await cookies()).get("__session")?.value;
      if (sessionCookie) {
        try {
          const decoded = await auth.verifySessionCookie(sessionCookie, true);
          authorized = isAdminEmail(decoded.email);
        } catch {
          authorized = false;
        }
      }
    }

    if (!authorized) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await runOnboardingSequence();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Run failed", error: message }, { status: 500 });
  }
}

