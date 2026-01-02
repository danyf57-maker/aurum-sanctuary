
"use server";

import OpenAI from 'openai';
import { JournalEntry, UserInsights } from '@/lib/types';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const systemPrompt = `Tu es un psychologue et un coach de vie bienveillant, spécialisé dans l'analyse de journaux intimes. Ton but est d'aider l'utilisateur à mieux se comprendre en analysant ses écrits sur une période donnée.

Analyse les entrées de journal suivantes et réponds UNIQUEMENT avec un objet JSON valide respectant ce format:
{
  "mainTheme": "Identifie le thème émotionnel ou situationnel principal qui ressort de l'ensemble des entrées. Sois concis et direct. Par exemple: 'exploration de la solitude' ou 'gestion du stress professionnel'.",
  "recurringPatterns": "Identifie un schéma de pensée ou de comportement récurrent. Sois subtil et perspicace. Par exemple: 'Tendance à minimiser les succès tout en analysant en détail les échecs.' ou 'Un schéma d'optimisme prudent semble émerger face aux nouveaux défis.'",
  "gentleAdvice": "Fournis un conseil ou une question de réflexion courte, douce et exploitable, basée sur les analyses précédentes. Ne sois pas directif. Par exemple: 'Quelle serait la plus petite étape pour célébrer une prochaine victoire, même modeste ?' ou 'Comment pourriez-vous offrir à votre anxiété un espace pour s'exprimer, plutôt que de la combattre ?'"
}

Ne rajoute aucun texte avant ou après l'objet JSON.`;

function formatEntriesForAI(entries: JournalEntry[]): string {
    return entries.map(entry => {
        const date = new Date(entry.createdAt).toLocaleDateString('fr-FR');
        return `Date: ${date}\nContenu: ${entry.content}\n---`;
    }).join('\n\n');
}

export async function generateInsights(entries: JournalEntry[]): Promise<Omit<UserInsights, 'lastUpdatedAt'>> {
    if (entries.length === 0) {
        throw new Error("Au moins une entrée est nécessaire pour générer des insights.");
    }
    
    const formattedContent = formatEntriesForAI(entries);

    try {
        const response = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: formattedContent }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
        });

        const resultText = response.choices[0]?.message?.content;
        
        if (!resultText) {
            throw new Error("La réponse de l'API est vide.");
        }

        const insights = JSON.parse(resultText);

        return insights;

    } catch (error) {
        console.error("Erreur lors de la génération des insights avec DeepSeek:", error);
        throw new Error("Impossible de générer les insights depuis l'API.");
    }
}
