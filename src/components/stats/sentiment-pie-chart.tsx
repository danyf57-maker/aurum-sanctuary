"use client";

import { useMemo } from 'react';
import { JournalEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";
import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig
} from "@/components/ui/chart";
import { calculateSentimentDistribution } from "@/lib/stats-utils";

type SentimentPieChartProps = {
    entries: JournalEntry[];
};

const chartConfig = {
    positif: {
        label: "Positif",
        color: "hsl(var(--chart-2))",
    },
    positive: {
        label: "Positif",
        color: "hsl(var(--chart-2))",
    },
    neutre: {
        label: "Neutre",
        color: "hsl(var(--chart-3))",
    },
    neutral: {
        label: "Neutre",
        color: "hsl(var(--chart-3))",
    },
    négatif: {
        label: "Négatif",
        color: "hsl(var(--chart-5))",
    },
    negative: {
        label: "Négatif",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig;

export function SentimentPieChart({ entries }: SentimentPieChartProps) {
    const chartData = useMemo(() => {
        return calculateSentimentDistribution(entries);
    }, [entries]);

    if (entries.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Distribution des Sentiments</CardTitle>
                    <CardDescription>Écrivez des entrées pour voir la répartition de vos sentiments.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Pas de données disponibles.</p>
                </CardContent>
            </Card>
        );
    }

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label if less than 5%

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
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
                <CardTitle className="font-headline">Distribution des Sentiments</CardTitle>
                <CardDescription>
                    La répartition de vos sentiments à travers {entries.length} entrée{entries.length > 1 ? 's' : ''}.
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
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            content={<ChartTooltipContent />}
                            formatter={(value: number, name: string, props: any) => {
                                const percentage = props.payload.percentage;
                                return [`${value} entrée${value > 1 ? 's' : ''} (${percentage}%)`, name];
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry: any) => {
                                const item = chartData.find(d => d.sentiment === value);
                                return `${value} (${item?.percentage}%)`;
                            }}
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
