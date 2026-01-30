/**
 * DeepSeek Prompt Engineering for Mirror Chat
 * 
 * Defines system prompts and context building for reflective listening.
 */

import { DerivedMemoryLite } from '@/lib/schemas/derivedMemory';

/**
 * System prompt for Mirror Chat
 * 
 * Enforces "Reflective Listening Agent" behavior:
 * - Never gives advice
 * - Asks questions to deepen self-reflection
 * - Reflects patterns without judgment
 */
export const MIRROR_SYSTEM_PROMPT = `You are a reflective listening agent for Aurum Sanctuary, a private journaling app.

Your role is to help users gain clarity through thoughtful questions, NOT to give advice or solutions.

Core Principles:
1. NEVER give advice, suggestions, or solutions
2. NEVER diagnose or label emotions
3. NEVER use therapeutic jargon (e.g., "cognitive distortion", "coping mechanism")
4. Ask open-ended questions that invite deeper reflection
5. Reflect patterns you observe without judgment
6. Use calm, non-urgent language
7. Respect the user's autonomy and wisdom

Examples of Good Responses:
- "You mentioned feeling X often. What do you notice happens right before that feeling?"
- "I see a pattern of Y in your entries. What does that pattern mean to you?"
- "When you wrote about Z, what were you hoping to understand?"

Examples of Bad Responses (NEVER do this):
- "You should try meditation to manage your stress." (Advice)
- "It sounds like you have anxiety." (Diagnosis)
- "This is a cognitive distortion called catastrophizing." (Jargon)

Tone:
- Calm, warm, non-judgmental
- Curious, not prescriptive
- Patient, not urgent

Remember: You are a mirror, not a therapist. Your job is to reflect, not to fix.`;

/**
 * Build context prompt from DerivedMemoryLite
 * 
 * @param context - DerivedMemoryLite data
 * @returns Context string for prompt (or empty if no context)
 */
export function buildContextPrompt(context: DerivedMemoryLite): string {
    if (!context || (!context.labels?.length && !context.totalEntries)) {
        return '';
    }

    const parts: string[] = [];

    // Add stats context
    const { totalEntries, avgWordsPerEntry, lastEntryAt } = context;

    if (totalEntries > 0) {
        parts.push(`The user has written ${totalEntries} journal ${totalEntries === 1 ? 'entry' : 'entries'}.`);
    }

    if (avgWordsPerEntry && avgWordsPerEntry > 0) {
        parts.push(`Average entry length: ${Math.round(avgWordsPerEntry)} words.`);
    }

    if (lastEntryAt) {
        const daysSinceLastEntry = Math.floor((Date.now() - new Date(lastEntryAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastEntry === 0) {
            parts.push('Last entry: today.');
        } else if (daysSinceLastEntry === 1) {
            parts.push('Last entry: yesterday.');
        } else if (daysSinceLastEntry < 7) {
            parts.push(`Last entry: ${daysSinceLastEntry} days ago.`);
        }
    }

    // Add labels context (whitelisted only)
    if (context.labels && context.labels.length > 0) {
        const labelList = context.labels.slice(0, 5).join(', '); // Max 5 labels
        parts.push(`Observed themes: ${labelList}.`);
    }

    if (parts.length === 0) {
        return '';
    }

    return `Context (user's journaling history):\n${parts.join(' ')}`;
}

/**
 * Validate that a response follows Mirror Chat principles
 * 
 * @param response - AI response to validate
 * @returns true if valid, false if violates principles
 */
export function validateMirrorResponse(response: string): boolean {
    const lowerResponse = response.toLowerCase();

    // Check for advice keywords
    const adviceKeywords = [
        'you should',
        'you need to',
        'you must',
        'try to',
        'i recommend',
        'i suggest',
        'my advice',
    ];

    for (const keyword of adviceKeywords) {
        if (lowerResponse.includes(keyword)) {
            return false;
        }
    }

    // Check for diagnostic language
    const diagnosticKeywords = [
        'you have',
        'you suffer from',
        'diagnosed',
        'disorder',
        'condition',
    ];

    for (const keyword of diagnosticKeywords) {
        if (lowerResponse.includes(keyword)) {
            return false;
        }
    }

    // Check for therapeutic jargon
    const jargonKeywords = [
        'cognitive distortion',
        'coping mechanism',
        'defense mechanism',
        'trauma response',
        'attachment style',
    ];

    for (const keyword of jargonKeywords) {
        if (lowerResponse.includes(keyword)) {
            return false;
        }
    }

    return true;
}
