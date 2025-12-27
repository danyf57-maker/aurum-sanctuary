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
    .describe('The text content of the journal entry to analyze.'),
});
export type EntrySentimentInput = z.infer<typeof EntrySentimentInputSchema>;

const EntrySentimentOutputSchema = z.object({
  sentiment:
    z.string()
    .describe(
      'The overall sentiment of the journal entry, such as positive, negative, or neutral.'
    ),
  score:
    z.number()
    .describe('A numerical score representing the sentiment intensity.'),
  analysis:
    z.string()
    .describe('A detailed analysis of the sentiment expressed in the entry.'),
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
  prompt: `You are a sentiment analysis expert.

  Analyze the following journal entry and determine its sentiment.
  Provide a sentiment (positive, negative, or neutral), a sentiment score (-1 to 1), and a brief analysis.

  Journal Entry: {{{entryText}}}
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
