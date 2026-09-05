// ─────────────────────────────────────────────────────────────
// Curated project showcase — the six pieces of work worth leading with.
// Ordered deliberately: flagship platform first, personal flagship second.
// ─────────────────────────────────────────────────────────────

export interface ProjectMetric {
  value: string
  label: string
}

export interface Project {
  id: string
  title: string
  org: string
  year: string
  /** one-line hook, no jargon */
  blurb: string
  /** what it actually does, two or three sentences */
  detail: string
  art: string
  metrics: ProjectMetric[]
  stack: string[]
  accent: string
  href?: string
  hrefLabel?: string
  featured?: boolean
}

export const projects: Project[] = [
  {
    id: 'crediverse',
    title: 'Crediverse',
    org: 'Newron.AI',
    year: '2025 —',
    blurb: 'One AI-driven loan platform replacing the legacy stacks of five-plus lenders.',
    detail:
      'End-to-end architecture for a loan-processing platform now running at Aditya Birla Finance, Credila, YES Bank and Fedfina. A configurable workflow-orchestration engine models each lender’s business process without forking the product, so onboarding a new NBFC is configuration rather than a rewrite.',
    art: '/showcase/newron-crediverse.svg',
    metrics: [
      { value: '5+', label: 'NBFCs live' },
      { value: '50%+', label: 'AWS cost cut' },
    ],
    stack: ['Node.js', 'PostgreSQL', 'AWS', 'Workflow engine'],
    accent: '#8b7bff',
    featured: true,
  },
  {
    id: 'mira',
    title: 'MIRA',
    org: 'Personal project',
    year: '2025',
    blurb: 'An agentic trip planner that researches, optimises and then illustrates your journey.',
    detail:
      'A LangGraph agent that calls real transport, stay and activity tools over MCP, then hands ranking to deterministic code rather than trusting the model to do arithmetic. Produces a day-wise itinerary and a Gemini-illustrated PDF guide, with a human-in-the-loop gate before anything is committed.',
    art: '/showcase/mira-graph.svg',
    metrics: [
      { value: 'LangGraph', label: 'orchestration' },
      { value: 'MCP', label: 'tool servers' },
    ],
    stack: ['FastAPI', 'LangGraph', 'MCP', 'Gemini', 'RAG'],
    accent: '#38e1ff',
    href: 'https://github.com/1500-Shubham/MIRA-Your-Multimodal-Intelligent-Route-Assistant',
    hrefLabel: 'Source on GitHub',
    featured: true,
  },
  {
    id: 'assistant',
    title: 'Agentic banking assistant',
    org: 'Newron.AI',
    year: '2025',
    blurb: 'RAG grounded in private banking policy, so answers cite the rule they came from.',
    detail:
      'A retrieval layer over internal policy documents with PGVector, wired to tool orchestration for automated report generation. Built so a compliance officer can trace any answer back to the clause that produced it.',
    art: '/showcase/newron-rag.svg',
    metrics: [
      { value: 'PGVector', label: 'retrieval' },
      { value: 'Grounded', label: 'policy search' },
    ],
    stack: ['Agentic AI', 'RAG', 'PGVector', 'Node.js'],
    accent: '#5ff2c0',
  },
  {
    id: 'videopd',
    title: 'VideoPD',
    org: 'Newron.AI',
    year: '2025',
    blurb: 'Remote loan verification that removed 300,000 km of travel a year.',
    detail:
      'Live video verification built on Cloudflare RealtimeKit with AWS Transcribe for searchable records. Field officers stopped driving to customers; the audit trail got better in the process.',
    art: '/showcase/newron-videopd.svg',
    metrics: [
      { value: '300K+', label: 'km saved / yr' },
      { value: '10K+', label: 'minutes verified' },
    ],
    stack: ['Cloudflare RealtimeKit', 'AWS Transcribe', 'Node.js'],
    accent: '#ff6ac2',
  },
  {
    id: 'gateway',
    title: 'Session gateway',
    org: 'Jio Platforms',
    year: '2023 — 2025',
    blurb: 'A thousand concurrent SSH and RDP sessions, recorded and retention-managed.',
    detail:
      'Session lifecycle management over Apache Guacamole handling 10,000+ sessions with archival, encryption and retention policy. Federated login through SAML SSO against Azure AD, with TOTP two-factor on top.',
    art: '/showcase/jio-gateway.svg',
    metrics: [
      { value: '1000+', label: 'concurrent' },
      { value: '10K+', label: 'sessions handled' },
    ],
    stack: ['Java', 'Spring Boot', 'Apache Guacamole', 'Azure AD'],
    accent: '#38e1ff',
  },
  {
    id: 'triage',
    title: 'Ticket triage',
    org: 'LTI Infotech',
    year: '2021',
    blurb: 'BERT routing 10,000 support tickets at 96% accuracy, under 250ms.',
    detail:
      'A classification model over real support queries spanning IT Support, DevOps, Engineering and QA, served through a serverless inference pipeline on FastAPI and AWS Lambda.',
    art: '/showcase/lti-bert.svg',
    metrics: [
      { value: '96%', label: 'accuracy' },
      { value: '<250ms', label: 'inference' },
    ],
    stack: ['BERT', 'FastAPI', 'AWS Lambda'],
    accent: '#5ff2c0',
  },
]
