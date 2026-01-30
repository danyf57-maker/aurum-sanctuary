"use client";

import { useMemo } from 'react';
import { JournalEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig
} from "@/components/ui/chart";
import { calculateMoodTrends } from "@/lib/stats-utils";

type MoodTrendsChartProps = {
    entries: JournalEntry[];
    days?: number;
};

const chartConfig = {
    optimiste: {
        label: "Optimiste",
        color: "hsl(var(--chart-1))",
    },
    joyeux: {
        label: "Joyeux",
        color: "hsl(var(--chart-2))",
    },
    calme: {
        label: "Calme",
        color: "hsl(var(--chart-3))",
    },
    anxieux: {
        label: "Anxieux",
        color: "hsl(var(--chart-4))",
    },
    triste: {
        label: "Triste",
        color: "hsl(var(--chart-5))",
    },
    stressé: {
        label: "Stressé",
        color: "hsl(var(--chart-6))",
    },
    neutre: {
        label: "Neutre",
        color: "hsl(var(--muted-foreground))",
    },
} satisfies ChartConfig;

export function MoodTrendsChart({ entries, days = 30 }: MoodTrendsChartProps) {
    const chartData = useMemo(() => {
        return calculateMoodTrends(entries, days);
    }, [entries, days]);

    // Get all unique moods from the data
    const allMoods = useMemo(() => {
        const moodSet = new Set<string>();
        chartData.forEach(dataPoint => {
            Object.keys(dataPoint).forEach(key => {
                if (key !== 'date') {
                    moodSet.add(key);
                }
            });
        });
        return Array.from(moodSet);
    }, [chartData]);

    if (entries.length < 2) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Tendances Émotionnelles</CardTitle>
                    <CardDescription>Écrivez plusieurs entrées pour voir l'évolution de vos humeurs dans le temps.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Pas assez de données pour afficher les tendances.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Tendances Émotionnelles</CardTitle>
                <CardDescription>
                    L'évolution de vos humeurs au cours des {days} derniers jours.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                            className="text-xs"
                        />
                        <YAxis
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            className="text-xs"
                        />
                        <Tooltip
                            content={<ChartTooltipContent indicator="line" />}
                            labelFormatter={(value) => {
                                const date = new Date(value as string);
                                return date.toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                });
                            }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                        />
                        {allMoods.map((mood, index) => {
                            const moodKey = mood.toLowerCase();
                            const config = chartConfig[moodKey as keyof typeof chartConfig];
                            const color = config?.color || `hsl(var(--chart-${(index % 6) + 1}))`;

                            return (
                                <Line
                                    key={mood}
                                    type="monotone"
                                    dataKey={mood}
                                    name={config?.label || mood}
                                    stroke={color}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            );
                        })}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
