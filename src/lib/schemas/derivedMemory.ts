/**
 * Zod Schemas for DerivedMemoryLite
 * 
 * Strict validation for derivedMemory/lite document.
 * This is a whitelisted, non-sensitive subset of derived memory.
 */

import { z } from 'zod';

/**
 * DerivedMemoryLite Schema
 * 
 * This document is READ by Edge Functions (Mirror Chat).
 * It contains ONLY non-sensitive, whitelisted data.
 * 
 * Structure:
 * - totalEntries: Number of journal entries
 * - avgWordsPerEntry: Average word count per entry
 * - lastEntryAt: Timestamp of last entry (ISO 8601)
 * - labels: Whitelisted emotion labels (soft whitelist)
 */
export const DerivedMemoryLiteSchema = z.object({
    totalEntries: z.number().int().min(0),
    avgWordsPerEntry: z.number().min(0),
    lastEntryAt: z.string().datetime().nullable(), // ISO 8601 or null
    labels: z.array(z.string()).max(20), // Soft whitelist, max 20 labels
    updatedAt: z.string().datetime(), // ISO 8601
});

export type DerivedMemoryLite = z.infer<typeof DerivedMemoryLiteSchema>;

/**
 * Whitelisted emotion labels
 * 
 * This is a soft whitelist - labels not in this list are still allowed,
 * but these are the recommended/common labels.
 */
export const EMOTION_LABELS_WHITELIST = [
    // Positive emotions
    'joy',
    'gratitude',
    'hope',
    'calm',
    'excited',
    'proud',
    'content',

    // Neutral emotions
    'curious',
    'reflective',
    'thoughtful',
    'uncertain',

    // Challenging emotions
    'anxious',
    'sad',
    'frustrated',
    'overwhelmed',
    'lonely',
    'angry',
    'confused',

    // Growth-oriented
    'learning',
    'growing',
    'processing',
] as const;

/**
 * Initial DerivedMemoryLite document
 * 
 * Created on user signup.
 */
export const INITIAL_DERIVED_MEMORY_LITE: DerivedMemoryLite = {
    totalEntries: 0,
    avgWordsPerEntry: 0,
    lastEntryAt: null,
    labels: [],
    updatedAt: new Date().toISOString(),
};
