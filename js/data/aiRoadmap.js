// Google & FAANG AI Engineer & ML Engineer Mastery Roadmap
export const AI_MODULES = [
  "Math & Deep Learning Foundations",
  "Transformer Architecture from Scratch",
  "LLM Engineering (Fine-tuning & SFT)",
  "Modern RAG & Vector Systems",
  "AI Inference & Systems Engineering",
  "Agentic AI & Tool Use",
  "ML System Design for FAANG"
];

export const DEFAULT_AI_STEPS = [
  { id: "ai_step_theory", title: "1. Core Mathematical Theory", desc: "Master equations, loss functions, tensor shapes, and derivations without hand-waving." },
  { id: "ai_step_scratch", title: "2. Build From Scratch in Python/PyTorch", desc: "Implement the primitive or layer using raw PyTorch/NumPy without high-level library wrappers." },
  { id: "ai_step_perf", title: "3. Computational & Memory Bottlenecks", desc: "Analyze FLOPs, memory footprint (KV cache size, VRAM, O(N^2) vs O(N) context)." },
  { id: "ai_step_prod", title: "4. Production Edge Cases & Scaling", desc: "Address numerical stability, bfloat16/FP8 precision, latency, throughput, and error recovery." },
  { id: "ai_step_interview", title: "5. FAANG AI System Design Presentation", desc: "Explain the architecture, trade-offs, and alternatives clearly as if answering an interviewer." }
];

export const INITIAL_AI_TOPICS = [
  {
    id: "ai_1",
    title: "Tensors, Autograd & Backpropagation from Scratch",
    module: "Math & Deep Learning Foundations",
    difficulty: "Medium",
    importance: "Fundamental",
    keyConcepts: "Computation graph (DAG), Jacobian-vector products, Chain rule, Gradient accumulation, Numerical stability.",
    practicalExercise: "Build a micro-grad engine (scalar autograd with backward() pass for MLP) in pure Python."
  },
  {
    id: "ai_2",
    title: "Self-Attention & Multi-Head Attention (MHA) Layer",
    module: "Transformer Architecture from Scratch",
    difficulty: "Hard",
    importance: "Core FAANG",
    keyConcepts: "Q, K, V projections, Scaled Dot-Product Attention, Softmax scaling (1/sqrt(d_k)), Attention masking, Head splitting & merging.",
    practicalExercise: "Implement MultiHeadAttention module in PyTorch with causal attention mask from raw matrix multiplications."
  },
  {
    id: "ai_3",
    title: "Positional Embeddings (Sinusoidal vs RoPE)",
    module: "Transformer Architecture from Scratch",
    difficulty: "Medium",
    importance: "Modern Standard",
    keyConcepts: "Rotary Position Embedding (RoPE), complex number rotation in 2D pairs, relative distance preservation, context extension.",
    practicalExercise: "Code RoPE embedding logic and apply it to Q and K tensors before computing attention."
  },
  {
    id: "ai_4",
    title: "KV Caching & Autoregressive Decoding Mechanics",
    module: "Transformer Architecture from Scratch",
    difficulty: "Hard",
    importance: "Google / FAANG Peak",
    keyConcepts: "Prefill phase vs Decode phase, memory calculation of KV cache (2 * 2 * n_layers * n_heads * d_head * seq_len bytes), quadratic to linear per-token generation.",
    practicalExercise: "Write a naive decoder loop with and without KV cache to measure token-generation latency speedup."
  },
  {
    id: "ai_5",
    title: "Parameter-Efficient Fine-Tuning (LoRA & QLoRA)",
    module: "LLM Engineering (Fine-tuning & SFT)",
    difficulty: "Medium",
    importance: "High",
    keyConcepts: "Low-Rank Adaptation: W = W0 + (B * A) * (alpha / r), rank r choice, frozen base weights, 4-bit NormalFloat (NF4), double quantization.",
    practicalExercise: "Implement a custom LoRALinear layer in PyTorch replacing standard nn.Linear."
  },
  {
    id: "ai_6",
    title: "Alignment & Preference Optimization (DPO & RLHF)",
    module: "LLM Engineering (Fine-tuning & SFT)",
    difficulty: "Hard",
    importance: "Modern FAANG",
    keyConcepts: "Reward model training, PPO vs Direct Preference Optimization (DPO), implicit reward derivation from policy and reference models, KL divergence penalty.",
    practicalExercise: "Write the DPO loss function in PyTorch given chosen and rejected log-probabilities."
  },
  {
    id: "ai_7",
    title: "Production RAG: Chunking, Dense & Sparse Retrieval, Re-ranking",
    module: "Modern RAG & Vector Systems",
    difficulty: "Medium",
    importance: "Universal Industry",
    keyConcepts: "Semantic chunking, ColBERT / Cross-Encoder re-rankers, Reciprocal Rank Fusion (RRF) combining BM25 and vector cosine similarity, lost-in-the-middle phenomenon.",
    practicalExercise: "Build an end-to-end hybrid retrieval pipeline combining lexical BM25 and vector embeddings with a reranking step."
  },
  {
    id: "ai_8",
    title: "Vector Search Algorithms (HNSW & IVFPQ)",
    module: "Modern RAG & Vector Systems",
    difficulty: "Hard",
    importance: "Core Systems",
    keyConcepts: "Hierarchical Navigable Small World (HNSW), skip-list graph layering, Inverted File Index with Product Quantization (IVF-PQ), recall vs query latency trade-off.",
    practicalExercise: "Trace HNSW multi-layer greedy routing and compare memory savings of 8x vector compression via Product Quantization."
  },
  {
    id: "ai_9",
    title: "AI Inference Engines: PagedAttention, vLLM & Continuous Batching",
    module: "AI Inference & Systems Engineering",
    difficulty: "Hard",
    importance: "Top FAANG",
    keyConcepts: "KV cache fragmentation problem, virtual memory paging analogy for GPU VRAM, non-contiguous block tables, dynamic request preemption.",
    practicalExercise: "Diagram PagedAttention block tables and calculate memory waste reduction from 70% to under 4%."
  },
  {
    id: "ai_10",
    title: "Model Quantization Techniques (AWQ, GPTQ, FP8)",
    module: "AI Inference & Systems Engineering",
    difficulty: "Hard",
    importance: "Top FAANG",
    keyConcepts: "Activation-aware Weight Quantization (AWQ), protecting salient 1% weight channels, INT4 weight packing, FP8 E4M3 vs E5M2 GEMM acceleration.",
    practicalExercise: "Implement min-max symmetric per-channel quantization and dequantization functions in Python."
  },
  {
    id: "ai_11",
    title: "Agentic Architecture: ReAct, Tool Calling & Plan-and-Execute",
    module: "Agentic AI & Tool Use",
    difficulty: "Medium",
    importance: "High",
    keyConcepts: "Thought-Action-Observation loops, JSON Schema tool declarations, constrained decoding / grammar sampling, loop termination, self-reflection.",
    practicalExercise: "Code a resilient ReAct loop agent with error handling and maximum iteration guardrails from scratch."
  },
  {
    id: "ai_12",
    title: "ML System Design: Real-time Multi-Stage Recommendation System",
    module: "ML System Design for FAANG",
    difficulty: "Hard",
    importance: "Google Peak",
    keyConcepts: "Two-tower embedding models (User Tower & Item Tower), candidate generation (retrieving top 1000 from 100M items in <10ms), scoring/ranking with GBDT/DNN, re-ranking/diversity filtering.",
    practicalExercise: "Design architecture diagram, SLA latency budget table (100ms total budget), feature store design, and offline/online evaluation metrics."
  }
];
