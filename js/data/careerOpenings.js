// FAANG & Top Tech Career Openings Directory (India & Global)
// Specifically targeting: AI Engineer, Machine Learning Engineer, Software Developer

export const TARGET_ROLE_CATEGORIES = [
  "All Roles",
  "AI Engineer",
  "Machine Learning Engineer",
  "Software Developer"
];

export const LOCATION_FILTERS = [
  "All Locations",
  "India (Bengaluru, Hyderabad, Pune, Gurugram)",
  "Global / Remote"
];

export const INITIAL_JOB_OPENINGS = [
  // Google Roles (Dedicated Section)
  {
    id: "job_goog_1",
    company: "Google",
    isGoogle: true,
    title: "Software Engineer III, Generative AI & Machine Learning",
    roleCategory: "AI Engineer",
    location: "Bengaluru, Karnataka, India",
    region: "India",
    team: "Google Cloud / DeepMind Applied",
    experienceLevel: "Mid-Level (3+ years)",
    applyUrl: "https://careers.google.com/jobs/results/?q=Software%20Engineer%20AI&location=India",
    sourcePortal: "Google Careers Official",
    postedDate: "Updated Today",
    description: "Design and scale deep learning inference pipelines and Gemini-powered infrastructure for enterprise systems.",
    qualifications: "B.Tech/M.Tech in CS or related field. Proficiency in Python/C++, PyTorch or JAX, distributed model serving.",
    applyPriority: "High (Recommended to Apply Today)"
  },
  {
    id: "job_goog_2",
    company: "Google",
    isGoogle: true,
    title: "Software Engineer, Core Systems & Algorithms",
    roleCategory: "Software Developer",
    location: "Hyderabad, Telangana, India",
    region: "India",
    team: "Google Search & Core Infrastructure",
    experienceLevel: "Early to Mid-Level (1-4 years)",
    applyUrl: "https://careers.google.com/jobs/results/?q=Software%20Engineer&location=India",
    sourcePortal: "Google Careers Official",
    postedDate: "Updated Today",
    description: "Build ultra-scale backend distributed systems handling hundreds of thousands of queries per second with millisecond latency.",
    qualifications: "Solid foundations in Data Structures, Algorithms, C++, Java or Go, concurrency and distributed system architecture.",
    applyPriority: "High (Recommended to Apply Today)"
  },
  {
    id: "job_goog_3",
    company: "Google",
    isGoogle: true,
    title: "Machine Learning Engineer, Search Ranking & Retrieval",
    roleCategory: "Machine Learning Engineer",
    location: "Bengaluru, Karnataka, India",
    region: "India",
    team: "Google Research & Search Ranking",
    experienceLevel: "Mid to Senior",
    applyUrl: "https://careers.google.com/jobs/results/?q=Machine%20Learning%20Engineer&location=India",
    sourcePortal: "Google Careers Official",
    postedDate: "Featured Opening",
    description: "Develop dense retrieval algorithms, vector embeddings, and two-tower recommendation pipelines for billions of daily queries.",
    qualifications: "Deep understanding of transformers, HNSW vector search, recommender architectures, and large-scale PyTorch/TensorFlow pipelines.",
    applyPriority: "High (Recommended to Apply Today)"
  },
  {
    id: "job_goog_4",
    company: "Google",
    isGoogle: true,
    title: "Software Engineer, Machine Learning Systems & TPU Accelerators",
    roleCategory: "AI Engineer",
    location: "Sunnyvale, CA, USA / Remote Global",
    region: "Global",
    team: "Google Cloud TPU Infrastructure",
    experienceLevel: "Mid-Level",
    applyUrl: "https://careers.google.com/jobs/results/?q=Software%20Engineer%20TPU",
    sourcePortal: "Google Careers Official",
    postedDate: "Recent",
    description: "Optimize high-throughput model training and inference pipelines for multi-node TPU v5e/v5p superclusters.",
    qualifications: "Experience in CUDA, XLA compilation, PyTorch, C++, and hardware accelerator kernel optimization.",
    applyPriority: "Standard"
  },

  // Microsoft
  {
    id: "job_msft_1",
    company: "Microsoft",
    isGoogle: false,
    title: "Software Engineer II - Azure AI Platform",
    roleCategory: "AI Engineer",
    location: "Bengaluru / Hyderabad, India",
    region: "India",
    team: "Azure Cognitive Services & OpenAI Platform",
    experienceLevel: "2+ years",
    applyUrl: "https://careers.microsoft.com/us/en/search-results?q=Software%20Engineer%20AI&location=India",
    sourcePortal: "Microsoft Careers",
    postedDate: "Updated Today",
    description: "Build high-availability gateway services and real-time fine-tuning pipelines powering Azure OpenAI enterprise instances.",
    qualifications: "Proficiency in C#, Python, distributed microservices, Docker/Kubernetes, and cloud scalability.",
    applyPriority: "Recommended to Apply Today"
  },
  {
    id: "job_msft_2",
    company: "Microsoft",
    isGoogle: false,
    title: "Software Development Engineer - Core Cloud & Edge",
    roleCategory: "Software Developer",
    location: "Hyderabad, Telangana, India",
    region: "India",
    team: "Cloud & AI Engineering Group",
    experienceLevel: "1-3 years",
    applyUrl: "https://careers.microsoft.com/us/en/search-results?q=Software%20Engineer&location=Hyderabad",
    sourcePortal: "Microsoft Careers",
    postedDate: "Recent",
    description: "Design low-latency distributed storage subsystems and high-throughput networking pipelines for Azure global datacenters.",
    qualifications: "Strong algorithmic problem-solving skills, object-oriented design in Java or C++, multithreading, and OS internals.",
    applyPriority: "Standard"
  },

  // Amazon
  {
    id: "job_amzn_1",
    company: "Amazon",
    isGoogle: false,
    title: "Software Development Engineer (SDE II)",
    roleCategory: "Software Developer",
    location: "Bengaluru, Karnataka, India",
    region: "India",
    team: "Amazon Fulfillment & Supply Chain Optimization",
    experienceLevel: "2-5 years",
    applyUrl: "https://www.amazon.jobs/en/search?base_query=SDE+II&loc_query=Bangalore%2C+India",
    sourcePortal: "Amazon Jobs Official",
    postedDate: "Updated Today",
    description: "Own customer-facing scalable services with strict 99.999% availability SLAs and automated fulfillment routing.",
    qualifications: "Mastery of DSA, Object-Oriented Design, Java or C++, relational & DynamoDB NoSQL databases.",
    applyPriority: "Recommended to Apply Today"
  },
  {
    id: "job_amzn_2",
    company: "Amazon",
    isGoogle: false,
    title: "Applied Scientist / ML Engineer - Generative AI",
    roleCategory: "Machine Learning Engineer",
    location: "Bengaluru / Hyderabad, India",
    region: "India",
    team: "Amazon AGI & Alexa AI",
    experienceLevel: "Mid-Level",
    applyUrl: "https://www.amazon.jobs/en/search?base_query=Applied+Scientist&loc_query=India",
    sourcePortal: "Amazon Jobs Official",
    postedDate: "Updated Today",
    description: "Research and implement foundation model fine-tuning, RAG retrieval architectures, and multimodal evaluation benchmarks.",
    qualifications: "M.S. or B.Tech in CS with strong publication or production ML record. PyTorch, LoRA, and LLM serving frameworks.",
    applyPriority: "High (Recommended to Apply Today)"
  },

  // Meta
  {
    id: "job_meta_1",
    company: "Meta",
    isGoogle: false,
    title: "Software Engineer - Infrastructure & AI Foundations",
    roleCategory: "Software Developer",
    location: "Gurugram / Remote, India",
    region: "India",
    team: "Meta Infrastructure & Monetization Core",
    experienceLevel: "Mid to Senior",
    applyUrl: "https://www.metacareers.com/jobs?q=Software%20Engineer&location=India",
    sourcePortal: "Meta Careers Official",
    postedDate: "Recent",
    description: "Develop global infrastructure services powering WhatsApp, Instagram, and core advertising auction engines.",
    qualifications: "Expertise in C++, Python, algorithms, Linux kernel profiling, and high-concurrency systems.",
    applyPriority: "Standard"
  },
  {
    id: "job_meta_2",
    company: "Meta",
    isGoogle: false,
    title: "Machine Learning Engineer - Content Understanding & LLMs",
    roleCategory: "Machine Learning Engineer",
    location: "London, UK / Remote Global",
    region: "Global",
    team: "Meta GenAI / LLaMA Foundation",
    experienceLevel: "Mid-Level",
    applyUrl: "https://www.metacareers.com/jobs?q=Machine%20Learning%20Engineer",
    sourcePortal: "Meta Careers Official",
    postedDate: "Recent",
    description: "Build next-generation LLaMA model fine-tuning, synthetic data generation, and low-latency inference pipelines.",
    qualifications: "Deep knowledge of transformer backbones, distributed training (FSDP, Megatron-LM), and PyTorch internals.",
    applyPriority: "Standard"
  },

  // Apple
  {
    id: "job_appl_1",
    company: "Apple",
    isGoogle: false,
    title: "Machine Learning Engineer - On-Device Intelligence",
    roleCategory: "Machine Learning Engineer",
    location: "Bengaluru, Karnataka, India",
    region: "India",
    team: "Apple Intelligence Group",
    experienceLevel: "2+ years",
    applyUrl: "https://jobs.apple.com/en-in/search?search=Machine%20Learning%20Engineer&location=india-INDC",
    sourcePortal: "Apple Careers Official",
    postedDate: "Updated Today",
    description: "Design efficient on-device neural network architectures, INT4/FP8 quantization, and Neural Engine optimization.",
    qualifications: "Experience in CoreML, PyTorch, C++, and low-power hardware inference performance tuning.",
    applyPriority: "Recommended to Apply Today"
  },

  // NVIDIA
  {
    id: "job_nvda_1",
    company: "NVIDIA",
    isGoogle: false,
    title: "System Software Engineer - Deep Learning & TensorRT",
    roleCategory: "AI Engineer",
    location: "Bengaluru / Pune, India",
    region: "India",
    team: "NVIDIA TensorRT & CUDA Algorithms",
    experienceLevel: "2-6 years",
    applyUrl: "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite?q=Software%20Engineer%20India",
    sourcePortal: "NVIDIA Careers Official",
    postedDate: "Updated Today",
    description: "Engineer custom GPU CUDA kernels, FlashAttention optimizations, and TensorRT-LLM inference engines.",
    qualifications: "Proficiency in modern C++, CUDA C/C++, GPU memory hierarchy, and deep learning framework internals.",
    applyPriority: "High (Recommended to Apply Today)"
  },

  // Uber
  {
    id: "job_uber_1",
    company: "Uber",
    isGoogle: false,
    title: "Software Engineer II - Maps & Routing Algorithms",
    roleCategory: "Software Developer",
    location: "Bengaluru / Hyderabad, India",
    region: "India",
    team: "Uber Core Marketplace & Routing",
    experienceLevel: "2-4 years",
    applyUrl: "https://www.uber.com/in/en/careers/list/?location=IND-Bengaluru",
    sourcePortal: "Uber Careers Official",
    postedDate: "Recent",
    description: "Develop graph partitioning and real-time shortest path dynamic algorithms computing millions of driver matchings per minute.",
    qualifications: "Exceptional mastery of graph theory, Dijkstra, Contraction Hierarchies, Java/Go, and microservices.",
    applyPriority: "Standard"
  }
];
