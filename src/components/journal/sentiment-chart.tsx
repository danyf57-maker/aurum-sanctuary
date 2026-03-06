"use client";

import { useMemo } from "react";
import { JournalEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useLocale } from "@/hooks/use-locale";

type SentimentChartProps = {
  entries: JournalEntry[];
};

export function SentimentChart({ entries }: SentimentChartProps) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const chartConfig = useMemo(
    () =>
      ({
        count: {
          label: isFr ? "Nombre d'entrées" : "Entry count",
        },
        positive: {
          label: isFr ? "Positif" : "Positive",
          color: "hsl(var(--chart-2))",
        },
        neutral: {
          label: isFr ? "Neutre" : "Neutral",
          color: "hsl(var(--chart-3))",
        },
        negative: {
          label: isFr ? "Négatif" : "Negative",
          color: "hsl(var(--chart-5))",
        },
      }) satisfies ChartConfig,
    [isFr]
  );

  const chartData = useMemo(() => {
    const moodCounts: { [key: string]: number } = {};
    entries.forEach((entry) => {
      const mood = entry.mood?.toLowerCase() || (isFr ? "inconnu" : "unknown");
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    return Object.keys(moodCounts).map((mood) => ({
      mood: mood.charAt(0).toUpperCase() + mood.slice(1),
      count: moodCounts[mood],
    }));
  }, [entries, isFr]);

  if (entries.length < 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            {isFr ? "Votre paysage émotionnel" : "Your emotional landscape"}
          </CardTitle>
          <CardDescription>
            {isFr
              ? "Écrivez votre première entrée pour commencer à dessiner la carte de vos émotions."
              : "Write your first entry to start mapping your emotional landscape."}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] w-full flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            {isFr ? "Pas assez de données pour le graphique." : "Not enough data yet for this chart."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          {isFr ? "Votre paysage émotionnel" : "Your emotional landscape"}
        </CardTitle>
        <CardDescription>
          {isFr
            ? "Un aperçu des humeurs qui se dessinent le plus souvent dans vos écrits."
            : "An overview of the moods that appear most often in your writing."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <XAxis dataKey="mood" tickLine={false} axisLine={false} dy={10} className="capitalize" />
            <YAxis dataKey="count" allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar
              dataKey="count"
              name={isFr ? "Nombre d'entrées" : "Entry count"}
              radius={8}
              fill="hsl(var(--primary))"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
