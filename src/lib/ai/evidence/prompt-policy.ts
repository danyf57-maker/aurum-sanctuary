import evidenceIndex from '../../../../knowledge/studies/runtime/evidence-index.json';

export type EvidencePromptMode =
  | 'reflect'
  | 'mirror'
  | 'weeklyInsight'
  | 'digest'
  | 'journalInsights'
  | 'entryAnalysis';

const approvedRuntimeSummaries = evidenceIndex.approved_runtime_cards.flatMap((card) => card.runtime_summary);

const commonGuardrails = [
  'Treat reflective writing as support for clarity and pattern recognition, never as therapy, diagnosis, or medical care.',
  'Stay descriptive and hypothesis-driven. Prefer "it may suggest" or "it seems" over strong causal claims.',
  'Help the user step back enough to notice what happened, what it meant, what changed, and what keeps returning instead of replaying the experience from inside it.',
  'Accept mixed, approximate, or incomplete emotion labels. If the feeling is unclear, explore it gently instead of correcting the user.',
  'Do not promise lasting symptom relief, durable improvement, or universal benefits from writing.',
  'Do not prescribe, diagnose, or use clinical certainty. Keep the tone human, calm, and non-technical.',
];

const modeSpecificGuidance: Record<EvidencePromptMode, string[]> = {
  reflect: [
    'Name tensions, contrasts, needs, fears, or protective strategies only when they are grounded in the text.',
    'End with an opening that deepens reflection without turning into advice.',
  ],
  mirror: [
    'Use questions and observations to deepen reflection, not to fix the user.',
    'Favor one meaningful thread over broad interpretation.',
  ],
  weeklyInsight: [
    'Focus on recurrence, change over time, persistence, and contrast across entries.',
    'Do not give recommendations. Mirror patterns and movement only.',
  ],
  digest: [
    'Summarize the week in a grounded way: activity, recurring themes, emotional shifts, and one gentle reflection opening.',
    'Any suggestion must remain a soft reflection prompt, not advice or a protocol.',
  ],
  journalInsights: [
    'Return structured pattern summaries grounded in the entries, not personality verdicts or clinical labels.',
    'If you provide a next step, it must be a gentle reflection question or invitation, not directive advice.',
  ],
  entryAnalysis: [
    'Keep structured output modest: sentiment, mood, and one short non-clinical insight anchored in the text.',
    'Do not over-interpret a single entry or convert emotional language into diagnosis.',
  ],
};

function formatBulletLines(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

export function buildEvidencePrompt(mode: EvidencePromptMode): string {
  return [
    'Evidence-informed reflection policy for Aurum:',
    'Use the user text as primary evidence. The following human-reviewed principles should constrain the response.',
    '',
    'Approved runtime principles:',
    formatBulletLines(approvedRuntimeSummaries),
    '',
    'Non-negotiable guardrails:',
    formatBulletLines(commonGuardrails),
    '',
    `Mode-specific guidance for ${mode}:`,
    formatBulletLines(modeSpecificGuidance[mode]),
  ].join('\n');
}
