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

function safeName(firstName: string, locale: Locale) {
  const normalized = firstName.trim();
  return normalized || (locale === "fr" ? "toi" : "you");
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
  const name = safeName(input.firstName, input.locale);
  const writeUrl = trackedUrl(input.appBaseUrl, input.userId, input.emailId, `${input.appBaseUrl}/sanctuary/write`);
  const pricingUrl = trackedUrl(input.appBaseUrl, input.userId, input.emailId, `${input.appBaseUrl}/pricing`);
  const unsubUrl = unsubscribeUrl(input.appBaseUrl, input.userId, input.emailId);
  const pixel = openPixelUrl(input.appBaseUrl, input.userId, input.emailId);
  const isFr = input.locale === 'fr';

  const contentByEmail: Record<OnboardingEmailId, Record<Locale, EmailCopy>> = {
    email_1: {
      fr: {
        subject: `Ton espace de réflexion privé est prêt, ${name}`,
        preheader: "Commence par une page privée. Aurum t'aidera à voir ce qui compte.",
        body: `Bonjour ${name},<br/><br/>Bienvenue dans Aurum.<br/><br/>Ici, tu peux écrire sans te filtrer, dans un espace privé pensé pour la clarté.<br/><br/>Après chaque page, Aurum peut te renvoyer ce qui ressort, ce qui semble émotionnellement central, et ce qui revient dans le temps.<br/><br/>Pour commencer, une phrase honnête suffit : <strong>qu&apos;est-ce qui est le plus présent en toi maintenant ?</strong><br/><br/>À très vite,<br/>Daniel`,
        ctaLabel: "Écrire ma première page",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: `Your private reflection space is ready, ${name}`,
        preheader: "Begin with one private page. Aurum will help you notice what matters.",
        body: `Hi ${name},<br/><br/>Welcome to Aurum.<br/><br/>Here, you can write without filtering, in a private space built for clarity.<br/><br/>After each page, Aurum can gently reflect back what stands out, what feels emotionally central, and what may keep returning over time.<br/><br/>To begin, one honest sentence is enough: <strong>what feels most present in you right now?</strong><br/><br/>See you soon,<br/>Daniel`,
        ctaLabel: "Write my first page",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    email_2: {
      fr: {
        subject: "Une première question pour ouvrir la page",
        preheader: "Un point d'entrée simple pour écrire sans te censurer.",
        body: `Bonjour ${name},<br/><br/>Parfois le plus dur est simplement de savoir où entrer.<br/><br/>Essaie cette question :<br/><br/><strong>&quot;Qu&apos;est-ce qui prend le plus de place en moi aujourd&apos;hui ?&quot;</strong><br/><br/>Quelques lignes suffisent. Aurum t&apos;aidera ensuite à clarifier ce qui ressort et ce qui revient.<br/><br/>Daniel`,
        ctaLabel: "Répondre à cette question",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "A first question to open the page",
        preheader: "A simple entry point for writing without self-censorship.",
        body: `Hi ${name},<br/><br/>Sometimes the hardest part is simply knowing where to begin.<br/><br/>Try this question:<br/><br/><strong>&quot;What is taking the most space in me today?&quot;</strong><br/><br/>A few lines are enough. Aurum can then help you clarify what stands out and what keeps returning.<br/><br/>Daniel`,
        ctaLabel: "Answer this question",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    email_3: {
      fr: {
        subject: "Ce n'est pas qu'un endroit pour écrire",
        preheader: "Tes pages peuvent devenir un miroir plus clair dans le temps.",
        body: `Bonjour ${name},<br/><br/>Aurum n&apos;est pas seulement un endroit pour déposer ce que tu portes.<br/><br/>C&apos;est aussi un espace privé où tes pages peuvent être relues avec plus de clarté, et où des motifs reviennent assez nettement pour être reconnus.<br/><br/>Aujourd&apos;hui, essaie cette question :<br/><br/><strong>&quot;Qu&apos;est-ce que j&apos;apprends sur moi à travers ce qui revient ?&quot;</strong><br/><br/>Daniel`,
        ctaLabel: "Explorer cette question",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "This is not only a place to write",
        preheader: "Your pages can become a clearer mirror over time.",
        body: `Hi ${name},<br/><br/>Aurum is not only a place to set down what you carry.<br/><br/>It is also a private space where your pages can be read back with more clarity, and where recurring patterns can become visible enough to recognize.<br/><br/>Today, try this question:<br/><br/><strong>&quot;What am I learning about myself through what keeps returning?&quot;</strong><br/><br/>Daniel`,
        ctaLabel: "Explore this question",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    email_4: {
      fr: {
        subject: `Une semaine plus tard, le fil commence déjà à se voir`,
        preheader: "La continuité aide les motifs et la clarté à émerger.",
        body: `Bonjour ${name},<br/><br/>Que tu aies écrit souvent ou seulement une fois, quelque chose d&apos;important a déjà commencé : tu as ouvert un espace privé où ta réflexion peut se construire dans le temps.<br/><br/>La suite n&apos;est pas d&apos;écrire parfaitement. C&apos;est de garder le fil, même avec quelques lignes.<br/><br/>Daniel`,
        ctaLabel: "Écrire aujourd'hui",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "A week later, the thread is already starting to show",
        preheader: "Continuity helps patterns and clarity emerge.",
        body: `Hi ${name},<br/><br/>Whether you wrote often or only once, something important has already started: you opened a private space where your reflection can build over time.<br/><br/>The next step is not to write perfectly. It is to keep the thread, even with just a few lines.<br/><br/>Daniel`,
        ctaLabel: "Write today",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    habit_email_1: {
      fr: {
        subject: "Tu as commencé. Maintenant, garde le fil",
        preheader: "Quelques lignes régulières suffisent pour approfondir la réflexion.",
        body: `Bonjour ${name},<br/><br/>Tu as déjà commencé à écrire, et c&apos;est l&apos;essentiel.<br/><br/>La suite n&apos;est pas d&apos;en faire plus, mais de revenir régulièrement.<br/><br/>Un cadre simple peut aider : un fait, une émotion, ce qui demande plus de clarté.<br/><br/>Avec le temps, Aurum relie ces pages et aide à faire émerger ce qui revient.<br/><br/>Daniel`,
        ctaLabel: "Continuer ma réflexion",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "You started. Now keep the thread",
        preheader: "A few regular lines are enough to deepen the reflection.",
        body: `Hi ${name},<br/><br/>You already started writing, and that is what matters most.<br/><br/>The next step is not to do more. It is to come back regularly.<br/><br/>A simple frame can help: one fact, one emotion, what needs more clarity.<br/><br/>Over time, Aurum connects these pages and helps what keeps returning become more visible.<br/><br/>Daniel`,
        ctaLabel: "Continue my reflection",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    habit_email_2: {
      fr: {
        subject: "Tes pages commencent à révéler des repères",
        preheader: "La régularité rend les thèmes récurrents plus visibles.",
        body: `Bonjour ${name},<br/><br/>Quand tu écris un peu chaque semaine, tu commences à voir des repères plus nets : ce qui te vide, ce qui te recentre, ce qui revient dans différentes situations.<br/><br/>Pas besoin de performance. Une phrase vraie vaut mieux qu&apos;une page parfaite.<br/><br/>Daniel`,
        ctaLabel: "Écrire 3 minutes",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email dans le cadre de ton onboarding Aurum Diary.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Your pages are starting to reveal clearer markers",
        preheader: "Regularity makes recurring themes easier to see.",
        body: `Hi ${name},<br/><br/>When you write a little each week, you begin to notice clearer markers: what drains you, what recenters you, and what keeps returning across situations.<br/><br/>No performance needed. One true sentence is better than a perfect page.<br/><br/>Daniel`,
        ctaLabel: "Write for 3 minutes",
        ctaUrl: writeUrl,
        footer: "You are receiving this email as part of your Aurum Diary onboarding.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    free_limit_followup: {
      fr: {
        subject: "Tes 5 pages offertes sont utilisées",
        preheader: "Continue sans casser ton fil avec 7 jours offerts.",
        body: `Bonjour ${name},<br/><br/>Tu as déjà commencé à construire quelque chose d&apos;utile : des pages privées, des reflets guidés, et les premiers motifs qui émergent.<br/><br/>Pour continuer sans casser ce fil, tu peux activer tes 7 jours offerts et laisser ta clarté se construire dans le temps.<br/><br/>Daniel`,
        ctaLabel: "Activer mes 7 jours offerts",
        ctaUrl: pricingUrl,
        footer: "Tu reçois cet email car tu as atteint la limite gratuite d'Aurum.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Your 5 free pages are used",
        preheader: "Keep going with 7 free days, without breaking your thread.",
        body: `Hi ${name},<br/><br/>You have already started building something useful: private pages, guided reflections, and the first recurring patterns beginning to emerge.<br/><br/>To continue without breaking that thread, you can activate your 7 free days and let your clarity keep building over time.<br/><br/>Daniel`,
        ctaLabel: "Start my 7 free days",
        ctaUrl: pricingUrl,
        footer: "You are receiving this email because you reached Aurum's free limit.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    trial_started: {
      fr: {
        subject: "Ton expérience Aurum complète est ouverte",
        preheader: "7 jours pour écrire en privé, recevoir des reflets guidés, et voir ce qui revient.",
        body: `Bonjour ${name},<br/><br/>Ton espace de réflexion privé est maintenant entièrement ouvert.<br/><br/>Pendant les 7 prochains jours, tu peux écrire librement, recevoir un reflet guidé après chaque page, et commencer à voir les thèmes qui reviennent plus clairement.<br/><br/>Si tu veux un point de départ simple, essaie :<br/><br/><strong>&quot;Qu&apos;est-ce qui est le plus chargé en moi aujourd&apos;hui, et qu&apos;est-ce qui semble revenir dessous ?&quot;</strong><br/><br/>Daniel`,
        ctaLabel: "Écrire aujourd'hui",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email car ton essai Aurum est maintenant actif.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Your full Aurum experience is now open",
        preheader: "7 days to write in private, receive guided reflection, and notice what keeps returning.",
        body: `Hi ${name},<br/><br/>Your private reflection space is now fully open.<br/><br/>Over the next 7 days, you can write freely, receive a guided reflection after each page, and begin seeing recurring themes more clearly.<br/><br/>If you want a simple place to start, try this:<br/><br/><strong>&quot;What feels most charged in me today, and what seems to keep returning underneath it?&quot;</strong><br/><br/>Daniel`,
        ctaLabel: "Write today",
        ctaUrl: writeUrl,
        footer: "You are receiving this email because your Aurum trial is now active.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    trial_ending_soon: {
      fr: {
        subject: "Ton essai se termine bientôt",
        preheader: "Garde la continuité de tes reflets et de tes motifs récurrents.",
        body: `Bonjour ${name},<br/><br/>Ton essai Aurum approche de sa fin.<br/><br/>Si les reflets guidés t&apos;aident à clarifier ce que tu ressens et à reconnaître ce qui revient, tu peux garder cette continuité sans perdre ton fil.<br/><br/>Tes pages, ton historique privé, et les motifs qui émergent peuvent continuer à se construire.<br/><br/>Daniel`,
        ctaLabel: "Continuer avec Aurum",
        ctaUrl: pricingUrl,
        footer: "Tu reçois cet email car ton essai Aurum approche de sa fin.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Your trial is ending soon",
        preheader: "Keep the continuity of your guided reflections and recurring patterns.",
        body: `Hi ${name},<br/><br/>Your Aurum trial will end soon.<br/><br/>If guided reflections are helping you clarify what you feel and recognize what keeps returning, you can keep that continuity without losing your thread.<br/><br/>Your pages, private history, and recurring patterns can keep building from here.<br/><br/>Daniel`,
        ctaLabel: "Continue with Aurum",
        ctaUrl: pricingUrl,
        footer: "You are receiving this email because your Aurum trial is approaching its end.",
        unsubscribeLabel: "Unsubscribe",
      },
    },
    subscription_active: {
      fr: {
        subject: "Ton abonnement Aurum est actif",
        preheader: "Ton espace privé reste ouvert, avec plus de continuité.",
        body: `Bonjour ${name},<br/><br/>Ton abonnement est maintenant actif.<br/><br/>Aurum reste là comme compagnon de réflexion privé : page après page, les reflets guidés se relient, la clarté émotionnelle s&apos;approfondit, et les motifs récurrents deviennent plus faciles à reconnaître.<br/><br/>Daniel`,
        ctaLabel: "Retourner écrire",
        ctaUrl: writeUrl,
        footer: "Tu reçois cet email car ton abonnement Aurum est maintenant actif.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Your Aurum subscription is active",
        preheader: "Your private space stays open, with more continuity.",
        body: `Hi ${name},<br/><br/>Your subscription is now active.<br/><br/>Aurum stays here as a private reflection companion: page after page, guided reflections connect, emotional clarity deepens, and recurring patterns become easier to recognize.<br/><br/>Daniel`,
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
        body: `Bonjour ${name},<br/><br/>Ton essai Aurum est maintenant terminé.<br/><br/>Si ce n&apos;était pas le bon moment, tu peux revenir plus tard sans repartir de zéro.<br/><br/>Aurum sera là pour t&apos;aider à reprendre le fil, retrouver de la clarté, et reconnecter les thèmes qui revenaient déjà.<br/><br/>Daniel`,
        ctaLabel: "Revenir à Aurum",
        ctaUrl: pricingUrl,
        footer: "Tu reçois cet email car ton essai Aurum est terminé.",
        unsubscribeLabel: "Se désinscrire",
      },
      en: {
        subject: "Your trial has ended",
        preheader: "You can come back whenever you want, without starting from zero.",
        body: `Hi ${name},<br/><br/>Your Aurum trial has now ended.<br/><br/>If it was not the right moment, you can come back later without starting from zero.<br/><br/>Aurum will still be here to help you pick up the thread, find more clarity, and reconnect the themes that had already started to emerge.<br/><br/>Daniel`,
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
