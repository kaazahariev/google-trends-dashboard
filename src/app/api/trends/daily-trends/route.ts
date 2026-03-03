import { NextRequest, NextResponse } from "next/server";
import { fetchDailyTrends } from "@/lib/trends-api";
import { parseDailyTrends } from "@/lib/parse-trends-data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const geo = searchParams.get("geo") || "US";

  try {
    const raw = await fetchDailyTrends(geo);
    const data = parseDailyTrends(raw);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Daily trends error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily trends" },
      { status: 500 }
    );
  }
}
