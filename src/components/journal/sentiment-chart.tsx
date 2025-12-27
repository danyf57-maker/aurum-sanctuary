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
    label: "Sentiment Score",
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
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Mood Summary</CardTitle>
        <CardDescription>A timeline of your entry sentiments.</CardDescription>
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
                  new Date(value).toLocaleDateString("en-US", {
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
