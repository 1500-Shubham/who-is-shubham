// ─────────────────────────────────────────────────────────────
// Brand system — the single source of truth for the visual identity.
// Tokens here mirror the CSS custom properties in styles/global.css.
// Documented in BRAND.md.
// ─────────────────────────────────────────────────────────────

export const brand = {
  name: 'who-is-shubham',
  wordmark: '{ "who": "shubham" }',

  // The one-line positioning statement the whole site is built around.
  promise: 'Agentic AI systems, and the platforms sturdy enough to run them.',

  voice: {
    tone: 'Precise, understated, engineer-first. Evidence over adjectives.',
    rules: [
      'Lead with the system, not the self.',
      'Every claim carries a number or a name.',
      'Lowercase machine asides in mono; sentence case for human prose.',
    ],
  },
} as const

// ---------- colour ----------
// Deep-space base with an aurora accent triad. Accents are used as light,
// never as fill: rim lights, gradients and glows on a near-black ground.
export const palette = {
  void: '#04050d', // page ground
  deep: '#080a18', // raised surface
  ink: '#eef1ff', // primary text
  muted: '#9aa3c7', // secondary text
  faint: '#6b7398', // tertiary / machine text

  cyan: '#38e1ff', // signal — links, focus, "live"
  violet: '#8b7bff', // core brand — the through-line accent
  magenta: '#ff6ac2', // heat — emphasis, peaks
  mint: '#5ff2c0', // success — shipped, verified
} as const

// Each scene tints the ambient backdrop as you scroll past it. This is what
// makes the page read as one continuous cinematic take rather than a stack
// of cards. Keys match section ids.
export interface Scene {
  id: string
  /** rgb triplet used for the ambient wash */
  tint: [number, number, number]
  /** one-line title card shown in the corner while the scene is on screen */
  slug: string
}

export const scenes: Scene[] = [
  { id: 'home', tint: [139, 123, 255], slug: 'cold open' },
  { id: 'identity', tint: [56, 225, 255], slug: 'who is shubham' },
  { id: 'impact', tint: [95, 242, 192], slug: 'the numbers' },
  { id: 'projects', tint: [139, 123, 255], slug: 'selected work' },
  { id: 'agents', tint: [255, 106, 194], slug: 'the agents' },
  { id: 'experience', tint: [56, 225, 255], slug: 'the record' },
  { id: 'mira', tint: [139, 123, 255], slug: 'mira' },
  { id: 'skills', tint: [95, 242, 192], slug: 'the toolkit' },
  { id: 'education', tint: [255, 106, 194], slug: 'origins' },
]

// ---------- motion ----------
// One easing curve and one duration scale across the whole site. Anything
// that moves borrows from here, so the timing feels authored, not accidental.
export const motionTokens = {
  ease: [0.2, 0.65, 0.3, 1] as [number, number, number, number],
  easeOutExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  fast: 0.35,
  base: 0.75,
  slow: 1.2,
  stagger: 0.08,
  spring: { stiffness: 90, damping: 26, mass: 0.9 },
} as const
