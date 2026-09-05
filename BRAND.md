# Brand system

The visual identity for **who-is-shubham**. Tokens live in
[`src/data/brand.ts`](src/data/brand.ts) and mirror the CSS custom properties at
the top of [`src/styles/global.css`](src/styles/global.css). Change them in both
places or not at all.

## Positioning

> Agentic AI systems, and the platforms sturdy enough to run them.

The site argues one thing: the interesting work is not the model, it is
everything holding the model up. Every section is evidence for that claim.

## Voice

Precise, understated, engineer-first. Evidence over adjectives.

- Lead with the system, not the self.
- Every claim carries a number or a name. "50%+ AWS cost cut", not "significant savings".
- Lowercase machine asides in mono (`// selected work`); sentence case for human prose.

## Colour

A near-black ground with an aurora accent triad. Accents are used as **light**,
never as fill: rim lights, gradients, glows. Nothing is a flat coloured block.

| Token | Hex | Role |
|---|---|---|
| `void` | `#04050d` | page ground |
| `deep` | `#080a18` | raised surface |
| `ink` | `#eef1ff` | primary text |
| `muted` | `#9aa3c7` | secondary text |
| `faint` | `#6b7398` | machine text, metadata |
| `cyan` | `#38e1ff` | signal — links, focus, "live" |
| `violet` | `#8b7bff` | core brand — the through-line |
| `magenta` | `#ff6ac2` | heat — emphasis, peaks |
| `mint` | `#5ff2c0` | success — shipped, verified |

## Type

Three families, no exceptions.

- **Space Grotesk** — display. Headlines, project titles, metric values.
- **Inter** — body. Anything a person reads in sentences.
- **JetBrains Mono** — machine. Eyebrows, labels, scene slugs, metadata.

## Motion

One easing curve and one duration scale, in `motionTokens`. Anything that moves
borrows from there, so timing reads as authored rather than accidental.

- `ease` `[0.2, 0.65, 0.3, 1]` for entrances
- `easeOutExpo` `[0.16, 1, 0.3, 1]` for interface state
- `base` 0.75s, `fast` 0.35s, `stagger` 0.08s

Every transform collapses to a plain fade under `prefers-reduced-motion`.

## Scenes

The page is one continuous take, not a stack of pages. Each section is a
**shot**: it rises and settles on entry, holds while it owns the viewport, then
recedes and dims as the next takes over. All of it is scroll-linked, so the page
responds to the reader instead of playing at them.

`scenes` in `brand.ts` assigns each section a tint. The fixed canvas in
[`CinematicBackdrop`](src/components/CinematicBackdrop.tsx) eases its ambient
wash toward whichever scene currently owns the viewport, which is what makes
scrolling feel like moving through changing light.

Primitives are in [`src/components/Cinematic.tsx`](src/components/Cinematic.tsx):

- `CinematicSection` — the shot shell, with an optional corner scene slug
- `Parallax` — a layer that scrolls at its own rate
- `StaggerGroup` / `StaggerItem` — a grid that assembles rather than pops

## Hero backdrop

The backdrop is **procedural**, not a generated asset: a half-resolution canvas
running a drifting volumetric nebula, an anamorphic streak and animated film
grain, capped at 30fps and asleep while the tab is hidden.

That was a fallback. The site was designed around a Higgsfield-generated hero
plate, but the account had 0 credits on the free plan at build time. The prompts
survive in [`scripts/higgsfield-assets.mjs`](scripts/higgsfield-assets.mjs),
which prices and generates the full set through the Higgsfield MCP server:

```
node scripts/higgsfield-assets.mjs        # cost preflight, spends nothing
node scripts/higgsfield-assets.mjs --run  # generate into public/brand/
```

Current pricing from the live catalogue:

| Asset | Model | Credits |
|---|---|---|
| `hero-wide` 21:9 | `cinematic_studio_2_5` | 2 |
| `hero-portrait` 9:16 | `cinematic_studio_2_5` | 2 |
| `hero-loop` 16:9 video | `seedance_2_5` | 32.5 |

Total 36.5 credits. Auth reuses the OAuth token Claude Code stored for the
`higgsfield` MCP server, so there are no API keys in the repo.
