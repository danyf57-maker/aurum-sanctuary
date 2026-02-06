/**
 * Pattern Injection Logic
 *
 * Selects maximum 2 patterns to inject into AI reflection context.
 * Rules:
 * - Most frequent AND most recent
 * - OR 2 most recent if user changed emotional phase
 */

import { Pattern, InjectedPatterns, EmotionalTone } from './types';

/**
 * Select patterns for injection (max 2)
 */
export function selectPatternsForInjection(
  allPatterns: Pattern[],
  currentEmotionalTone?: EmotionalTone
): InjectedPatterns | null {
  if (allPatterns.length === 0) {
    return null;
  }

  // Filter out patterns with very low decay score
  const activePatterns = allPatterns.filter((p) => p.decay_score > 0.15);

  if (activePatterns.length === 0) {
    return null;
  }

  // Sort by decay score (combines recency + frequency)
  const sortedByDecay = [...activePatterns].sort((a, b) => b.decay_score - a.decay_score);

  // Sort by recency only
  const sortedByRecency = [...activePatterns].sort(
    (a, b) => b.last_seen.getTime() - a.last_seen.getTime()
  );

  // Sort by frequency only
  const sortedByFrequency = [...activePatterns].sort((a, b) => b.frequency - a.frequency);

  // Check if there's a phase change (emotional tone shift)
  const recentTones = sortedByRecency.slice(0, 3).map((p) => p.emotional_tone);
  const hasPhaseChange = currentEmotionalTone && !recentTones.includes(currentEmotionalTone);

  if (hasPhaseChange) {
    // User changed emotional phase → prioritize 2 most recent
    return {
      patterns: sortedByRecency.slice(0, 2),
      selection_reason: 'phase_change',
    };
  }

  // Default: most frequent AND most recent (prioritizing decay score)
  const mostFrequent = sortedByFrequency[0];
  const mostRecent = sortedByRecency[0];

  // If they're the same, add the second-best from decay
  if (mostFrequent.theme_id === mostRecent.theme_id) {
    return {
      patterns: sortedByDecay.slice(0, 2),
      selection_reason: 'most_frequent_and_recent',
    };
  }

  // Otherwise, return both
  return {
    patterns: [mostFrequent, mostRecent],
    selection_reason: 'most_frequent_and_recent',
  };
}

/**
 * Format patterns for AI context (non-narrative, abstract)
 */
export function formatPatternsForContext(injected: InjectedPatterns): string {
  if (!injected || injected.patterns.length === 0) {
    return '';
  }

  const contextLines = injected.patterns.map((p) => {
    return `- Thème récurrent : ${p.theme_id} (${p.frequency}x, ton: ${p.emotional_tone}, intensité: ${p.intensity_avg.toFixed(2)})`;
  });

  return `Context (pour toi uniquement, NE JAMAIS mentionner explicitement) :
${contextLines.join('\n')}

Règle critique : ces patterns informent la PROFONDEUR de ton reflet, jamais sa surface.
Ne dis JAMAIS : "je reconnais", "déjà", "avant", "souvent", "encore", "comme les autres fois", "récurrent", "d'habitude".
Parle uniquement du présent. Utilise le conditionnel pour les nuances ("il y a peut-être...").`;
}

/**
 * Theme ID to French abstract description (for logging/debugging only)
 */
export function themeToDescription(themeId: string): string {
  const descriptions: Record<string, string> = {
    WORK_BOUNDARY_TENSION: 'tension autour des frontières professionnelles',
    WORK_PERFORMANCE_PRESSURE: 'pression de performance au travail',
    WORK_PURPOSE_QUESTIONING: 'questionnement du sens professionnel',
    SELF_WORTH_QUESTIONING: 'questionnement de la valeur personnelle',
    SELF_AUTHENTICITY_SEARCH: 'recherche d\'authenticité',
    SELF_CHANGE_RESISTANCE: 'résistance au changement',
    RELATIONSHIP_DISTANCE: 'distance relationnelle',
    RELATIONSHIP_EXPECTATION_MISMATCH: 'décalage d\'attentes relationnelles',
    RELATIONSHIP_VULNERABILITY_FEAR: 'peur de la vulnérabilité',
    ANXIETY_FUTURE: 'anxiété face au futur',
    ANXIETY_CONTROL_LOSS: 'anxiété de perte de contrôle',
    SADNESS_LOSS: 'tristesse liée à une perte',
    SADNESS_UNMET_NEED: 'tristesse d\'un besoin non satisfait',
    JOY_CONNECTION: 'joie de connexion',
    JOY_ACCOMPLISHMENT: 'joie d\'accomplissement',
    MEANING_SEARCH: 'recherche de sens',
    TIME_PASSAGE_AWARENESS: 'conscience du passage du temps',
    TRANSITION_UNCERTAINTY: 'incertitude de transition',
  };

  return descriptions[themeId] || themeId;
}
