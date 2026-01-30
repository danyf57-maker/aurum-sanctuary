/**
 * Zustand Store for Mirror Chat
 * 
 * Manages chat state including messages, typing indicator, and UI state.
 */

import { create } from 'zustand';

/**
 * Message interface
 */
export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

/**
 * Mirror Chat store state
 */
interface MirrorStore {
    // State
    messages: Message[];
    isTyping: boolean;
    isMinimized: boolean;
    error: string | null;
    isStreaming: boolean;

    // Actions
    addMessage: (message: Message) => void;
    updateLastMessage: (content: string) => void;
    setTyping: (isTyping: boolean) => void;
    setStreaming: (isStreaming: boolean) => void;
    toggleMinimized: () => void;
    setError: (error: string | null) => void;
    clearChat: () => void;
    clearError: () => void;
}

/**
 * Create Mirror Chat store
 */
export const useMirrorStore = create<MirrorStore>((set) => ({
    // Initial state
    messages: [],
    isTyping: false,
    isMinimized: true,
    error: null,
    isStreaming: false,

    // Add a new message to the chat
    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),

    // Update the last message (for streaming)
    updateLastMessage: (content) =>
        set((state) => {
            const messages = [...state.messages];
            if (messages.length > 0) {
                messages[messages.length - 1] = {
                    ...messages[messages.length - 1],
                    content,
                };
            }
            return { messages };
        }),

    // Set typing indicator state
    setTyping: (isTyping) => set({ isTyping }),

    // Set streaming state
    setStreaming: (isStreaming) => set({ isStreaming }),

    // Toggle chat panel visibility
    toggleMinimized: () =>
        set((state) => ({ isMinimized: !state.isMinimized })),

    // Set error message
    setError: (error) => set({ error }),

    // Clear error message
    clearError: () => set({ error: null }),

    // Clear all messages and reset state
    clearChat: () =>
        set({
            messages: [],
            error: null,
            isTyping: false,
            isStreaming: false,
        }),
}));
