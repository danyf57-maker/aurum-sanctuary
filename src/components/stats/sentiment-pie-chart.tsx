"use client";

import { useMemo } from "react";
import { JournalEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pie, PieChart, Cell, Legend, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { calculateSentimentDistribution } from "@/lib/stats-utils";
import { useLocale } from "@/hooks/use-locale";

type SentimentPieChartProps = {
  entries: JournalEntry[];
};

export function SentimentPieChart({ entries }: SentimentPieChartProps) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const chartConfig = useMemo(
    () =>
      ({
        positif: {
          label: isFr ? "Positif" : "Positive",
          color: "hsl(var(--chart-2))",
        },
        positive: {
          label: isFr ? "Positif" : "Positive",
          color: "hsl(var(--chart-2))",
        },
        neutre: {
          label: isFr ? "Neutre" : "Neutral",
          color: "hsl(var(--chart-3))",
        },
        neutral: {
          label: isFr ? "Neutre" : "Neutral",
          color: "hsl(var(--chart-3))",
        },
        négatif: {
          label: isFr ? "Négatif" : "Negative",
          color: "hsl(var(--chart-5))",
        },
        negative: {
          label: isFr ? "Négatif" : "Negative",
          color: "hsl(var(--chart-5))",
        },
      }) satisfies ChartConfig,
    [isFr]
  );

  const chartData = useMemo(() => calculateSentimentDistribution(entries), [entries]);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            {isFr ? "Distribution des sentiments" : "Sentiment distribution"}
          </CardTitle>
          <CardDescription>
            {isFr
              ? "Écrivez des entrées pour voir la répartition de vos sentiments."
              : "Write entries to see how your sentiments are distributed."}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            {isFr ? "Pas de données disponibles." : "No data available yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          {isFr ? "Distribution des sentiments" : "Sentiment distribution"}
        </CardTitle>
        <CardDescription>
          {isFr
            ? `La répartition de vos sentiments à travers ${entries.length} entrée${entries.length > 1 ? "s" : ""}.`
            : `How your sentiments are distributed across ${entries.length} entr${entries.length > 1 ? "ies" : "y"}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              nameKey="sentiment"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={<ChartTooltipContent />}
              formatter={(value: number, name: string, props: any) => {
                const percentage = props.payload.percentage;
                const unit = isFr
                  ? `entrée${value > 1 ? "s" : ""}`
                  : `entr${value > 1 ? "ies" : "y"}`;
                return [`${value} ${unit} (${percentage}%)`, name];
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const item = chartData.find((d) => d.sentiment === value);
                return `${value} (${item?.percentage}%)`;
              }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
