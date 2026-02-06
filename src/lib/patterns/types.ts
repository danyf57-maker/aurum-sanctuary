/**
 * Pattern Detection System Types
 *
 * Admin-Blind pattern storage with decay and confidence scoring.
 * Patterns are abstract theme IDs, not narrative text.
 */

/**
 * Theme identifiers (non-narrative, categorical)
 */
export enum ThemeId {
  // Work & Boundaries
  WORK_BOUNDARY_TENSION = 'WORK_BOUNDARY_TENSION',
  WORK_PERFORMANCE_PRESSURE = 'WORK_PERFORMANCE_PRESSURE',
  WORK_PURPOSE_QUESTIONING = 'WORK_PURPOSE_QUESTIONING',

  // Self & Identity
  SELF_WORTH_QUESTIONING = 'SELF_WORTH_QUESTIONING',
  SELF_AUTHENTICITY_SEARCH = 'SELF_AUTHENTICITY_SEARCH',
  SELF_CHANGE_RESISTANCE = 'SELF_CHANGE_RESISTANCE',

  // Relations
  RELATIONSHIP_DISTANCE = 'RELATIONSHIP_DISTANCE',
  RELATIONSHIP_EXPECTATION_MISMATCH = 'RELATIONSHIP_EXPECTATION_MISMATCH',
  RELATIONSHIP_VULNERABILITY_FEAR = 'RELATIONSHIP_VULNERABILITY_FEAR',

  // Emotional States
  ANXIETY_FUTURE = 'ANXIETY_FUTURE',
  ANXIETY_CONTROL_LOSS = 'ANXIETY_CONTROL_LOSS',
  SADNESS_LOSS = 'SADNESS_LOSS',
  SADNESS_UNMET_NEED = 'SADNESS_UNMET_NEED',
  JOY_CONNECTION = 'JOY_CONNECTION',
  JOY_ACCOMPLISHMENT = 'JOY_ACCOMPLISHMENT',

  // Existential
  MEANING_SEARCH = 'MEANING_SEARCH',
  TIME_PASSAGE_AWARENESS = 'TIME_PASSAGE_AWARENESS',
  TRANSITION_UNCERTAINTY = 'TRANSITION_UNCERTAINTY',
}

/**
 * Emotional tone categories
 */
export enum EmotionalTone {
  ANXIOUS = 'ANXIOUS',
  SAD = 'SAD',
  CALM = 'CALM',
  JOYFUL = 'JOYFUL',
  CONFUSED = 'CONFUSED',
  ANGRY = 'ANGRY',
  NEUTRAL = 'NEUTRAL',
}

/**
 * Pattern stored in Firestore (Admin-Blind compliant)
 */
export interface Pattern {
  /** Non-narrative theme identifier */
  theme_id: ThemeId;

  /** Number of times detected */
  frequency: number;

  /** Last detection timestamp */
  last_seen: Date;

  /** First detection timestamp */
  first_seen: Date;

  /** Emotional tone associated with this pattern */
  emotional_tone: EmotionalTone;

  /** Average intensity (0-1) across detections */
  intensity_avg: number;

  /** Confidence score (0-1) for pattern validity */
  confidence: number;

  /** Decay score based on recency and frequency (0-1) */
  decay_score: number;

  /** Half-life in days (patterns decay over time) */
  half_life_days: number;
}

/**
 * Pattern detection result from AI analysis
 */
export interface PatternDetectionResult {
  /** Detected themes with confidence */
  themes: Array<{
    theme_id: ThemeId;
    confidence: number;
    intensity: number;
  }>;

  /** Primary emotional tone */
  emotional_tone: EmotionalTone;

  /** Optional additional context (never stored, used only for immediate reflection) */
  immediate_context?: string;
}

/**
 * Patterns selected for injection into AI context
 */
export interface InjectedPatterns {
  /** Maximum 2 patterns */
  patterns: Pattern[];

  /** Why these patterns were selected */
  selection_reason: 'most_frequent_and_recent' | 'two_most_recent' | 'phase_change';
}
