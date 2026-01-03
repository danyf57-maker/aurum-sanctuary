
'use client';

import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Bell, Palette, Moon, Sun, Monitor, CreditCard } from 'lucide-react';
import { createPortalSession } from '@/app/actions/stripe';

export default function ProfilePage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
             <div className="container max-w-4xl mx-auto py-20 md:py-28">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-24 h-24 bg-muted rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-muted rounded-md animate-pulse"></div>
                        <div className="h-6 w-64 bg-muted rounded-md animate-pulse"></div>
                    </div>
                </div>
                 <div className="h-96 w-full bg-muted rounded-lg animate-pulse"></div>
             </div>
        );
    }
    
    if (!user) {
        redirect('/sanctuary/write');
    }

    const registrationDate = user.metadata.creationTime 
        ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(user.metadata.creationTime))
        : 'N/A';

    const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : '?';

    return (
        <div className="container max-w-4xl mx-auto py-20 md:py-28 animate-fade-in">
            <header className="mb-12">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative">
                        <Avatar className="w-24 h-24 text-4xl border-2">
                            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'Avatar'} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                        <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0" disabled>
                           <User className="h-4 w-4" /> 
                           <span className="sr-only">Changer l'avatar</span>
                        </Button>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold font-headline">{user.displayName}</h1>
                        <p className="mt-1 text-muted-foreground">Gérez vos informations personnelles et vos préférences.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground"/>
                                <span className="text-sm">{user.displayName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground"/>
                                <span className="text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground"/>
                                <span className="text-sm">Membre depuis le {registrationDate}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Abonnement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <p className="text-sm text-muted-foreground">Vous êtes sur le plan Essentiel.</p>
                           <form action={createPortalSession}>
                             <Button>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Gérer l'abonnement
                             </Button>
                           </form>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <form>
                        <Card>
                            <CardHeader>
                                <CardTitle>Préférences</CardTitle>
                                <CardDescription>Personnalisez votre expérience Aurum.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                               <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Palette className="h-4 w-4"/> Thème de l'application</Label>
                                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                                        <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2" disabled>
                                            <Sun className="h-4 w-4"/> Clair
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2" disabled>
                                            <Moon className="h-4 w-4" /> Foncé
                                        </Button>
                                         <Button variant="secondary" size="sm" className="flex-1 justify-start gap-2" disabled>
                                            <Monitor className="h-4 w-4"/> Système
                                        </Button>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications par email</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Recevoir des résumés et rappels hebdomadaires.
                                        </p>
                                    </div>
                                    <Switch disabled />
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
             <div className="mt-12 flex justify-end">
                <Button disabled>Enregistrer les modifications</Button>
            </div>
        </div>
    );
}
