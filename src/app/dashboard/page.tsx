'use client';

import { useAuth } from '@/providers/auth-provider';
import { EntryForm } from '@/components/journal/EntryForm';
import { Timeline } from '@/components/journal/Timeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <header className="mb-12 text-center">
                <h1 className="text-3xl font-serif text-foreground/90 mb-2">
                    Bonjour, {user?.displayName?.split(' ')[0] || 'Voyageur'}
                </h1>
                <p className="text-muted-foreground">
                    Le sanctuaire est ouvert.
                </p>
            </header>

            <Tabs defaultValue="write" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="write">Écrire</TabsTrigger>
                        <TabsTrigger value="timeline">Journal</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="write" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                    <section className="bg-card/30 backdrop-blur-sm rounded-xl p-6 min-h-[600px] border border-border/50 shadow-sm">
                        <EntryForm />
                    </section>
                </TabsContent>

                <TabsContent value="timeline" className="focus-visible:outline-none focus-visible:ring-0">
                    <Timeline />
                </TabsContent>
            </Tabs>
        </div>
    );
}