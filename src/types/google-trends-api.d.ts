declare module "google-trends-api" {
  interface TrendsOptions {
    keyword?: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string | string[];
    hl?: string;
    timezone?: number;
    category?: number;
    property?: string;
    resolution?: "COUNTRY" | "REGION" | "CITY" | "DMA";
    granularTimeResolution?: boolean;
  }

  interface DailyTrendsOptions {
    geo: string;
    hl?: string;
    timezone?: number;
    trendDate?: Date;
  }

  interface RealtimeTrendsOptions {
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: string;
  }

  function interestOverTime(options: TrendsOptions): Promise<string>;
  function interestByRegion(options: TrendsOptions): Promise<string>;
  function relatedQueries(options: TrendsOptions): Promise<string>;
  function relatedTopics(options: TrendsOptions): Promise<string>;
  function dailyTrends(options: DailyTrendsOptions): Promise<string>;
  function realTimeTrends(options: RealtimeTrendsOptions): Promise<string>;

  const _default: {
    interestOverTime: typeof interestOverTime;
    interestByRegion: typeof interestByRegion;
    relatedQueries: typeof relatedQueries;
    relatedTopics: typeof relatedTopics;
    dailyTrends: typeof dailyTrends;
    realTimeTrends: typeof realTimeTrends;
  };

  export default _default;
}
