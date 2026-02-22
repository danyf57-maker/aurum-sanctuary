import crypto from "crypto";

const DEFAULT_TTL_SEC = 60 * 60 * 24 * 30; // 30 jours

function getSecret() {
  return process.env.ONBOARDING_EMAIL_SECRET || process.env.FIREBASE_COOKIE_SECRET || "";
}

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function unb64url(input: string) {
  return Buffer.from(input, "base64url").toString("utf-8");
}

export function signOnboardingToken(payload: Record<string, string>, ttlSec = DEFAULT_TTL_SEC) {
  const secret = getSecret();
  if (!secret) throw new Error("Missing ONBOARDING_EMAIL_SECRET");

  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const data = { ...payload, exp: String(exp) };
  const raw = JSON.stringify(data);
  const body = b64url(raw);
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyOnboardingToken(token: string) {
  const secret = getSecret();
  if (!secret) throw new Error("Missing ONBOARDING_EMAIL_SECRET");
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (sig !== expected) return null;
  const decoded = JSON.parse(unb64url(body)) as Record<string, string>;
  const exp = Number(decoded.exp || 0);
  if (!exp || Date.now() / 1000 > exp) return null;
  return decoded;
}

