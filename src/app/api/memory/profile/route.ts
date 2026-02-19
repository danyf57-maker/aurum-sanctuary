import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/firebase/admin";
import {
  getLongMemoryProfile,
  getLongMemorySettings,
} from "@/lib/memory/long-memory";

async function getUserIdFromSession() {
  const sessionCookie = (await cookies()).get("__session")?.value;
  if (!sessionCookie) return null;
  const decoded = await auth.verifySessionCookie(sessionCookie, true);
  return decoded.uid;
}

export async function GET() {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [settings, profile] = await Promise.all([
      getLongMemorySettings(userId),
      getLongMemoryProfile(userId),
    ]);

    return NextResponse.json({ settings, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Unable to fetch memory profile", error: message },
      { status: 500 }
    );
  }
}
