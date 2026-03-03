"use client";

import { TrendingUp, Flame } from "lucide-react";
import type { DailyTrendingSearch, RealtimeTrendingStory } from "@/types/trends";
import { LoadingSpinner } from "./LoadingSpinner";

interface Props {
  dailyTrends: DailyTrendingSearch[] | null;
  realtimeTrends: RealtimeTrendingStory[] | null;
  isLoading: boolean;
}

export function TrendingSection({ dailyTrends, realtimeTrends, isLoading }: Props) {
  if (isLoading) {
    return <LoadingSpinner text="Loading trending searches..." />;
  }

  const hasDailyData = dailyTrends && dailyTrends.length > 0;
  const hasRealtimeData = realtimeTrends && realtimeTrends.length > 0;

  if (!hasDailyData && !hasRealtimeData) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Trending Now</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {hasDailyData && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Daily Trending</h3>
            </div>
            <div className="space-y-3">
              {dailyTrends.slice(0, 10).map((trend, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500 dark:bg-gray-800">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{trend.title.query}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {trend.formattedTraffic} searches
                      </span>
                    </div>
                    {trend.articles?.[0] && (
                      <p className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                        {trend.articles[0].title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasRealtimeData && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Real-Time Trends</h3>
            </div>
            <div className="space-y-3">
              {realtimeTrends.slice(0, 10).map((story, i) => (
                <div
                  key={i}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <p className="font-medium">{story.title}</p>
                  {story.entityNames && story.entityNames.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {story.entityNames.slice(0, 3).map((name, j) => (
                        <span
                          key={j}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                  {story.articles?.[0] && (
                    <p className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                      {story.articles[0].source} - {story.articles[0].articleTitle}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
