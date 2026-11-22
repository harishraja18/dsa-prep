// Daily Smart Time Allocator & Schedule Generator with Task Deletion & Travel Presets

import { MICRO_RESOURCES, COMMUTE_VIDEOS } from "./data/podcastsAndResources.js";

const PLANNER_STORAGE_KEY = "ascent_daily_plan_v2";

export class DailyPlanner {
  static getTodayPlan() {
    try {
      const data = localStorage.getItem(PLANNER_STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      const isToday = new Date(parsed.date).toDateString() === new Date().toDateString();
      return isToday ? parsed : null;
    } catch {
      return null;
    }
  }

  static saveTodayPlan(plan) {
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify({
      date: new Date().toISOString(),
      ...plan
    }));
  }

  static deletePlanItem(taskId) {
    const plan = DailyPlanner.getTodayPlan();
    if (!plan || !plan.items) return null;
    plan.items = plan.items.filter((item) => item.id !== taskId);
    DailyPlanner.saveTodayPlan(plan);
    return plan;
  }

  static generateSchedule(availableMinutes, focusArea = "balanced") {
    const mins = parseInt(availableMinutes, 10);
    const scheduleItems = [];

    // Case 0: College Commute / Bus Travel Preset (45 - 60 minutes)
    if (focusArea === "commute") {
      const video = COMMUTE_VIDEOS[Math.floor(Math.random() * COMMUTE_VIDEOS.length)];
      scheduleItems.push({
        id: "task_commute_1",
        timeBox: "45 min",
        durationMinutes: 45,
        title: `Travel Mode: ${video.title}`,
        category: "In-Page Video / Travel Study",
        description: `${video.description} Takeaway: ${video.keyTakeaway}`,
        youtubeId: video.youtubeId,
        isCommuteVideo: true,
        completed: false
      });
      scheduleItems.push({
        id: "task_commute_2",
        timeBox: "15 min",
        durationMinutes: 15,
        title: "Travel Reflection & Interview Takeaway Notes",
        category: "Review",
        description: "Review communication flow and note 3 algorithmic strategies observed during the mock interview.",
        link: "#guide",
        completed: false
      });
    }
    // Case 1: Micro slot (10 - 15 minutes)
    else if (mins <= 15) {
      const podcast = MICRO_RESOURCES[Math.floor(Math.random() * MICRO_RESOURCES.length)];
      scheduleItems.push({
        id: "task_1",
        timeBox: `${mins} min`,
        durationMinutes: mins,
        title: `Listen: ${podcast.title}`,
        category: "Podcast / High-Yield AI",
        description: `${podcast.recommendationReason} Source: ${podcast.source}.`,
        link: podcast.link,
        completed: false
      });
    }
    // Case 2: Short Sprint (20 - 30 minutes)
    else if (mins <= 30) {
      scheduleItems.push({
        id: "task_1",
        timeBox: "15 min",
        durationMinutes: 15,
        title: "Solve 1 Medium Google DSA Problem",
        category: "DSA Practice",
        description: "Solve today's challenge in the Daily DSA Editor with real test-case verification.",
        link: "#daily-dsa",
        completed: false
      });
      scheduleItems.push({
        id: "task_2",
        timeBox: `${mins - 15} min`,
        durationMinutes: mins - 15,
        title: "Micro Review / Technical Invariant",
        category: "Takeaways",
        description: "Document the optimal pattern in your notes for spaced repetition.",
        link: "#guide",
        completed: false
      });
    }
    // Case 3: 45 Minutes to 1 Hour
    else if (mins <= 60) {
      if (focusArea === "ai") {
        scheduleItems.push({
          id: "task_1",
          timeBox: "30 min",
          durationMinutes: 30,
          title: "AI Math Foundations: Attention Matrix Derivations",
          category: "AI Curriculum",
          description: "Derive shapes of Q, K, V projections and 1/sqrt(d_k) scaling factor on paper.",
          link: "#ai",
          completed: false
        });
        scheduleItems.push({
          id: "task_2",
          timeBox: "25 min",
          durationMinutes: 25,
          title: "PyTorch MultiHeadAttention Layer Implementation",
          category: "AI Coding",
          description: "Code the forward pass with causal mask in PyTorch from scratch without high-level wrappers.",
          link: "#ai",
          completed: false
        });
      } else {
        scheduleItems.push({
          id: "task_1",
          timeBox: "45 min",
          durationMinutes: 45,
          title: "Google Mock Interview Simulation",
          category: "Mock Interview",
          description: "Solve 1 Medium/Hard DSA problem under strict 45-minute countdown clock without looking at solutions.",
          link: "#timer",
          completed: false
        });
        scheduleItems.push({
          id: "task_2",
          timeBox: "15 min",
          durationMinutes: 15,
          title: "Line-by-Line Dry Run & Post-Mortem Notes",
          category: "Analysis",
          description: "Document edge cases and mathematical Big-O proof in personal notes.",
          link: "#guide",
          completed: false
        });
      }
    }
    // Case 4: 2 Hours
    else if (mins <= 120) {
      scheduleItems.push({
        id: "task_1",
        timeBox: "60 min",
        durationMinutes: 60,
        title: "Deep DSA Pattern Focus (2 Google Problems)",
        category: "DSA Practice",
        description: "Target high-frequency topic (Graphs / Topo Sort or Monotonic Stack). Write full dry runs.",
        link: "#dsa",
        completed: false
      });
      scheduleItems.push({
        id: "task_2",
        timeBox: "45 min",
        durationMinutes: 45,
        title: "AI & ML Engineering Core Topic (1 Module)",
        category: "AI Curriculum",
        description: "Study KV Caching mechanics, memory calculation formulas, and vLLM PagedAttention architecture.",
        link: "#ai",
        completed: false
      });
      scheduleItems.push({
        id: "task_3",
        timeBox: "15 min",
        durationMinutes: 15,
        title: "Technical Commute / Podcast Reflection",
        category: "Podcast",
        description: "Watch or listen to recommended technical breakdown (DeepMind or Karpathy overview).",
        link: MICRO_RESOURCES[0].link,
        completed: false
      });
    }
    // Case 5: 3 - 4+ Hours (Full Immersion Day)
    else {
      scheduleItems.push({
        id: "task_1",
        timeBox: "90 min",
        durationMinutes: 90,
        title: "Block 1: Heavy DSA Mastery (Trees, Graphs, DP)",
        category: "DSA Practice",
        description: "Solve 2-3 Google interview favorites (Alien Dictionary, Meeting Rooms III, or Burst Balloons). Follow complete 10-step framework.",
        link: "#dsa",
        completed: false
      });
      scheduleItems.push({
        id: "task_2",
        timeBox: "75 min",
        durationMinutes: 75,
        title: "Block 2: AI Systems & Production Engineering",
        category: "AI Curriculum",
        description: "Implement LoRA layer from scratch in PyTorch or design a real-time vector search recommendation pipeline.",
        link: "#ai",
        completed: false
      });
      scheduleItems.push({
        id: "task_3",
        timeBox: "45 min",
        durationMinutes: 45,
        title: "Block 3: Speed & Contest Solving (Codeforces / LeetCode)",
        category: "Speed Practice",
        description: "Simulate contest environment. Solve Div. 2 / Div. 3 problems with speed under pressure.",
        link: "https://codeforces.com/contests",
        completed: false
      });
      scheduleItems.push({
        id: "task_4",
        timeBox: "20 min",
        durationMinutes: 20,
        title: "Block 4: Daily Retrospective & Spaced Review",
        category: "Takeaways",
        description: "Consolidate all notes, review past tricky problems, and schedule revisits.",
        link: "#guide",
        completed: false
      });
    }

    const plan = {
      availableMinutes: mins,
      focusArea,
      items: scheduleItems
    };

    DailyPlanner.saveTodayPlan(plan);
    return plan;
  }
}
