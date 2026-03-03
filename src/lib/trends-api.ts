import googleTrends from "google-trends-api";

export async function fetchInterestOverTime(params: {
  keyword: string | string[];
  startTime?: Date;
  endTime?: Date;
  geo?: string;
}) {
  const result = await googleTrends.interestOverTime({
    keyword: params.keyword,
    startTime: params.startTime,
    endTime: params.endTime,
    geo: params.geo || "",
  });
  return JSON.parse(result);
}

export async function fetchInterestByRegion(params: {
  keyword: string | string[];
  startTime?: Date;
  endTime?: Date;
  geo?: string;
  resolution?: "COUNTRY" | "REGION" | "CITY" | "DMA";
}) {
  const result = await googleTrends.interestByRegion({
    keyword: params.keyword,
    startTime: params.startTime,
    endTime: params.endTime,
    geo: params.geo || "",
    resolution: params.resolution || "COUNTRY",
  });
  return JSON.parse(result);
}

export async function fetchRelatedQueries(params: {
  keyword: string | string[];
  startTime?: Date;
  endTime?: Date;
  geo?: string;
}) {
  const result = await googleTrends.relatedQueries({
    keyword: params.keyword,
    startTime: params.startTime,
    endTime: params.endTime,
    geo: params.geo || "",
  });
  return JSON.parse(result);
}

export async function fetchRelatedTopics(params: {
  keyword: string | string[];
  startTime?: Date;
  endTime?: Date;
  geo?: string;
}) {
  const result = await googleTrends.relatedTopics({
    keyword: params.keyword,
    startTime: params.startTime,
    endTime: params.endTime,
    geo: params.geo || "",
  });
  return JSON.parse(result);
}

export async function fetchDailyTrends(geo: string) {
  const result = await googleTrends.dailyTrends({
    geo: geo || "US",
  });
  return JSON.parse(result);
}

export async function fetchRealtimeTrends(geo: string) {
  const result = await googleTrends.realTimeTrends({
    geo: geo || "US",
    category: "all",
  });
  return JSON.parse(result);
}
