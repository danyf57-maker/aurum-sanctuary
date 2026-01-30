'use client';

import { useEffect } from 'react';
import { useJournal } from '@/hooks/useJournal';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Timeline() {
    const { entries, fetchEntries, loading } = useJournal();

    // Fetch on mount
    useEffect(() => {
        fetchEntries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading && entries.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>Votre journal est vide.</p>
                <p className="text-sm">Commencez à écrire pour voir vos pensées ici.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto py-8">
            {entries.map((entry) => (
                <Card key={entry.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground mb-3 flex justify-between">
                            <span className="capitalize">
                                {format(entry.createdAt, 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                            </span>
                        </div>
                        <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-serif">
                            {entry.content}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
