
'use client';

import { useEffect } from 'react';
import { useAuth, ALMA_USER_ID } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LineChart, Users, BookOpen, MessageCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, XAxis, YAxis, Line, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

const chartConfig = {
  users: { label: 'Utilisateurs', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

const mockStats = {
    totalUsers: 1256,
    newSignups: 78,
    entriesCreated: 432,
    dau: 152,
    wau: 489,
};

const mockEvents = [
    { event: 'sign_up', user: 'user_a@...com', date: '2 min ago', details: 'Provider: google' },
    { event: 'entry_created', user: 'user_b@...com', date: '5 min ago', details: 'Tags: travail, stress' },
    { event: 'login', user: 'user_c@...com', date: '10 min ago', details: 'Provider: email' },
    { event: 'first_entry', user: 'user_a@...com', date: '11 min ago', details: 'Length: 250 chars' },
    { event: 'RATE_LIMIT_EXCEEDED', user: 'user_d@...com', date: '15 min ago', details: 'Action: submitAurumMessage' },
];

const mockChartData = [
    { date: '2024-07-18', users: 12 },
    { date: '2024-07-19', users: 15 },
    { date: '2024-07-20', users: 13 },
    { date: '2024-07-21', users: 22 },
    { date: '2024-07-22', users: 25 },
    { date: '2024-07-23', users: 23 },
    { date: '2024-07-24', users: 31 },
];

function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirige uniquement côté client une fois que l'authentification est vérifiée
        if (!loading && (!user || user.uid !== ALMA_USER_ID)) {
            router.push('/');
        }
    }, [user, loading, router]);
    
    // Affiche un état de chargement pendant la vérification de l'authentification
    if (loading || !user || user.uid !== ALMA_USER_ID) {
        return (
             <div className="min-h-screen bg-muted/40">
                <main className="container max-w-7xl py-12">
                     <header className="mb-8">
                        <Skeleton className="h-9 w-1/3" />
                        <Skeleton className="h-5 w-1/2 mt-2" />
                    </header>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <Skeleton className="h-[350px] w-full" />
                        <Skeleton className="h-[350px] w-full" />
                    </div>
                </main>
             </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-muted/40">
            <main className="container max-w-7xl py-12">
                <header className="mb-8">
                     <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Administrateur</h1>
                     <p className="text-muted-foreground">Vue d'ensemble de l'activité sur Aurum.</p>
                </header>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">+ {mockStats.newSignups} cette semaine</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Entrées Créées (24h)</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{mockStats.entriesCreated}</div>
                             <p className="text-xs text-muted-foreground">Activité récente</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Utilisateurs Actifs (DAU)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{mockStats.dau}</div>
                            <p className="text-xs text-muted-foreground">WAU: {mockStats.wau}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Messages IA (24h)</CardTitle>
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,204</div>
                             <p className="text-xs text-muted-foreground">Coût estimé: 0.87€</p>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Nouveaux utilisateurs / jour</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                           <ChartContainer config={chartConfig}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={mockChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Événements Récents</CardTitle>
                            <CardDescription>Journal des actions clés des utilisateurs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Événement</TableHead>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockEvents.map((event, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {event.event === 'RATE_LIMIT_EXCEEDED' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                                    <Badge variant={event.event === 'RATE_LIMIT_EXCEEDED' ? 'destructive' : 'secondary'}>{event.event}</Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{event.user}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{event.date}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;

    
