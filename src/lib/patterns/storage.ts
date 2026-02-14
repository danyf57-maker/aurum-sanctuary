/**
 * Pattern Storage Layer
 *
 * Firestore operations for user patterns.
 * Collection: users/{uid}/patterns/{themeId}
 */

import { db } from "@/lib/firebase/admin";
import { Pattern, ThemeId } from "./types";
import { logger } from "@/lib/logger/safe";

/**
 * Get all patterns for a user
 */
export async function getUserPatterns(userId: string): Promise<Pattern[]> {
  try {
    const patternsRef = db
      .collection("users")
      .doc(userId)
      .collection("patterns");
    const snapshot = await patternsRef.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        theme_id: data.theme_id as ThemeId,
        frequency: data.frequency,
        last_seen: data.last_seen?.toDate?.() || new Date(),
        first_seen: data.first_seen?.toDate?.() || new Date(),
        emotional_tone: data.emotional_tone,
        intensity_avg: data.intensity_avg,
        confidence: data.confidence,
        decay_score: data.decay_score,
        half_life_days: data.half_life_days || 30, // default 30 days
      };
    });
  } catch (error) {
    logger.errorSafe("Failed to fetch user patterns", error, { userId });
    return [];
  }
}

/**
 * Get a specific pattern for a user
 */
export async function getUserPattern(
  userId: string,
  themeId: ThemeId
): Promise<Pattern | null> {
  try {
    const patternRef = db
      .collection("users")
      .doc(userId)
      .collection("patterns")
      .doc(themeId);

    const doc = await patternRef.get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      theme_id: data.theme_id as ThemeId,
      frequency: data.frequency,
      last_seen: data.last_seen?.toDate?.() || new Date(),
      first_seen: data.first_seen?.toDate?.() || new Date(),
      emotional_tone: data.emotional_tone,
      intensity_avg: data.intensity_avg,
      confidence: data.confidence,
      decay_score: data.decay_score,
      half_life_days: data.half_life_days || 30,
    };
  } catch (error) {
    logger.errorSafe("Failed to fetch user pattern", error, {
      userId,
      themeId,
    });
    return null;
  }
}

/**
 * Calculate decay score based on recency and frequency
 * Formula: decay = exp(-(days_since_last_seen / half_life_days)) * sqrt(frequency)
 */
function calculateDecayScore(
  lastSeen: Date,
  frequency: number,
  halfLifeDays: number
): number {
  const now = new Date();
  const daysSinceLastSeen =
    (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24);

  // Exponential decay
  const timeDecay = Math.exp(-(daysSinceLastSeen / halfLifeDays));

  // Frequency boost (sqrt to avoid over-weighting)
  const frequencyBoost = Math.sqrt(frequency);

  return Math.min(1, timeDecay * frequencyBoost);
}

/**
 * Update or create a pattern
 */
export async function upsertPattern(
  userId: string,
  themeId: ThemeId,
  emotionalTone: string,
  intensity: number,
  confidence: number
): Promise<void> {
  try {
    const patternRef = db
      .collection("users")
      .doc(userId)
      .collection("patterns")
      .doc(themeId);

    const doc = await patternRef.get();
    const now = new Date();

    if (doc.exists) {
      // Update existing pattern
      const data = doc.data()!;
      const newFrequency = data.frequency + 1;
      const halfLifeDays = data.half_life_days || 30;

      // Update average intensity (weighted average)
      const newIntensityAvg =
        (data.intensity_avg * data.frequency + intensity) / newFrequency;

      // Calculate new decay score
      const decayScore = calculateDecayScore(now, newFrequency, halfLifeDays);

      await patternRef.update({
        frequency: newFrequency,
        last_seen: now,
        intensity_avg: newIntensityAvg,
        emotional_tone: emotionalTone,
        confidence: Math.max(data.confidence, confidence), // Keep highest confidence
        decay_score: decayScore,
      });
    } else {
      // Create new pattern
      const halfLifeDays = 30; // Default 30-day half-life
      const decayScore = calculateDecayScore(now, 1, halfLifeDays);

      await patternRef.set({
        theme_id: themeId,
        frequency: 1,
        last_seen: now,
        first_seen: now,
        emotional_tone: emotionalTone,
        intensity_avg: intensity,
        confidence,
        decay_score: decayScore,
        half_life_days: halfLifeDays,
      });
    }
  } catch (error) {
    logger.errorSafe("Failed to upsert pattern", error, { userId, themeId });
    throw error;
  }
}

/**
 * Batch update patterns (used after detection)
 */
export async function batchUpdatePatterns(
  userId: string,
  detections: Array<{
    theme_id: ThemeId;
    emotional_tone: string;
    intensity: number;
    confidence: number;
  }>
): Promise<void> {
  try {
    // Update all detected patterns
    await Promise.all(
      detections.map((detection) =>
        upsertPattern(
          userId,
          detection.theme_id,
          detection.emotional_tone,
          detection.intensity,
          detection.confidence
        )
      )
    );
  } catch (error) {
    logger.errorSafe("Failed to batch update patterns", error, { userId });
    throw error;
  }
}

/**
 * Delete old patterns with very low decay scores (cleanup)
 */
export async function cleanupStalePatterns(userId: string): Promise<void> {
  try {
    const patterns = await getUserPatterns(userId);

    // Delete patterns with decay_score < 0.05 (essentially dead)
    const stalePatterns = patterns.filter((p) => p.decay_score < 0.05);

    if (stalePatterns.length === 0) {
      return;
    }

    const batch = db.batch();

    stalePatterns.forEach((pattern) => {
      const ref = db
        .collection("users")
        .doc(userId)
        .collection("patterns")
        .doc(pattern.theme_id);
      batch.delete(ref);
    });

    await batch.commit();

    logger.infoSafe("Cleaned up stale patterns", {
      userId,
      deletedCount: stalePatterns.length,
    });
  } catch (error) {
    logger.errorSafe("Failed to cleanup stale patterns", error, { userId });
    // Non-critical, don't throw
  }
}
