import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function readProvidedSecret(request: NextRequest) {
  const headerSecret = request.headers.get("x-analytics-export-secret");
  if (headerSecret) return headerSecret;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return request.nextUrl.searchParams.get("secret");
}

export async function requireAnalyticsExportAccess(request: NextRequest) {
  const configuredSecret = process.env.ANALYTICS_EXPORT_SECRET?.trim();
  const providedSecret = readProvidedSecret(request)?.trim();

  if (configuredSecret && providedSecret && providedSecret === configuredSecret) {
    return null;
  }

  const { auth, isAdminEmail } = await import("@/lib/firebase/admin");
  const sessionCookie = (await cookies()).get("__session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = await auth.verifySessionCookie(sessionCookie, true);
  if (!isAdminEmail(decoded.email)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return null;
}
