'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { submitAurumMessage } from '@/app/actions/chat';
import { type ChatMessage } from '@/lib/ai/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Utiliser l'état initial défini dans l'action si disponible, sinon un état par défaut.
const initialState = {
    response: '',
    history: [],
};

function SubmitButton() {  
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      <span className="sr-only">Envoyer</span>
    </Button>
  );
}

export function AurumChat() {
  const [state, formAction, isPending] = useActionState(submitAurumMessage, initialState);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Mettre à jour l'historique local lorsque l'action serveur réussit
    if (state && state.history.length > history.length) {
      setHistory(state.history);
      formRef.current?.reset(); // Vider le textarea
      if(textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset textarea height
      }
    }
  }, [state, history.length]);

  useEffect(() => {
    // Scroll vers le bas à chaque nouveau message
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [history]);

  const handleTextareaInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <Card className="w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl shadow-stone-200/50">
      <CardHeader className="border-b">
        <CardTitle className="font-headline text-2xl flex items-center gap-3">
          <Bot className="text-amber-600" />
          <span>Discuter avec Aurum</span>
        </CardTitle>
        <CardDescription>Votre confident IA pour une introspection guidée.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {history.map((msg, index) => (
              <div
                key={index}
                className={cn('flex items-start gap-4', { 'justify-end': msg.role === 'user' })}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border">
                     <AvatarFallback className="bg-amber-100 text-amber-700">A</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn('max-w-md rounded-lg p-3', {
                    'bg-secondary text-secondary-foreground': msg.role === 'user',
                    'bg-stone-100 dark:bg-stone-800': msg.role === 'assistant'
                })}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                    <Avatar className="h-8 w-8 border">
                        <AvatarFallback><User size={16}/></AvatarFallback>
                    </Avatar>
                )}
              </div>
            ))}
             {isPending && (
                <div className="flex items-start gap-4">
                     <Avatar className="h-8 w-8 border">
                     <AvatarFallback className="bg-amber-100 text-amber-700">A</AvatarFallback>
                  </Avatar>
                  <div className="max-w-md rounded-lg p-3 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                  </div>
                </div>
             )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form
          ref={formRef}
          action={formAction}
          className="w-full flex items-end gap-2"
        >
          <input type="hidden" name="history" value={JSON.stringify(history)} />
          <Textarea
            ref={textareaRef}
            name="message"
            placeholder="Écrivez ce qui vous traverse l'esprit..."
            required
            disabled={isPending}
            className="flex-1 resize-none max-h-48"
            rows={1}
            onInput={handleTextareaInput}
            onKeyDown={handleKeyDown}
          />
          <SubmitButton />
        </form>
      </CardFooter>
    </Card>
  );
}
