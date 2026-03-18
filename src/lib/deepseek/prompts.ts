/**
 * DeepSeek Prompt Engineering for Mirror Chat
 * 
 * Defines system prompts and context building for reflective listening.
 */

import { DerivedMemoryLite } from '@/lib/schemas/derivedMemory';
import { buildAurumSystemPrompt } from '@/lib/ai/aurum-system-prompts';
import type { ReflectionLanguage } from '@/lib/language-policy';

/**
 * System prompt for Mirror Chat
 * 
 * Enforces "Reflective Listening Agent" behavior:
 * - Never gives advice
 * - Asks questions to deepen self-reflection
 * - Reflects patterns without judgment
 */
export function buildMirrorPromptPack(language: ReflectionLanguage) {
    return {
        system: buildAurumSystemPrompt('mirror', language),
    };
}

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
