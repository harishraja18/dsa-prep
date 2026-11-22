// Daily Google News & AI Tech Intelligence Service

const GOOGLE_NEWS_RSS_FEEDS = [
  {
    name: "Google AI & DeepMind",
    category: "google_ai",
    url: "https://news.google.com/rss/search?q=Google+AI+OR+Google+DeepMind+when:7d&hl=en-US&gl=US&ceid=US:en"
  },
  {
    name: "Google Cloud & Tech",
    category: "google_tech",
    url: "https://news.google.com/rss/search?q=Google+Cloud+OR+Google+Engineers+when:7d&hl=en-US&gl=US&ceid=US:en"
  },
  {
    name: "FAANG & Machine Learning",
    category: "ml_faang",
    url: "https://news.google.com/rss/search?q=Machine+Learning+LLM+AI+Engineer+when:7d&hl=en-US&gl=US&ceid=US:en"
  }
];

// Fallback curated daily updates for offline/proxy fallback
const CURATED_GOOGLE_NEWS_FALLBACK = [
  {
    title: "Google DeepMind Unveils Next-Generation Reasoning Architecture with Gemini Pro",
    link: "https://blog.google/technology/ai/",
    source: "Google AI Blog",
    pubDate: "Updated Today",
    snippet: "DeepMind introduces novel architectural breakthroughs combining tree-search planning with test-time compute scaling for elite algorithmic reasoning.",
    category: "google_ai"
  },
  {
    title: "Google Cloud Expands TPU v5e & v5p Deployments for Large-Scale AI Clusters",
    link: "https://cloud.google.com/blog/products/ai-machine-learning",
    source: "Google Cloud Blog",
    pubDate: "Updated Today",
    snippet: "High-performance Tensor Processing Units empower machine learning teams to train trillion-parameter models with unprecedented FLOP efficiency.",
    category: "google_tech"
  },
  {
    title: "How Google Engineers Structure Monolithic Repositories & Distributed Build Systems",
    link: "https://research.google/",
    source: "Google Research",
    pubDate: "Featured Guide",
    snippet: "A deep dive into Piper, Google's ultra-scale version control system, and Blaze/Bazel build optimizations for high-throughput codebases.",
    category: "google_tech"
  },
  {
    title: "Advancements in LLM Inference: KV-Cache Compression and Speculative Decoding",
    link: "https://arxiv.org/abs/2302.01318",
    source: "AI Engineering & arXiv",
    pubDate: "Trending Research",
    snippet: "New mathematical strategies allow serving large transformer models with 3x higher throughput without degradation in accuracy.",
    category: "ml_faang"
  },
  {
    title: "Google Research: Solving Complex Graph Algorithmic Challenges at Planetary Scale",
    link: "https://research.google/pubs/",
    source: "Google Research Papers",
    pubDate: "Engineering Deep Dive",
    snippet: "Parallel graph partitioning and distributed shortest-path algorithms powering Google Maps and knowledge graphs.",
    category: "google_ai"
  }
];

export class NewsService {
  constructor() {
    this.cacheKey = "ascent_google_news_cache";
    this.cacheDuration = 60 * 60 * 1000; // 1 hour in ms
  }

  getCachedNews() {
    try {
      const data = localStorage.getItem(this.cacheKey);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (Date.now() - parsed.timestamp < this.cacheDuration) {
        return parsed.items;
      }
    } catch (e) {
      console.warn("Error reading cached news:", e);
    }
    return null;
  }

  setCachedNews(items) {
    try {
      localStorage.setItem(
        this.cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          items
        })
      );
    } catch (e) {
      console.warn("Error saving cached news:", e);
    }
  }

  async fetchFeedFromRss2Json(rssUrl, category, sourceName) {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.status !== "ok" || !Array.isArray(data.items)) {
      throw new Error("Invalid RSS response");
    }

    return data.items.slice(0, 5).map((item) => {
      // Clean HTML tags from description if present
      const cleanDesc = (item.description || item.content || "")
        .replace(/<[^>]*>?/gm, "")
        .trim();

      const displayDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      }) : "Recent";

      return {
        title: item.title,
        link: item.link,
        source: item.author || sourceName,
        pubDate: displayDate,
        snippet: cleanDesc.slice(0, 180) + (cleanDesc.length > 180 ? "..." : ""),
        category
      };
    });
  }

  async fetchAllNews(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getCachedNews();
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    const fetchedItems = [];

    // Attempt to fetch from public RSS-to-JSON
    for (const feed of GOOGLE_NEWS_RSS_FEEDS) {
      try {
        const items = await this.fetchFeedFromRss2Json(feed.url, feed.category, feed.name);
        fetchedItems.push(...items);
      } catch (err) {
        console.warn(`Failed fetching RSS feed ${feed.name}:`, err.message);
      }
    }

    // If fetched successfully, merge with curated items and cache
    if (fetchedItems.length > 0) {
      // Deduplicate by title
      const seen = new Set();
      const uniqueItems = [];
      for (const item of [...fetchedItems, ...CURATED_GOOGLE_NEWS_FALLBACK]) {
        const key = item.title.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueItems.push(item);
        }
      }
      this.setCachedNews(uniqueItems);
      return uniqueItems;
    }

    // Graceful fallback to rich curated Google tech & AI updates
    return CURATED_GOOGLE_NEWS_FALLBACK;
  }
}
