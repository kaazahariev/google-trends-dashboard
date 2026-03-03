// Google Trends CORS proxy with server-side cache — run with: node proxy.js
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 3001;
const CACHE_FILE = path.join(__dirname, ".trends-cache.json");
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STAGGER_DELAY = 3000; // 3s between Google API calls

// Store cookies from Google across requests
// Pre-seed with CONSENT cookie to bypass EU/GDPR consent gate
// Without this, Google returns empty Related Topics data
let storedCookies = "CONSENT=YES+cb.20210720-08-p0.en+FX+111; NID=511=placeholder";

// ============================================================
// Category definitions (mirror of client)
// ============================================================
const TRENDING_CATS = [
  { code: "all", catId: 0,  label: "All",           icon: "🔥" },
  { code: "ent", catId: 3,  label: "Entertainment", icon: "🎬" },
  { code: "spo", catId: 20, label: "Sports",        icon: "⚽" },
  { code: "tec", catId: 5,  label: "Technology",    icon: "💻" },
  { code: "biz", catId: 12, label: "Business",      icon: "💼" },
  { code: "hea", catId: 45, label: "Health",        icon: "🏥" },
  { code: "fin", catId: 7,  label: "Finance",       icon: "📈" },
  { code: "new", catId: 16, label: "News",          icon: "📰" },
];

// Default geo to pre-fetch
const DEFAULT_GEOS = ["BG"];

// ============================================================
// In-memory cache:  { "BG": { "all": { data, ts }, "ent": { data, ts }, ... } }
// ============================================================
let cache = {};
let refreshInProgress = false;

function loadCacheFromDisk() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      const geos = Object.keys(cache);
      const total = geos.reduce((n, g) => n + Object.keys(cache[g]).length, 0);
      console.log(`  📦 Loaded ${total} cached entries for ${geos.join(", ")} from disk`);
    }
  } catch (e) {
    console.warn("  ⚠️  Cache file corrupted, starting fresh:", e.message);
    cache = {};
  }
}

function saveCacheToDisk() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), "utf-8");
  } catch (e) {
    console.warn("  ⚠️  Cache save failed:", e.message);
  }
}

// ============================================================
// Google Trends fetch helpers (server-side)
// ============================================================
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function googleFetch(url, label) {
  const headers = {
    "User-Agent": UA,
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://trends.google.com/trends/explore",
  };
  if (storedCookies) headers["Cookie"] = storedCookies;

  const resp = await fetch(url, { headers, redirect: "follow" });

  // Capture and merge cookies (keep existing, update/add new)
  const setCookie = resp.headers.getSetCookie?.() || [];
  if (setCookie.length) {
    const cookieMap = {};
    // Parse existing cookies
    storedCookies.split("; ").forEach(c => {
      const [k, ...v] = c.split("=");
      if (k) cookieMap[k.trim()] = v.join("=");
    });
    // Merge new cookies
    setCookie.forEach(c => {
      const pair = c.split(";")[0];
      const [k, ...v] = pair.split("=");
      if (k) cookieMap[k.trim()] = v.join("=");
    });
    storedCookies = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join("; ");
  }

  if (resp.status === 429) throw new Error("429");
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.text();
}

function parseTrendsJSON(text) {
  return JSON.parse(text.replace(/^\)\]\}',?\n?/, ""));
}

// Fetch RSS trending for "All"
async function fetchRSSTrending(geo) {
  const url = `https://trends.google.com/trending/rss?geo=${geo}`;
  const resp = await fetch(url, { headers: { "User-Agent": UA } });
  if (!resp.ok) throw new Error(`RSS HTTP ${resp.status}`);
  const xml = await resp.text();

  // Parse XML manually (no DOMParser in Node)
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
    const traffic = (block.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/) || [])[1] || "";
    const newsTitle = (block.match(/<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>/) || [])[1] || "";
    const newsSource = (block.match(/<ht:news_item_source>([\s\S]*?)<\/ht:news_item_source>/) || [])[1] || "";
    const newsUrl = (block.match(/<ht:news_item_url>([\s\S]*?)<\/ht:news_item_url>/) || [])[1] || "";
    items.push({ title, traffic, newsTitle, newsSource, newsUrl });
  }
  return items;
}

// Fetch category trending via explore API
async function fetchCategoryTrending(geo, catId) {
  // Step 1: Get explore widget tokens
  const req = JSON.stringify({
    comparisonItem: [{ keyword: "", geo, time: "now 7-d" }],
    category: catId,
    property: "",
  });
  const exploreUrl = `https://trends.google.com/trends/api/explore?hl=en-US&tz=240&req=${encodeURIComponent(req)}&token=`;
  const exploreText = await googleFetch(exploreUrl, `explore-${catId}`);
  const explore = parseTrendsJSON(exploreText);

  const widgets = explore.widgets || [];
  const queriesWidget = widgets.find(w => w.id?.startsWith("RELATED_QUERIES"));
  if (!queriesWidget) return { top: [], rising: [] };

  // Step 2: Fetch widget data
  const token = queriesWidget.token;
  const widgetReq = encodeURIComponent(JSON.stringify(queriesWidget.request));
  const dataUrl = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=en-US&tz=240&req=${widgetReq}&token=${token}`;
  const dataText = await googleFetch(dataUrl, `queries-${catId}`);
  const data = parseTrendsJSON(dataText);

  const ranked = data?.default?.rankedList || [];
  return {
    top: ranked[0]?.rankedKeyword || [],
    rising: ranked[1]?.rankedKeyword || [],
  };
}

// ============================================================
// Background refresh: fetch all categories for a geo
// ============================================================
async function refreshGeo(geo) {
  if (!cache[geo]) cache[geo] = {};
  console.log(`\n  🔄 Refreshing all categories for ${geo}...`);

  // 1. RSS "All"
  try {
    const data = await fetchRSSTrending(geo);
    cache[geo]["all"] = { data, ts: Date.now() };
    saveCacheToDisk();
    console.log(`    ✓ All (${data.length} items)`);
  } catch (e) {
    console.warn(`    ✗ All: ${e.message}`);
  }

  await sleep(STAGGER_DELAY);

  // 2. Each category
  const cats = TRENDING_CATS.filter(c => c.code !== "all");
  for (const cat of cats) {
    try {
      const data = await fetchCategoryTrending(geo, cat.catId);
      cache[geo][cat.code] = { data, ts: Date.now() };
      saveCacheToDisk();
      const total = (data.top?.length || 0) + (data.rising?.length || 0);
      console.log(`    ✓ ${cat.label} (${total} items)`);
    } catch (e) {
      console.warn(`    ✗ ${cat.label}: ${e.message}`);
      if (e.message === "429") {
        console.warn("      Rate limited — pausing 15s...");
        await sleep(15000);
        // Retry once
        try {
          const data = await fetchCategoryTrending(geo, cat.catId);
          cache[geo][cat.code] = { data, ts: Date.now() };
          saveCacheToDisk();
          console.log(`    ✓ ${cat.label} (retry OK)`);
        } catch (e2) {
          console.warn(`    ✗ ${cat.label} retry failed: ${e2.message}`);
        }
      }
    }
    await sleep(STAGGER_DELAY);
  }

  console.log(`  ✅ Refresh complete for ${geo}`);
}

async function refreshAll() {
  if (refreshInProgress) { console.log("  ⏳ Refresh already in progress, skipping"); return; }
  refreshInProgress = true;
  try {
    for (const geo of DEFAULT_GEOS) {
      await refreshGeo(geo);
    }
  } finally {
    refreshInProgress = false;
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// HTTP Server
// ============================================================
http.createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, "http://localhost");

  // ── NEW: /api/trending?geo=BG ─────────────────────────────
  // Returns all cached categories for this geo in one JSON response
  if (url.pathname === "/api/trending") {
    const geo = url.searchParams.get("geo") || "BG";
    const geoCache = cache[geo] || {};

    // If this geo isn't in our default list, kick off a background fetch
    if (!DEFAULT_GEOS.includes(geo) && !cache[geo]) {
      DEFAULT_GEOS.push(geo);
      refreshGeo(geo).catch(() => {}); // fire-and-forget
    }

    // Build response
    const result = {};
    for (const cat of TRENDING_CATS) {
      const entry = geoCache[cat.code];
      result[cat.code] = entry ? { data: entry.data, ts: entry.ts, fresh: true } : null;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ geo, categories: result, serverTime: Date.now() }));
    return;
  }

  // ── NEW: /api/status ──────────────────────────────────────
  // Show cache status
  if (url.pathname === "/api/status") {
    const status = {};
    for (const geo of Object.keys(cache)) {
      status[geo] = {};
      for (const cat of Object.keys(cache[geo])) {
        const entry = cache[geo][cat];
        const age = Math.round((Date.now() - entry.ts) / 1000);
        status[geo][cat] = { items: Array.isArray(entry.data) ? entry.data.length : (entry.data?.top?.length || 0) + (entry.data?.rising?.length || 0), ageSec: age };
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ refreshInProgress, refreshInterval: REFRESH_INTERVAL / 1000, geos: status }));
    return;
  }

  // ── NEW: /api/refresh?geo=BG ──────────────────────────────
  // Force a refresh
  if (url.pathname === "/api/refresh") {
    const geo = url.searchParams.get("geo") || "BG";
    if (!DEFAULT_GEOS.includes(geo)) DEFAULT_GEOS.push(geo);
    refreshGeo(geo).catch(() => {});
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: `Refresh started for ${geo}` }));
    return;
  }

  // ── Existing: RSS proxy ───────────────────────────────────
  if (req.url.startsWith("/rss-trending")) {
    const params = new URL(req.url, "http://localhost").searchParams;
    const geo = params.get("geo") || "US";
    const cat = params.get("cat") || "";
    const target = `https://trends.google.com/trending/rss?geo=${geo}${cat ? "&cat=" + cat : ""}`;
    try {
      const resp = await fetch(target, { headers: { "User-Agent": UA } });
      const body = await resp.text();
      res.writeHead(resp.status, { "Content-Type": "application/xml" });
      res.end(body);
    } catch (e) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── Existing: Generic Google Trends proxy ─────────────────
  const target = "https://trends.google.com" + req.url;
  try {
    const body = await googleFetch(target, "proxy");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(body);
  } catch (e) {
    const status = e.message === "429" ? 429 : 502;
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: e.message }));
  }

}).listen(PORT, () => {
  console.log(`\n  ✅ Trends proxy running at http://localhost:${PORT}`);
  console.log(`  📡 API endpoints:`);
  console.log(`     GET /api/trending?geo=BG  — cached trending data (instant)`);
  console.log(`     GET /api/status           — cache status`);
  console.log(`     GET /api/refresh?geo=BG   — force refresh`);
  console.log(`  ⏱️  Auto-refresh every ${REFRESH_INTERVAL / 1000}s\n`);

  // Load disk cache, then start background refresh
  loadCacheFromDisk();

  // Warm up Google session (visit trends page to get proper cookies)
  setTimeout(async () => {
    try {
      console.log("  🍪 Warming up Google Trends session...");
      await googleFetch("https://trends.google.com/trends/?geo=US", "warmup");
      console.log("  🍪 Session ready, cookies:", storedCookies.substring(0, 80) + "...");
    } catch (e) {
      console.warn("  ⚠️  Warmup failed:", e.message, "— continuing anyway");
    }
    // Start background refresh after warmup
    setTimeout(() => refreshAll(), 1000);
  }, 500);

  // Periodic refresh
  setInterval(() => refreshAll(), REFRESH_INTERVAL);
});
