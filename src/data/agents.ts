export interface Agent {
  id: string
  name: string
  role: string
  /** Three verbs, shown under the role. */
  tagline: string
  accent: string
  /**
   * Portrait in public/agents/<id>.png — a transparent cut-out. Used on its own
   * as a depth-displaced relief, and as the fallback while a model loads.
   */
  image?: string
  /**
   * Optional glTF binary in public/agents/<id>.glb. When present the slot
   * renders the real mesh instead of the portrait relief. See public/agents/README.md.
   */
  model?: string
  status: 'live' | 'soon'
  /** What they say when they wave at you in the roster grid. */
  greeting: string
  /** In-page anchor for agents that have a section of their own. */
  href?: string
}

export const agents: Agent[] = [
  {
    id: 'mira',
    name: 'MIRA',
    role: 'Travel Planner Agent',
    tagline: 'Plan · Explore · Experience',
    accent: '#38e1ff',
    image: '/agents/mira.png',
    model: '/agents/mira.glb',
    status: 'live',
    greeting: "Hi! I'm MIRA. Where are we going?",
    href: '#mira',
  },
  {
    id: 'aria',
    name: 'ARIA',
    role: 'Research Agent',
    tagline: 'Find · Analyze · Summarize',
    accent: '#8b7bff',
    image: '/agents/aria.png',
    model: '/agents/aria.glb',
    status: 'soon',
    greeting: "Hello! I'm ARIA. Ask me anything.",
  },
  {
    id: 'nova',
    name: 'NOVA',
    role: 'Productivity Agent',
    tagline: 'Organize · Automate · Achieve',
    accent: '#5ff2c0',
    image: '/agents/nova.png',
    model: '/agents/nova.glb',
    status: 'soon',
    greeting: "Hey, I'm NOVA. Let's get organised.",
  },
  {
    id: 'sana',
    name: 'SANA',
    role: 'Creative Agent',
    tagline: 'Create · Design · Inspire',
    accent: '#ff6ac2',
    image: '/agents/sana.png',
    model: '/agents/sana.glb',
    status: 'soon',
    greeting: "Hi, I'm SANA. Let's make something.",
  },
]
