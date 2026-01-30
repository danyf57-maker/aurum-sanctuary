/**
 * Typing Indicator Component
 * 
 * Animated dots indicator shown while AI is processing.
 * Must appear <400ms after user sends message.
 */

'use client';

export function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-2">
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#8B4513] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-[#8B4513] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-[#8B4513] rounded-full animate-bounce"></span>
            </div>
            <span className="text-sm text-[#8B4513] ml-2">Mirror is reflecting...</span>
        </div>
    );
}
