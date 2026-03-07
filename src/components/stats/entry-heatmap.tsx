"use client";

import { useMemo } from "react";
import { JournalEntry } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { generateHeatmapData } from "@/lib/stats-utils";
import { useLocale } from "@/hooks/use-locale";

type EntryHeatmapProps = {
  entries: JournalEntry[];
};

const CELL_SIZE = 12;
const CELL_GAP = 3;
const DAY_LABELS = {
  fr: ["Lun", "Mer", "Ven"],
  en: ["Mon", "Wed", "Fri"],
} as const;

export function EntryHeatmap({ entries }: EntryHeatmapProps) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const days = DAY_LABELS[isFr ? "fr" : "en"];
  const heatmapData = useMemo(() => generateHeatmapData(entries), [entries]);

  const weeks = useMemo(() => {
    const result: Array<Array<{ date: string; count: number; level: number }>> = [];
    let currentWeek: Array<{ date: string; count: number; level: number }> = [];

    heatmapData.forEach((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = (date.getDay() + 6) % 7;

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        result.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(day);

      if (index === heatmapData.length - 1) {
        result.push(currentWeek);
      }
    });

    return result;
  }, [heatmapData]);

  const getColor = (level: number): string => {
    const colors = [
      "bg-muted/30",
      "bg-primary/20",
      "bg-primary/40",
      "bg-primary/60",
      "bg-primary/80",
    ];
    return colors[level] || colors[0];
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            {isFr ? "Fréquence d'écriture" : "Writing frequency"}
          </CardTitle>
          <CardDescription>
            {isFr
              ? "Écrivez régulièrement pour voir votre activité."
              : "Write regularly to reveal your activity."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[200px] w-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {isFr ? "Pas de données disponibles." : "No data available."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          {isFr ? "Fréquence d'écriture" : "Writing frequency"}
        </CardTitle>
        <CardDescription>
          {isFr
            ? "Votre activité d'écriture au cours de l'année passée."
            : "Your writing activity over the past year."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex min-w-full flex-col gap-1">
            <div className="flex gap-1">
              <div
                style={{ width: `${CELL_SIZE * 2}px` }}
                className="text-xs text-muted-foreground"
              />
              {days.map((day, i) => (
                <div
                  key={day}
                  style={{
                    height: `${CELL_SIZE}px`,
                    width: `${weeks.length * (CELL_SIZE + CELL_GAP)}px`,
                  }}
                  className="flex items-center text-xs text-muted-foreground"
                >
                  {i === 0 && day}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              <div className="flex flex-col gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <div
                    key={day}
                    style={{
                      width: `${CELL_SIZE * 2}px`,
                      height: `${CELL_SIZE}px`,
                    }}
                    className="flex items-center justify-end pr-2 text-xs text-muted-foreground"
                  >
                    {day % 2 === 0 && days[day / 2]}
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                      const dayData = week.find((d) => {
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
                      const formattedDate = date.toLocaleDateString(
                        isFr ? "fr-FR" : "en-US",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      );

                      return (
                        <div
                          key={dayIndex}
                          style={{
                            width: `${CELL_SIZE}px`,
                            height: `${CELL_SIZE}px`,
                          }}
                          className={`cursor-pointer rounded-sm ${getColor(dayData.level)} transition-all hover:ring-2 hover:ring-primary`}
                          title={`${formattedDate}: ${dayData.count} ${
                            isFr
                              ? `entrée${dayData.count > 1 ? "s" : ""}`
                              : `entr${dayData.count === 1 ? "y" : "ies"}`
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{isFr ? "Moins" : "Less"}</span>
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
              <span>{isFr ? "Plus" : "More"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
