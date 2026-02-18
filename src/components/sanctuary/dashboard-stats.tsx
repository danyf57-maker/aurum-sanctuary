'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DashboardEmotions } from '@/components/sanctuary/dashboard-emotions';
import { DashboardThemes } from '@/components/sanctuary/dashboard-themes';
import { DashboardAurum, type AurumConversationStats } from '@/components/sanctuary/dashboard-aurum';
import { DashboardProgression } from '@/components/sanctuary/dashboard-progression';

type MagazineIssue = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  tags: string[];
  createdAt: Date | null;
  mood: string | null;
};

type DashboardStatsProps = {
  issues: MagazineIssue[];
  aurumStats: AurumConversationStats | null;
  isAurumLoading: boolean;
};

export function DashboardStats({ issues, aurumStats, isAurumLoading }: DashboardStatsProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      <Tabs defaultValue="emotions">
        <TabsList className="w-full justify-start gap-0 rounded-none rounded-t-2xl border-b border-stone-200 bg-transparent p-0">
          <TabsTrigger
            value="emotions"
            className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-xs font-medium text-stone-500 shadow-none data-[state=active]:border-[#C5A059] data-[state=active]:bg-transparent data-[state=active]:text-[#7A5D24] data-[state=active]:shadow-none"
          >
            Émotions
          </TabsTrigger>
          <TabsTrigger
            value="themes"
            className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-xs font-medium text-stone-500 shadow-none data-[state=active]:border-[#C5A059] data-[state=active]:bg-transparent data-[state=active]:text-[#7A5D24] data-[state=active]:shadow-none"
          >
            Thèmes
          </TabsTrigger>
          <TabsTrigger
            value="aurum"
            className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-xs font-medium text-stone-500 shadow-none data-[state=active]:border-[#C5A059] data-[state=active]:bg-transparent data-[state=active]:text-[#7A5D24] data-[state=active]:shadow-none"
          >
            Aurum
          </TabsTrigger>
          <TabsTrigger
            value="progression"
            className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-xs font-medium text-stone-500 shadow-none data-[state=active]:border-[#C5A059] data-[state=active]:bg-transparent data-[state=active]:text-[#7A5D24] data-[state=active]:shadow-none"
          >
            Progression
          </TabsTrigger>
        </TabsList>

        <div className="p-5">
          <TabsContent value="emotions" className="mt-0">
            <DashboardEmotions issues={issues} />
          </TabsContent>

          <TabsContent value="themes" className="mt-0">
            <DashboardThemes issues={issues} />
          </TabsContent>

          <TabsContent value="aurum" className="mt-0">
            <DashboardAurum stats={aurumStats} isLoading={isAurumLoading} />
          </TabsContent>

          <TabsContent value="progression" className="mt-0">
            <DashboardProgression issues={issues} />
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
