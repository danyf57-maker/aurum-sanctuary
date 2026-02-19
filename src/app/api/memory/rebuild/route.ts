import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/firebase/admin";
import { rebuildLongMemory } from "@/lib/memory/long-memory";

async function getUserIdFromSession() {
  const sessionCookie = (await cookies()).get("__session")?.value;
  if (!sessionCookie) return null;
  const decoded = await auth.verifySessionCookie(sessionCookie, true);
  return decoded.uid;
}

export async function POST() {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const profile = await rebuildLongMemory(userId, {
      reason: "manual_rebuild",
      force: true,
      maxEntries: 300,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Unable to rebuild memory", error: message },
      { status: 500 }
    );
  }
}
