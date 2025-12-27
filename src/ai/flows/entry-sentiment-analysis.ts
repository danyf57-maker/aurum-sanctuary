'use server';

/**
 * @fileOverview An AI agent that analyzes the sentiment of journal entries.
 *
 * - analyzeEntrySentiment - A function that analyzes the sentiment of a journal entry.
 * - EntrySentimentInput - The input type for the analyzeEntrySentiment function.
 * - EntrySentimentOutput - The return type for the analyzeEntrySentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EntrySentimentInputSchema = z.object({
  entryText: z
    .string()
    .describe('Le contenu textuel de l\'entrée de journal à analyser.'),
});
export type EntrySentimentInput = z.infer<typeof EntrySentimentInputSchema>;

const EntrySentimentOutputSchema = z.object({
  sentiment:
    z.string()
    .describe(
      'Le sentiment général de l\'entrée de journal, tel que positif, négatif ou neutre.'
    ),
  score:
    z.number()
    .describe('Un score numérique représentant l\'intensité du sentiment.'),
  analysis:
    z.string()
    .describe('Une analyse détaillée du sentiment exprimé dans l\'entrée.'),
});
export type EntrySentimentOutput = z.infer<typeof EntrySentimentOutputSchema>;

export async function analyzeEntrySentiment(
  input: EntrySentimentInput
): Promise<EntrySentimentOutput> {
  return entrySentimentAnalysisFlow(input);
}

const sentimentAnalysisPrompt = ai.definePrompt({
  name: 'sentimentAnalysisPrompt',
  input: {schema: EntrySentimentInputSchema},
  output: {schema: EntrySentimentOutputSchema},
  prompt: `Vous êtes un expert en analyse de sentiments.

  Analysez l'entrée de journal suivante et déterminez son sentiment.
  Fournissez un sentiment (positif, négatif ou neutre), un score de sentiment (-1 à 1) et une brève analyse.
  Répondez en anglais pour les valeurs de sentiment (positive, negative, neutral).

  Entrée de journal: {{{entryText}}}
  `,
});

const entrySentimentAnalysisFlow = ai.defineFlow(
  {
    name: 'entrySentimentAnalysisFlow',
    inputSchema: EntrySentimentInputSchema,
    outputSchema: EntrySentimentOutputSchema,
  },
  async input => {
    const {output} = await sentimentAnalysisPrompt(input);
    return output!;
  }
);
