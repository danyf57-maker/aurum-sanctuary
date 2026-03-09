import type { EmailTemplateResult, OnboardingEmailId } from "@/lib/onboarding/types";
import type { Locale } from "@/lib/locale";
import { signOnboardingToken } from "@/lib/onboarding/token";

type TemplateInput = {
  emailId: OnboardingEmailId;
  firstName: string;
  userId: string;
  appBaseUrl: string;
  locale: Locale;
};

type EmailCopy = {
  subject: string;
  preheader: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  footer: string;
  unsubscribeLabel: string;
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
  const pricingUrl = trackedUrl(input.appBaseUrl, input.userId, input.emailId, `${input.appBaseUrl}/pricing`);
  const unsubUrl = unsubscribeUrl(input.appBaseUrl, input.userId, input.emailId);
  const pixel = openPixelUrl(input.appBaseUrl, input.userId, input.emailId);
  const isFr = input.locale === 'fr';

  const contentByEmail: Record<OnboardingEmailId, Record<Locale, EmailCopy>> = {
    email_1: {
      fr: {
        subject: `Bienvenue dans Aurum Diary, ${name} !`,
        preheader: "Un premier pas simple pour commencer ton journaling.",
        body: `Bonjour ${name},<br/><br/>Et bienvenue dans Aurum Diary ! Je suis Daniel, le créateur de l&apos;application.<br/><br/>La plupart des gens abandonnent le journaling parce qu&apos;ils ne savent pas par où commencer. Mon conseil : ne te mets pas la pression.<br/><br/>Pour ta toute première entrée, écris simplement une phrase. Une seule. Sur ce que tu ressens, là, maintenant.<br/><br/>À très vite,<br/>Daniel`,
        ctaLabel: "Écrire ma première entrée",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: `Welcome to Aurum Diary, ${name}!`,
        preheader: "A simple first step to begin journaling.",
        body: `Hi ${name},<br/><br/>And welcome to Aurum Diary. I&apos;m Daniel, the creator of the app.<br/><br/>Most people give up on journaling because they don&apos;t know how to begin. My advice: don&apos;t put pressure on yourself.<br/><br/>For your very first entry, write just one sentence. Only one. About what you feel, right now.<br/><br/>See you soon,<br/>Daniel`,
        ctaLabel: "Write my first entry",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    email_2: {
      fr: {
        subject: "La page blanche ?",
        preheader: "Une question simple pour démarrer sans pression.",
        body: `Bonjour ${name},<br/><br/>Parfois, même trouver la première phrase est difficile. C&apos;est normal.<br/><br/>Alors aujourd&apos;hui, je te propose une seule question :<br/><br/><strong>&quot;De quoi suis-je reconnaissant(e) aujourd&apos;hui, même si c&apos;est tout petit ?&quot;</strong><br/><br/>Pas besoin d&apos;aller plus loin que ça. Le plus dur est de commencer.<br/><br/>Daniel`,
        ctaLabel: "Répondre à cette question",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Blank page?",
        preheader: "One simple question to start without pressure.",
        body: `Hi ${name},<br/><br/>Sometimes even finding the first sentence is hard. That&apos;s normal.<br/><br/>So today, I&apos;m giving you just one question:<br/><br/><strong>&quot;What am I grateful for today, even if it&apos;s something very small?&quot;</strong><br/><br/>You don&apos;t need to go further than that. The hardest part is starting.<br/><br/>Daniel`,
        ctaLabel: "Answer this question",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    email_3: {
      fr: {
        subject: "Ce n'est pas juste un journal...",
        preheader: "Un dialogue silencieux, mais puissant.",
        body: `Bonjour ${name},<br/><br/>Le journaling n&apos;est pas seulement un endroit pour vider son sac. C&apos;est aussi un espace pour se rencontrer soi-même.<br/><br/>Aujourd&apos;hui, je te propose cette question :<br/><br/><strong>&quot;Quelle est une chose que j&apos;ai apprise sur moi-même récemment ?&quot;</strong><br/><br/>Il n&apos;y a pas de bonne ou de mauvaise réponse. Juste ta vérité du moment.<br/><br/>Daniel`,
        ctaLabel: "Explorer cette question",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "This is more than a journal...",
        preheader: "A quiet dialogue, but a powerful one.",
        body: `Hi ${name},<br/><br/>Journaling is not only a place to unload what you carry. It can also become a place where you meet yourself more clearly.<br/><br/>Today, here is one question for you:<br/><br/><strong>&quot;What is one thing I&apos;ve learned about myself recently?&quot;</strong><br/><br/>There is no right or wrong answer. Only what feels true for you right now.<br/><br/>Daniel`,
        ctaLabel: "Explore this question",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    email_4: {
      fr: {
        subject: `Déjà une semaine, ${name} !`,
        preheader: "Célébrer ce premier jalon et continuer ton rythme.",
        body: `Bonjour ${name},<br/><br/>Cela fait déjà une semaine depuis tes débuts sur Aurum.<br/><br/>Que tu aies écrit souvent ou seulement une fois, le plus important est là : tu as ouvert la porte à un dialogue avec toi-même.<br/><br/>Le plus utile maintenant est de continuer, même avec quelques lignes.<br/><br/>Daniel`,
        ctaLabel: "Écrire ma pensée du jour",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: `Already one week, ${name}!`,
        preheader: "Celebrate this first milestone and keep your rhythm going.",
        body: `Hi ${name},<br/><br/>It has already been a week since you started with Aurum.<br/><br/>Whether you wrote often or only once, the most important thing is already true: you opened a door to a conversation with yourself.<br/><br/>What matters now is simply to continue, even with just a few lines.<br/><br/>Daniel`,
        ctaLabel: "Write today’s thought",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    habit_email_1: {
      fr: {
        subject: "Tu as commencé : bravo pour ce premier pas",
        preheader: "Le plus difficile est fait : garder un rythme simple et réaliste.",
        body: `Bonjour ${name},<br/><br/>Tu as déjà commencé à écrire, et c&apos;est excellent.<br/><br/>La clé maintenant, ce n&apos;est pas d&apos;écrire longtemps. C&apos;est d&apos;écrire régulièrement, même quelques lignes.<br/><br/>Une mini-structure qui marche bien : un fait, une émotion, un besoin.<br/><br/>Daniel`,
        ctaLabel: "Continuer mon écriture",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "You started: that first step matters",
        preheader: "The hardest part is done: keep the rhythm simple and realistic.",
        body: `Hi ${name},<br/><br/>You already started writing, and that is excellent.<br/><br/>The key now is not to write for a long time. It is to write regularly, even just a few lines.<br/><br/>A simple structure that works well: one fact, one emotion, one need.<br/><br/>Daniel`,
        ctaLabel: "Keep writing",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    habit_email_2: {
      fr: {
        subject: "Ton rythme se construit, une ligne après l'autre",
        preheader: "Transforme ton écriture en routine simple et utile.",
        body: `Bonjour ${name},<br/><br/>Quand on écrit un peu chaque semaine, on commence à voir des repères : ce qui te vide, ce qui te recharge, ce qui revient souvent.<br/><br/>Pas besoin de performance. Une phrase utile vaut mieux qu&apos;une page parfaite.<br/><br/>Daniel`,
        ctaLabel: "Écrire 3 minutes",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Your rhythm is forming, one line at a time",
        preheader: "Turn your writing into a simple, useful routine.",
        body: `Hi ${name},<br/><br/>When you write a little each week, you start to notice markers: what drains you, what restores you, what comes back again and again.<br/><br/>No performance needed. One useful sentence is better than a perfect page.<br/><br/>Daniel`,
        ctaLabel: "Write for 3 minutes",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    free_limit_followup: {
      fr: {
        subject: "Tu as atteint tes 5 entrées gratuites",
        preheader: "Tu peux continuer avec 7 jours offerts.",
        body: `Bonjour ${name},<br/><br/>Tu as déjà commencé quelque chose d&apos;utile.<br/><br/>Mettre ses pensées en mots aide souvent à y voir plus clair, surtout quand elles tournent en boucle.<br/><br/>Pour continuer sans couper ton élan, tu peux activer tes 7 jours offerts.<br/><br/>Daniel`,
        ctaLabel: "Activer mes 7 jours offerts",
        ctaUrl: pricingUrl,
        footer: "Tu reçois cet email car tu as atteint la limite gratuite d'Aurum.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "You reached your 5 free entries",
        preheader: "You can keep going with 7 free days.",
        body: `Hi ${name},<br/><br/>You have already started something useful.<br/><br/>Putting thoughts into words often helps bring more clarity, especially when they keep looping in your mind.<br/><br/>To keep going without breaking your momentum, you can activate your 7 free days.<br/><br/>Daniel`,
        ctaLabel: "Start my 7 free days",
        ctaUrl: pricingUrl,
        footer: "You are receiving this email because you reached Aurum's free limit.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    trial_started: {
      fr: {
        subject: "Bienvenue dans Aurum",
        preheader: "Ton espace est prêt. Quelques lignes suffisent pour commencer.",
        body: `Bonjour ${name},<br/><br/>Bienvenue dans Aurum.<br/><br/>Ton espace est prêt, et tu peux commencer simplement, sans pression.<br/><br/>Quelques lignes suffisent souvent à faire baisser le bruit intérieur et à remettre un peu d&apos;ordre dans ce que l&apos;on ressent.<br/><br/>Si tu ne sais pas par où commencer, essaie simplement :<br/><br/><strong>&quot;Qu&apos;est-ce qui prend le plus de place dans ma tête aujourd&apos;hui ?&quot;</strong><br/><br/>Daniel`,
        ctaLabel: "Écrire aujourd'hui",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email car ton essai Aurum est maintenant actif.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Welcome to Aurum",
        preheader: "Your space is ready. A few lines are enough to begin.",
        body: `Hi ${name},<br/><br/>Welcome to Aurum.<br/><br/>Your space is ready, and you can begin simply, without pressure.<br/><br/>A few lines are often enough to lower the inner noise and bring a little more order to what you feel.<br/><br/>If you do not know where to start, try this simple question:<br/><br/><strong>&quot;What is taking up the most space in my mind today?&quot;</strong><br/><br/>Daniel`,
        ctaLabel: "Write today",
        ctaUrl: writeUrl,
        footer: "You are receiving this email because your Aurum trial is now active.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    trial_ending_soon: {
      fr: {
        subject: "Ton essai se termine bientôt",
        preheader: "Ce que tu as commencé peut encore devenir un vrai rythme.",
        body: `Bonjour ${name},<br/><br/>Ton essai Aurum arrive bientôt à sa fin.<br/><br/>L&apos;écriture régulière aide souvent à mieux voir ce qui revient, ce qui fatigue, et ce qui apaise.<br/><br/>Si Aurum t&apos;aide à garder ce lien avec toi-même, tu peux simplement continuer.<br/><br/>Daniel`,
        ctaLabel: "Continuer avec Aurum",
        ctaUrl: pricingUrl,
        footer: "Tu reçois cet email car ton essai Aurum approche de sa fin.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Your trial is ending soon",
        preheader: "What you started can still become a real rhythm.",
        body: `Hi ${name},<br/><br/>Your Aurum trial will end soon.<br/><br/>Regular writing often helps you see more clearly what keeps returning, what drains you, and what soothes you.<br/><br/>If Aurum helps you keep that connection with yourself, you can simply continue.<br/><br/>Daniel`,
        ctaLabel: "Continue with Aurum",
        ctaUrl: pricingUrl,
        footer: "You are receiving this email because your Aurum trial is approaching its end.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    subscription_active: {
      fr: {
        subject: "Ton abonnement Aurum est actif",
        preheader: "Ton espace reste ouvert, à ton rythme.",
        body: `Bonjour ${name},<br/><br/>Ton abonnement est maintenant actif.<br/><br/>La valeur du journaling apparaît rarement en un seul jour. Elle se construit dans la continuité.<br/><br/>Tu peux continuer simplement : quelques lignes quand c&apos;est utile, plus quand c&apos;est nécessaire.<br/><br/>Daniel`,
        ctaLabel: "Retourner écrire",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email car ton abonnement Aurum est maintenant actif.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Your Aurum subscription is active",
        preheader: "Your space stays open, at your own pace.",
        body: `Hi ${name},<br/><br/>Your subscription is now active.<br/><br/>The value of journaling rarely appears in a single day. It grows through continuity.<br/><br/>You can keep going simply: a few lines when it helps, more when you need it.<br/><br/>Daniel`,
        ctaLabel: "Go back to writing",
        ctaUrl: writeUrl,
        footer: "You are receiving this email because your Aurum subscription is now active.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    trial_expired_no_conversion: {
      fr: {
        subject: "Ton essai est terminé",
        preheader: "Tu peux revenir quand tu veux, sans repartir de zéro.",
        body: `Bonjour ${name},<br/><br/>Ton essai Aurum est maintenant terminé.<br/><br/>Peut-être que ce n&apos;était pas le bon moment. Peut-être aussi que tu as seulement manqué de temps pour vraiment installer ton rythme.<br/><br/>Dans tous les cas, il n&apos;y a rien à forcer.<br/><br/>Si tu veux revenir, Aurum est là pour t&apos;aider à reprendre un fil et retrouver un peu de clarté au milieu du bruit.<br/><br/>Daniel`,
        ctaLabel: "Revenir à Aurum",
        ctaUrl: pricingUrl,
        footer: "Tu reçois cet email car ton essai Aurum est terminé.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Your trial has ended",
        preheader: "You can come back whenever you want, without starting from zero.",
        body: `Hi ${name},<br/><br/>Your Aurum trial has now ended.<br/><br/>Maybe it was not the right moment. Maybe you simply did not have enough time to truly install a rhythm.<br/><br/>In any case, there is nothing to force.<br/><br/>If you want to come back, Aurum is here to help you pick up the thread and find a little more clarity in the middle of the noise.<br/><br/>Daniel`,
        ctaLabel: "Come back to Aurum",
        ctaUrl: pricingUrl,
        footer: "You are receiving this email because your Aurum trial has ended.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
  };

  const selected = contentByEmail[input.emailId][input.locale];
  const html = `
<!doctype html>
<html lang="${input.locale}">
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
                ${selected.footer}<br/>
                <a href="${unsubUrl}" style="color:#78716c;">${selected.unsubscribeLabel}</a>
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
    `${isFr ? 'Bonjour' : 'Hi'} ${name},\n\n` +
    selected.body.replace(/<br\/>/g, "\n").replace(/<[^>]+>/g, "") +
    `\n\n${selected.ctaLabel}: ${selected.ctaUrl}\n\n` +
    `${selected.unsubscribeLabel}: ${unsubUrl}\n`;

  return {
    subject: selected.subject,
    html,
    text,
  };
}
