
'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { exportUserData, deleteUserAccount } from '@/app/actions/account';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AccountDataPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (authLoading) {
        return (
            <div className="container max-w-2xl mx-auto py-20 md:py-28">
                <div className="space-y-4">
                    <div className="h-10 w-1/3 bg-muted rounded-md animate-pulse"></div>
                    <div className="h-6 w-2/3 bg-muted rounded-md animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container max-w-2xl mx-auto py-20 md:py-28 text-center">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Accès restreint</AlertTitle>
                    <AlertDescription>
                        Vous devez être connecté pour gérer vos données.
                    </AlertDescription>
                </Alert>
                <Button asChild className="mt-6">
                    <Link href="/sanctuary/write">Retourner à l'écriture</Link>
                </Button>
            </div>
        );
    }

    const handleDownload = async () => {
        setIsDownloading(true);
        const { data, error } = await exportUserData();
        setIsDownloading(false);

        if (error) {
            toast({ title: "Erreur lors de l'exportation", description: error, variant: "destructive" });
        } else if (data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aurum_export_${user.uid}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast({ title: "Exportation réussie", description: "Vos données ont été téléchargées." });
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const { error } = await deleteUserAccount();
        setIsDeleting(false);

        if (error) {
            toast({ title: "Erreur lors de la suppression", description: error, variant: "destructive" });
        } else {
            // The user will be signed out and redirected by the auth hook.
            toast({ title: "Compte supprimé", description: "Nous sommes tristes de vous voir partir." });
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-20 md:py-28 animate-fade-in">
            <header className="mb-12">
                <h1 className="text-4xl font-bold font-headline">Gérer mes Données</h1>
                <p className="mt-2 text-muted-foreground">Exercez vos droits sur vos données personnelles conformément au RGPD.</p>
            </header>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Exporter vos données</CardTitle>
                        <CardDescription>
                            Téléchargez une copie de toutes vos données stockées sur Aurum (profil et entrées de journal) au format JSON.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleDownload} disabled={isDownloading}>
                            {isDownloading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Téléchargement...</>
                            ) : (
                                <><Download className="mr-2 h-4 w-4" /> Télécharger mes données</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Zone de Danger</CardTitle>
                        <CardDescription>
                            La suppression de votre compte est une action irréversible. Toutes vos données, y compris vos entrées de journal, seront définitivement effacées.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isDeleting}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer mon compte et mes données
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Toutes vos entrées de journal seront définitivement supprimées. Nous ne pourrons pas récupérer vos données.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                        {isDeleting ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Suppression...</>
                                        ) : (
                                            "Oui, supprimer mon compte"
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
