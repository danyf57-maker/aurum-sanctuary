import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { auth } from "@/lib/firebase/admin";
import { sendVerificationEmailForUser } from "@/lib/auth/verification-email";
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit";

function getClientAddress(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function isAllowedOrigin(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin) return true;
  const runtimeOrigin = new URL(request.url).origin;
  const configuredAppOrigin = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : runtimeOrigin;
  return new Set([runtimeOrigin, configuredAppOrigin]).has(requestOrigin);
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const body = (await request.json()) as {
      email?: unknown;
      locale?: unknown;
    };

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const locale = body.locale === "fr" ? "fr" : "en";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const ipRate = await rateLimit(
      RateLimitPresets.verificationEmail(`ip:${hashIdentifier(getClientAddress(request))}`)
    );
    const emailRate = await rateLimit(
      RateLimitPresets.verificationEmail(`email:${hashIdentifier(email)}`)
    );
    if (!ipRate.success || !emailRate.success) {
      return NextResponse.json(
        { ok: true, sent: false, throttled: true },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }

    try {
      const user = await auth.getUserByEmail(email);
      if (!user.email || user.emailVerified) {
        return NextResponse.json({ ok: true, sent: false }, { status: 200 });
      }

      const result = await sendVerificationEmailForUser({
        uid: user.uid,
        email: user.email,
        locale,
      });

      return NextResponse.json({ ok: true, ...result }, { status: 200 });
    } catch (error: any) {
      if (error?.code === "auth/user-not-found") {
        return NextResponse.json({ ok: true, sent: false }, { status: 200 });
      }
      throw error;
    }
  } catch (error) {
    console.error("send-verification-email failed", error);
    return NextResponse.json(
      { error: "Unable to send verification email right now." },
      { status: 500 }
    );
  }
}
