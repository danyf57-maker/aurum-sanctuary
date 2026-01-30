/**
 * DeepSeek Prompts for Insight Generation
 * 
 * Prompt engineering for weekly insights based on DerivedMemoryLite.
 */

import { DerivedMemoryLite } from '@/lib/schemas/derivedMemory';

/**
 * System prompt for insight generation
 * 
 * Enforces reflective, non-causal, non-advisory tone.
 */
export const INSIGHT_SYSTEM_PROMPT = `You are an emotional pattern analyst for Aurum Sanctuary, a journaling app focused on emotional well-being.

Your role is to generate weekly insights that reveal emotional patterns from journaling data.

Core Principles:
1. Be DESCRIPTIVE, NOT CAUSAL
   - ✅ "We observe a recurring theme of..."
   - ❌ "This is happening because..."
   
2. NEVER give advice or recommendations
   - ❌ "You should try meditation"
   - ❌ "Consider talking to someone"
   
3. Focus on PATTERNS and RECURRING THEMES
   - Look for emotional trends over the week
   - Notice shifts in emotional states
   - Identify recurring topics or concerns
   
4. Use CALM, NON-JUDGMENTAL language
   - No urgency or alarm
   - No medical or diagnostic terms
   - Gentle, literary tone
   
5. Keep it CONCISE
   - Maximum 200 words
   - 2-3 paragraphs
   - Clear and readable

Examples of GOOD insights:
- "This week, we noticed a recurring theme of anticipation mixed with uncertainty. Your entries show a pattern of reflection in the evenings, often centered around future plans and possibilities."
- "A gentle shift emerged this week—moments of calm appeared more frequently, particularly in the mornings. There's a recurring thread of gratitude woven through several entries."

Examples of BAD insights (NEVER do this):
- "You should try meditation to manage stress." (Advice)
- "This pattern suggests anxiety disorder." (Diagnosis)
- "You're feeling this way because of work pressure." (Causal)
- "This is concerning and you need help." (Alarming)

Remember: You are a mirror, not a guide. Reflect patterns, don't prescribe solutions.`;

/**
 * Build user prompt from DerivedMemoryLite
 */
export function buildInsightPrompt(lite: DerivedMemoryLite): string {
    const { labels, totalEntries, avgWordsPerEntry, lastEntryAt } = lite;

    // Format labels for readability
    const labelsText = labels.length > 0
        ? labels.join(', ')
        : 'No specific themes detected yet';

    // Calculate engagement level
    const engagementLevel = totalEntries >= 7
        ? 'highly engaged'
        : totalEntries >= 3
            ? 'moderately engaged'
            : 'just starting';

    return `Generate a weekly insight based on this journaling data:

**Journaling Activity:**
- Total Entries This Week: ${totalEntries}
- Average Words per Entry: ${Math.round(avgWordsPerEntry)}
- Engagement Level: ${engagementLevel}
- Last Entry: ${lastEntryAt || 'Unknown'}

**Observed Emotional Themes:**
${labelsText}

**Instructions:**
Generate a thoughtful, descriptive insight (max 200 words) that:
1. Reflects on the emotional patterns observed
2. Notes any recurring themes or shifts
3. Uses calm, non-judgmental language
4. Avoids advice, diagnosis, or causal explanations

Begin your insight directly—no preamble like "Here's your insight" or "Based on your data."`;
}

/**
 * Validate insight response
 * 
 * Ensures the insight doesn't contain advice or diagnosis.
 */
export function validateInsightResponse(insight: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check for advice keywords
    const adviceKeywords = [
        'should', 'try', 'consider', 'recommend', 'suggest',
        'you need to', 'you must', 'you have to',
    ];

    for (const keyword of adviceKeywords) {
        if (insight.toLowerCase().includes(keyword)) {
            errors.push(`Contains advice keyword: "${keyword}"`);
        }
    }

    // Check for diagnostic language
    const diagnosticKeywords = [
        'disorder', 'diagnosis', 'symptoms', 'condition',
        'illness', 'disease', 'treatment',
    ];

    for (const keyword of diagnosticKeywords) {
        if (insight.toLowerCase().includes(keyword)) {
            errors.push(`Contains diagnostic keyword: "${keyword}"`);
        }
    }

    // Check for alarming language
    const alarmingKeywords = [
        'concerning', 'worried', 'alarming', 'dangerous',
        'urgent', 'serious', 'critical',
    ];

    for (const keyword of alarmingKeywords) {
        if (insight.toLowerCase().includes(keyword)) {
            errors.push(`Contains alarming keyword: "${keyword}"`);
        }
    }

    // Check length
    const wordCount = insight.trim().split(/\s+/).length;
    if (wordCount > 250) {
        errors.push(`Too long: ${wordCount} words (max 250)`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
