# who-is-shubham

Single-page 3D portfolio for **Shubham Keshari** — AI Engineer.

Deep-space theme with aurora accents, an interactive Three.js hero, and **MIRA rendered as a
live particle hologram** (~5k GPU particles that assemble from stardust on scroll and flinch
away from your cursor).

## Stack

- **Vite + React 19 + TypeScript**
- **three / @react-three/fiber / @react-three/drei** — hero scene & MIRA hologram
- **framer-motion** — scroll reveals, scroll-spy progress bar
- Hand-rolled CSS design system (`src/styles/global.css`) — no UI framework

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run typecheck  # tsc --noEmit
```

## Deploy to Vercel

```bash
git add -A && git commit -m "portfolio v1"
git push -u origin main
```

Then on [vercel.com](https://vercel.com) → **Add New → Project** → import
`1500-Shubham/who-is-shubham`. Vercel auto-detects Vite (build `npm run build`, output
`dist`) — no configuration needed. Or deploy straight from the CLI with `npx vercel`.

## Editing content

Everything you'd ever change lives in **one file**: [`src/data/resume.ts`](src/data/resume.ts)
— links, roles, hero stats, experience bullets, MIRA's voice lines & features, skills,
education, honors.

### Add your 3D photo (future)

Drop a square-ish photo at **`public/avatar.jpg`** and redeploy — the hero's neural-core orb
is automatically replaced by a floating holographic photo disc with orbit rings
(see `Centerpiece` in [`src/three/HeroScene.tsx`](src/three/HeroScene.tsx)). No code change needed.

### Company logos

`public/logos/*.png` — rendered on a light chip; if a file is missing or fails to load, a
branded monogram badge takes its place automatically (`src/components/CompanyLogo.tsx`).
LTI currently uses the monogram fallback; drop a `public/logos/lti.png` to override.

## Section map

| Section      | File                            | Notable bits                                     |
| ------------ | ------------------------------- | ------------------------------------------------ |
| Hero         | `components/Hero.tsx`           | typewriter roles, count-up stats, 3D neural core |
| Experience   | `components/Experience.tsx`     | timeline, tilt cards, gradient metric highlights |
| MIRA         | `components/Mira.tsx`           | particle hologram + typed speech bubble          |
| Skills       | `components/Skills.tsx`         | marquee + tilt panels                            |
| Education    | `components/Education.tsx`      | education & honors                               |
| Contact      | `components/Footer.tsx`         | copy-to-clipboard email, magnetic CTAs           |

3D scenes live in `src/three/` and pause rendering (`frameloop="never"`) while offscreen.
