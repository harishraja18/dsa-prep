// Google & FAANG DSA High-Frequency Interview Problems (Expanded Standard Set)
export const DSA_TOPICS = [
  "Arrays & Hashing",
  "Two Pointers & Sliding Window",
  "Stack & Queue (Monotonic)",
  "Linked Lists",
  "Binary Search",
  "Trees & Binary Search Trees",
  "Tries & Prefix Trees",
  "Graphs & Topological Sort",
  "Intervals & Greedy",
  "Backtracking & Recursion",
  "Dynamic Programming",
  "Heaps & Priority Queue",
  "Google Algorithmic System Design"
];

export const DEFAULT_PROBLEM_STEPS = [
  { id: "step_read", title: "1. Read Carefully", desc: "Read problem description twice. Identify exact input types, outputs, and edge guarantees." },
  { id: "step_bounds", title: "2. Constraints & Scale", desc: "Check N bounds (e.g., N <= 10^5 implies O(N log N) or O(N); N <= 20 implies O(2^N))." },
  { id: "step_cases", title: "3. Three Manual Test Cases", desc: "Write out: 1) Base/empty case, 2) Standard case, 3) Adversarial/duplicate/negative case." },
  { id: "step_naive", title: "4. Naive Baseline & Bottleneck", desc: "State brute force Big-O. Explain why it fails and where redundant work occurs." },
  { id: "step_pattern", title: "5. Match Algorithmic Pattern", desc: "Select structure: Two Pointers, Sliding Window, Monotonic Stack, Trie, Topo Sort, DP." },
  { id: "step_proof", title: "6. State Big-O Proof", desc: "State exact Time and Space complexities before writing code." },
  { id: "step_code", title: "7. Production-Quality Code", desc: "Write clean, modular code with boundary checks and clear variable names." },
  { id: "step_dryrun", title: "8. Line-by-Line Dry Run", desc: "Step through code line-by-line using a state table on a sample test input." },
  { id: "step_edgecheck", title: "9. Verify Bounds & Off-by-Ones", desc: "Check 0-indexing, loop conditions (< vs <=), and empty collection guards." },
  { id: "step_takeaway", title: "10. Post-Mortem & Spaced Review", desc: "Log core algorithmic mental model and schedule 1-day, 3-day review." }
];

export const INITIAL_DSA_PROBLEMS = [
  // Arrays & Hashing
  {
    id: "dsa_1",
    title: "Two Sum",
    topic: "Arrays & Hashing",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/two-sum/",
    pattern: "Hash Map Complement",
    keyInsight: "Store seen numbers in hash map. Check if target - num exists in O(1) time.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_2",
    title: "3Sum",
    topic: "Arrays & Hashing",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/3sum/",
    pattern: "Sort + Two Pointers",
    keyInsight: "Sort array, fix first number, use two pointers for remaining two. Skip duplicate values.",
    timeComp: "O(N^2)",
    spaceComp: "O(1)"
  },
  {
    id: "dsa_3",
    title: "Subarray Sum Equals K",
    topic: "Arrays & Hashing",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/subarray-sum-equals-k/",
    pattern: "Prefix Sum + Frequency Map",
    keyInsight: "prefixSum[j] - prefixSum[i] = k. Track frequency of seen prefix sums in map.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_4",
    title: "Longest Consecutive Sequence",
    topic: "Arrays & Hashing",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/longest-consecutive-sequence/",
    pattern: "Hash Set Streak Search",
    keyInsight: "Only start building a streak if (num - 1) is not in the set.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_5",
    title: "Product of Array Except Self",
    topic: "Arrays & Hashing",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/product-of-array-except-self/",
    pattern: "Prefix & Suffix Running Products",
    keyInsight: "Two passes: compute prefix products forward, then multiply suffix products backward.",
    timeComp: "O(N)",
    spaceComp: "O(1)"
  },

  // Two Pointers & Sliding Window
  {
    id: "dsa_6",
    title: "Trapping Rain Water",
    topic: "Two Pointers & Sliding Window",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/trapping-rain-water/",
    pattern: "Two Pointers / Boundary Tracking",
    keyInsight: "Water trapped at i is min(maxLeft, maxRight) - height[i]. Advance the pointer with smaller max.",
    timeComp: "O(N)",
    spaceComp: "O(1)"
  },
  {
    id: "dsa_7",
    title: "Container With Most Water",
    topic: "Two Pointers & Sliding Window",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/container-with-most-water/",
    pattern: "Two Pointers Greedy Shifting",
    keyInsight: "Area limited by shorter line. Always advance the pointer pointing to shorter line.",
    timeComp: "O(N)",
    spaceComp: "O(1)"
  },
  {
    id: "dsa_8",
    title: "Minimum Window Substring",
    topic: "Two Pointers & Sliding Window",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/minimum-window-substring/",
    pattern: "Sliding Window with Frequency Map",
    keyInsight: "Expand right to satisfy char counts, shrink left to minimize window while condition holds.",
    timeComp: "O(N)",
    spaceComp: "O(K)"
  },
  {
    id: "dsa_9",
    title: "Longest Substring Without Repeating Characters",
    topic: "Two Pointers & Sliding Window",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    pattern: "Sliding Window with Last-Seen Map",
    keyInsight: "Jump left pointer to max(left, lastSeen[char] + 1) on duplicate detection.",
    timeComp: "O(N)",
    spaceComp: "O(min(N, AlphabetSize))"
  },
  {
    id: "dsa_10",
    title: "Sliding Window Maximum",
    topic: "Two Pointers & Sliding Window",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/sliding-window-maximum/",
    pattern: "Monotonic Decreasing Deque",
    keyInsight: "Maintain deque storing indices in decreasing value order. Front is always max of window.",
    timeComp: "O(N)",
    spaceComp: "O(K)"
  },

  // Stack & Queue
  {
    id: "dsa_11",
    title: "Daily Temperatures",
    topic: "Stack & Queue (Monotonic)",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/daily-temperatures/",
    pattern: "Monotonic Decreasing Stack",
    keyInsight: "Store indices with decreasing temperatures. Pop indices when warmer temperature is found.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_12",
    title: "Largest Rectangle in Histogram",
    topic: "Stack & Queue (Monotonic)",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    pattern: "Monotonic Increasing Stack",
    keyInsight: "Find left and right boundaries where bars are shorter to determine max width for height.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_13",
    title: "Valid Parentheses",
    topic: "Stack & Queue (Monotonic)",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/valid-parentheses/",
    pattern: "LIFO Stack Matching",
    keyInsight: "Push opening brackets, pop and compare on closing brackets. Stack must be empty at end.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },

  // Linked Lists
  {
    id: "dsa_14",
    title: "LRU Cache",
    topic: "Linked Lists",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/lru-cache/",
    pattern: "Hash Map + Doubly Linked List",
    keyInsight: "Hash map provides O(1) key access; Doubly Linked List provides O(1) remove and append to head.",
    timeComp: "O(1) get & put",
    spaceComp: "O(Capacity)"
  },
  {
    id: "dsa_15",
    title: "Merge k Sorted Lists",
    topic: "Linked Lists",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/merge-k-sorted-lists/",
    pattern: "Min-Heap / Priority Queue",
    keyInsight: "Maintain min-heap of size k holding heads of lists. Continuously extract minimum node.",
    timeComp: "O(N log K)",
    spaceComp: "O(K)"
  },
  {
    id: "dsa_16",
    title: "Reverse Nodes in k-Group",
    topic: "Linked Lists",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/reverse-nodes-in-k-group/",
    pattern: "Iterative Pointer Reversal",
    keyInsight: "Check if k nodes exist first. Reverse k nodes iteratively and reconnect previous group tail.",
    timeComp: "O(N)",
    spaceComp: "O(1)"
  },

  // Binary Search
  {
    id: "dsa_17",
    title: "Search in Rotated Sorted Array",
    topic: "Binary Search",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    pattern: "Modified Binary Search",
    keyInsight: "At least one half is always strictly sorted. Determine which half is sorted and test target bound.",
    timeComp: "O(log N)",
    spaceComp: "O(1)"
  },
  {
    id: "dsa_18",
    title: "Find Minimum in Rotated Sorted Array",
    topic: "Binary Search",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    pattern: "Binary Search on Inflection Point",
    keyInsight: "Compare mid with right pointer. If nums[mid] > nums[right], inflection point lies in right half.",
    timeComp: "O(log N)",
    spaceComp: "O(1)"
  },
  {
    id: "dsa_19",
    title: "Median of Two Sorted Arrays",
    topic: "Binary Search",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    pattern: "Binary Search on Partition Cut",
    keyInsight: "Binary search on smaller array to partition combined arrays into equal left and right halves.",
    timeComp: "O(log(min(M, N)))",
    spaceComp: "O(1)"
  },

  // Trees & Binary Search Trees
  {
    id: "dsa_20",
    title: "Lowest Common Ancestor of a Binary Tree",
    topic: "Trees & Binary Search Trees",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    pattern: "Post-Order DFS Bottom-Up",
    keyInsight: "If left and right subtrees each return a match, current node is the LCA.",
    timeComp: "O(N)",
    spaceComp: "O(H)"
  },
  {
    id: "dsa_21",
    title: "Binary Tree Maximum Path Sum",
    topic: "Trees & Binary Search Trees",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    pattern: "Post-Order DFS with Subtree Gain",
    keyInsight: "Calculate max single-branch gain (discarding negatives with max(0, gain)); update global path crossing node.",
    timeComp: "O(N)",
    spaceComp: "O(H)"
  },
  {
    id: "dsa_22",
    title: "Serialize and Deserialize Binary Tree",
    topic: "Trees & Binary Search Trees",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    pattern: "Pre-order DFS with Null Delimiters",
    keyInsight: "Pre-order traversal with '#' for null nodes preserves exact tree structure deterministically.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_23",
    title: "Step-By-Step Directions From a Binary Tree Node to Another",
    topic: "Trees & Binary Search Trees",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/step-by-step-directions-from-a-binary-tree-node-to-another/",
    pattern: "LCA + Path Tracing",
    keyInsight: "Find path from root to start and root to dest. Discard common prefix (LCA), convert start path to 'U's.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },

  // Tries
  {
    id: "dsa_24",
    title: "Word Search II",
    topic: "Tries & Prefix Trees",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/word-search-ii/",
    pattern: "Trie + Grid DFS Backtracking",
    keyInsight: "Load dictionary into Trie. Prune Trie nodes on match to prevent redundant grid exploration.",
    timeComp: "O(M * N * 4^L)",
    spaceComp: "O(Dictionary Characters)"
  },
  {
    id: "dsa_25",
    title: "Implement Trie (Prefix Tree)",
    topic: "Tries & Prefix Trees",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/implement-trie-prefix-tree/",
    pattern: "Trie Node Character Array",
    keyInsight: "Array of 26 children pointers per node with isEndOfWord boolean flag.",
    timeComp: "O(L) per word",
    spaceComp: "O(Total Characters)"
  },

  // Graphs
  {
    id: "dsa_26",
    title: "Course Schedule II",
    topic: "Graphs & Topological Sort",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/course-schedule-ii/",
    pattern: "Kahn's Topological Sort (In-Degree BFS)",
    keyInsight: "Queue nodes with in-degree 0. Decrement neighbor in-degrees as nodes are processed.",
    timeComp: "O(V + E)",
    spaceComp: "O(V + E)"
  },
  {
    id: "dsa_27",
    title: "Alien Dictionary",
    topic: "Graphs & Topological Sort",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/alien-dictionary/",
    pattern: "DAG Construction + Topological Sort",
    keyInsight: "Compare adjacent sorted words to extract directed character edges. Detect cycles for invalid alphabets.",
    timeComp: "O(Total Characters)",
    spaceComp: "O(1) max 26 vertices"
  },
  {
    id: "dsa_28",
    title: "Word Ladder",
    topic: "Graphs & Topological Sort",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/word-ladder/",
    pattern: "Bidirectional BFS",
    keyInsight: "Shortest transformation path = BFS. Expand concurrently from start and end words to prune search frontier.",
    timeComp: "O(M^2 * N)",
    spaceComp: "O(M * N)"
  },
  {
    id: "dsa_29",
    title: "Number of Connected Components in an Undirected Graph",
    topic: "Graphs & Topological Sort",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
    pattern: "Union-Find with Path Compression & Rank",
    keyInsight: "Start with N components. Each successful union of disjoint sets decrements component count by 1.",
    timeComp: "O(E * α(V))",
    spaceComp: "O(V)"
  },
  {
    id: "dsa_30",
    title: "Network Delay Time",
    topic: "Graphs & Topological Sort",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/network-delay-time/",
    pattern: "Dijkstra's Algorithm (Min-Heap)",
    keyInsight: "Single-source shortest path with non-negative edge weights using priority queue.",
    timeComp: "O((V + E) log V)",
    spaceComp: "O(V + E)"
  },

  // Intervals & Greedy
  {
    id: "dsa_31",
    title: "Merge Intervals",
    topic: "Intervals & Greedy",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/merge-intervals/",
    pattern: "Sort by Start Time + Linear Merge",
    keyInsight: "Sort intervals by start. If current.start <= prev.end, merge by setting prev.end = max(prev.end, current.end).",
    timeComp: "O(N log N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_32",
    title: "Meeting Rooms III",
    topic: "Intervals & Greedy",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/meeting-rooms-iii/",
    pattern: "Dual Min-Heaps (Free Rooms & Busy Rooms)",
    keyInsight: "Min-heap for free rooms (by room index) and occupied rooms (by end time). Simulate meeting delays accurately.",
    timeComp: "O(M log M + M log N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_33",
    title: "Non-overlapping Intervals",
    topic: "Intervals & Greedy",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/non-overlapping-intervals/",
    pattern: "Greedy Sorting by End Time",
    keyInsight: "Sort by end time. Always keep the interval that finishes earliest to leave max room for subsequent intervals.",
    timeComp: "O(N log N)",
    spaceComp: "O(1)"
  },

  // Dynamic Programming
  {
    id: "dsa_34",
    title: "Edit Distance",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/edit-distance/",
    pattern: "2D DP (Insert, Delete, Replace)",
    keyInsight: "dp[i][j] = dp[i-1][j-1] if match else 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]).",
    timeComp: "O(M * N)",
    spaceComp: "O(min(M, N))"
  },
  {
    id: "dsa_35",
    title: "Longest Increasing Subsequence",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/longest-increasing-subsequence/",
    pattern: "Patience Sorting / Binary Search",
    keyInsight: "Maintain array of smallest tail values for increasing subsequences. Binary search to update tails.",
    timeComp: "O(N log N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_36",
    title: "Coin Change",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/coin-change/",
    pattern: "1D Bottom-Up DP (Unbounded Knapsack)",
    keyInsight: "dp[a] = min(dp[a], 1 + dp[a - coin]) for each coin.",
    timeComp: "O(Amount * Coins)",
    spaceComp: "O(Amount)"
  },
  {
    id: "dsa_37",
    title: "Burst Balloons",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/burst-balloons/",
    pattern: "Interval DP (Reverse Elimination)",
    keyInsight: "Consider which balloon is the LAST to burst in range (i, j).",
    timeComp: "O(N^3)",
    spaceComp: "O(N^2)"
  },

  // Google Algorithmic System Design
  {
    id: "dsa_38",
    title: "Snapshot Array",
    topic: "Google Algorithmic System Design",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/snapshot-array/",
    pattern: "Binary Search on Versioned Array History",
    keyInsight: "For each index, store (snap_id, val). In get(), binary search for upper bound snap_id.",
    timeComp: "O(1) set & snap, O(log S) get",
    spaceComp: "O(Total Sets)"
  },
  {
    id: "dsa_39",
    title: "Logger Rate Limiter",
    topic: "Google Algorithmic System Design",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/logger-rate-limiter/",
    pattern: "Hash Table Timestamp Window",
    keyInsight: "Map message to next allowed timestamp (timestamp + 10). Reject if current < allowed.",
    timeComp: "O(1)",
    spaceComp: "O(Distinct Messages)"
  },
  {
    id: "dsa_40",
    title: "Random Pick with Weight",
    topic: "Google Algorithmic System Design",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/random-pick-with-weight/",
    pattern: "Prefix Sum + Binary Search (bisect)",
    keyInsight: "Calculate running prefix sum of weights. Generate uniform random int in [1, totalSum], binary search bucket.",
    timeComp: "O(N) init, O(log N) pick",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_41",
    title: "Sentence Screen Fitting",
    topic: "Google Algorithmic System Design",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/sentence-screen-fitting/",
    pattern: "String Pointer & Jump Table",
    keyInsight: "Join sentence with spaces. Advance pointer by cols each row; adjust for word boundary breaks.",
    timeComp: "O(Rows + Words * MaxLen)",
    spaceComp: "O(Sentence Length)"
  }
];
