
"use client";

import { useMemo } from 'react';
import { JournalEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";

type SentimentChartProps = {
  entries: JournalEntry[];
};

const chartConfig = {
  count: {
    label: "Nombre d'entrées",
  },
  positive: {
    label: "Positif",
    color: "hsl(var(--chart-2))",
  },
  neutral: {
    label: "Neutre",
    color: "hsl(var(--chart-3))",
  },
  negative: {
    label: "Négatif",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function SentimentChart({ entries }: SentimentChartProps) {
  const chartData = useMemo(() => {
    const moodCounts: { [key: string]: number } = {};
    entries.forEach(entry => {
      const mood = entry.mood?.toLowerCase() || 'inconnu';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    return Object.keys(moodCounts).map(mood => ({
      mood: mood.charAt(0).toUpperCase() + mood.slice(1),
      count: moodCounts[mood],
    }));

  }, [entries]);

  if (entries.length < 1) {
    return (
         <Card>
            <CardHeader>
                <CardTitle className="font-headline">Votre Paysage Émotionnel</CardTitle>
                <CardDescription>Écrivez votre première entrée pour commencer à dessiner la carte de vos émotions.</CardDescription>
            </CardHeader>
             <CardContent className="h-[250px] w-full flex items-center justify-center">
                 <p className="text-muted-foreground text-sm">Pas assez de données pour le graphique.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Votre Paysage Émotionnel</CardTitle>
        <CardDescription>Un aperçu des humeurs qui se dessinent le plus souvent dans vos écrits.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <XAxis
                dataKey="mood"
                tickLine={false}
                axisLine={false}
                dy={10}
                className="capitalize"
              />
              <YAxis
                dataKey="count"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="count"
                name="Nombre d'entrées"
                radius={8}
                fill="hsl(var(--primary))"
              />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
