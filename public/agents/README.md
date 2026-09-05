# Agent assets

Two tiers per agent, keyed off its `id` in `src/data/agents.ts`.

## 1. Portrait — `<id>.png` (present)

Transparent cut-out, cropped to head-and-chest. The scene subdivides a plane,
builds a blurred silhouette from the alpha channel, and displaces the mesh along
it — so the portrait is a real relief that catches a rim light and shows
parallax as the turntable spins, not a flat sticker.

These were cut from the ChatGPT 4-up sheet: per-agent matte, 2px erode, speckle
removal, tight bbox. Regenerate by re-running the pipeline if the source changes.

## 2. Model — `<id>.glb` (optional, takes over when present)

Drop a glTF-binary here and that agent renders as a true 3D mesh instead: full
rotation, real silhouette from every angle. No code change — the loader probes
for the file and upgrades the slot automatically, falling back to the portrait
while it downloads or if it 404s.

**Getting a .glb from these portraits**

A `.glb` is a container, not something that can be derived from a PNG by code —
the geometry has to be authored or generated. Options, cheapest first:

- **Image-to-3D services** — Meshy, Tripo3D, or Luma Genie take a single
  reference image and return a downloadable GLB. Feed them `<id>.png`.
- **Ready Player Me** — generates a stylised rigged avatar from a photo and
  exports GLB. Best if you later want the agents animated or lip-synced.
- **Author it** — Blender export as glTF 2.0 Binary.

**Budget**: keep each under ~3 MB and ~40k triangles; four of them load on first
paint. Draco/meshopt compression is fine — three.js decodes both. Face the model
down +Z, origin at its feet; the scene re-centres and scales to fit either way.
