"use client";

import { useMemo } from 'react';
import { JournalEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateHeatmapData } from "@/lib/stats-utils";
import { Tooltip } from "@/components/ui/tooltip";

type EntryHeatmapProps = {
    entries: JournalEntry[];
};

const CELL_SIZE = 12;
const CELL_GAP = 3;
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const DAYS = ['Lun', 'Mer', 'Ven'];

export function EntryHeatmap({ entries }: EntryHeatmapProps) {
    const heatmapData = useMemo(() => generateHeatmapData(entries), [entries]);

    // Group data by week
    const weeks = useMemo(() => {
        const result: Array<Array<{ date: string; count: number; level: number }>> = [];
        let currentWeek: Array<{ date: string; count: number; level: number }> = [];

        heatmapData.forEach((day, index) => {
            const date = new Date(day.date);
            const dayOfWeek = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

            // Start a new week on Monday
            if (dayOfWeek === 0 && currentWeek.length > 0) {
                result.push(currentWeek);
                currentWeek = [];
            }

            currentWeek.push(day);

            // Push the last week
            if (index === heatmapData.length - 1) {
                result.push(currentWeek);
            }
        });

        return result;
    }, [heatmapData]);

    // Get color for intensity level
    const getColor = (level: number): string => {
        const colors = [
            'bg-muted/30',           // 0 - no entries
            'bg-primary/20',         // 1 - low
            'bg-primary/40',         // 2 - medium-low
            'bg-primary/60',         // 3 - medium-high
            'bg-primary/80',         // 4 - high
        ];
        return colors[level] || colors[0];
    };

    if (entries.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Fréquence d'Écriture</CardTitle>
                    <CardDescription>Écrivez régulièrement pour voir votre activité.</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px] w-full flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Pas de données disponibles.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Fréquence d'Écriture</CardTitle>
                <CardDescription>
                    Votre activité d'écriture au cours de l'année passée.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="inline-flex flex-col gap-1 min-w-full">
                        {/* Day labels */}
                        <div className="flex gap-1">
                            <div style={{ width: `${CELL_SIZE * 2}px` }} className="text-xs text-muted-foreground" />
                            {DAYS.map((day, i) => (
                                <div
                                    key={day}
                                    style={{
                                        height: `${CELL_SIZE}px`,
                                        width: `${weeks.length * (CELL_SIZE + CELL_GAP)}px`,
                                    }}
                                    className="text-xs text-muted-foreground flex items-center"
                                >
                                    {i === 0 && day}
                                </div>
                            ))}
                        </div>

                        {/* Heatmap grid */}
                        <div className="flex gap-1">
                            {/* Week day labels */}
                            <div className="flex flex-col gap-1">
                                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                                    <div
                                        key={day}
                                        style={{
                                            width: `${CELL_SIZE * 2}px`,
                                            height: `${CELL_SIZE}px`,
                                        }}
                                        className="text-xs text-muted-foreground flex items-center justify-end pr-2"
                                    >
                                        {day % 2 === 0 && DAYS[day / 2]}
                                    </div>
                                ))}
                            </div>

                            {/* Weeks */}
                            <div className="flex gap-1">
                                {weeks.map((week, weekIndex) => (
                                    <div key={weekIndex} className="flex flex-col gap-1">
                                        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                                            const dayData = week.find(d => {
                                                const date = new Date(d.date);
                                                return (date.getDay() + 6) % 7 === dayIndex;
                                            });

                                            if (!dayData) {
                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        style={{
                                                            width: `${CELL_SIZE}px`,
                                                            height: `${CELL_SIZE}px`,
                                                        }}
                                                        className="rounded-sm bg-transparent"
                                                    />
                                                );
                                            }

                                            const date = new Date(dayData.date);
                                            const formattedDate = date.toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            });

                                            return (
                                                <div
                                                    key={dayIndex}
                                                    style={{
                                                        width: `${CELL_SIZE}px`,
                                                        height: `${CELL_SIZE}px`,
                                                    }}
                                                    className={`rounded-sm ${getColor(dayData.level)} cursor-pointer hover:ring-2 hover:ring-primary transition-all`}
                                                    title={`${formattedDate}: ${dayData.count} entrée${dayData.count > 1 ? 's' : ''}`}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                            <span>Moins</span>
                            <div className="flex gap-1">
                                {[0, 1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        style={{
                                            width: `${CELL_SIZE}px`,
                                            height: `${CELL_SIZE}px`,
                                        }}
                                        className={`rounded-sm ${getColor(level)}`}
                                    />
                                ))}
                            </div>
                            <span>Plus</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
