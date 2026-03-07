import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger/safe';
import { requireUserIdFromRequest, UserGuardError } from '@/lib/api/require-user-id';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await requireUserIdFromRequest(request, body);
    const { content } = body as { content?: string };

    if (!content) {
      return NextResponse.json(
        { error: 'Le contenu est requis' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      logger.errorSafe('Clé API Deepseek non configurée');
      return NextResponse.json(
        { error: 'Clé API Deepseek non configurée' },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant empathique spécialisé dans l\'analyse des émotions. Analyse le texte suivant et retourne UNIQUEMENT un objet JSON avec: {"sentiment": "positive/negative/neutral", "mood": "calme/anxieux/joyeux/triste/etc", "insight": "une phrase courte et bienveillante sur ce que ressent la personne"}'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 1.5,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      logger.errorSafe('Deepseek API error', undefined, {
        statusCode: response.status,
        errorPreview: error?.substring(0, 100)
      });
      return NextResponse.json(
        { error: 'Erreur lors de l\'analyse par l\'API Deepseek' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content;

    if (!analysisText) {
      return NextResponse.json(
        { error: 'Réponse invalide de l\'API d\'analyse' },
        { status: 500 }
      );
    }

    // L'API est censée retourner un JSON valide
    try {
      const analysis = JSON.parse(analysisText);
      return NextResponse.json(analysis);
    } catch (parseError) {
      logger.errorSafe('Failed to parse DeepSeek response as JSON', parseError, {
        responsePreview: analysisText?.substring(0, 100)
      });
      return NextResponse.json(
        { error: 'Format de réponse invalide de l\'API d\'analyse' },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof UserGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.errorSafe('Error analyzing entry', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de l\'analyse' },
      { status: 500 }
      );
  }
}
