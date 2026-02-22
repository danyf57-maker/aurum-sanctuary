'use client';

import { useEffect, useState } from 'react';
import { useAuth, isAdminEmail } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, MessageCircle, TrendingUp, Filter, Download } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, XAxis, YAxis, Line, ResponsiveContainer, LineChart } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

const chartConfig = {
  users: { label: 'Nouveaux inscrits', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

type AdminAnalyticsResponse = {
  stats: {
    totalUsers: number;
    newSignups: number;
    entriesCreated: number;
    dau: number;
    wau: number;
    visitorsLast30d: number;
    aurumMessagesLast24h: number;
  };
  funnel: {
    visitors: number;
    signups: number;
    firstEntries: number;
    checkoutStarts: number;
    purchases: number;
  };
  quizFunnel: {
    started: number;
    completed: number;
    resultViewed: number;
    ctaClicked: number;
    signupWithQuiz: number;
  };
  chart: Array<{ date: string; users: number }>;
  topEvents: Array<{ name: string; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
  recentEvents: Array<{ id: string; name: string; user: string; date: string; details: string }>;
  topLeads: Array<{
    leadId: string;
    userEmail: string | null;
    score: number;
    segment: 'hot' | 'warm' | 'cold';
    lastActivityAt: string;
  }>;
};

function DashboardSkeleton() {
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

function pct(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function escapeCsvValue(value: unknown) {
  const text = String(value ?? '');
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
}

function toCsv<T extends Record<string, unknown>>(rows: T[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeCsvValue).join(',');
  const bodyLines = rows.map((row) =>
    headers.map((header) => escapeCsvValue(row[header])).join(',')
  );
  return [headerLine, ...bodyLines].join('\n');
}

function downloadCsv(filename: string, csv: string) {
  if (!csv) return;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function downloadCsvFromApi(url: string, filename: string) {
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`Export failed (${response.status})`);
  }
  const csv = await response.text();
  downloadCsv(filename, csv);
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AdminAnalyticsResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isRunningOnboarding, setIsRunningOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdminEmail(user.email))) {
      router.push('/');
      return;
    }
    if (loading || !user) return;

    let cancelled = false;
    async function loadData() {
      setLoadingData(true);
      try {
        const response = await fetch('/api/admin/analytics', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Failed to fetch admin analytics');
        }
        const json = (await response.json()) as AdminAnalyticsResponse;
        if (!cancelled) setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }
    void loadData();
    return () => {
      cancelled = true;
    };
  }, [user, loading, router]);

  if (loading || !user || !isAdminEmail(user.email) || loadingData || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <main className="container max-w-7xl py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Administrateur</h1>
          <p className="text-muted-foreground">Données réelles: acquisition, activation et conversion.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={isRunningOnboarding}
              onClick={async () => {
                setIsRunningOnboarding(true);
                try {
                  await fetch("/api/onboarding/run", { method: "POST" });
                } finally {
                  setIsRunningOnboarding(false);
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              {isRunningOnboarding ? "Onboarding en cours..." : "Lancer onboarding maintenant"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                void downloadCsvFromApi("/api/admin/exports?type=users_enriched", "users_enriched.csv");
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export users_enriched
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void downloadCsvFromApi("/api/admin/exports?type=users", "users.csv");
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export users
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void downloadCsvFromApi("/api/admin/exports?type=events", "events.csv");
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export events
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = toCsv(
                  data.recentEvents.map((event) => ({
                    event: event.name,
                    user: event.user,
                    date: event.date,
                    details: event.details,
                  }))
                );
                downloadCsv('aurum_recent_events.csv', csv);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export événements
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = toCsv(
                  data.topEvents.map((event) => ({
                    event: event.name,
                    count: event.count,
                  }))
                );
                downloadCsv('aurum_top_events.csv', csv);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export top événements
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = toCsv(
                  data.topPaths.map((row) => ({
                    path: row.path,
                    views: row.count,
                  }))
                );
                downloadCsv('aurum_top_pages.csv', csv);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export top pages
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = toCsv(
                  data.topLeads.map((lead) => ({
                    lead_id: lead.leadId,
                    email: lead.userEmail || '',
                    score: lead.score,
                    segment: lead.segment,
                    last_activity_at: lead.lastActivityAt,
                  }))
                );
                downloadCsv('aurum_top_leads.csv', csv);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export leads
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{data.stats.newSignups} inscriptions (7 jours)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entrées créées (24h)</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.entriesCreated}</div>
              <p className="text-xs text-muted-foreground">Activation produit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">DAU {data.stats.dau}</div>
              <p className="text-xs text-muted-foreground">WAU {data.stats.wau} · Visiteurs 30j {data.stats.visitorsLast30d}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Aurum (24h)</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.aurumMessagesLast24h}</div>
              <p className="text-xs text-muted-foreground">Volume conversationnel</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nouveaux inscrits / jour</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
              <CardTitle className="flex items-center gap-2"><Filter className="h-4 w-4" />Funnel mensuel</CardTitle>
              <CardDescription>Visiteur → signup → 1re écriture → checkout → paiement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span>Visiteurs</span><span className="font-semibold">{data.funnel.visitors}</span></div>
              <div className="flex justify-between text-sm"><span>Signups</span><span className="font-semibold">{data.funnel.signups} ({pct(data.funnel.signups, data.funnel.visitors)}%)</span></div>
              <div className="flex justify-between text-sm"><span>1re écriture</span><span className="font-semibold">{data.funnel.firstEntries} ({pct(data.funnel.firstEntries, data.funnel.signups)}%)</span></div>
              <div className="flex justify-between text-sm"><span>Checkout start</span><span className="font-semibold">{data.funnel.checkoutStarts} ({pct(data.funnel.checkoutStarts, data.funnel.firstEntries)}%)</span></div>
              <div className="flex justify-between text-sm"><span>Paiements</span><span className="font-semibold">{data.funnel.purchases} ({pct(data.funnel.purchases, data.funnel.checkoutStarts)}%)</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Funnel Quiz (30 jours)
              </CardTitle>
              <CardDescription>
                Départ quiz → résultat → clic CTA → inscription attribuée au quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Quiz démarrés</span>
                <span className="font-semibold">{data.quizFunnel.started}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quiz complétés</span>
                <span className="font-semibold">
                  {data.quizFunnel.completed} ({pct(data.quizFunnel.completed, data.quizFunnel.started)}%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Résultat vu</span>
                <span className="font-semibold">
                  {data.quizFunnel.resultViewed} ({pct(data.quizFunnel.resultViewed, data.quizFunnel.completed)}%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>CTA résultat cliqué</span>
                <span className="font-semibold">
                  {data.quizFunnel.ctaClicked} ({pct(data.quizFunnel.ctaClicked, data.quizFunnel.resultViewed)}%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Inscriptions après quiz</span>
                <span className="font-semibold">
                  {data.quizFunnel.signupWithQuiz} ({pct(data.quizFunnel.signupWithQuiz, data.quizFunnel.ctaClicked)}%)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top événements (30 jours)</CardTitle>
              <CardDescription>Actions les plus fréquentes dans l&apos;app</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Événement</TableHead>
                    <TableHead>Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topEvents.map((event) => (
                    <TableRow key={event.name}>
                      <TableCell>
                        <Badge variant="secondary">{event.name}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{event.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top pages (30 jours)</CardTitle>
              <CardDescription>Écrans les plus consultés</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Vues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topPaths.map((row) => (
                    <TableRow key={row.path}>
                      <TableCell className="font-mono text-xs">{row.path}</TableCell>
                      <TableCell className="font-semibold">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top leads (score)</CardTitle>
              <CardDescription>Scoring comportemental V1</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Segment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topLeads.map((lead) => (
                    <TableRow key={lead.leadId}>
                      <TableCell className="font-mono text-xs">{lead.userEmail || lead.leadId}</TableCell>
                      <TableCell>{lead.score}</TableCell>
                      <TableCell>
                        <Badge variant={lead.segment === 'hot' ? 'destructive' : lead.segment === 'warm' ? 'secondary' : 'outline'}>
                          {lead.segment}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Événements récents</CardTitle>
              <CardDescription>Journal d'événements de tracking</CardDescription>
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
                  {data.recentEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge variant="secondary">{event.name}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{event.user}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleString('fr-FR')}
                      </TableCell>
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
