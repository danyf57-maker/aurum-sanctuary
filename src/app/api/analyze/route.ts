import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger/safe';
import { requireUserIdFromRequest, UserGuardError } from '@/lib/api/require-user-id';
import { buildEvidencePrompt } from '@/lib/ai/evidence/prompt-policy';
import { buildAurumResponseContract } from '@/lib/ai/aurum-response-contract';
import {
  buildStrictReplyLanguageInstruction,
  resolvePromptLanguage,
  resolveReplyLanguage,
} from '@/lib/ai/language';
import { buildAurumSystemPrompt } from '@/lib/ai/aurum-system-prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await requireUserIdFromRequest(request, body);
    const { content } = body as { content?: string };
    const replyLanguage = resolveReplyLanguage(content || '', null);
    const promptLanguage = resolvePromptLanguage(replyLanguage, null);

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
            content: `${buildAurumSystemPrompt('entryAnalysis', promptLanguage)}\n\nReturn ONLY a valid JSON object with this exact shape: {"sentiment": "positive/negative/neutral", "mood": "calm/anxious/joyful/sad/etc", "insight": "one short, careful, non-clinical sentence about what seems present here"}\n\n${buildEvidencePrompt('entryAnalysis', promptLanguage)}\n\n${buildAurumResponseContract('entryAnalysis', promptLanguage)}`
          },
          {
            role: 'system',
            content: `${buildStrictReplyLanguageInstruction(replyLanguage, null)} Return the JSON values in that same language.`,
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
