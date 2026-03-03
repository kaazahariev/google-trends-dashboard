// Cloudflare Worker: Google Trends CORS Proxy with Cache + Retry
// - Caches responses via Cloudflare Cache API (5 min TTL)
// - Server-side retry with exponential backoff on 429
// - Supports path-based (/trends/api/...) and ?url= parameter modes

const GOOGLE_TRENDS = "https://trends.google.com";
const CACHE_TTL = 300; // 5 minutes

// Rotate user agents to reduce fingerprinting
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:134.0) Gecko/20100101 Firefox/134.0",
];

export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);

    // Mode 1: ?url= parameter (full URL proxy, for RSS etc.)
    const fullUrl = url.searchParams.get("url");
    if (fullUrl) {
      if (!fullUrl.startsWith("https://trends.google.com/")) {
        return jsonError("Only trends.google.com URLs allowed", 400);
      }
      return cachedProxy(ctx, fullUrl);
    }

    // Mode 2: Path-based proxy (e.g. /trends/api/explore?...)
    const path = url.pathname + url.search;
    if (path.startsWith("/trends/") || path.startsWith("/trending/")) {
      return cachedProxy(ctx, GOOGLE_TRENDS + path);
    }

    // Health check
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", service: "trends-proxy", cache_ttl: CACHE_TTL }), {
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    return jsonError("Use /trends/api/... or ?url=https://trends.google.com/...", 400);
  },
};

// ── Cached proxy with server-side retry ──

async function cachedProxy(ctx, targetUrl) {
  const cache = caches.default;

  // Stable cache key from the target URL
  const cacheKey = new Request(`https://cache.internal/${encodeURIComponent(targetUrl)}`, {
    method: "GET",
  });

  // 1) Try cache first
  const cached = await cache.match(cacheKey);
  if (cached) {
    const body = await cached.text();
    return new Response(body, {
      status: cached.status,
      headers: {
        ...corsHeaders(),
        "Content-Type": cached.headers.get("Content-Type") || "text/plain",
        "X-Cache": "HIT",
        "X-Proxy-Status": String(cached.status),
      },
    });
  }

  // 2) Fetch from Google with retry on 429
  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [2000, 5000, 10000]; // ms
  let lastStatus = 0;
  let lastBody = "";
  let lastContentType = "text/plain";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS[attempt - 1] || 10000);
    }

    try {
      const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": ua,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,bg;q=0.8",
          "Referer": "https://trends.google.com/trends/explore",
          "Cookie": "CONSENT=YES+cb.20210720-08-p0.en+FX+111",
        },
      });

      lastStatus = response.status;
      lastBody = await response.text();
      lastContentType = response.headers.get("Content-Type") || "text/plain";

      // Success → cache & return
      if (response.status >= 200 && response.status < 400 && lastBody.length > 0) {
        const toCache = new Response(lastBody, {
          status: response.status,
          headers: {
            "Content-Type": lastContentType,
            "Cache-Control": `public, max-age=${CACHE_TTL}`,
          },
        });
        ctx.waitUntil(cache.put(cacheKey, toCache));

        return new Response(lastBody, {
          status: response.status,
          headers: {
            ...corsHeaders(),
            "Content-Type": lastContentType,
            "X-Cache": "MISS",
            "X-Proxy-Status": String(response.status),
            "X-Retry": String(attempt),
          },
        });
      }

      // 429 → retry (unless last attempt)
      if (response.status === 429 && attempt < MAX_RETRIES) {
        continue;
      }

      // Other error → return immediately
      if (response.status !== 429) {
        break;
      }
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        return jsonError(err.message, 502);
      }
      continue;
    }
  }

  // All retries exhausted or non-retryable error
  return new Response(lastBody, {
    status: lastStatus,
    headers: {
      ...corsHeaders(),
      "Content-Type": lastContentType,
      "X-Cache": "MISS",
      "X-Proxy-Status": String(lastStatus),
      "X-Retry": String(MAX_RETRIES),
    },
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
