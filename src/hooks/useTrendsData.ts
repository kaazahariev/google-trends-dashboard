"use client";

import { useState, useCallback } from "react";
import { getTimeRangeStart } from "@/lib/constants";
import type {
  TimeRange,
  ChartDataPoint,
  RegionChartData,
  ParsedRelatedQueries,
  ParsedRelatedTopics,
  DailyTrendingSearch,
  RealtimeTrendingStory,
} from "@/types/trends";

interface TrendsState {
  keywords: string[];
  timeRange: TimeRange;
  geo: string;
  isLoading: boolean;
  isTrendingLoading: boolean;
  error: string | null;
  interestOverTime: ChartDataPoint[] | null;
  interestOverTimeKeywords: string[] | null;
  interestByRegion: RegionChartData[] | null;
  interestByRegionKeywords: string[] | null;
  relatedQueries: Record<string, ParsedRelatedQueries> | null;
  relatedTopics: Record<string, ParsedRelatedTopics> | null;
  dailyTrends: DailyTrendingSearch[] | null;
  realtimeTrends: RealtimeTrendingStory[] | null;
}

const initialState: TrendsState = {
  keywords: [],
  timeRange: "past_12_months",
  geo: "",
  isLoading: false,
  isTrendingLoading: false,
  error: null,
  interestOverTime: null,
  interestOverTimeKeywords: null,
  interestByRegion: null,
  interestByRegionKeywords: null,
  relatedQueries: null,
  relatedTopics: null,
  dailyTrends: null,
  realtimeTrends: null,
};

async function safeFetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export function useTrendsData() {
  const [state, setState] = useState<TrendsState>(initialState);

  const setField = useCallback(
    <K extends keyof TrendsState>(key: K, value: TrendsState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const fetchAllData = useCallback(
    async (keywords: string[], timeRange: TimeRange, geo: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        keywords,
        timeRange,
        geo,
      }));

      const startTime = getTimeRangeStart(timeRange).toISOString();
      const endTime = new Date().toISOString();
      const kw = encodeURIComponent(keywords.join(","));
      const base = `keywords=${kw}&startTime=${startTime}&endTime=${endTime}&geo=${geo}`;

      try {
        const [iotRes, ibrRes, rqRes, rtRes] = await Promise.allSettled([
          safeFetchJson(`/api/trends/interest-over-time?${base}`),
          safeFetchJson(`/api/trends/interest-by-region?${base}`),
          safeFetchJson(`/api/trends/related-queries?${base}`),
          safeFetchJson(`/api/trends/related-topics?${base}`),
        ]);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          interestOverTime:
            iotRes.status === "fulfilled" && iotRes.value?.data
              ? iotRes.value.data
              : null,
          interestOverTimeKeywords:
            iotRes.status === "fulfilled" && iotRes.value?.keywords
              ? iotRes.value.keywords
              : keywords,
          interestByRegion:
            ibrRes.status === "fulfilled" && ibrRes.value?.data
              ? ibrRes.value.data
              : null,
          interestByRegionKeywords:
            ibrRes.status === "fulfilled" && ibrRes.value?.keywords
              ? ibrRes.value.keywords
              : keywords,
          relatedQueries:
            rqRes.status === "fulfilled" && rqRes.value?.data
              ? rqRes.value.data
              : null,
          relatedTopics:
            rtRes.status === "fulfilled" && rtRes.value?.data
              ? rtRes.value.data
              : null,
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to fetch trends data. Please try again.",
        }));
      }
    },
    []
  );

  const fetchTrending = useCallback(async (geo: string) => {
    setState((prev) => ({ ...prev, isTrendingLoading: true }));

    try {
      const [dailyRes, realtimeRes] = await Promise.allSettled([
        safeFetchJson(`/api/trends/daily-trends?geo=${geo || "US"}`),
        safeFetchJson(`/api/trends/realtime-trends?geo=${geo || "US"}`),
      ]);

      setState((prev) => ({
        ...prev,
        isTrendingLoading: false,
        dailyTrends:
          dailyRes.status === "fulfilled" && dailyRes.value?.data
            ? dailyRes.value.data
            : null,
        realtimeTrends:
          realtimeRes.status === "fulfilled" && realtimeRes.value?.data
            ? realtimeRes.value.data
            : null,
      }));
    } catch {
      setState((prev) => ({ ...prev, isTrendingLoading: false }));
    }
  }, []);

  return { state, setField, fetchAllData, fetchTrending };
}
