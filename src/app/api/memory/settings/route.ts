import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/firebase/admin";
import {
  getLongMemorySettings,
  setLongMemoryEnabled,
} from "@/lib/memory/long-memory";

async function getUserIdFromSession() {
  const sessionCookie = (await cookies()).get("__session")?.value;
  if (!sessionCookie) return null;
  const decoded = await auth.verifySessionCookie(sessionCookie, true);
  return decoded.uid;
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const enabled = Boolean(body.enabled);

    await setLongMemoryEnabled(userId, enabled);
    const settings = await getLongMemorySettings(userId);

    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Unable to update memory settings", error: message },
      { status: 500 }
    );
  }
}
