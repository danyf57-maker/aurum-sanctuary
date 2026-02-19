
// src/app/actions/chat.ts

"use server";

import { AurumAIService } from '@/lib/ai/service';
import { ChatMessage, MessageRole } from '@/lib/ai/types';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/ratelimit';
import { logAuditEvent } from '@/lib/audit';
import { auth } from 'firebase-admin';
import { logger } from '@/lib/logger/safe';
import { PSYCHOLOGIST_ANALYST_SYSTEM_PROMPT } from '@/lib/skills/psychologist-analyst';
import { PHILOSOPHY_SYSTEM_PROMPT } from '@/lib/skills/philosophy';
import { trackServerEvent } from '@/lib/analytics/server';

async function getUserIdFromToken(token: string | null): Promise<string | null> {
    if (!token) return null;
    try {
        const decodedToken = await auth().verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        logger.errorSafe("Error verifying ID token", error);
        return null;
    }
}

const chatSchema = z.object({
    message: z.string().min(1, "Le message ne peut pas être vide."),
    history: z.array(z.object({
        role: z.string(),
        content: z.string(),
    })).optional(),
    idToken: z.string().optional(),
});

export async function submitAurumMessage(
    prevState: any,
    formData: FormData
): Promise<{ response: string; history: ChatMessage[], error?: string }> {
    const validatedFields = chatSchema.safeParse({
        message: formData.get('message'),
        history: JSON.parse(formData.get('history') as string || '[]'),
        idToken: formData.get('idToken'),
    });

    if (!validatedFields.success) {
        return {
            response: "",
            history: [],
            error: "Une erreur de validation est survenue.",
        };
    }

    const { message, history, idToken } = validatedFields.data;
    const userId = await getUserIdFromToken(idToken || null);

    if (!userId) {
        return {
            response: "",
            history: history as ChatMessage[],
            error: "Utilisateur non authentifié. Veuillez vous reconnecter.",
        };
    }

    // 1. Vérifier le rate limit
    const rateLimit = await checkRateLimit(userId, 'submitAurumMessage');
    if (!rateLimit.allowed) {
        await logAuditEvent(userId, 'RATE_LIMIT_EXCEEDED', { action: 'submitAurumMessage' });
        const resetDate = new Date(rateLimit.resetAt).toLocaleTimeString('fr-FR');
        return {
            response: "",
            history: history as ChatMessage[],
            error: `Vous avez envoyé trop de messages. Veuillez réessayer après ${resetDate}.`,
        };
    }

    // 2. Logique d'Aurum
    const detectSkillPrompt = (text: string): string | undefined => {
        const lowered = text.toLowerCase();
        if (/(philosophie|philosophique|epistemologie|épistémologie|metaphysique|métaphysique|ethique|éthique|platon|aristote|kant|nietzsche|stoicisme|stoïcisme|existentialisme)/.test(lowered)) {
            return PHILOSOPHY_SYSTEM_PROMPT;
        }
        if (/(analyse|analyse-moi|clarifie|clarifier|comprendre|pourquoi)/.test(lowered)) {
            return PSYCHOLOGIST_ANALYST_SYSTEM_PROMPT;
        }
        return undefined;
    };

    const chatHistory = (history || []) as ChatMessage[];
    const skillPrompt = detectSkillPrompt(message);
    const aurumService = new AurumAIService(chatHistory, skillPrompt);

    try {
        const response = await aurumService.generateResponse(message);

        // 3. Log d'audit
        await logAuditEvent(userId, 'MESSAGE_SENT', { messageLength: message.length });
        await trackServerEvent('aurum_message_sent', {
            userId,
            path: '/sanctuary/write',
            params: { messageLength: message.length },
        });

        const newHistory: ChatMessage[] = [
            ...chatHistory,
            { role: MessageRole.User, content: message },
            { role: MessageRole.Assistant, content: response },
        ];

        return {
            response: response,
            history: newHistory,
        };
    } catch (error) {
        logger.errorSafe("Erreur dans l'action submitAurumMessage", error);
        return {
            response: "",
            history: chatHistory,
            error: "Une erreur est survenue sur le serveur. Veuillez réessayer.",
        };
    }
}
