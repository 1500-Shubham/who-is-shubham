// ─────────────────────────────────────────────────────────────
// Single source of truth for every word on the site.
// Edit here → the whole portfolio updates.
// ─────────────────────────────────────────────────────────────

export const links = {
  github: 'https://github.com/1500-Shubham',
  linkedin: 'https://www.linkedin.com/in/shubham-keshari-b543301aa',
  email: 'contactshubham1511@gmail.com',
  phone: '+91 93090 77697',
  phoneHref: 'tel:+919309077697',
  mira: 'https://github.com/1500-Shubham/MIRA-Your-Multimodal-Intelligent-Route-Assistant',
}

export const roles = [
  'I build agentic AI systems',
  'RAG over real banking policies',
  'Workflow orchestration at scale',
  'Full-stack platform architecture',
]

// running strip in the hero
export interface Client {
  name: string
  logo?: string
  initials?: string
  badgeBg?: string
}

export const clients: Client[] = [
  { name: 'YES Bank', logo: '/clients/yesbank.png' },
  { name: 'Fedfina', initials: 'F', badgeBg: 'linear-gradient(135deg, #0b4fa0, #f5a623)' },
  { name: 'Aditya Birla Finance (ABCL)', logo: '/clients/abcl.png' },
  { name: 'Credila', initials: 'C', badgeBg: 'linear-gradient(135deg, #0a58c4, #18b592)' },
  { name: 'Jio Cloud Platform', logo: '/clients/jiocloud.png' },
]

// the highlight-reel section
export const impact = {
  featured: {
    value: 5,
    suffix: '+',
    label: 'NBFCs run on Crediverse',
    detail:
      'One AI-driven loan platform serving five+ lenders — including Aditya Birla Finance, Credila, YES Bank and Fedfina — consolidated from multiple legacy systems into a single extensible product.',
  },
  stats: [
    { value: 50, suffix: '%+', label: 'AWS cost reduction', note: 'reusable workflow pipelines' },
    { value: 300, suffix: 'K+', label: 'km travel saved / yr', note: 'VideoPD remote verification' },
    { value: 1000, suffix: '+', label: 'concurrent sessions', note: 'SSH/RDP via Guacamole' },
    { value: 20, suffix: '+', label: 'environments observed', note: 'OpenTelemetry + SigNoz' },
    { value: 96, suffix: '%', label: 'ML triage accuracy', note: 'BERT over 10K+ tickets' },
    { value: 70, suffix: '%', label: 'test effort reduced', note: 'no-code Appium tooling' },
  ],
}

export interface Shot {
  src: string
  caption: string
}

export interface Job {
  company: string
  role: string
  dates: string
  kind: 'current' | 'fulltime' | 'internship'
  logoSrc?: string
  initials: string
  badgeBg: string
  bullets: string[]
  tags: string[]
  gallery: Shot[]
}

export const experience: Job[] = [
  {
    company: 'Newron.AI',
    role: 'AI Engineer',
    dates: 'Dec 2025 — Present',
    kind: 'current',
    logoSrc: '/logos/newron.png',
    initials: 'N',
    badgeBg: 'linear-gradient(135deg, #6c5ce7, #38b6ff)',
    bullets: [
      'Leading end-to-end architecture of Crediverse — an AI-driven loan-processing platform serving 5+ NBFCs including Aditya Birla Finance and Credila, consolidating legacy systems into one extensible platform.',
      'Architected a configurable workflow-orchestration engine for client-specific business processes, cutting AWS infrastructure costs by 50%+ through reusable execution pipelines.',
      'Built an agentic AI banking assistant with RAG over private banking policies — grounded policy search and automated report generation through tool orchestration.',
      'Established centralized observability across 20+ environments with OpenTelemetry and SigNoz: distributed tracing, log aggregation and proactive alerting.',
      'Engineered VideoPD for remote loan verification (Cloudflare RealtimeKit + AWS Transcribe), saving 10K+ verification minutes and 300,000+ km of customer travel annually.',
      'Shipped enterprise audit logging and fraud detection — GeoTagging, GeoLive and IP-intelligence checks strengthening compliance controls.',
    ],
    tags: ['Agentic AI', 'RAG', 'PGVector', 'Node.js', 'AWS', 'OpenTelemetry', 'SigNoz'],
    gallery: [
      { src: '/showcase/newron-crediverse.svg', caption: 'Crediverse · loan journey' },
      { src: '/showcase/newron-rag.svg', caption: 'Agentic assistant · RAG' },
      { src: '/showcase/newron-observability.svg', caption: 'Observability · OTel + SigNoz' },
      { src: '/showcase/newron-videopd.svg', caption: 'VideoPD · remote verification' },
    ],
  },
  {
    company: 'Jio Platforms Limited',
    role: 'Software Development Engineer',
    dates: 'Aug 2023 — Jun 2025',
    kind: 'fulltime',
    logoSrc: '/logos/jio.png',
    initials: 'Jio',
    badgeBg: 'linear-gradient(135deg, #0a2885, #1240c4)',
    bullets: [
      'Engineered session lifecycle management for 1000+ concurrent SSH/RDP connections via Apache Guacamole — a platform handling 10K+ sessions with archival, encryption and retention policies for compliance.',
      'Integrated SAML SSO with Azure AD and initiated TOTP-based 2FA — federated login and automated user provisioning across microservices.',
      'Developed an SCP-based file-transfer controller: an SSH client with UI-like navigation, recursive listing and secure upload/download.',
      'Designed database optimization and Redis monitoring across 100+ servers with automated performance recommendations.',
      'Built Appium-based no-code automation tooling, reducing test-automation development effort by 70%.',
    ],
    tags: ['Java', 'Spring Boot', 'Apache Guacamole', 'Azure AD', 'Redis', 'Appium'],
    gallery: [
      { src: '/showcase/jio-gateway.svg', caption: 'Session gateway · Guacamole' },
      { src: '/showcase/jio-sso.svg', caption: 'SAML SSO + TOTP 2FA' },
      { src: '/showcase/jio-monitor.svg', caption: 'DB & Redis fleet monitor' },
    ],
  },
  {
    company: 'Happay',
    role: 'Software Developer Intern',
    dates: 'Jul 2022 — Dec 2022',
    kind: 'internship',
    logoSrc: '/logos/happay.png',
    initials: 'H',
    badgeBg: 'linear-gradient(135deg, #ff5f6d, #ff9966)',
    bullets: [
      'Developed a WhatsApp notification platform for flight and hotel bookings, integrating email and SMS workflows — communication responsiveness up 50%.',
      'Automated document generation and delivery with Kafka and AWS S3, integrating third-party providers including Yellow.ai.',
    ],
    tags: ['Kafka', 'AWS S3', 'WhatsApp API', 'Yellow.ai'],
    gallery: [
      { src: '/showcase/happay-whatsapp.svg', caption: 'WhatsApp booking alerts' },
      { src: '/showcase/happay-docgen.svg', caption: 'Doc pipeline · Kafka → S3' },
    ],
  },
  {
    company: 'LTI Infotech',
    role: 'ML & Cloud Intern',
    dates: 'May 2021 — Jul 2021',
    kind: 'internship',
    initials: 'LTI',
    badgeBg: 'linear-gradient(135deg, #0f9b8e, #12b8a8)',
    bullets: [
      'Built a ticket-classification system with BERT and neural networks — 96% accuracy across 10K+ support queries spanning IT Support, DevOps, Engineering and QA.',
      'Developed a serverless inference pipeline with FastAPI, AWS Lambda and S3, bringing prediction latency below 250ms.',
    ],
    tags: ['BERT', 'FastAPI', 'AWS Lambda', 'Neural Networks'],
    gallery: [
      { src: '/showcase/lti-bert.svg', caption: 'BERT ticket triage · 96%' },
      { src: '/showcase/lti-serverless.svg', caption: 'Serverless inference · <250ms' },
    ],
  },
]

export const mira = {
  name: 'MIRA',
  tagline: 'Multimodal Intelligent Route Assistant',
  repo: links.mira,
  description:
    'My personal project — an **agentic trip planner** that researches real transport, stay and activity options, optimises them against your stated constraints, and produces a day-wise itinerary plus an illustrated travel guide.',
  // What she says in the hologram speech bubble
  voiceLines: [
    "Hi, I'm MIRA — Shubham built me to plan journeys ✈",
    'I research real transport, stays & activities with agentic tools',
    'I optimise every option against your budget & constraints',
    'I write day-wise itineraries… then illustrate the travel guide',
    'LangGraph orchestration · MCP tools · RAG over destinations',
    'A human stays in my loop before anything is committed',
  ],
  features: [
    { icon: '🧭', text: '<b>Agentic research</b> over real transport, stay & activity options via LangGraph and MCP tool servers' },
    { icon: '⚖️', text: '<b>Deterministic optimisation</b> — the LLM extracts preferences; testable code does the ranking' },
    { icon: '🗺️', text: '<b>Day-wise itineraries</b> plus an illustrated, Gemini-generated travel guide as a PDF' },
    { icon: '🔁', text: '<b>Streaming chat</b> with threads, checkpoints & human-in-the-loop gates before actions' },
  ],
  tech: ['FastAPI', 'LangGraph', 'MCP', 'Gemini', 'RAG', 'LangSmith', 'React', 'Bruno'],
  shots: [
    { src: '/showcase/mira-chat.svg', caption: 'streaming chat · HITL gate' },
    { src: '/showcase/mira-graph.svg', caption: 'agent graph · LangGraph + MCP' },
    { src: '/showcase/mira-guide.svg', caption: 'generated PDF travel guide' },
  ] as Shot[],
}

export const skillGroups = [
  {
    title: 'Programming',
    icon: '⌨️',
    accent: '#38e1ff',
    items: ['Java', 'C++', 'Python', 'JavaScript', 'TypeScript', 'SQL'],
  },
  {
    title: 'Backend & AI',
    icon: '🧠',
    accent: '#8b7bff',
    items: ['Agentic AI', 'RAG', 'LangChain', 'LangGraph', 'LangSmith', 'Spring Boot', 'Node.js', 'Fastify', 'Django', 'Microservices'],
  },
  {
    title: 'Cloud & DevOps',
    icon: '☁️',
    accent: '#5ff2c0',
    items: ['AWS', 'Docker', 'Kubernetes', 'Git', 'GitHub Actions', 'Nginx'],
  },
  {
    title: 'Data & Messaging',
    icon: '🗄️',
    accent: '#ff6ac2',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'PGVector', 'Redis', 'Kafka', 'RabbitMQ', 'OpenTelemetry'],
  },
]

export const education = [
  {
    school: 'Stockholm University',
    flag: '🇸🇪',
    degree: "Master's studies · Computer and System Science",
    meta: ['Stockholm, Sweden', '09/2025 — 12/2025'],
  },
  {
    school: 'BITS Pilani',
    flag: '🇮🇳',
    degree: 'B.E. Electronics & Instrumentation Engineering',
    meta: ['Pilani, India', '2019 — 2023', 'CGPA 9.14 / 10'],
  },
]

export const honors = [
  {
    icon: '🏆',
    title: 'Star Performer of the Year — Jio Platforms',
    detail: 'Awarded for excellent contributions across the platform org.',
  },
  {
    icon: '🎖️',
    title: '80% Merit-cum-Scholarship — BITS Pilani',
    detail: "Ranked among the university's top 1% students.",
  },
]
