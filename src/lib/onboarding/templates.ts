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
  const pricingUrl = trackedUrl(input.appBaseUrl, input.userId, input.emailId, `${input.appBaseUrl}/pricing`);
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
      subject: `Déjà une semaine, ${name} !`,
      preheader: "Célébrer ce premier jalon et continuer ton rythme.",
      body: `Salut ${name},<br/><br/>Félicitations ! Cela fait maintenant 7 jours que tu as commencé ton journal avec Aurum Diary.<br/><br/>Que tu aies écrit tous les jours ou juste une seule fois, le plus important est fait : tu as ouvert la porte à un dialogue avec toi-même. C&apos;est le pas le plus difficile, et tu l&apos;as franchi.<br/><br/>La suite de l&apos;aventure est encore plus intéressante. En continuant, tu ne vas pas seulement accumuler des souvenirs. Tu vas commencer à voir des schémas se dessiner, à comprendre tes humeurs, à découvrir ce qui te donne de l&apos;énergie et ce qui t&apos;en prend.<br/><br/>Plus tard, tu découvriras comment Aurum Diary peut t&apos;aider avec des analyses plus poussées pour accélérer cette découverte. Mais pour l&apos;instant, l&apos;essentiel est de continuer à écrire, même juste une ligne.<br/><br/>Pour marquer cette première semaine, quelle est ta pensée du jour ?<br/><br/>Fier de ton parcours jusqu&apos;ici.<br/><br/>Daniel`,
      ctaLabel: "Écrire ma pensée du jour",
      ctaUrl: writeUrl,
    },
    habit_email_1: {
      subject: "Tu as commencé: bravo pour ce premier pas",
      preheader: "Le plus difficile est fait: garder un rythme simple et realiste.",
      body: `Salut ${name},<br/><br/>Tu as deja commencé à écrire, et c&apos;est excellent.<br/><br/>La clé maintenant, ce n&apos;est pas d&apos;écrire longtemps. C&apos;est d&apos;écrire régulièrement, même quelques lignes.<br/><br/>Voici une mini-structure qui marche bien :<br/>1) Un fait de ta journée<br/>2) Une émotion que tu ressens<br/>3) Un besoin pour demain<br/><br/>En 3 minutes, tu peux clarifier beaucoup de choses.<br/><br/>Continue comme ça.<br/><br/>Daniel`,
      ctaLabel: "Continuer mon écriture",
      ctaUrl: writeUrl,
    },
    habit_email_2: {
      subject: "Ton rythme se construit, une ligne apres l'autre",
      preheader: "Transforme ton ecriture en routine simple et utile.",
      body: `Salut ${name},<br/><br/>Quand on écrit un peu chaque semaine, on commence à voir des repères : ce qui te vide, ce qui te recharge, ce qui revient souvent.<br/><br/>Pas besoin de performance. Une phrase utile vaut mieux qu&apos;une page parfaite.<br/><br/>Si tu veux un prompt tout prêt aujourd&apos;hui :<br/><strong>&quot;Qu&apos;est-ce qui m&apos;a pris de l&apos;énergie, et qu&apos;est-ce qui m&apos;en a redonné ?&quot;</strong><br/><br/>Tu avances dans la bonne direction.<br/><br/>Daniel`,
      ctaLabel: "Écrire 3 minutes",
      ctaUrl: writeUrl,
    },
    free_limit_followup: {
      subject: "Tu as atteint tes 5 entrées gratuites",
      preheader: "Tu peux continuer avec 7 jours offerts, sans casser ton élan.",
      body: `Salut ${name},<br/><br/>Tu as déjà posé 5 entrées dans Aurum.<br/><br/>C&apos;est plus qu&apos;un test. C&apos;est le début d&apos;un rythme.<br/><br/>Quand on écrit quelques lignes régulièrement, on commence souvent à mieux distinguer ce qui pèse, ce qui revient, et ce qui apaise.<br/><br/>Pour continuer sans t&apos;arrêter maintenant, tu peux activer tes 7 jours offerts et garder cet élan.<br/><br/>Daniel`,
      ctaLabel: "Activer mes 7 jours offerts",
      ctaUrl: pricingUrl,
    },
    trial_started: {
      subject: "Tes 7 jours offerts ont commencé",
      preheader: "Cette semaine, le plus important est de prendre un rythme simple.",
      body: `Salut ${name},<br/><br/>Tes 7 jours offerts sont maintenant actifs.<br/><br/>Le plus utile pendant cette semaine n&apos;est pas d&apos;écrire longtemps. C&apos;est d&apos;écrire régulièrement, même peu.<br/><br/>Quelques lignes suffisent souvent à faire baisser le bruit intérieur et à remettre un peu d&apos;ordre dans ce qu&apos;on ressent.<br/><br/>Si tu ne sais pas quoi écrire aujourd&apos;hui, commence par cette question :<br/><br/><strong>&quot;Qu&apos;est-ce qui prend le plus de place dans ma tête aujourd&apos;hui ?&quot;</strong><br/><br/>Daniel`,
      ctaLabel: "Écrire aujourd'hui",
      ctaUrl: writeUrl,
    },
    trial_ending_soon: {
      subject: "Ton essai se termine bientôt",
      preheader: "Ce que tu as commencé à construire mérite peut-être de continuer.",
      body: `Salut ${name},<br/><br/>Ton essai Aurum arrive bientôt à sa fin.<br/><br/>Depuis quelques jours, tu as commencé à créer un espace à toi. Et c&apos;est souvent là que la valeur du journaling apparaît : non pas dans une seule entrée, mais dans la continuité.<br/><br/>Quand on revient écrire plusieurs fois, on commence à voir ce qui se répète, ce qui fatigue, ce qui soulage, et ce qu&apos;on n&apos;arrivait pas encore à nommer.<br/><br/>Si Aurum t&apos;aide à garder ce lien avec toi-même, le plus simple est de continuer à ton rythme.<br/><br/>Daniel`,
      ctaLabel: "Continuer avec Aurum",
      ctaUrl: pricingUrl,
    },
    subscription_active: {
      subject: "Bienvenue dans Aurum en continu",
      preheader: "Ton espace reste ouvert, et tu peux continuer à ton rythme.",
      body: `Salut ${name},<br/><br/>Ton abonnement Aurum est maintenant actif.<br/><br/>Tu as choisi de garder un espace à toi pour écrire, clarifier, et revenir quand tu en as besoin.<br/><br/>La valeur du journaling se construit rarement en un jour. Elle apparaît avec le temps, à mesure que les entrées s&apos;accumulent et que certains motifs deviennent plus visibles.<br/><br/>Tu peux continuer exactement comme il faut : quelques lignes quand c&apos;est utile, plus quand c&apos;est nécessaire.<br/><br/>Daniel`,
      ctaLabel: "Retourner écrire",
      ctaUrl: writeUrl,
    },
    trial_expired_no_conversion: {
      subject: "Ton essai est terminé",
      preheader: "Tu peux revenir quand tu veux, sans repartir de zéro.",
      body: `Salut ${name},<br/><br/>Ton essai Aurum est maintenant terminé.<br/><br/>Peut-être que ce n&apos;était pas le bon moment. Peut-être aussi que tu as seulement manqué de temps pour vraiment installer ton rythme.<br/><br/>Dans tous les cas, il n&apos;y a rien à forcer.<br/><br/>Si tu veux revenir, Aurum est là pour t&apos;aider à reprendre un fil, poser ce qui t&apos;encombre, et retrouver un peu de clarté au milieu du bruit.<br/><br/>Daniel`,
      ctaLabel: "Revenir à Aurum",
      ctaUrl: pricingUrl,
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
