import { JournalEntry } from './types';

/**
 * Statistics Utility Functions
 * 
 * Helper functions for calculating statistics and aggregating data
 * for charts and visualizations.
 */

// ============================================================================
// MOOD TRENDS
// ============================================================================

export interface MoodTrendData {
    date: string;
    [mood: string]: string | number; // Dynamic mood keys + count
}

/**
 * Calculate mood trends over a specified number of days
 * Groups entries by date and counts occurrences of each mood
 */
export function calculateMoodTrends(entries: JournalEntry[], days: number = 30): MoodTrendData[] {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Filter entries within date range
    const filteredEntries = entries.filter(entry =>
        entry.createdAt >= startDate
    );

    // Group by date
    const dateMap = new Map<string, Map<string, number>>();

    filteredEntries.forEach(entry => {
        const dateKey = entry.createdAt.toISOString().split('T')[0];
        const mood = entry.mood?.toLowerCase() || 'inconnu';

        if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, new Map());
        }

        const moodMap = dateMap.get(dateKey)!;
        moodMap.set(mood, (moodMap.get(mood) || 0) + 1);
    });

    // Convert to array format for Recharts
    const result: MoodTrendData[] = [];
    const dateKeys = Array.from(dateMap.keys()).sort();

    dateKeys.forEach(dateKey => {
        const moodMap = dateMap.get(dateKey)!;
        const dataPoint: MoodTrendData = { date: dateKey };

        moodMap.forEach((count, mood) => {
            dataPoint[mood] = count;
        });

        result.push(dataPoint);
    });

    return result;
}

// ============================================================================
// ENTRY FREQUENCY HEATMAP
// ============================================================================

export interface HeatmapData {
    date: string;
    count: number;
    level: number; // 0-4 intensity level
}

/**
 * Generate heatmap data for entry frequency
 * Returns data for the last 365 days
 */
export function generateHeatmapData(entries: JournalEntry[]): HeatmapData[] {
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Count entries per day
    const dateCounts = new Map<string, number>();

    entries.forEach(entry => {
        if (entry.createdAt >= oneYearAgo) {
            const dateKey = entry.createdAt.toISOString().split('T')[0];
            dateCounts.set(dateKey, (dateCounts.get(dateKey) || 0) + 1);
        }
    });

    // Find max count for normalization
    const maxCount = Math.max(...Array.from(dateCounts.values()), 1);

    // Generate data for all days in the last year
    const result: HeatmapData[] = [];
    const currentDate = new Date(oneYearAgo);

    while (currentDate <= now) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const count = dateCounts.get(dateKey) || 0;
        const level = count === 0 ? 0 : Math.min(Math.ceil((count / maxCount) * 4), 4);

        result.push({
            date: dateKey,
            count,
            level
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
}

// ============================================================================
// SENTIMENT DISTRIBUTION
// ============================================================================

export interface SentimentDistribution {
    sentiment: string;
    count: number;
    percentage: number;
    color: string;
}

/**
 * Calculate sentiment distribution across all entries
 */
export function calculateSentimentDistribution(entries: JournalEntry[]): SentimentDistribution[] {
    const sentimentCounts = new Map<string, number>();

    entries.forEach(entry => {
        const sentiment = entry.sentiment?.toLowerCase() || 'neutre';
        sentimentCounts.set(sentiment, (sentimentCounts.get(sentiment) || 0) + 1);
    });

    const total = entries.length || 1;
    const colors: { [key: string]: string } = {
        'positif': 'hsl(var(--chart-2))',
        'positive': 'hsl(var(--chart-2))',
        'neutre': 'hsl(var(--chart-3))',
        'neutral': 'hsl(var(--chart-3))',
        'négatif': 'hsl(var(--chart-5))',
        'negative': 'hsl(var(--chart-5))',
    };

    const result: SentimentDistribution[] = [];

    sentimentCounts.forEach((count, sentiment) => {
        result.push({
            sentiment: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
            count,
            percentage: Math.round((count / total) * 100),
            color: colors[sentiment] || 'hsl(var(--chart-1))'
        });
    });

    return result.sort((a, b) => b.count - a.count);
}

// ============================================================================
// TAG FREQUENCY
// ============================================================================

export interface TagFrequency {
    tag: string;
    count: number;
    percentage: number;
}

/**
 * Get tag frequency across all entries
 */
export function getTagFrequency(entries: JournalEntry[]): TagFrequency[] {
    const tagCounts = new Map<string, number>();

    entries.forEach(entry => {
        if (entry.tags && Array.isArray(entry.tags)) {
            entry.tags.forEach(tag => {
                const normalizedTag = tag.toLowerCase().trim();
                tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
            });
        }
    });

    const totalTags = Array.from(tagCounts.values()).reduce((sum, count) => sum + count, 0) || 1;

    const result: TagFrequency[] = [];

    tagCounts.forEach((count, tag) => {
        result.push({
            tag: tag.charAt(0).toUpperCase() + tag.slice(1),
            count,
            percentage: Math.round((count / totalTags) * 100)
        });
    });

    return result.sort((a, b) => b.count - a.count);
}

// ============================================================================
// STREAKS
// ============================================================================

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastEntryDate: Date | null;
}

/**
 * Calculate writing streaks
 */
export function calculateStreaks(entries: JournalEntry[]): StreakData {
    if (entries.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastEntryDate: null
        };
    }

    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) =>
        b.createdAt.getTime() - a.createdAt.getTime()
    );

    const lastEntryDate = sortedEntries[0].createdAt;

    // Get unique dates
    const uniqueDates = new Set<string>();
    sortedEntries.forEach(entry => {
        uniqueDates.add(entry.createdAt.toISOString().split('T')[0]);
    });

    const dates = Array.from(uniqueDates).sort().reverse();

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (dates[0] === today || dates[0] === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000));

            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000));

        if (diffDays === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }

    return {
        currentStreak,
        longestStreak,
        lastEntryDate
    };
}

// ============================================================================
// SUMMARY STATISTICS
// ============================================================================

export interface SummaryStats {
    totalEntries: number;
    entriesThisWeek: number;
    entriesThisMonth: number;
    averagePerDay: number;
    mostCommonMood: string;
    sentimentTrend: 'up' | 'down' | 'stable';
}

/**
 * Calculate summary statistics
 */
export function calculateSummaryStats(entries: JournalEntry[]): SummaryStats {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const entriesThisWeek = entries.filter(e => e.createdAt >= oneWeekAgo).length;
    const entriesThisMonth = entries.filter(e => e.createdAt >= oneMonthAgo).length;

    // Calculate average per day (last 30 days)
    const averagePerDay = entriesThisMonth / 30;

    // Find most common mood
    const moodCounts = new Map<string, number>();
    entries.forEach(entry => {
        const mood = entry.mood?.toLowerCase() || 'inconnu';
        moodCounts.set(mood, (moodCounts.get(mood) || 0) + 1);
    });

    let mostCommonMood = 'inconnu';
    let maxCount = 0;
    moodCounts.forEach((count, mood) => {
        if (count > maxCount) {
            maxCount = count;
            mostCommonMood = mood;
        }
    });

    // Calculate sentiment trend (compare last week vs previous week)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekEntries = entries.filter(e => e.createdAt >= oneWeekAgo);
    const prevWeekEntries = entries.filter(e => e.createdAt >= twoWeeksAgo && e.createdAt < oneWeekAgo);

    const lastWeekPositive = lastWeekEntries.filter(e => e.sentiment?.toLowerCase() === 'positif' || e.sentiment?.toLowerCase() === 'positive').length;
    const prevWeekPositive = prevWeekEntries.filter(e => e.sentiment?.toLowerCase() === 'positif' || e.sentiment?.toLowerCase() === 'positive').length;

    const lastWeekRatio = lastWeekEntries.length > 0 ? lastWeekPositive / lastWeekEntries.length : 0;
    const prevWeekRatio = prevWeekEntries.length > 0 ? prevWeekPositive / prevWeekEntries.length : 0;

    let sentimentTrend: 'up' | 'down' | 'stable' = 'stable';
    if (lastWeekRatio > prevWeekRatio + 0.1) sentimentTrend = 'up';
    else if (lastWeekRatio < prevWeekRatio - 0.1) sentimentTrend = 'down';

    return {
        totalEntries: entries.length,
        entriesThisWeek,
        entriesThisMonth,
        averagePerDay: Math.round(averagePerDay * 10) / 10,
        mostCommonMood: mostCommonMood.charAt(0).toUpperCase() + mostCommonMood.slice(1),
        sentimentTrend
    };
}
