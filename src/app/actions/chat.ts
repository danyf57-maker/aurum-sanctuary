// src/app/actions/chat.ts

"use server";

import { AurumAIService } from '@/lib/ai/service';
import { ChatMessage } from '@/lib/ai/types';
import { z } from 'zod';

const chatSchema = z.object({
    message: z.string().min(1, "Le message ne peut pas être vide."),
    history: z.array(z.object({
        role: z.string(),
        content: z.string(),
    })).optional(),
});

export async function submitAurumMessage(
    prevState: any,
    formData: FormData
): Promise<{ response: string; history: ChatMessage[] }> {
    const validatedFields = chatSchema.safeParse({
        message: formData.get('message'),
        history: JSON.parse(formData.get('history') as string || '[]'),
    });

    if (!validatedFields.success) {
        return {
            response: "Une erreur de validation est survenue.",
            history: [],
        };
    }
    
    const { message, history } = validatedFields.data;
    
    // Le type de l'historique doit être casté pour correspondre à ChatMessage[]
    const chatHistory = (history || []) as ChatMessage[];

    const aurumService = new AurumAIService(chatHistory);

    try {
        const response = await aurumService.generateResponse(message);
        
        // La nouvelle histoire inclut le dernier message utilisateur et la réponse d'Aurum
        const newHistory = [
            ...chatHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: response },
        ];

        return {
            response: response,
            history: newHistory,
        };
    } catch (error) {
        console.error("Erreur dans l'action submitAurumMessage:", error);
        return {
            response: "Une erreur est survenue sur le serveur. Veuillez réessayer.",
            history: chatHistory, // On retourne l'historique sans le dernier message
        };
    }
}
