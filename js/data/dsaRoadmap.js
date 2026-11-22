// Google & FAANG DSA High-Frequency Interview Problems
export const DSA_TOPICS = [
  "Arrays & Hashing",
  "Two Pointers & Sliding Window",
  "Stack & Queue (Monotonic)",
  "Linked Lists",
  "Binary Search",
  "Trees & BST",
  "Tries (Google Favorite)",
  "Graphs (BFS/DFS/Dijkstra/Union-Find)",
  "Intervals & Greedy",
  "Backtracking & Recursion",
  "Dynamic Programming",
  "Heaps & Priority Queue",
  "Google System-Style Algorithmic Design"
];

export const DEFAULT_PROBLEM_STEPS = [
  { id: "step_clarify", title: "1. Clarify & Constraints", desc: "Identify bounds (N, value ranges, negative nums, empty input, memory limit)." },
  { id: "step_examples", title: "2. Examples & Edge Cases", desc: "Walk through at least 3 distinct cases (min size, max size, boundary condition)." },
  { id: "step_brute", title: "3. Brute Force & Bottleneck", desc: "State naive complexity and why it fails (O(N^2), O(2^N)). Pinpoint the bottleneck." },
  { id: "step_pattern", title: "4. Pattern & Invariants", desc: "Pick optimal pattern (Two Pointers, Monotonic Stack, Trie, Topo Sort, DP, etc.)." },
  { id: "step_complexity", title: "5. Big-O Proof", desc: "Prove exact Time and Space complexities before writing any code." },
  { id: "step_code", title: "6. Production-Quality Code", desc: "Write clean, modular code with boundary checks, meaningful variables, no side-effects." },
  { id: "step_dryrun", title: "7. Manual Dry Run", desc: "Trace through sample inputs step-by-step with state tables to catch off-by-one errors." },
  { id: "step_postmortem", title: "8. Takeaways & Spaced Repetition", desc: "Note core conceptual trick and schedule 1d, 3d, 7d revisit intervals." }
];

export const INITIAL_DSA_PROBLEMS = [
  // Arrays & Hashing
  {
    id: "dsa_1",
    title: "Two Sum",
    topic: "Arrays & Hashing",
    difficulty: "Easy",
    googleFreq: "High",
    link: "https://leetcode.com/problems/two-sum/",
    pattern: "Hash Map Complement",
    keyInsight: "Use a hash map to look up target - num in O(1) time.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_2",
    title: "3Sum",
    topic: "Arrays & Hashing",
    difficulty: "Medium",
    googleFreq: "High",
    link: "https://leetcode.com/problems/3sum/",
    pattern: "Sort + Two Pointers",
    keyInsight: "Sort array, fix first number, then two pointers. Skip duplicates to prevent duplicate triplets.",
    timeComp: "O(N^2)",
    spaceComp: "O(1) or O(N)"
  },
  {
    id: "dsa_3",
    title: "Subarray Sum Equals K",
    topic: "Arrays & Hashing",
    difficulty: "Medium",
    googleFreq: "Very High",
    link: "https://leetcode.com/problems/subarray-sum-equals-k/",
    pattern: "Prefix Sum + Frequency Map",
    keyInsight: "prefixSum[j] - prefixSum[i] = k. Track frequency of running prefix sums seen so far.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_4",
    title: "Longest Consecutive Sequence",
    topic: "Arrays & Hashing",
    difficulty: "Medium",
    googleFreq: "High",
    link: "https://leetcode.com/problems/longest-consecutive-sequence/",
    pattern: "Hash Set Streak Search",
    keyInsight: "Only start building a streak if (num - 1) is not in the set.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },

  // Two Pointers & Sliding Window
  {
    id: "dsa_5",
    title: "Trapping Rain Water",
    topic: "Two Pointers & Sliding Window",
    difficulty: "Hard",
    googleFreq: "Top FAANG",
    link: "https://leetcode.com/problems/trapping-rain-water/",
    pattern: "Two Pointers / Max Tracking",
    keyInsight: "Water trapped at i is min(maxLeft, maxRight) - height[i]. Move the pointer with the smaller max.",
    timeComp: "O(N)",
    spaceComp: "O(1)"
  },
  {
    id: "dsa_6",
    title: "Container With Most Water",
    topic: "Two Pointers & Sliding Window",
    difficulty: "Medium",
    googleFreq: "High",
    link: "https://leetcode.com/problems/container-with-most-water/",
    pattern: "Two Pointers Greedy Shifting",
    keyInsight: "Width decreases every step, so only moving the shorter line can potentially find a larger area.",
    timeComp: "O(N)",
    spaceComp: "O(1)"
  },
  {
    id: "dsa_7",
    title: "Minimum Window Substring",
    topic: "Two Pointers & Sliding Window",
    difficulty: "Hard",
    googleFreq: "Top FAANG",
    link: "https://leetcode.com/problems/minimum-window-substring/",
    pattern: "Sliding Window with Frequency Match",
    keyInsight: "Expand right to satisfy condition, contract left to minimize window while maintaining condition.",
    timeComp: "O(N)",
    spaceComp: "O(K)"
  },
  {
    id: "dsa_8",
    title: "Longest Substring Without Repeating Characters",
    topic: "Two Pointers & Sliding Window",
    difficulty: "Medium",
    googleFreq: "High",
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    pattern: "Sliding Window with Last-Seen Index Map",
    keyInsight: "Jump left pointer to max(left, lastSeen[char] + 1) to avoid duplicate characters.",
    timeComp: "O(N)",
    spaceComp: "O(min(N, AlphabetSize))"
  },

  // Stack & Queue
  {
    id: "dsa_9",
    title: "Daily Temperatures",
    topic: "Stack & Queue (Monotonic)",
    difficulty: "Medium",
    googleFreq: "High",
    link: "https://leetcode.com/problems/daily-temperatures/",
    pattern: "Monotonic Decreasing Stack",
    keyInsight: "Store indices in a stack with decreasing temperatures. Pop when a warmer temperature arrives.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_10",
    title: "Largest Rectangle in Histogram",
    topic: "Stack & Queue (Monotonic)",
    difficulty: "Hard",
    googleFreq: "Top FAANG",
    link: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    pattern: "Monotonic Increasing Stack",
    keyInsight: "Find the left and right boundaries where heights drop below current bar to compute max area.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },

  // Linked Lists
  {
    id: "dsa_11",
    title: "LRU Cache",
    topic: "Linked Lists",
    difficulty: "Medium",
    googleFreq: "Universal FAANG",
    link: "https://leetcode.com/problems/lru-cache/",
    pattern: "Hash Map + Doubly Linked List",
    keyInsight: "Hash map provides O(1) key access; Doubly Linked List provides O(1) node removal and prepend to head.",
    timeComp: "O(1) get & put",
    spaceComp: "O(Capacity)"
  },
  {
    id: "dsa_12",
    title: "Merge k Sorted Lists",
    topic: "Linked Lists",
    difficulty: "Hard",
    googleFreq: "Very High",
    link: "https://leetcode.com/problems/merge-k-sorted-lists/",
    pattern: "Min-Heap / Divide & Conquer",
    keyInsight: "Maintain a min-heap of size k containing heads of lists, repeatedly extract minimum.",
    timeComp: "O(N log K)",
    spaceComp: "O(K)"
  },

  // Binary Search
  {
    id: "dsa_13",
    title: "Search in Rotated Sorted Array",
    topic: "Binary Search",
    difficulty: "Medium",
    googleFreq: "High",
    link: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    pattern: "Modified Binary Search with Sorted Half Check",
    keyInsight: "At least one half is always strictly sorted. Determine which half is sorted and whether target lies inside it.",
    timeComp: "O(log N)",
    spaceComp: "O(1)"
  },
  {
    id: "dsa_14",
    title: "Median of Two Sorted Arrays",
    topic: "Binary Search",
    difficulty: "Hard",
    googleFreq: "Top FAANG",
    link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    pattern: "Binary Search on Partition Cut",
    keyInsight: "Binary search on the smaller array to partition combined arrays into equal left and right halves.",
    timeComp: "O(log(min(M, N)))",
    spaceComp: "O(1)"
  },

  // Trees & BST
  {
    id: "dsa_15",
    title: "Lowest Common Ancestor of a Binary Tree",
    topic: "Trees & BST",
    difficulty: "Medium",
    googleFreq: "Very High",
    link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    pattern: "Post-Order DFS Bottom-Up",
    keyInsight: "If left and right subtrees each return a match, the current node is the LCA.",
    timeComp: "O(N)",
    spaceComp: "O(H)"
  },
  {
    id: "dsa_16",
    title: "Binary Tree Maximum Path Sum",
    topic: "Trees & BST",
    difficulty: "Hard",
    googleFreq: "Top FAANG",
    link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    pattern: "Post-Order DFS with Subtree Gain",
    keyInsight: "Compute max single-branch gain (discarding negatives with max(0, gain)), update global max path crossing root.",
    timeComp: "O(N)",
    spaceComp: "O(H)"
  },
  {
    id: "dsa_17",
    title: "Step-By-Step Directions From a Binary Tree Node to Another",
    topic: "Trees & BST",
    difficulty: "Medium",
    googleFreq: "Google Classic",
    link: "https://leetcode.com/problems/step-by-step-directions-from-a-binary-tree-node-to-another/",
    pattern: "LCA + Path Tracing",
    keyInsight: "Find path from root to start and root to dest. Strip common prefix (LCA), convert start path to 'U's.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },

  // Tries
  {
    id: "dsa_18",
    title: "Word Search II",
    topic: "Tries (Google Favorite)",
    difficulty: "Hard",
    googleFreq: "Top FAANG",
    link: "https://leetcode.com/problems/word-search-ii/",
    pattern: "Trie + Backtracking DFS on Grid",
    keyInsight: "Store dictionary words in a Trie. Prune Trie nodes on word discovery to avoid redundant paths.",
    timeComp: "O(M * N * 4^(L))",
    spaceComp: "O(Total Chars in Dict)"
  },
  {
    id: "dsa_19",
    title: "Design Add and Search Words Data Structure",
    topic: "Tries (Google Favorite)",
    difficulty: "Medium",
    googleFreq: "High",
    link: "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
    pattern: "Trie with Wildcard DFS",
    keyInsight: "When encountering '.', recursively branch through all valid children of current Trie node.",
    timeComp: "O(M) for words, O(26^K) worst-case wildcard",
    spaceComp: "O(Trie Nodes)"
  },

  // Graphs
  {
    id: "dsa_20",
    title: "Course Schedule II",
    topic: "Graphs (BFS/DFS/Dijkstra/Union-Find)",
    difficulty: "Medium",
    googleFreq: "Universal FAANG",
    link: "https://leetcode.com/problems/course-schedule-ii/",
    pattern: "Kahn's Topological Sort (In-Degree BFS)",
    keyInsight: "Queue nodes with in-degree 0. As nodes are processed, decrement neighbor in-degrees.",
    timeComp: "O(V + E)",
    spaceComp: "O(V + E)"
  },
  {
    id: "dsa_21",
    title: "Alien Dictionary",
    topic: "Graphs (BFS/DFS/Dijkstra/Union-Find)",
    difficulty: "Hard",
    googleFreq: "Google Classic",
    link: "https://leetcode.com/problems/alien-dictionary/",
    pattern: "Directed Graph Construction + Topological Sort",
    keyInsight: "Compare adjacent words to extract character order edges. Detect cycles (invalid language rules).",
    timeComp: "O(C) total characters",
    spaceComp: "O(1) max 26 vertices"
  },
  {
    id: "dsa_22",
    title: "Word Ladder",
    topic: "Graphs (BFS/DFS/Dijkstra/Union-Find)",
    difficulty: "Hard",
    googleFreq: "Top FAANG",
    link: "https://leetcode.com/problems/word-ladder/",
    pattern: "Bidirectional BFS / Level-order BFS",
    keyInsight: "Shortest transformation path = BFS. Expand from both start and end frontiers to cut search space exponentially.",
    timeComp: "O(M^2 * N)",
    spaceComp: "O(M * N)"
  },
  {
    id: "dsa_23",
    title: "Number of Connected Components in an Undirected Graph",
    topic: "Graphs (BFS/DFS/Dijkstra/Union-Find)",
    difficulty: "Medium",
    googleFreq: "High",
    link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
    pattern: "Union-Find with Path Compression & Rank",
    keyInsight: "Start with N components. Each successful union of disjoint sets decrements the component count.",
    timeComp: "O(E * α(V))",
    spaceComp: "O(V)"
  },

  // Intervals & Greedy
  {
    id: "dsa_24",
    title: "Merge Intervals",
    topic: "Intervals & Greedy",
    difficulty: "Medium",
    googleFreq: "Very High",
    link: "https://leetcode.com/problems/merge-intervals/",
    pattern: "Sorting by Start Time + Linear Merge",
    keyInsight: "Sort intervals by start time. If current.start <= prev.end, merge by updating prev.end = max(prev.end, current.end).",
    timeComp: "O(N log N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_25",
    title: "Meeting Rooms III",
    topic: "Intervals & Greedy",
    difficulty: "Hard",
    googleFreq: "Google Peak Frequency",
    link: "https://leetcode.com/problems/meeting-rooms-iii/",
    pattern: "Dual Min-Heaps (Free Rooms & Busy Rooms)",
    keyInsight: "Track available rooms (ordered by room index) and occupied rooms (ordered by end time). Handle delayed meetings.",
    timeComp: "O(M log M + M log N)",
    spaceComp: "O(N)"
  },

  // Dynamic Programming
  {
    id: "dsa_26",
    title: "Edit Distance",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    googleFreq: "Google Classic",
    link: "https://leetcode.com/problems/edit-distance/",
    pattern: "2D DP (Insert, Delete, Replace)",
    keyInsight: "dp[i][j] = dp[i-1][j-1] if match else 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]).",
    timeComp: "O(M * N)",
    spaceComp: "O(min(M, N)) with space optimization"
  },
  {
    id: "dsa_27",
    title: "Longest Increasing Subsequence",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    googleFreq: "Very High",
    link: "https://leetcode.com/problems/longest-increasing-subsequence/",
    pattern: "Patience Sorting / Binary Search (Piles)",
    keyInsight: "Maintain tails array of smallest tail of all increasing subsequences of length i. Use binary search to update.",
    timeComp: "O(N log N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_28",
    title: "Burst Balloons",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    googleFreq: "Top FAANG",
    link: "https://leetcode.com/problems/burst-balloons/",
    pattern: "Interval DP (Bottom-Up by Length)",
    keyInsight: "Think in reverse: instead of which balloon bursts first, consider which balloon bursts LAST in the interval (i, j).",
    timeComp: "O(N^3)",
    spaceComp: "O(N^2)"
  },

  // Google System-Style Algorithmic Design
  {
    id: "dsa_29",
    title: "Snapshot Array",
    topic: "Google System-Style Algorithmic Design",
    difficulty: "Medium",
    googleFreq: "Google Peak Frequency",
    link: "https://leetcode.com/problems/snapshot-array/",
    pattern: "Binary Search on Versioned History List",
    keyInsight: "For each index, store a list of (snap_id, val). In get(index, snap_id), binary search for upper bound.",
    timeComp: "O(1) set & snap, O(log(versions)) get",
    spaceComp: "O(Total Sets)"
  },
  {
    id: "dsa_30",
    title: "Logger Rate Limiter",
    topic: "Google System-Style Algorithmic Design",
    difficulty: "Easy",
    googleFreq: "Google Favorite",
    link: "https://leetcode.com/problems/logger-rate-limiter/",
    pattern: "Hash Table / Sliding Time Window",
    keyInsight: "Map message to next allowed timestamp (timestamp + 10). Clean expired records if memory is constrained.",
    timeComp: "O(1)",
    spaceComp: "O(Distinct Messages in 10s)"
  },
  {
    id: "dsa_31",
    title: "Random Pick with Weight",
    topic: "Google System-Style Algorithmic Design",
    difficulty: "Medium",
    googleFreq: "High",
    link: "https://leetcode.com/problems/random-pick-with-weight/",
    pattern: "Prefix Sum Array + Binary Search (bisect_right)",
    keyInsight: "Construct running prefix sum of weights, generate uniform random integer in [1, totalSum], binary search bucket.",
    timeComp: "O(N) init, O(log N) pickIndex",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_32",
    title: "Sentence Screen Fitting",
    topic: "Google System-Style Algorithmic Design",
    difficulty: "Medium",
    googleFreq: "Google Classic",
    link: "https://leetcode.com/problems/sentence-screen-fitting/",
    pattern: "Pointer Arithmetic & Word Boundary Jump Table",
    keyInsight: "Concatenate sentence with space. Advance pointer by cols every row; adjust for space / mid-word collisions.",
    timeComp: "O(Rows + Words * MaxWordLen)",
    spaceComp: "O(Total Sentence Length)"
  }
];
