'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useJournal } from '@/hooks/useJournal';
import { Editor } from './Editor';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function EntryForm() {
    const { user } = useAuth();
    const { createEntry } = useJournal();
    const { toast } = useToast();
    const t = useTranslations('entryForm');

    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!content.trim()) return;

        try {
            setIsSaving(true);

            await createEntry(content);

            toast({
                title: t('savedTitle'),
                description: t('savedDescription'),
            });

            setContent(''); // Clear after save
        } catch (error) {
            // Toast handled by hook
        } finally {
            setIsSaving(false);
        }
    };



    return (
        <div className="relative min-h-[80vh] flex flex-col">
            <header className="flex items-center justify-between py-4 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-xs">{t('encryptionActive')}</span>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !content.trim()}
                    size="sm"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {t('save')}
                </Button>
            </header>

            <main className="flex-1">
                <Editor
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isSaving}
                    autoFocus
                />
            </main>
        </div>
    );
}
