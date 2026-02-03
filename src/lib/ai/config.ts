// src/lib/ai/config.ts

import OpenAI from 'openai';

let cachedClient: OpenAI | null = null;

// L'API de DeepSeek est compatible avec le client OpenAI.
export function getAiClient(): OpenAI {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("La variable d'environnement DEEPSEEK_API_KEY n'est pas définie.");
  }
  cachedClient = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com/v1',
  });
  return cachedClient;
}

export const AI_MODEL = 'deepseek-chat';
export const AI_TEMPERATURE = 0.5;
