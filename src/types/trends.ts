export interface TrendsSearchParams {
  keywords: string[];
  startTime: Date;
  endTime: Date;
  geo: string;
}

export type TimeRange =
  | "past_hour"
  | "past_4_hours"
  | "past_day"
  | "past_7_days"
  | "past_30_days"
  | "past_90_days"
  | "past_12_months"
  | "past_5_years";

export interface TimeRangeOption {
  label: string;
  value: TimeRange;
  getStartTime: () => Date;
}

export interface TimelineDataPoint {
  time: string;
  value: number[];
  hasData: boolean[];
  formattedTime: string;
  formattedValue: string[];
  formattedAxisTime: string;
}

export interface InterestOverTimeResponse {
  default: {
    timelineData: TimelineDataPoint[];
    averages: number[];
  };
}

export interface ChartDataPoint {
  date: string;
  timestamp: number;
  [keyword: string]: number | string;
}

export interface RegionDataPoint {
  geoCode: string;
  geoName: string;
  value: number[];
  hasData: boolean[];
  formattedValue: string[];
  maxValueIndex: number;
}

export interface InterestByRegionResponse {
  default: {
    geoMapData: RegionDataPoint[];
  };
}

export interface RegionChartData {
  region: string;
  geoCode: string;
  [keyword: string]: number | string;
}

export interface RelatedQuery {
  query: string;
  value: number;
  formattedValue: string;
  link: string;
  hasData?: boolean;
}

export interface RelatedQueriesResponse {
  default: {
    rankedList: Array<{
      rankedKeyword: RelatedQuery[];
    }>;
  };
}

export interface ParsedRelatedQueries {
  top: RelatedQuery[];
  rising: RelatedQuery[];
}

export interface RelatedTopic {
  topic: {
    mid: string;
    title: string;
    type: string;
  };
  value: number;
  formattedValue: string;
  link: string;
  hasData?: boolean;
}

export interface RelatedTopicsResponse {
  default: {
    rankedList: Array<{
      rankedKeyword: RelatedTopic[];
    }>;
  };
}

export interface ParsedRelatedTopics {
  top: RelatedTopic[];
  rising: RelatedTopic[];
}

export interface DailyTrendingSearch {
  title: {
    query: string;
    exploreLink: string;
  };
  formattedTraffic: string;
  relatedQueries: Array<{ query: string; exploreLink: string }>;
  image: {
    newsUrl: string;
    source: string;
    imageUrl: string;
  };
  articles: Array<{
    title: string;
    timeAgo: string;
    source: string;
    url: string;
    snippet: string;
  }>;
}

export interface DailyTrendsResponse {
  default: {
    trendingSearchesDays: Array<{
      date: string;
      formattedDate: string;
      trendingSearches: DailyTrendingSearch[];
    }>;
  };
}

export interface RealtimeTrendingStory {
  title: string;
  entityNames: string[];
  articles: Array<{
    articleTitle: string;
    url: string;
    source: string;
    time: string;
    snippet: string;
  }>;
}

export interface RealtimeTrendsResponse {
  storySummaries: {
    trendingStories: RealtimeTrendingStory[];
  };
}

export interface Country {
  code: string;
  name: string;
}
