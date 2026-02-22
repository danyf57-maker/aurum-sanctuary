import type { EmailTemplateResult, OnboardingEmailId } from "@/lib/onboarding/types";
import { signOnboardingToken } from "@/lib/onboarding/token";

type TemplateInput = {
  emailId: OnboardingEmailId;
  firstName: string;
  userId: string;
  appBaseUrl: string;
};

function safeName(firstName: string) {
  const normalized = firstName.trim();
  return normalized || "toi";
}

function trackedUrl(
  appBaseUrl: string,
  userId: string,
  emailId: OnboardingEmailId,
  targetUrl: string
) {
  const token = signOnboardingToken({
    uid: userId,
    eid: emailId,
    kind: "click",
    target: targetUrl,
  });
  const params = new URLSearchParams({
    uid: userId,
    eid: emailId,
    target: targetUrl,
    token,
  });
  return `${appBaseUrl}/api/onboarding/click?${params.toString()}`;
}

function unsubscribeUrl(appBaseUrl: string, userId: string, emailId: OnboardingEmailId) {
  const token = signOnboardingToken({
    uid: userId,
    eid: emailId,
    kind: "unsubscribe",
  });
  const params = new URLSearchParams({
    uid: userId,
    eid: emailId,
    token,
  });
  return `${appBaseUrl}/api/onboarding/unsubscribe?${params.toString()}`;
}

function openPixelUrl(appBaseUrl: string, userId: string, emailId: OnboardingEmailId) {
  const token = signOnboardingToken({
    uid: userId,
    eid: emailId,
    kind: "open",
  });
  const params = new URLSearchParams({
    uid: userId,
    eid: emailId,
    token,
  });
  return `${appBaseUrl}/api/onboarding/open?${params.toString()}`;
}

export function renderOnboardingEmail(input: TemplateInput): EmailTemplateResult {
  const name = safeName(input.firstName);
  const writeUrl = trackedUrl(input.appBaseUrl, input.userId, input.emailId, `${input.appBaseUrl}/sanctuary/write`);
  const magazineUrl = trackedUrl(input.appBaseUrl, input.userId, input.emailId, `${input.appBaseUrl}/sanctuary/magazine`);
  const unsubUrl = unsubscribeUrl(input.appBaseUrl, input.userId, input.emailId);
  const pixel = openPixelUrl(input.appBaseUrl, input.userId, input.emailId);

  const contentByEmail: Record<OnboardingEmailId, { subject: string; preheader: string; body: string; ctaLabel: string; ctaUrl: string }> = {
    email_1: {
      subject: "Bienvenue sur Aurum, ton espace est prêt",
      preheader: "Ton premier pas prend moins de 2 minutes.",
      body: `Salut ${name},<br/><br/>Bienvenue dans Aurum. Quand ta tête est pleine, écris ici pour remettre tes idées dans l'ordre.<br/><br/>Commence par une mini page: un fait, une émotion, un besoin.`,
      ctaLabel: "Écrire ma première page",
      ctaUrl: writeUrl,
    },
    email_2: {
      subject: "Un petit rappel doux pour ton journal",
      preheader: "Une phrase suffit pour commencer.",
      body: `Salut ${name},<br/><br/>Tu n'as pas besoin d'écrire longtemps pour avancer. Une phrase claire peut déjà calmer une journée agitée.<br/><br/>Aurum est là pour t'écouter, sans pression.`,
      ctaLabel: "Commencer maintenant",
      ctaUrl: writeUrl,
    },
    email_3: {
      subject: "Ton calme se construit mot après mot",
      preheader: "Écrire un peu, régulièrement, change la suite.",
      body: `Salut ${name},<br/><br/>Écrire, c'est remettre de l'ordre dans ce qui tourne en boucle.<br/><br/>Tu peux reprendre là où tu t'es arrêté et voir ton chemin dans Magazine.`,
      ctaLabel: "Voir mon Magazine",
      ctaUrl: magazineUrl,
    },
    email_4: {
      subject: "Déjà 1 semaine avec Aurum",
      preheader: "On continue avec une routine simple et utile.",
      body: `Salut ${name},<br/><br/>Bravo pour cette première semaine. Même de petites pages régulières créent de vrais repères.<br/><br/>Objectif simple: garder ton rythme, une page à la fois.`,
      ctaLabel: "Reprendre mon rythme",
      ctaUrl: writeUrl,
    },
  };

  const selected = contentByEmail[input.emailId];
  const html = `
<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f8f7f4;font-family:Arial,sans-serif;color:#1c1917;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${selected.preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #ede9e1;border-radius:16px;padding:28px;">
            <tr><td style="font-size:28px;font-weight:700;font-family:Georgia,serif;color:#1c1917;">Aurum</td></tr>
            <tr><td style="height:16px;"></td></tr>
            <tr><td style="font-size:16px;line-height:1.6;color:#292524;">${selected.body}</td></tr>
            <tr><td style="height:24px;"></td></tr>
            <tr>
              <td>
                <a href="${selected.ctaUrl}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;">
                  ${selected.ctaLabel}
                </a>
              </td>
            </tr>
            <tr><td style="height:28px;"></td></tr>
            <tr>
              <td style="font-size:12px;color:#78716c;line-height:1.5;">
                Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.<br/>
                <a href="${unsubUrl}" style="color:#78716c;">Se désinscrire</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <img src="${pixel}" alt="" width="1" height="1" style="display:block;border:0;outline:none;" />
  </body>
</html>`;

  const text =
    `Salut ${name},\n\n` +
    selected.body.replace(/<br\/>/g, "\n").replace(/<[^>]+>/g, "") +
    `\n\n${selected.ctaLabel}: ${selected.ctaUrl}\n\n` +
    `Se désinscrire: ${unsubUrl}\n`;

  return {
    subject: selected.subject,
    html,
    text,
  };
}

