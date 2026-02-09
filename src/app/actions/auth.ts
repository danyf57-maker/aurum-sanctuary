"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/firebase/admin";

export async function getAuthedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) return null;
  if (!auth || typeof auth.verifySessionCookie !== "function") return null;

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function getAuthedUserEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) return null;
  if (!auth || typeof auth.verifySessionCookie !== "function") return null;

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    return decoded.email || null;
  } catch {
    return null;
  }
}
