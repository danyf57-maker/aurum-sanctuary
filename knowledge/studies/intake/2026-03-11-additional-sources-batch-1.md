# Intake Note - 2026-03-11 Additional Sources Batch 1

## Source files reviewed

- `2019-02-15-plutchiks-wheel-of-emotions.png`
- `A Procedure for Evaluating Sensitivity to Within-Person Change_ Can Mood Measures in Diary Studies Detect Change Reliably_ - PMC.pdf`
- `Appraisals, emotions and emotion regulation_ An integrative approach.pdf`
- `Emotional granularity.pdf`
- `Emotional_granularity_–_Vocabulary_for_mental_health.pdf`
- `Identifier les declencheurs emotionnels grace au profilage psychographique - FasterCapital.pdf`
- `Primary and Secondary Emotions_ What's The Difference_.pdf`
- `Reflective journal writing and interpreting anxiety_ insights from a longitudinal study - PMC.pdf`
- `Stepping-back-to-move-forward.pdf`

## High-value additions for Aurum

### 1. Self-distancing as a mechanism

- `Stepping-back-to-move-forward.pdf`
- Strong fit for Aurum's mission.
- Useful to guide how reflection should help the user step back from an
  experience rather than loop inside it.

### 2. Within-person change measurement

- `A Procedure for Evaluating Sensitivity to Within-Person Change_ Can Mood Measures in Diary Studies Detect Change Reliably_ - PMC.pdf`
- Valuable for Aurum's analytics, mood tracking, and evaluation layer.
- Not a direct runtime evidence source for DeepSeek interpretation, but highly
  relevant for how the product measures change over time.

### 3. Appraisal -> emotion -> regulation mapping

- `Appraisals, emotions and emotion regulation_ An integrative approach.pdf`
- Useful for designing how Aurum maps situations, perceived meaning, emotional
  states, and coping tendencies.
- Better as a design/context card than a direct runtime card, because the sample
  is narrow and scenario-specific.

## Medium-value additions

### 4. Reflective journal writing in a longitudinal study

- `Reflective journal writing and interpreting anxiety_ insights from a longitudinal study - PMC.pdf`
- Interesting because it is longitudinal and explicitly about reflective journal
  writing.
- However, the context is specialized: interpreting anxiety in students.
- Keep as context-only unless later corroborated by broader evidence.

### 5. Plutchik wheel image

- `2019-02-15-plutchiks-wheel-of-emotions.png`
- Useful for UX vocabulary, emotion pickers, and editorial inspiration.
- Not evidence by itself.

## Weak or unsafe sources for runtime evidence

### Exclude

- `Identifier les declencheurs emotionnels grace au profilage psychographique - FasterCapital.pdf`
  - marketing/content site, not a scientific source
- `Primary and Secondary Emotions_ What's The Difference_.pdf`
  - popular psychology explainer, not a primary source
- `Emotional granularity.pdf`
  - encyclopedia-style overview, not a strong paper for runtime grounding

### Context-only, with caution

- `Emotional_granularity_–_Vocabulary_for_mental_health.pdf`
  - useful critical perspective
  - not a solid basis for runtime guidance on its own
  - can help avoid ideology or overclaiming around emotional vocabulary

## Practical consequence for Aurum

This batch improves Aurum in three important ways:

- better design of prompts that encourage self-distancing,
- better design of longitudinal measures and mood change detection,
- better conceptual mapping between situation appraisal, emotion, and regulation.

It does **not** yet justify:

- psychographic trigger profiling,
- broad mental-health outcome claims,
- using popular explainers as runtime scientific evidence.
