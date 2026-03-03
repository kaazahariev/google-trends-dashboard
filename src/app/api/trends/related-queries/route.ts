import { NextRequest, NextResponse } from "next/server";
import { fetchRelatedQueries } from "@/lib/trends-api";
import { parseRelatedQueries } from "@/lib/parse-trends-data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keywords = searchParams.get("keywords");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");
  const geo = searchParams.get("geo") || "";

  if (!keywords) {
    return NextResponse.json({ error: "Keywords required" }, { status: 400 });
  }

  try {
    const keywordArray = keywords.split(",").map((k) => k.trim()).filter(Boolean);
    const raw = await fetchRelatedQueries({
      keyword: keywordArray.length === 1 ? keywordArray[0] : keywordArray,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      geo,
    });

    const data = parseRelatedQueries(raw, keywordArray);
    return NextResponse.json({ data, keywords: keywordArray });
  } catch (error) {
    console.error("Related queries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch related queries" },
      { status: 500 }
    );
  }
}
