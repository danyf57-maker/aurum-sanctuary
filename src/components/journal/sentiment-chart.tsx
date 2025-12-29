
"use client";

import { useMemo } from 'react';
import { JournalEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";

type SentimentChartProps = {
  entries: JournalEntry[];
};

const chartConfig = {
  score: {
    label: "Score de Sentiment",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function SentimentChart({ entries }: SentimentChartProps) {
  const chartData = useMemo(() => entries
    .map((entry) => ({
      date: new Date(entry.createdAt).getTime(),
      score: entry.sentimentScore,
    }))
    .sort((a, b) => a.date - b.date), [entries]);

  if (chartData.length < 2) {
    return (
         <Card>
            <CardHeader>
                <CardTitle className="font-headline">Résumé de l'humeur</CardTitle>
                <CardDescription>Écrivez au moins deux entrées pour voir l'évolution de vos sentiments.</CardDescription>
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
        <CardDescription>Une chronologie des sentiments qui traversent vos écrits.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                dataKey="score"
                domain={[-1, 1]}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line
                dataKey="score"
                type="monotone"
                stroke="var(--color-score)"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
