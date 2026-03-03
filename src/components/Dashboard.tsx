"use client";

import { useEffect } from "react";
import { useTrendsData } from "@/hooks/useTrendsData";
import { SearchBar } from "./SearchBar";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { RegionSelector } from "./RegionSelector";
import { InterestOverTimeChart } from "./InterestOverTimeChart";
import { RegionalInterestChart } from "./RegionalInterestChart";
import { RelatedQueriesCard } from "./RelatedQueriesCard";
import { RelatedTopicsCard } from "./RelatedTopicsCard";
import { TrendingSection } from "./TrendingSection";
import { LoadingSpinner } from "./LoadingSpinner";
import { AlertCircle } from "lucide-react";

export function Dashboard() {
  const { state, setField, fetchAllData, fetchTrending } = useTrendsData();

  useEffect(() => {
    fetchTrending(state.geo || "US");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    if (state.keywords.length > 0) {
      fetchAllData(state.keywords, state.timeRange, state.geo);
    }
  };

  const hasResults =
    state.interestOverTime ||
    state.interestByRegion ||
    state.relatedQueries ||
    state.relatedTopics;

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="space-y-3">
        <SearchBar
          keywords={state.keywords}
          onKeywordsChange={(kw) => setField("keywords", kw)}
          onSearch={handleSearch}
          isLoading={state.isLoading}
        />
        <div className="flex flex-wrap gap-2">
          <TimeRangeSelector
            value={state.timeRange}
            onChange={(v) => setField("timeRange", v)}
          />
          <RegionSelector
            value={state.geo}
            onChange={(v) => setField("geo", v)}
          />
        </div>
      </div>

      {/* Error */}
      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      {/* Loading */}
      {state.isLoading && <LoadingSpinner text="Fetching trends data..." />}

      {/* Results */}
      {!state.isLoading && hasResults && (
        <div className="space-y-6">
          {state.interestOverTime && (
            <InterestOverTimeChart
              data={state.interestOverTime}
              keywords={state.interestOverTimeKeywords || state.keywords}
            />
          )}

          {state.interestByRegion && (
            <RegionalInterestChart
              data={state.interestByRegion}
              keywords={state.interestByRegionKeywords || state.keywords}
            />
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {state.relatedQueries && (
              <RelatedQueriesCard
                data={state.relatedQueries}
                keywords={state.keywords}
              />
            )}
            {state.relatedTopics && (
              <RelatedTopicsCard
                data={state.relatedTopics}
                keywords={state.keywords}
              />
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!state.isLoading && !hasResults && !state.error && (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">Enter keywords above and click Explore to get started</p>
          <p className="mt-1 text-sm">Compare up to 5 search terms and discover what the world is searching for</p>
        </div>
      )}

      {/* Trending */}
      <TrendingSection
        dailyTrends={state.dailyTrends}
        realtimeTrends={state.realtimeTrends}
        isLoading={state.isTrendingLoading}
      />
    </div>
  );
}
