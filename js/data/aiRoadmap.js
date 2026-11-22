// Google & FAANG AI Engineer & ML Engineer Mastery Roadmap with Hourly Breakdown

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
  { id: "ai_step_theory", title: "1. Core Mathematical Theory", desc: "Derive loss functions, tensor shapes, gradient equations, and matrix multiplications." },
  { id: "ai_step_scratch", title: "2. Build From Scratch in Python/PyTorch", desc: "Write raw Python/PyTorch implementations without high-level library abstractions." },
  { id: "ai_step_perf", title: "3. Computational & Memory Bottlenecks", desc: "Calculate VRAM usage, KV cache sizes, FLOPs, and latency scaling bounds." },
  { id: "ai_step_prod", title: "4. Production Edge Cases & Scaling", desc: "Handle precision (bfloat16, FP8), numerical stability, and distributed training constraints." },
  { id: "ai_step_interview", title: "5. FAANG System Design Defense", desc: "Articulate architecture trade-offs clearly as if defending in a Google interview." }
];

export const INITIAL_AI_TOPICS = [
  {
    id: "ai_1",
    title: "Tensors, Autograd & Backpropagation from Scratch",
    module: "Math & Deep Learning Foundations",
    difficulty: "Medium",
    importance: "Fundamental",
    estimatedHours: 3,
    hourlySchedule: [
      { hour: "Hour 1 (Math)", task: "Derive chain rule for computational graph (DAG) and Jacobian-vector products on paper." },
      { hour: "Hour 2 (Code)", task: "Code a micro-grad engine (scalar autograd with backward() pass for MLP) in pure Python." },
      { hour: "Hour 3 (Analysis)", task: "Test numerical gradient checking and analyze vanishing/exploding gradients." }
    ],
    keyConcepts: "Computation graph (DAG), Jacobian-vector products, Chain rule, Gradient accumulation, Numerical stability.",
    practicalExercise: "Build a micro-grad engine (scalar autograd with backward() pass for MLP) in pure Python."
  },
  {
    id: "ai_2",
    title: "Self-Attention & Multi-Head Attention (MHA) Layer",
    module: "Transformer Architecture from Scratch",
    difficulty: "Hard",
    importance: "Core FAANG",
    estimatedHours: 3.5,
    hourlySchedule: [
      { hour: "Hour 1 (Math)", task: "Derive Q, K, V projection formulas, scaled dot-product attention equation, and softmax scaling 1/sqrt(d_k)." },
      { hour: "Hour 2 (Code)", task: "Implement MultiHeadAttention module in PyTorch with causal attention mask from raw matrix multiplications." },
      { hour: "Hour 3 (Systems)", task: "Profile attention memory footprint O(N^2) vs O(N) context length scaling." }
    ],
    keyConcepts: "Q, K, V projections, Scaled Dot-Product Attention, Softmax scaling (1/sqrt(d_k)), Attention masking, Head splitting & merging.",
    practicalExercise: "Implement MultiHeadAttention module in PyTorch with causal attention mask from raw matrix multiplications."
  },
  {
    id: "ai_3",
    title: "Positional Embeddings (Sinusoidal vs RoPE)",
    module: "Transformer Architecture from Scratch",
    difficulty: "Medium",
    importance: "Modern Standard",
    estimatedHours: 2.5,
    hourlySchedule: [
      { hour: "Hour 1 (Math)", task: "Understand Rotary Position Embedding (RoPE) complex 2D rotation geometry." },
      { hour: "Hour 2 (Code)", task: "Code RoPE embedding logic and apply it to Q and K tensors before computing dot products." }
    ],
    keyConcepts: "Rotary Position Embedding (RoPE), complex number rotation in 2D pairs, relative distance preservation, context extension.",
    practicalExercise: "Code RoPE embedding logic and apply it to Q and K tensors before computing attention."
  },
  {
    id: "ai_4",
    title: "KV Caching & Autoregressive Decoding Mechanics",
    module: "Transformer Architecture from Scratch",
    difficulty: "Hard",
    importance: "Google Peak",
    estimatedHours: 3,
    hourlySchedule: [
      { hour: "Hour 1 (Theory)", task: "Understand Prefill vs Decode phase. Calculate exact memory footprint formula: 2 * 2 * n_layers * n_heads * d_head * seq_len bytes." },
      { hour: "Hour 2 (Code)", task: "Write a naive autoregressive generation loop with and without KV cache in PyTorch to measure latency speedup." },
      { hour: "Hour 3 (Systems)", task: "Analyze GPU memory bandwidth saturation (memory-bound decode phase vs compute-bound prefill)." }
    ],
    keyConcepts: "Prefill phase vs Decode phase, memory calculation of KV cache, quadratic to linear per-token generation speedup.",
    practicalExercise: "Write a naive decoder loop with and without KV cache to measure token-generation latency speedup."
  },
  {
    id: "ai_5",
    title: "Parameter-Efficient Fine-Tuning (LoRA & QLoRA)",
    module: "LLM Engineering (Fine-tuning & SFT)",
    difficulty: "Medium",
    importance: "High",
    estimatedHours: 3,
    hourlySchedule: [
      { hour: "Hour 1 (Math)", task: "Derive low-rank matrix decomposition: W = W0 + (B * A) * (alpha / r), analyze parameter reduction." },
      { hour: "Hour 2 (Code)", task: "Implement a custom LoRALinear layer in PyTorch replacing standard nn.Linear." },
      { hour: "Hour 3 (Practice)", task: "Examine 4-bit NormalFloat (NF4) quantization and double quantization in QLoRA." }
    ],
    keyConcepts: "Low-Rank Adaptation: W = W0 + (B * A) * (alpha / r), rank r choice, frozen base weights, 4-bit NormalFloat (NF4).",
    practicalExercise: "Implement a custom LoRALinear layer in PyTorch replacing standard nn.Linear."
  },
  {
    id: "ai_6",
    title: "Alignment & Preference Optimization (DPO & RLHF)",
    module: "LLM Engineering (Fine-tuning & SFT)",
    difficulty: "Hard",
    importance: "Modern FAANG",
    estimatedHours: 3,
    hourlySchedule: [
      { hour: "Hour 1 (Theory)", task: "Study Bradley-Terry preference model, PPO actor-critic architecture, and DPO closed-form derivation." },
      { hour: "Hour 2 (Code)", task: "Code DPO loss function in PyTorch from chosen and rejected log-probability tensors." }
    ],
    keyConcepts: "Reward model training, PPO vs Direct Preference Optimization (DPO), implicit reward derivation from policy and reference models.",
    practicalExercise: "Write the DPO loss function in PyTorch given chosen and rejected log-probabilities."
  },
  {
    id: "ai_7",
    title: "Production RAG: Chunking, Dense & Sparse Retrieval, Re-ranking",
    module: "Modern RAG & Vector Systems",
    difficulty: "Medium",
    importance: "Universal Industry",
    estimatedHours: 2.5,
    hourlySchedule: [
      { hour: "Hour 1 (Architecture)", task: "Understand semantic chunking, reciprocal rank fusion (RRF), and cross-encoder re-ranking." },
      { hour: "Hour 2 (Code)", task: "Build a Python pipeline combining BM25 keyword score with embedding cosine similarity." }
    ],
    keyConcepts: "Semantic chunking, ColBERT / Cross-Encoder re-rankers, Reciprocal Rank Fusion (RRF), lost-in-the-middle phenomenon.",
    practicalExercise: "Build an end-to-end hybrid retrieval pipeline combining lexical BM25 and vector embeddings with a reranking step."
  },
  {
    id: "ai_8",
    title: "AI Inference Engines: PagedAttention, vLLM & Continuous Batching",
    module: "AI Inference & Systems Engineering",
    difficulty: "Hard",
    importance: "Top FAANG",
    estimatedHours: 3.5,
    hourlySchedule: [
      { hour: "Hour 1 (Architecture)", task: "Study virtual memory paging analogy for GPU VRAM, internal vs external memory fragmentation." },
      { hour: "Hour 2 (Systems)", task: "Diagram vLLM block tables, non-contiguous physical memory allocation, and continuous iteration batching." },
      { hour: "Hour 3 (Design)", task: "Compare static padding waste vs PagedAttention memory utilization (>96%)." }
    ],
    keyConcepts: "KV cache fragmentation problem, virtual memory paging analogy for GPU VRAM, non-contiguous block tables, continuous batching.",
    practicalExercise: "Diagram PagedAttention block tables and calculate memory waste reduction from 70% to under 4%."
  },
  {
    id: "ai_9",
    title: "Model Quantization Techniques (AWQ, GPTQ, FP8)",
    module: "AI Inference & Systems Engineering",
    difficulty: "Hard",
    importance: "Top FAANG",
    estimatedHours: 3,
    hourlySchedule: [
      { hour: "Hour 1 (Math)", task: "Derive symmetric vs asymmetric quantization, zero-point and scale factor calculations." },
      { hour: "Hour 2 (Code)", task: "Write min-max INT8 quantize and dequantize functions in Python." },
      { hour: "Hour 3 (Theory)", task: "Study Activation-aware Weight Quantization (AWQ) protecting salient 1% channel weights." }
    ],
    keyConcepts: "Activation-aware Weight Quantization (AWQ), protecting salient 1% weight channels, INT4 weight packing, FP8 GEMM acceleration.",
    practicalExercise: "Implement min-max symmetric per-channel quantization and dequantization functions in Python."
  },
  {
    id: "ai_10",
    title: "ML System Design: Real-time Multi-Stage Recommendation System",
    module: "ML System Design for FAANG",
    difficulty: "Hard",
    importance: "Google Peak",
    estimatedHours: 4,
    hourlySchedule: [
      { hour: "Hour 1 (Requirements)", task: "Establish latency budget (100ms total), throughput (50,000 QPS), candidate pool (100M items to 1000 items)." },
      { hour: "Hour 2 (Two-Tower)", task: "Design user-tower and item-tower architecture, offline embedding indexing via HNSW." },
      { hour: "Hour 3 (Scoring)", task: "Multi-task ranking model (GBDT/DNN) predicting pCTR and pCVR, real-time feature store design." },
      { hour: "Hour 4 (Re-ranking)", task: "Diversity filtering, exploration vs exploitation (multi-armed bandits), and online A/B testing framework." }
    ],
    keyConcepts: "Two-tower embedding models (User Tower & Item Tower), candidate retrieval via HNSW, scoring/ranking DNN, diversity filtering.",
    practicalExercise: "Design architecture diagram, SLA latency budget table (100ms total), and feature store design."
  }
];
