// Codeforces & LeetCode Contest Schedule & Notification Service

export class ContestService {
  constructor() {
    this.cacheKey = "ascent_contests_cache";
    this.cacheDuration = 30 * 60 * 1000; // 30 minutes
  }

  // Calculate Next LeetCode Weekly and Biweekly Contests deterministically
  getLeetCodeUpcomingContests() {
    const now = new Date();
    const contests = [];

    // LeetCode Weekly Contest is every Sunday at 02:30 UTC (08:00 AM IST)
    const nextSunday = new Date(now);
    const dayOfWeek = now.getUTCDay(); // 0 is Sunday
    let daysUntilSunday = (7 - dayOfWeek) % 7;
    if (daysUntilSunday === 0 && (now.getUTCHours() > 4 || (now.getUTCHours() === 4 && now.getUTCMinutes() > 0))) {
      daysUntilSunday = 7;
    }
    nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
    nextSunday.setUTCHours(2, 30, 0, 0);

    contests.push({
      platform: "LeetCode",
      name: "LeetCode Weekly Contest",
      startTime: nextSunday.getTime(),
      durationMinutes: 90,
      link: "https://leetcode.com/contest/",
      type: "Weekly"
    });

    // LeetCode Biweekly Contest is alternate Saturdays at 14:30 UTC (08:00 PM IST)
    // Reference epoch for biweekly contest: Saturday, Nov 21, 2026, or calculate nearest upcoming Saturday
    const nextSaturday = new Date(now);
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    nextSaturday.setUTCDate(now.getUTCDate() + (daysUntilSaturday === 0 && now.getUTCHours() >= 16 ? 7 : daysUntilSaturday));
    nextSaturday.setUTCHours(14, 30, 0, 0);

    contests.push({
      platform: "LeetCode",
      name: "LeetCode Biweekly Contest",
      startTime: nextSaturday.getTime(),
      durationMinutes: 90,
      link: "https://leetcode.com/contest/",
      type: "Biweekly"
    });

    return contests;
  }

  async fetchCodeforcesContests() {
    try {
      const response = await fetch("https://codeforces.com/api/contest.list?gym=false", { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (data.status !== "OK" || !Array.isArray(data.result)) throw new Error("Invalid API response");

      // Filter upcoming contests (phase === "BEFORE")
      const upcoming = data.result
        .filter((c) => c.phase === "BEFORE")
        .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
        .slice(0, 5)
        .map((c) => ({
          platform: "Codeforces",
          name: c.name,
          startTime: c.startTimeSeconds * 1000,
          durationMinutes: Math.round(c.durationSeconds / 60),
          link: "https://codeforces.com/contests",
          type: c.type || "Div. 2/3"
        }));

      return upcoming;
    } catch (e) {
      console.warn("Could not fetch live Codeforces contests:", e.message);
      // Fallback placeholder schedule
      return [
        {
          platform: "Codeforces",
          name: "Codeforces Round (Div. 2 / Div. 3)",
          startTime: Date.now() + (2 * 24 * 60 * 60 * 1000),
          durationMinutes: 120,
          link: "https://codeforces.com/contests",
          type: "Regular Round"
        }
      ];
    }
  }

  async getAllUpcomingContests() {
    const leetcode = this.getLeetCodeUpcomingContests();
    const codeforces = await this.fetchCodeforcesContests();

    const combined = [...leetcode, ...codeforces].sort((a, b) => a.startTime - b.startTime);
    return combined;
  }

  // Format countdown string
  static formatCountdown(startTimeMs) {
    const diff = startTimeMs - Date.now();
    if (diff <= 0) return "Starting now / In progress";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `In ${days} day${days > 1 ? "s" : ""}, ${hours % 24}h`;
    }
    return `In ${hours}h ${minutes}m`;
  }

  // Request browser notification permission
  static requestNotificationPermission() {
    if (!("Notification" in window)) return Promise.resolve(false);
    return Notification.requestPermission().then((perm) => perm === "granted");
  }

  static sendNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%231a73e8%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/><circle cx=%2212%22 cy=%2212%22 r=%226%22 fill=%22%23ffffff%22/><circle cx=%2212%22 cy=%2212%22 r=%223%22 fill=%22%231a73e8%22/></svg>"
      });
    }
  }
}
