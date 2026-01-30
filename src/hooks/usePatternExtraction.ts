/**
 * Client-Side Pattern Extraction Hook
 * 
 * Extracts emotional patterns from journal entry text before encryption.
 * Updates DerivedMemoryLite with detected labels and word count.
 */

'use client';

import { useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/web-client';
import { EMOTION_LABELS_WHITELIST } from '@/lib/schemas/derivedMemory';
import { useAuth } from '@/providers/auth-provider';

interface PatternExtractionResult {
    wordCount: number;
    labels: string[];
}

/**
 * Hook for extracting patterns from journal entries
 */
export function usePatternExtraction() {
    const { user } = useAuth();
    const [isExtracting, setIsExtracting] = useState(false);

    /**
     * Simple keyword-based emotion detection
     * 
     * For V1, we use keyword matching. V2 can use AI for better accuracy.
     */
    const detectEmotionLabels = (text: string): string[] => {
        const lowerText = text.toLowerCase();
        const detectedLabels: string[] = [];

        // Keyword mapping for emotions
        const emotionKeywords: Record<string, string[]> = {
            joy: ['happy', 'joyful', 'excited', 'delighted', 'cheerful'],
            gratitude: ['grateful', 'thankful', 'appreciate', 'blessed'],
            hope: ['hopeful', 'optimistic', 'looking forward'],
            calm: ['calm', 'peaceful', 'serene', 'relaxed'],
            excited: ['excited', 'thrilled', 'enthusiastic'],
            proud: ['proud', 'accomplished', 'achievement'],
            content: ['content', 'satisfied', 'fulfilled'],
            curious: ['curious', 'wondering', 'interested'],
            reflective: ['reflecting', 'thinking', 'pondering'],
            thoughtful: ['thoughtful', 'contemplating'],
            uncertain: ['uncertain', 'unsure', 'confused'],
            anxious: ['anxious', 'worried', 'nervous', 'stressed'],
            sad: ['sad', 'down', 'depressed', 'unhappy'],
            frustrated: ['frustrated', 'annoyed', 'irritated'],
            overwhelmed: ['overwhelmed', 'too much', 'can\'t handle'],
            lonely: ['lonely', 'alone', 'isolated'],
            angry: ['angry', 'mad', 'furious'],
            confused: ['confused', 'lost', 'don\'t understand'],
            learning: ['learning', 'growing', 'discovering'],
            growing: ['growing', 'evolving', 'developing'],
            processing: ['processing', 'working through'],
        };

        // Check each emotion
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            for (const keyword of keywords) {
                if (lowerText.includes(keyword)) {
                    detectedLabels.push(emotion);
                    break; // Only add each emotion once
                }
            }
        }

        // Filter to whitelisted labels only
        return detectedLabels.filter(label =>
            EMOTION_LABELS_WHITELIST.includes(label as any)
        );
    };

    /**
     * Extract patterns from entry text
     */
    const extractPatterns = async (text: string): Promise<PatternExtractionResult> => {
        setIsExtracting(true);

        try {
            // Calculate word count
            const wordCount = text.trim().split(/\s+/).length;

            // Detect emotion labels
            const labels = detectEmotionLabels(text);

            return {
                wordCount,
                labels,
            };
        } finally {
            setIsExtracting(false);
        }
    };

    /**
     * Update DerivedMemoryLite with extracted patterns
     */
    const updateDerivedMemoryLite = async (patterns: PatternExtractionResult) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        const liteRef = doc(firestore, 'users', user.uid, 'derivedMemory', 'lite');

        try {
            // Get current data to calculate average
            const currentDoc = await getDoc(liteRef);
            const currentData = currentDoc.data();

            const currentTotal = currentData?.totalEntries || 0;
            const currentAvg = currentData?.avgWordsPerEntry || 0;
            const newTotal = currentTotal + 1;
            const newAvg = ((currentAvg * currentTotal) + patterns.wordCount) / newTotal;

            // Merge new labels with existing (deduplicate)
            const existingLabels = currentData?.labels || [];
            const allLabels = [...new Set([...existingLabels, ...patterns.labels])];

            // Update document
            await updateDoc(liteRef, {
                avgWordsPerEntry: Math.round(newAvg),
                labels: allLabels.slice(0, 20), // Max 20 labels
                updatedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error updating DerivedMemoryLite:', error);
            throw error;
        }
    };

    return {
        extractPatterns,
        updateDerivedMemoryLite,
        isExtracting,
    };
}
