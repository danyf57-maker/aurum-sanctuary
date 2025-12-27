import { NextResponse } from 'next/server';

// Définir la structure de la sortie attendue de l'API Deepseek
interface DeepseekResponse {
  sentiment: 'positif' | 'négatif' | 'neutre';
  score: number;
  analysis: string;
}

export async function POST(request: Request) {
  try {
    const { entryText } = await request.json();

    if (!entryText) {
      return NextResponse.json({ error: 'Le texte de l\'entrée est manquant' }, { status: 400 });
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
    const analysisResult: DeepseekResponse = JSON.parse(result.choices[0].message.content);

    // Mapper les valeurs françaises aux valeurs anglaises attendues par le reste de l'application
    let sentimentEn = 'neutral';
    if (analysisResult.sentiment === 'positif') sentimentEn = 'positive';
    if (analysisResult.sentiment === 'négatif') sentimentEn = 'negative';

    return NextResponse.json({
        sentiment: sentimentEn,
        score: analysisResult.score,
        analysis: analysisResult.analysis,
    });

  } catch (error: any) {
    console.error('Erreur dans la route API d\'analyse:', error);
    return NextResponse.json({ error: error.message || 'Une erreur interne est survenue' }, { status: 500 });
  }
}
