
// src/app/actions/chat.ts

"use server";

import { AurumAIService } from '@/lib/ai/service';
import { ChatMessage } from '@/lib/ai/types';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/ratelimit';
import { logAuditEvent } from '@/lib/audit';
import { auth } from 'firebase-admin';

async function getUserIdFromToken(token: string | null): Promise<string | null> {
    if (!token) return null;
    try {
        const decodedToken = await auth().verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying ID token:", error);
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

    // 2. Logique de l'IA
    const chatHistory = (history || []) as ChatMessage[];
    const aurumService = new AurumAIService(chatHistory);

    try {
        const response = await aurumService.generateResponse(message);

        // 3. Log d'audit
        await logAuditEvent(userId, 'MESSAGE_SENT', { messageLength: message.length });

        const newHistory: ChatMessage[] = [
            ...chatHistory,
            { role: 'user' as const, content: message },
            { role: 'assistant' as const, content: response },
        ];

        return {
            response: response,
            history: newHistory,
        };
    } catch (error) {
        console.error("Erreur dans l'action submitAurumMessage:", error);
        return {
            response: "",
            history: chatHistory,
            error: "Une erreur est survenue sur le serveur. Veuillez réessayer.",
        };
    }
}
