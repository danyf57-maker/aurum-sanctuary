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
      subject: `Bienvenue dans Aurum Diary, ${name} !`,
      preheader: "Un premier pas simple pour commencer ton journaling.",
      body: `Salut ${name},<br/><br/>Et bienvenue dans Aurum Diary ! Je suis Daniel, le créateur de l&apos;application.<br/><br/>Je suis ravi de te compter parmi nous. Si tu es là, c&apos;est probablement que tu cherches à mettre plus de clarté dans tes pensées, et tu as fait le premier pas dans la bonne direction.<br/><br/>La plupart des gens abandonnent le journaling parce qu&apos;ils ne savent pas par où commencer. Mon conseil : ne te mets pas la pression.<br/><br/>Pour ta toute première entrée, écris simplement une phrase. Une seule. Sur ce que tu ressens, là, maintenant.<br/><br/>À très vite,<br/>Daniel`,
      ctaLabel: "Écrire ma première entrée",
      ctaUrl: writeUrl,
    },
    email_2: {
      subject: "La page blanche ?",
      preheader: "Une question simple pour démarrer sans pression.",
      body: `Salut ${name},<br/><br/>Hier, je te conseillais d&apos;écrire une seule phrase pour commencer.<br/><br/>Parfois, même trouver cette première phrase est difficile. C&apos;est tout à fait normal. L&apos;inspiration ne se commande pas.<br/><br/>Alors aujourd&apos;hui, je te propose un jeu. Pas besoin de réfléchir.<br/><br/>Réponds juste à cette simple question dans ta prochaine entrée :<br/><br/><strong>&quot;De quoi suis-je reconnaissant(e) aujourd&apos;hui, même si c&apos;est tout petit ?&quot;</strong><br/><br/>Ça peut être ton café du matin, un rayon de soleil, une musique... Il n&apos;y a pas de mauvaise réponse.<br/><br/>Le plus dur est de commencer. On le fait ensemble.<br/><br/>Daniel`,
      ctaLabel: "Répondre à cette question",
      ctaUrl: writeUrl,
    },
    email_3: {
      subject: "Ce n'est pas juste un journal...",
      preheader: "Un dialogue silencieux, mais puissant.",
      body: `Salut ${name},<br/><br/>Cela fait maintenant trois jours que tu as rejoint Aurum Diary. J&apos;espère que tu commences à y trouver un espace qui te ressemble.<br/><br/>En créant cet outil, j&apos;ai beaucoup lu sur l&apos;impact du journaling. Une chose m&apos;a marqué : ce n&apos;est pas seulement un endroit pour &quot;vider son sac&quot;. C&apos;est un espace pour se rencontrer soi-même. Un dialogue silencieux, mais puissant.<br/><br/>Beaucoup d&apos;utilisateurs me disent qu&apos;au début, ils ne savent pas quoi écrire, puis un jour, une prise de conscience émerge au fil des mots.<br/><br/>Cela m&apos;a amené à une question que je trouve particulièrement utile pour ce genre de découverte. Aujourd&apos;hui, je te la propose :<br/><br/><strong>&quot;Quelle est une chose que j&apos;ai apprise sur moi-même récemment ?&quot;</strong><br/><br/>Prends quelques minutes pour y réfléchir. Il n&apos;y a pas de bonne ou de mauvaise réponse, juste ta vérité du moment.<br/><br/>Continue ce dialogue avec toi-même. C&apos;est le plus important.<br/><br/>Daniel`,
      ctaLabel: "Explorer cette question",
      ctaUrl: writeUrl,
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
            <tr><td style="height:10px;"></td></tr>
            <tr><td style="height:2px;background:#D4AF37;border-radius:999px;"></td></tr>
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
