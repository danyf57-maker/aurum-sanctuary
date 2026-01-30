/**
 * Mirror Chat Component
 * 
 * Main UI for Mirror Chat - reflective listening AI.
 * Minimized by default, expandable on click.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useMirrorStore } from '@/store/mirror/useMirrorStore';
import { TypingIndicator } from './TypingIndicator';
import { useAuth } from '@/providers/auth-provider';
import { useDerivedMemoryLite } from '@/hooks/useDerivedMemoryLite';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { INITIAL_DERIVED_MEMORY_LITE } from '@/lib/schemas/derivedMemory';

export function MirrorChat() {
    const { user } = useAuth();
    const { data: derivedMemoryLite } = useDerivedMemoryLite();
    const {
        messages,
        isTyping,
        isMinimized,
        error,
        isStreaming,
        addMessage,
        updateLastMessage,
        setTyping,
        setStreaming,
        toggleMinimized,
        setError,
        clearError,
    } = useMirrorStore();

    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Focus textarea when chat is expanded
    useEffect(() => {
        if (!isMinimized && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isMinimized]);

    /**
     * Send message to Mirror Chat API
     */
    const handleSendMessage = async () => {
        if (!inputText.trim() || isSending || !user) return;

        const userMessage = inputText.trim();
        setInputText('');
        clearError();
        setIsSending(true);

        // Add user message immediately
        addMessage({
            role: 'user',
            content: userMessage,
            timestamp: Date.now(),
        });

        // Show typing indicator immediately (<400ms requirement)
        setTyping(true);

        try {
            // Get Firebase ID token
            const idToken = await user.getIdToken();

            // Use fetched derivedMemoryLite or fallback to initial
            const context = derivedMemoryLite || INITIAL_DERIVED_MEMORY_LITE;

            // Call Mirror Chat API
            const response = await fetch('/api/mirror', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    text: userMessage,
                    derivedMemoryLite: context,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send message');
            }

            // Hide typing indicator when first token arrives
            setTyping(false);
            setStreaming(true);

            // Add empty assistant message for streaming
            addMessage({
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
            });

            // Stream response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response body');
            }

            let aiMessage = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                aiMessage += chunk;

                // Update last message with accumulated content
                updateLastMessage(aiMessage);
            }

            setStreaming(false);
        } catch (error) {
            setTyping(false);
            setStreaming(false);

            const errorMessage = error instanceof Error
                ? error.message
                : 'Something went wrong. Please try again.';

            setError(errorMessage);
        } finally {
            setIsSending(false);
        }
    };

    /**
     * Handle Enter key to send message
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Minimized state - floating icon
    if (isMinimized) {
        return (
            <button
                onClick={toggleMinimized}
                className="fixed bottom-6 right-6 w-14 h-14 bg-[#D4AF37] hover:bg-[#C4A037] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
                aria-label="Open Mirror Chat"
            >
                <MessageCircle className="w-6 h-6" />
            </button>
        );
    }

    // Expanded state - chat panel
    return (
        <div className="fixed bottom-0 right-0 w-full sm:w-[400px] h-[600px] bg-[#F5F5DC] shadow-2xl flex flex-col z-50 border-l border-[#8B4513]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#8B4513] bg-[#D4AF37]">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-white">Mirror Chat</h3>
                </div>
                <button
                    onClick={toggleMinimized}
                    className="text-white hover:text-gray-200 transition-colors"
                    aria-label="Minimize chat"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-[#8B4513] opacity-70 mt-8">
                        <p className="text-sm">Welcome to your Mirror.</p>
                        <p className="text-xs mt-2">Ask a question or share a thought.</p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                                ? 'bg-[#D4AF37] text-white'
                                : 'bg-white border border-[#8B4513] text-[#8B4513]'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}

                {isTyping && <TypingIndicator />}

                <div ref={messagesEndRef} />
            </div>

            {/* Error Alert */}
            {error && (
                <div className="px-4 pb-2">
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-[#8B4513]">
                <div className="flex gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Share your thoughts..."
                        className="flex-1 resize-none bg-white border-[#8B4513] focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                        rows={2}
                        maxLength={500}
                        disabled={isSending || isStreaming}
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || isSending || isStreaming}
                        className="bg-[#D4AF37] hover:bg-[#C4A037] text-white"
                        size="icon"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-xs text-[#8B4513] opacity-70 mt-1">
                    {inputText.length}/500 characters
                </p>
            </div>
        </div>
    );
}
