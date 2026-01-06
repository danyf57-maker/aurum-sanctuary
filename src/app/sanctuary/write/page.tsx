
'use client';

import { useState } from 'react';
import { JournalEntryForm } from '@/components/journal/journal-entry-form';
import { AurumChat } from '@/components/chat/AurumChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookText, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WritePage() {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState("write");

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto py-20">
                <div className="space-y-4">
                    <div className="h-10 w-1/3 bg-muted rounded-md animate-pulse"></div>
                    <div className="h-96 w-full bg-muted rounded-md animate-pulse"></div>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center py-8 md:py-12 animate-fade-in bg-stone-50/50">
                <JournalEntryForm />
            </div>
        );
    }
    
    return (
        <div className="container max-w-4xl mx-auto py-12 md:py-16">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="write">
                        <BookText className="mr-2 h-4 w-4" />
                        Mode Écriture
                    </TabsTrigger>
                    <TabsTrigger value="chat">
                         <MessageSquare className="mr-2 h-4 w-4" />
                        Dialogue avec Aurum
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Écriture Libre</CardTitle>
                            <CardDescription>Votre espace pour déposer vos pensées, sans filtre.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <JournalEntryForm />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="chat" className="mt-6">
                   <AurumChat />
                </TabsContent>
            </Tabs>
        </div>
    );
}
