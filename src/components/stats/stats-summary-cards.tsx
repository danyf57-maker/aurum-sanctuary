"use client";

import { useMemo } from 'react';
import { JournalEntry } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { calculateSummaryStats, calculateStreaks } from "@/lib/stats-utils";
import { TrendingUp, TrendingDown, Minus, Calendar, Flame, BarChart3, Smile } from "lucide-react";

type StatsSummaryCardsProps = {
    entries: JournalEntry[];
    layout?: "grid" | "stack";
};

export function StatsSummaryCards({ entries, layout = "grid" }: StatsSummaryCardsProps) {
    const stats = useMemo(() => calculateSummaryStats(entries), [entries]);
    const streaks = useMemo(() => calculateStreaks(entries), [entries]);

    const cards = [
        {
            title: "Cette Semaine",
            value: stats.entriesThisWeek,
            subtitle: `${stats.entriesThisMonth} ce mois`,
            icon: Calendar,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Série Actuelle",
            value: streaks.currentStreak,
            subtitle: `Record: ${streaks.longestStreak} jours`,
            icon: Flame,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
        {
            title: "Moyenne Quotidienne",
            value: stats.averagePerDay.toFixed(1),
            subtitle: "Sur 30 jours",
            icon: BarChart3,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Humeur Dominante",
            value: stats.mostCommonMood,
            subtitle: getTrendText(stats.sentimentTrend),
            icon: Smile,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
            trendIcon: getTrendIcon(stats.sentimentTrend),
        },
    ];

    return (
        <div className={layout === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-4" : "flex flex-col gap-4"}>
            {cards.map((card, index) => {
                const Icon = card.icon;
                const TrendIcon = card.trendIcon;

                return (
                    <Card key={index} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {card.title}
                                    </p>
                                    <div className="flex items-baseline space-x-2">
                                        <p className="text-2xl font-bold">
                                            {card.value}
                                        </p>
                                        {TrendIcon && (
                                            <TrendIcon className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {card.subtitle}
                                    </p>
                                </div>
                                <div className={`rounded-full p-3 ${card.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

function getTrendText(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
        case 'up':
            return 'Tendance positive';
        case 'down':
            return 'Tendance négative';
        case 'stable':
            return 'Tendance stable';
    }
}

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
    switch (trend) {
        case 'up':
            return TrendingUp;
        case 'down':
            return TrendingDown;
        case 'stable':
            return Minus;
    }
}
