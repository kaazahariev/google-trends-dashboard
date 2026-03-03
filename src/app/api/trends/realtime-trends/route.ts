import { NextRequest, NextResponse } from "next/server";
import { fetchRealtimeTrends } from "@/lib/trends-api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const geo = searchParams.get("geo") || "US";

  try {
    const raw = await fetchRealtimeTrends(geo);
    const stories = raw?.storySummaries?.trendingStories || [];
    return NextResponse.json({ data: stories });
  } catch (error) {
    console.error("Realtime trends error:", error);
    return NextResponse.json(
      { error: "Failed to fetch realtime trends" },
      { status: 500 }
    );
  }
}
