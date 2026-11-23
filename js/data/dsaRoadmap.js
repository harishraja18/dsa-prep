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
  },
  {
    id: "dsa_42",
    title: "Sliding Window Maximum",
    topic: "Two Pointers & Sliding Window",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/sliding-window-maximum/",
    pattern: "Monotonic Decreasing Deque",
    keyInsight: "Maintain a double-ended queue storing indices in decreasing order of element values. Pop indices older than window start from front; pop indices with values smaller than current from back.",
    timeComp: "O(N)",
    spaceComp: "O(K)"
  },
  {
    id: "dsa_43",
    title: "Largest Rectangle in Histogram",
    topic: "Stack & Queue (Monotonic)",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    pattern: "Monotonic Increasing Stack",
    keyInsight: "Maintain stack of increasing bar heights. When a smaller bar arrives, pop the top and calculate the area with popped bar as the bottleneck height across window (current_i - stack.peek() - 1).",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_44",
    title: "Burst Balloons",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/burst-balloons/",
    pattern: "Interval Dynamic Programming (Inside-Out)",
    keyInsight: "Pad array with 1 at both boundaries. In interval (left, right), consider which balloon k is burst LAST. Subproblems (left, k) and (k, right) become completely independent.",
    timeComp: "O(N^3)",
    spaceComp: "O(N^2)"
  },
  {
    id: "dsa_45",
    title: "Regular Expression Matching",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/regular-expression-matching/",
    pattern: "2D Dynamic Programming with '*' Wildcards",
    keyInsight: "dp[i][j] stores whether s[0..i-1] matches p[0..j-1]. When p[j-1] == '*', it matches 0 preceding characters (dp[i][j-2]) or 1+ preceding characters if characters match.",
    timeComp: "O(M * N)",
    spaceComp: "O(M * N)"
  },
  {
    id: "dsa_46",
    title: "Binary Tree Maximum Path Sum",
    topic: "Trees & Binary Search Trees",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    pattern: "Post-Order Tree DFS with Global Maximum",
    keyInsight: "At each node, compute max gain from left and right child (clamped at 0). Update global answer with node.val + leftGain + rightGain. Return node.val + max(leftGain, rightGain) to parent.",
    timeComp: "O(N)",
    spaceComp: "O(Height)"
  },
  {
    id: "dsa_47",
    title: "Serialize and Deserialize Binary Tree",
    topic: "Trees & Binary Search Trees",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    pattern: "Pre-order Traversal Encoding with Sentinel Nulls",
    keyInsight: "Encode binary tree as comma-separated string with 'null' placeholders. In deserialization, tokenize into queue and reconstruct recursively in pre-order.",
    timeComp: "O(N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_48",
    title: "Alien Dictionary",
    topic: "Graphs & Topological Sort",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/alien-dictionary/",
    pattern: "Topological Sort (Kahn's BFS / DFS Post-Order) with Cycle Detection",
    keyInsight: "Compare adjacent lexicographical words to extract directed edge (c1 -> c2) at the first mismatching character. Build graph and run topological sort; if cycle detected, ordering is invalid.",
    timeComp: "O(Total Characters)",
    spaceComp: "O(Unique Letters)"
  },
  {
    id: "dsa_49",
    title: "Critical Connections in a Network (Tarjan's Bridges)",
    topic: "Graphs & Topological Sort",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/critical-connections-in-a-network/",
    pattern: "Tarjan's Bridge-Finding DFS with Discovery & Lowest Timestamps",
    keyInsight: "Assign discovery time to each node. Edge (u, v) is a critical bridge if low[v] > discovery[u], meaning v has no back-edge reaching u or its ancestors.",
    timeComp: "O(V + E)",
    spaceComp: "O(V + E)"
  },
  {
    id: "dsa_50",
    title: "Reconstruct Itinerary",
    topic: "Graphs & Topological Sort",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/reconstruct-itinerary/",
    pattern: "Hierholzer's Eulerian Path Algorithm with Priority Queue",
    keyInsight: "Build adjacency list with min-heaps to guarantee lexicographical order. Run DFS until stuck; push current airport to result stack and reverse at end.",
    timeComp: "O(E log E)",
    spaceComp: "O(V + E)"
  },
  {
    id: "dsa_51",
    title: "Design Search Autocomplete System",
    topic: "Google Algorithmic System Design",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/design-search-autocomplete-system/",
    pattern: "Trie with Top-3 Frequency Min-Heap at Each Node",
    keyInsight: "At every Trie node along the prefix path, maintain a min-heap or sorted list of the top 3 hot sentences. Updating a sentence frequency updates nodes in O(Prefix Length).",
    timeComp: "Input: O(Prefix), Add: O(L log 3)",
    spaceComp: "O(Total Characters in Sentences)"
  },
  {
    id: "dsa_52",
    title: "Median of Two Sorted Arrays",
    topic: "Binary Search",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    pattern: "Binary Search on Partition Cut (Divide and Conquer)",
    keyInsight: "Perform binary search on the smaller array to partition both arrays such that left halves and right halves have equal size, and max(left1, left2) <= min(right1, right2).",
    timeComp: "O(log(min(M, N)))",
    spaceComp: "O(1)"
  },
  {
    id: "dsa_53",
    title: "Word Search II",
    topic: "Tries & Prefix Trees",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/word-search-ii/",
    pattern: "Backtracking DFS with Prefix Trie Pruning",
    keyInsight: "Insert word dictionary into a Trie. When exploring 2D grid with DFS, immediately prune branches if current prefix does not exist in the Trie. Store completed word at leaf nodes.",
    timeComp: "O(M * N * 3^L)",
    spaceComp: "O(Total Characters in Words)"
  },
  {
    id: "dsa_54",
    title: "LFU Cache (Least Frequently Used)",
    topic: "Google Algorithmic System Design",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/lfu-cache/",
    pattern: "Double Hash Map + Frequency Doubly Linked Lists",
    keyInsight: "Map key -> Node, and freq -> DoublyLinkedList. Track minFreq. When capacity is exceeded, evict from tail of minFreq list in O(1) time.",
    timeComp: "O(1) get & put",
    spaceComp: "O(Capacity)"
  },
  {
    id: "dsa_55",
    title: "Minimum Window Substring",
    topic: "Two Pointers & Sliding Window",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/minimum-window-substring/",
    pattern: "Two Pointers Sliding Window with Frequency Map & Required Count",
    keyInsight: "Expand right pointer until all characters in target string t are satisfied (formedCount == requiredUnique). Then contract left pointer while keeping window valid to minimize window length.",
    timeComp: "O(S + T)",
    spaceComp: "O(Unique Characters in S and T)"
  },
  {
    id: "dsa_56",
    title: "Find Median from Data Stream",
    topic: "Heaps & Priority Queue",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/find-median-from-data-stream/",
    pattern: "Two Balanced Heaps (Max-Heap Lower Half, Min-Heap Upper Half)",
    keyInsight: "Store lower half of numbers in max-heap and upper half in min-heap. Balance sizes so max-heap has at most 1 more element. Median is top of max-heap or average of both tops.",
    timeComp: "O(log N) addNum, O(1) findMedian",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_57",
    title: "Trapping Rain Water II (3D Elevation Grid)",
    topic: "Heaps & Priority Queue",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/trapping-rain-water-ii/",
    pattern: "Min-Heap Priority Queue BFS from Outer Boundaries",
    keyInsight: "Push all boundary cells into a min-heap. Pop cell with lowest height. For each unvisited neighbor, trapped water is max(0, height - neighborHeight). Push neighbor with max(height, neighborHeight).",
    timeComp: "O(M * N log(M * N))",
    spaceComp: "O(M * N)"
  },
  {
    id: "dsa_58",
    title: "Shortest Path to Get All Keys",
    topic: "Graphs & Topological Sort",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/shortest-path-to-get-all-keys/",
    pattern: "3D Breadth-First Search (BFS) with Bitmask State",
    keyInsight: "State is represented as (row, col, keysBitmask). When collecting key 'a'-'f', set corresponding bit with OR operation. Run BFS to find shortest path to full bitmask ((1 << k) - 1).",
    timeComp: "O(M * N * 2^K)",
    spaceComp: "O(M * N * 2^K)"
  },
  {
    id: "dsa_59",
    title: "Count of Smaller Numbers After Self",
    topic: "Binary Search",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
    pattern: "Merge Sort with Inversion Counting or Fenwick Tree (BIT)",
    keyInsight: "During merge sort on index array, when right element nums[r] is smaller than left element nums[l], it will be placed before nums[l]. When placing nums[l], increment count by number of right elements merged.",
    timeComp: "O(N log N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_60",
    title: "Maximal Rectangle in 2D Binary Matrix",
    topic: "Stack & Queue (Monotonic)",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/maximal-rectangle/",
    pattern: "Running Histogram Heights + Monotonic Stack",
    keyInsight: "For each row in matrix, update running heights array (height[j] = matrix[i][j] == '1' ? height[j] + 1 : 0). Run Largest Rectangle in Histogram algorithm on heights array for each row.",
    timeComp: "O(M * N)",
    spaceComp: "O(N)"
  },
  {
    id: "dsa_61",
    title: "Text Justification (Google Production Formatter)",
    topic: "Google Algorithmic System Design",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/text-justification/",
    pattern: "Greedy Line Partitioning with Fair Space Distribution",
    keyInsight: "Pack as many words as possible per line. Distribute spaces evenly among slots (spaces / slots + (slot < extra ? 1 : 0)). Handle last line and single-word lines with left justification.",
    timeComp: "O(Total Characters)",
    spaceComp: "O(Total Characters)"
  },
  {
    id: "dsa_62",
    title: "Minimum Cost to Cut a Stick",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
    pattern: "Interval Dynamic Programming with Coordinate Sorting",
    keyInsight: "Sort cuts array and pad with 0 and n. dp[i][j] represents min cost to make all cuts between cuts[i] and cuts[j]. For each intermediate cut k, cost is (cuts[j] - cuts[i]) + dp[i][k] + dp[k][j].",
    timeComp: "O(K^3)",
    spaceComp: "O(K^2)"
  },
  {
    id: "dsa_63",
    title: "Reverse Nodes in k-Group",
    topic: "Linked Lists",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/reverse-nodes-in-k-group/",
    pattern: "Iterative Subsegment Reversal with Dummy Head",
    keyInsight: "Count if at least k nodes remain. If so, reverse k nodes using standard 3-pointer reversal, reconnect previous group's tail to new head, and update previous pointer to new tail.",
    timeComp: "O(N)",
    spaceComp: "O(1)"
  },
  {
    id: "dsa_64",
    title: "Concatenated Words",
    topic: "Tries & Prefix Trees",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/concatenated-words/",
    pattern: "Trie + Memoized Word Break DP",
    keyInsight: "Sort words by length. For each word, test if it can be formed by shorter words already in Trie using DP / DFS. Then insert current word into Trie. Avoids checking word against itself.",
    timeComp: "O(N * L^2)",
    spaceComp: "O(Total Characters)"
  }
];
