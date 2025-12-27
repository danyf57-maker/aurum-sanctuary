import { NextResponse } from 'next/server';
import {z} from 'zod';

// Define the expected structure of the output from the AI model
const AnalysisResultSchema = z.object({
  sentiment: z.enum(['positif', 'négatif', 'neutre']),
  score: z.number().min(-1).max(1),
  analysis: z.string(),
});

export async function POST(request: Request) {
  try {
    const { entryText } = await request.json();

    if (!entryText) {
      return NextResponse.json({ error: "Le texte de l'entrée est manquant" }, { status: 400 });
    }
    
    if (!process.env.DEEPSEEK_API_KEY) {
        throw new Error("La clé API DEEPSEEK_API_KEY n'est pas définie dans les variables d'environnement.");
    }

    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                {
                    content: `Analysez le sentiment de l'entrée de journal suivante. 
                    Répondez avec un objet JSON contenant les clés "sentiment" ("positif", "négatif", ou "neutre"), "score" (un nombre de -1 à 1), et "analysis" (une brève explication en français).
                    L'entrée de journal est : "${entryText}"`,
                    role: 'user',
                },
            ],
            response_format: { type: 'json_object' },
            stream: false,
        }),
    });

    if (!deepseekResponse.ok) {
        const errorBody = await deepseekResponse.text();
        console.error("Erreur de l'API Deepseek:", errorBody);
        throw new Error(`L'API Deepseek a répondu avec le statut ${deepseekResponse.status}`);
    }

    const result = await deepseekResponse.json();
    const parsedContent = JSON.parse(result.choices[0].message.content);
    
    // Validate the response from the AI model
    const analysisResult = AnalysisResultSchema.parse(parsedContent);

    // Map French sentiment values to English values expected by the rest of the application
    const sentimentMap = {
        'positif': 'positive',
        'négatif': 'negative',
        'neutre': 'neutral'
    };

    return NextResponse.json({
        sentiment: sentimentMap[analysisResult.sentiment],
        score: analysisResult.score,
        analysis: analysisResult.analysis,
    });

  } catch (error: any) {
    console.error("Erreur dans la route API d'analyse:", error);
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "La réponse de l'API d'IA n'a pas le format attendu.", details: error.issues }, { status: 500 });
    }
    return NextResponse.json({ error: error.message || 'Une erreur interne est survenue' }, { status: 500 });
  }
}
