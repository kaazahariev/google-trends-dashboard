import type {
  InterestOverTimeResponse,
  ChartDataPoint,
  InterestByRegionResponse,
  RegionChartData,
  RelatedQueriesResponse,
  ParsedRelatedQueries,
  RelatedTopicsResponse,
  ParsedRelatedTopics,
  DailyTrendsResponse,
  DailyTrendingSearch,
} from "@/types/trends";

export function parseInterestOverTime(
  raw: InterestOverTimeResponse,
  keywords: string[]
): ChartDataPoint[] {
  if (!raw?.default?.timelineData) return [];

  return raw.default.timelineData.map((point) => {
    const entry: ChartDataPoint = {
      date: point.formattedAxisTime || point.formattedTime,
      timestamp: parseInt(point.time, 10) * 1000,
    };
    keywords.forEach((keyword, i) => {
      entry[keyword] = point.value?.[i] ?? 0;
    });
    return entry;
  });
}

export function parseInterestByRegion(
  raw: InterestByRegionResponse,
  keywords: string[]
): RegionChartData[] {
  if (!raw?.default?.geoMapData) return [];

  return raw.default.geoMapData
    .map((point) => {
      const entry: RegionChartData = {
        region: point.geoName,
        geoCode: point.geoCode,
      };
      keywords.forEach((keyword, i) => {
        entry[keyword] = point.value?.[i] ?? 0;
      });
      return entry;
    })
    .sort((a, b) => {
      const aVal = typeof a[keywords[0]] === "number" ? (a[keywords[0]] as number) : 0;
      const bVal = typeof b[keywords[0]] === "number" ? (b[keywords[0]] as number) : 0;
      return bVal - aVal;
    })
    .slice(0, 25);
}

export function parseRelatedQueries(
  raw: RelatedQueriesResponse,
  keywords: string[]
): Record<string, ParsedRelatedQueries> {
  if (!raw?.default?.rankedList) return {};

  const result: Record<string, ParsedRelatedQueries> = {};

  keywords.forEach((keyword, i) => {
    const topIndex = i * 2;
    const risingIndex = i * 2 + 1;

    result[keyword] = {
      top: raw.default.rankedList[topIndex]?.rankedKeyword || [],
      rising: raw.default.rankedList[risingIndex]?.rankedKeyword || [],
    };
  });

  return result;
}

export function parseRelatedTopics(
  raw: RelatedTopicsResponse,
  keywords: string[]
): Record<string, ParsedRelatedTopics> {
  if (!raw?.default?.rankedList) return {};

  const result: Record<string, ParsedRelatedTopics> = {};

  keywords.forEach((keyword, i) => {
    const topIndex = i * 2;
    const risingIndex = i * 2 + 1;

    result[keyword] = {
      top: raw.default.rankedList[topIndex]?.rankedKeyword || [],
      rising: raw.default.rankedList[risingIndex]?.rankedKeyword || [],
    };
  });

  return result;
}

export function parseDailyTrends(raw: DailyTrendsResponse): DailyTrendingSearch[] {
  if (!raw?.default?.trendingSearchesDays) return [];

  return raw.default.trendingSearchesDays.flatMap(
    (day) => day.trendingSearches || []
  );
}
