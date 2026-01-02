// src/lib/ai/config.ts

import OpenAI from 'openai';

if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('La variable d\'environnement DEEPSEEK_API_KEY n\'est pas définie.');
}

// L'API de DeepSeek est compatible avec le client OpenAI.
export const aiClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export const AI_MODEL = 'deepseek-chat';
export const AI_TEMPERATURE = 0.5;
