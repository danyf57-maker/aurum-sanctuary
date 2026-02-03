// src/lib/ai/service.ts

import { getAiClient, AI_MODEL, AI_TEMPERATURE } from './config';
import { AURUM_CONSTITUTION, EMERGENCY_KEYWORDS, SAFETY_RESPONSE } from './aurum-constitution';
import { ChatMessage, MessageRole } from './types';

export class AurumAIService {
    private conversationHistory: ChatMessage[];
    private readonly constitution: string;

    constructor(history: ChatMessage[] = []) {
        this.constitution = AURUM_CONSTITUTION;
        // On s'assure que la constitution est toujours le premier message système
        this.conversationHistory = [
            { role: MessageRole.System, content: this.constitution },
            ...history
        ];
    }

    private checkForEmergency(message: string): boolean {
        const lowerCaseMessage = message.toLowerCase();
        return EMERGENCY_KEYWORDS.some(keyword => lowerCaseMessage.includes(keyword));
    }

    public async generateResponse(userMessage: string): Promise<string> {
        if (this.checkForEmergency(userMessage)) {
            return SAFETY_RESPONSE;
        }

        // Ajouter le message de l'utilisateur à l'historique
        this.conversationHistory.push({
            role: MessageRole.User,
            content: userMessage,
        });

        try {
            const aiClient = getAiClient();
            const response = await aiClient.chat.completions.create({
                model: AI_MODEL,
                messages: this.conversationHistory as any, // Le type est compatible
                temperature: AI_TEMPERATURE,
            });

            const assistantResponse = response.choices[0]?.message?.content;

            if (!assistantResponse) {
                return "Je suis désolé, je ne trouve pas mes mots. Pourriez-vous reformuler ?";
            }
            
            // Ajouter la réponse de l'assistant à l'historique pour la continuité
            this.conversationHistory.push({
                role: MessageRole.Assistant,
                content: assistantResponse,
            });

            return assistantResponse;

        } catch (error) {
            console.error("Erreur lors de l'appel à l'API DeepSeek:", error);
            return "Je rencontre une difficulté technique pour vous répondre. Veuillez réessayer dans un instant.";
        }
    }
}
