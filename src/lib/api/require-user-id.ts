import type { NextRequest } from "next/server";
import { auth } from "@/lib/firebase/admin";

type RequestBodyWithAuth = {
  idToken?: unknown;
  userId?: unknown;
};

type GuardErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "SERVICE_UNAVAILABLE";

export class UserGuardError extends Error {
  status: number;
  code: GuardErrorCode;

  constructor(status: number, code: GuardErrorCode, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim() || null;
}

export async function requireUserIdFromRequest(
  request: NextRequest,
  body?: RequestBodyWithAuth
): Promise<string> {
  const authName = (auth as { name?: string } | undefined)?.name;
  const isMockAuth = typeof authName === "string" && authName.includes("mock");
  if (!auth || isMockAuth) {
    throw new UserGuardError(
      503,
      "SERVICE_UNAVAILABLE",
      "Authentification temporairement indisponible. Merci de réessayer."
    );
  }

  const bearerToken = getBearerToken(request);
  const bodyIdToken = typeof body?.idToken === "string" ? body.idToken : null;
  const sessionCookie = request.cookies.get("__session")?.value || null;

  let uid: string | null = null;

  if (bearerToken) {
    try {
      const decoded = await auth.verifyIdToken(bearerToken);
      uid = decoded.uid;
    } catch {
      throw new UserGuardError(401, "UNAUTHORIZED", "Session invalide. Reconnecte-toi.");
    }
  } else if (bodyIdToken) {
    try {
      const decoded = await auth.verifyIdToken(bodyIdToken);
      uid = decoded.uid;
    } catch {
      throw new UserGuardError(401, "UNAUTHORIZED", "Session invalide. Reconnecte-toi.");
    }
  } else if (sessionCookie) {
    try {
      const decoded = await auth.verifySessionCookie(sessionCookie, true);
      uid = decoded.uid;
    } catch {
      throw new UserGuardError(401, "UNAUTHORIZED", "Session expirée. Reconnecte-toi.");
    }
  } else {
    throw new UserGuardError(401, "UNAUTHORIZED", "Authentification requise.");
  }

  if (!uid) {
    throw new UserGuardError(401, "UNAUTHORIZED", "Session invalide. Reconnecte-toi.");
  }

  if (typeof body?.userId === "string" && body.userId && body.userId !== uid) {
    throw new UserGuardError(403, "FORBIDDEN", "userId incohérent avec la session.");
  }

  return uid;
}
