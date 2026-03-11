
"use server";

import OpenAI from 'openai';
import { JournalEntry, UserInsights } from '@/lib/types';
import { buildEvidencePrompt } from '@/lib/ai/evidence/prompt-policy';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const systemPrompt = `Tu es Aurum, un compagnon de réflexion privé spécialisé dans l'analyse longitudinale d'écrits personnels.

Analyse les entrées de journal suivantes et réponds UNIQUEMENT avec un objet JSON valide respectant ce format:
{
  "mainTheme": "Identifie le thème émotionnel ou situationnel principal qui ressort de l'ensemble des entrées. Sois concis et direct.",
  "recurringPatterns": "Décris un schéma récurrent, une tension, un besoin, ou un mouvement qui revient dans les écrits. Reste descriptif, prudent, et ancré dans le texte.",
  "gentleAdvice": "Formule une ouverture de réflexion courte et douce. Privilégie une question ou une invitation à observer, jamais un conseil directif."
}

Contraintes:
- Ne donne ni diagnostic, ni conseil clinique, ni promesse d'amélioration.
- Reste descriptif et hypothétique, jamais catégorique.
- Ne rajoute aucun texte avant ou après l'objet JSON.

${buildEvidencePrompt('journalInsights')}`;

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
