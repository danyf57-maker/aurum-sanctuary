import "server-only";

import { auth, db } from "@/lib/firebase/admin";
import { trackServerEvent } from "@/lib/analytics/server";

type Locale = "fr" | "en";

type SendVerificationEmailParams = {
  uid: string;
  email: string;
  locale: Locale;
};

type VerificationEmailSendResult = {
  sent: boolean;
  throttled?: boolean;
};

const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

function resolveAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://aurumdiary.com").trim();
}

function resolveFromEmail() {
  return process.env.ONBOARDING_FROM_EMAIL || "Aurum Diary <hello@aurumdiary.com>";
}

function resolveReplyTo() {
  return process.env.ONBOARDING_REPLY_TO || "hello@aurumdiary.com";
}

function buildCopy(locale: Locale, verificationUrl: string) {
  if (locale === "fr") {
    return {
      subject: "Vérifie ton email pour activer Aurum",
      text: [
        "Bonjour,",
        "",
        "Ton compte Aurum a bien été créé.",
        "Clique sur le lien ci-dessous pour vérifier ton email et activer ton espace de réflexion privé :",
        verificationUrl,
        "",
        "Si tu n'es pas à l'origine de cette inscription, tu peux ignorer ce message.",
        "",
        "Aurum",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1c1917;line-height:1.6">
          <h1 style="font-size:24px;margin:0 0 16px">Vérifie ton email</h1>
          <p>Ton compte Aurum a bien été créé.</p>
          <p>Clique sur le bouton ci-dessous pour vérifier ton email et activer ton espace de réflexion privé.</p>
          <p style="margin:24px 0">
            <a href="${verificationUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600">Vérifier mon email</a>
          </p>
          <p>Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :</p>
          <p style="word-break:break-all;color:#57534e">${verificationUrl}</p>
          <p style="color:#78716c;font-size:14px;margin-top:24px">Si tu n'es pas à l'origine de cette inscription, tu peux ignorer ce message.</p>
        </div>
      `,
    };
  }

  return {
    subject: "Verify your email to activate Aurum",
    text: [
      "Hello,",
      "",
      "Your Aurum account has been created.",
      "Use the link below to verify your email and activate your private reflection space:",
      verificationUrl,
      "",
      "If you did not create this account, you can ignore this email.",
      "",
      "Aurum",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1c1917;line-height:1.6">
        <h1 style="font-size:24px;margin:0 0 16px">Verify your email</h1>
        <p>Your Aurum account has been created.</p>
        <p>Use the button below to verify your email and activate your private reflection space.</p>
        <p style="margin:24px 0">
          <a href="${verificationUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600">Verify my email</a>
        </p>
        <p>If the button does not work, paste this link into your browser:</p>
        <p style="word-break:break-all;color:#57534e">${verificationUrl}</p>
        <p style="color:#78716c;font-size:14px;margin-top:24px">If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  };
}

async function sendViaResend(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resolveFromEmail(),
      to: [input.to],
      reply_to: resolveReplyTo(),
      subject: input.subject,
      html: input.html,
      text: input.text,
      tags: [{ name: "flow", value: "verification" }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend send failed (${response.status}): ${err}`);
  }
}

export async function sendVerificationEmailForUser(
  params: SendVerificationEmailParams
): Promise<VerificationEmailSendResult> {
  const email = params.email.trim().toLowerCase();
  const locale = params.locale === "fr" ? "fr" : "en";

  const user = await auth.getUser(params.uid);
  if (!user.email || user.email.toLowerCase() !== email || user.emailVerified) {
    return { sent: false };
  }

  const auditRef = db.collection("users").doc(params.uid).collection("auth").doc("verificationEmail");
  const auditSnap = await auditRef.get();
  const lastSentAtRaw = auditSnap.exists ? (auditSnap.data()?.lastSentAt as string | undefined) : undefined;
  const lastSentAt = lastSentAtRaw ? new Date(lastSentAtRaw) : null;
  if (lastSentAt && Date.now() - lastSentAt.getTime() < RESEND_COOLDOWN_MS) {
    return { sent: false, throttled: true };
  }

  const verificationUrl = await auth.generateEmailVerificationLink(email, {
    url: `${resolveAppUrl()}/auth/action?lang=${locale}`,
    handleCodeInApp: false,
  });
  const copy = buildCopy(locale, verificationUrl);
  await sendViaResend({
    to: email,
    subject: copy.subject,
    html: copy.html,
    text: copy.text,
  });

  const nowIso = new Date().toISOString();
  await auditRef.set(
    {
      lastSentAt: nowIso,
      sentVia: "resend",
      updatedAt: nowIso,
    },
    { merge: true }
  );

  await trackServerEvent("onboarding_email_sent", {
    userId: params.uid,
    userEmail: email,
    path: "/api/auth/send-verification-email",
    params: {
      locale,
      flow: "verification",
    },
  });

  return { sent: true };
}
