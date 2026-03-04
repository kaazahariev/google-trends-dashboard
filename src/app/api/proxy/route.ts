import { NextRequest, NextResponse } from "next/server";

const GOOGLE_TRENDS = "https://trends.google.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// Simple CORS proxy for Google Trends API
// Usage: /api/proxy?url=https://trends.google.com/trends/api/explore?...
// Or:    /api/proxy?path=/trends/api/explore?...
// Or:    /api/proxy?rss=BG  (shortcut for trending RSS)

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // Mode 1: RSS shortcut
  const rssGeo = params.get("rss");
  if (rssGeo) {
    return proxyTo(`${GOOGLE_TRENDS}/trending/rss?geo=${rssGeo}`);
  }

  // Mode 2: Full URL
  const fullUrl = params.get("url");
  if (fullUrl) {
    if (!fullUrl.startsWith("https://trends.google.com/")) {
      return NextResponse.json(
        { error: "Only trends.google.com URLs allowed" },
        { status: 400 }
      );
    }
    return proxyTo(fullUrl);
  }

  // Mode 3: Path-based
  const path = params.get("path");
  if (path) {
    return proxyTo(GOOGLE_TRENDS + path);
  }

  return NextResponse.json(
    { error: "Use ?url=, ?path=, or ?rss= parameter" },
    { status: 400 }
  );
}

async function proxyTo(targetUrl: string): Promise<NextResponse> {
  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,bg;q=0.8",
        Referer: "https://trends.google.com/trends/explore",
        Cookie: "CONSENT=YES+cb.20210720-08-p0.en+FX+111",
      },
      cache: "no-store",
    });

    const body = await response.text();
    const contentType = response.headers.get("Content-Type") || "text/plain";

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "X-Proxy-Status": String(response.status),
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}

export const runtime = "edge"; // Use edge runtime for faster cold starts
