'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface EditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

/**
 * Journal Editor Component
 * 
 * V1: Simple clean textarea with auto-resize (handled by parent or CSS)
 * Future: Tiptap integration for rich text
 */
const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(
    ({ className, ...props }, ref) => {
        return (
            <div className="w-full max-w-3xl mx-auto">
                <Textarea
                    ref={ref}
                    className={cn(
                        "min-h-[60vh] resize-none border-none focus-visible:ring-0 text-lg leading-relaxed p-0 bg-transparent placeholder:text-muted-foreground/50",
                        className
                    )}
                    placeholder="Écrivez ce qui vous pèse..."
                    {...props}
                />
            </div>
        );
    }
);
Editor.displayName = 'Editor';

export { Editor };
