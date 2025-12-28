import {NextResponse} from 'next/server';
import {z} from 'zod';
import {ai} from '@/ai/genkit';
import {generate} from 'genkit/ai';

// Define the expected structure of the output from the AI model
const AnalysisResultSchema = z.object({
  sentiment: z
    .enum(['positif', 'négatif', 'neutre'])
    .describe("Le sentiment général du texte, qui peut être 'positif', 'négatif' ou 'neutre'."),
  score: z
    .number()
    .min(-1)
    .max(1)
    .describe('Un score de sentiment compris entre -1 (très négatif) et 1 (très positif).'),
  analysis: z.string().describe('Une brève explication en français de l’analyse des sentiments.'),
});

export async function POST(request: Request) {
  try {
    const {entryText} = await request.json();

    if (!entryText) {
      return NextResponse.json({error: "Le texte de l'entrée est manquant"}, {status: 400});
    }

    const llmResponse = await generate({
      model: ai.model,
      output: {
        schema: AnalysisResultSchema,
      },
      prompt: `Analysez le sentiment de l'entrée de journal suivante.
                    Répondez avec un objet JSON contenant les clés "sentiment" ("positif", "négatif", ou "neutre"), "score" (un nombre de -1 à 1), et "analysis" (une brève explication en français).
                    L'entrée de journal est : "${entryText}"`,
    });

    const analysisResult = llmResponse.output;

    if (!analysisResult) {
      throw new Error("L'analyse des sentiments n'a pas pu être effectuée par l'IA.");
    }

    // Map French sentiment values to English values expected by the rest of the application
    const sentimentMap: {[key: string]: string} = {
      positif: 'positive',
      négatif: 'negative',
      neutre: 'neutral',
    };

    return NextResponse.json({
      sentiment: sentimentMap[analysisResult.sentiment] || 'neutral',
      score: analysisResult.score,
      analysis: analysisResult.analysis,
    });
  } catch (error: any) {
    console.error("Erreur dans la route API d'analyse:", error);
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {error: "La réponse de l'API d'IA n'a pas le format attendu.", details: error.issues},
        {status: 500}
      );
    }
    return NextResponse.json({error: error.message || 'Une erreur interne est survenue'}, {status: 500});
  }
}
