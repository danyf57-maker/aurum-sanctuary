type EvidencePromptMode = 'weeklyInsight';

const approvedRuntimeSummaries = [
  'Private, self-directed writing that includes feelings and thoughts is consistent with expressive writing protocols.',
  'Use reflective prompts to support clarity, not to promise treatment outcomes.',
  'Keep emotionally intense prompts bounded, optional, and non-clinical.',
  'Reflective writing effects may vary over time and should not be framed as durable symptom relief.',
  'Favor prompts that compare current entries with earlier ones to surface change, persistence, or recurrence.',
  'Use tentative language around improvement and stay grounded in the user\'s own observations.',
  'Good reflective writing helps the user step back from an experience rather than replay it from inside.',
  'Prompts should emphasize observation, causes, and meaning instead of emotional re-immersion.',
  'Use self-distancing as a reflective aid, not as emotional invalidation.',
];

const commonGuardrails = [
  'Treat reflective writing as support for clarity and pattern recognition, never as therapy, diagnosis, or medical care.',
  'Stay descriptive and hypothesis-driven. Prefer "we notice" or "it may suggest" over strong causal claims.',
  'Focus on recurrence, change over time, persistence, and contrast across entries.',
  'Do not give advice, recommendations, or universal promises about improvement.',
  'Do not prescribe, diagnose, or use clinical certainty.',
];

const modeSpecificGuidance: Record<EvidencePromptMode, string[]> = {
  weeklyInsight: [
    'Mirror patterns and movement only.',
    'Keep the insight concise, calm, and non-technical.',
  ],
};

function formatBulletLines(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

export function buildEvidencePrompt(mode: EvidencePromptMode): string {
  return [
    'Evidence-informed reflection policy for Aurum:',
    'Use the journaling data as primary evidence. The following human-reviewed principles constrain the response.',
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
