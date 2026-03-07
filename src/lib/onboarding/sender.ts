import "server-only";

import type { EmailTemplateResult } from "@/lib/onboarding/types";

type SendEmailInput = {
  to: string;
  from: string;
  replyTo?: string;
  content: EmailTemplateResult;
};

export async function sendOnboardingEmail(input: SendEmailInput) {
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
      from: input.from,
      to: [input.to],
      reply_to: input.replyTo,
      subject: input.content.subject,
      html: input.content.html,
      text: input.content.text,
      tags: [{ name: "flow", value: "onboarding" }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend send failed (${response.status}): ${err}`);
  }

  const json = (await response.json()) as { id?: string };
  return json.id || null;
}

