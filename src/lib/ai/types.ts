// src/lib/ai/types.ts

export enum MessageRole {
    System = 'system',
    User = 'user',
    Assistant = 'assistant',
}

export interface ChatMessage {
    role: MessageRole;
    content: string;
}
