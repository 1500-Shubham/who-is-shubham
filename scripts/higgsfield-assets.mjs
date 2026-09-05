#!/usr/bin/env node
/**
 * Generate the brand's hero assets through the Higgsfield MCP server.
 *
 * This is parked, not abandoned: the prompts below are the ones the site was
 * designed around, but the account had 0 credits on the free plan when the
 * layout was built, so the site ships with a procedural backdrop instead
 * (see src/components/CinematicBackdrop.tsx). Top the account up and run:
 *
 *     node scripts/higgsfield-assets.mjs           # cost preflight only
 *     node scripts/higgsfield-assets.mjs --run     # actually generate
 *
 * Output lands in public/brand/. Point CinematicBackdrop at it, or drop it
 * straight into .hero as a background-image / <video> poster.
 *
 * Auth reuses the OAuth token Claude Code already stored in the macOS
 * keychain for the `higgsfield` MCP server. No API keys to manage.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'brand')
const ENDPOINT = 'https://mcp.higgsfield.ai/mcp'

const RUN = process.argv.includes('--run')

// ---------------------------------------------------------------- prompts

const STYLE = [
  'deep indigo void, near-black ground',
  'volumetric nebula core lit from within',
  'thin geometric light filaments implying a neural lattice',
  'cyan and violet rim light bleeding to deep magenta at the frame edge',
  'fine particulate haze, anamorphic lens bloom, subtle film grain',
  'high contrast, no people, no text, no logos, no watermark',
].join(', ')

const ASSETS = [
  {
    name: 'hero-wide',
    kind: 'image',
    model: 'cinematic_studio_2_5',
    aspect_ratio: '21:9',
    params: { resolution: '2k' },
    prompt:
      `Cinematic ultra-wide abstract hero plate for an AI engineer's portfolio. ${STYLE}. ` +
      'Composition holds deliberate negative space across the left third so a headline can sit ' +
      'over it without competing. Photoreal render, 4k detail.',
  },
  {
    name: 'hero-portrait',
    kind: 'image',
    model: 'cinematic_studio_2_5',
    aspect_ratio: '9:16',
    params: { resolution: '2k' },
    prompt:
      `Mobile crop of the same world. ${STYLE}. ` +
      'Nebula core sits in the upper third, clean falloff to near-black at the bottom for text.',
  },
  {
    name: 'hero-loop',
    kind: 'video',
    model: null, // resolved at runtime from models_explore
    aspect_ratio: '16:9',
    params: {},
    prompt:
      `Slow cinematic push through a dark volumetric nebula. ${STYLE}. ` +
      'Camera drifts forward almost imperceptibly, light filaments parallax past the lens, ' +
      'dust motes catch the rim light. Seamless, loopable, no cuts, no people, no text.',
  },
]

// ---------------------------------------------------------------- transport

function token() {
  const raw = execFileSync(
    'security',
    ['find-generic-password', '-s', 'Claude Code-credentials', '-w'],
    { encoding: 'utf8' },
  )
  const creds = JSON.parse(raw)
  const entry = Object.entries(creds.mcpOAuth ?? {}).find(([k]) =>
    k.toLowerCase().startsWith('higgsfield'),
  )
  if (!entry) {
    throw new Error(
      'No Higgsfield OAuth token found. Run: claude mcp login higgsfield',
    )
  }
  return entry[1].accessToken ?? entry[1].access_token
}

let id = 0
async function call(tool, args, tok) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tok}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: ++id,
      method: 'tools/call',
      params: { name: tool, arguments: args },
    }),
  })
  const text = await res.text()
  const start = text.indexOf('{"result"')
  const parsed = JSON.parse(start >= 0 ? text.slice(start) : text)
  if (parsed.error) throw new Error(JSON.stringify(parsed.error))
  const result = parsed.result ?? {}
  return result.structuredContent ?? result
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForJob(jobId, tok) {
  for (let i = 0; i < 60; i++) {
    const s = await call('job_status', { job_id: jobId }, tok)
    const status = s.status ?? s.state
    if (status === 'completed' || status === 'succeeded') return s
    if (status === 'failed' || status === 'error') {
      throw new Error(`job ${jobId} failed: ${JSON.stringify(s).slice(0, 300)}`)
    }
    await sleep(5000)
  }
  throw new Error(`job ${jobId} timed out`)
}

function collectUrls(node, found = []) {
  if (!node) return found
  if (typeof node === 'string') {
    if (/^https?:\/\/\S+\.(png|jpe?g|webp|mp4|webm)/i.test(node)) found.push(node)
    return found
  }
  if (Array.isArray(node)) {
    node.forEach((n) => collectUrls(n, found))
    return found
  }
  if (typeof node === 'object') {
    Object.values(node).forEach((v) => collectUrls(v, found))
  }
  return found
}

// ---------------------------------------------------------------- main

async function main() {
  const tok = token()

  const bal = await call('balance', {}, tok)
  console.log(`credits: ${bal.credits} · plan: ${bal.subscription_plan_type}`)

  // resolve a video model from the live catalogue rather than pinning one
  const videoModels = await call(
    'models_explore',
    { action: 'recommend', type: 'video', goal: 'seamless looping cinematic nebula background' },
    tok,
  )
  const videoModel = videoModels.items?.[0]?.id
  if (videoModel) console.log(`video model: ${videoModel}`)

  mkdirSync(OUT, { recursive: true })
  let total = 0

  for (const asset of ASSETS) {
    const model = asset.model ?? videoModel
    if (!model) {
      console.log(`- ${asset.name}: no model available, skipped`)
      continue
    }
    const tool = asset.kind === 'video' ? 'generate_video' : 'generate_image'
    const base = {
      model,
      prompt: asset.prompt,
      aspect_ratio: asset.aspect_ratio,
      ...asset.params,
    }

    const cost = await call(tool, { params: { ...base, get_cost: true } }, tok)
    const credits = cost.cost?.credits ?? '?'
    total += Number(credits) || 0
    console.log(`- ${asset.name} (${model}): ${credits} credits`)

    if (!RUN) continue

    if (bal.credits <= 0) {
      console.log('  skipped — no credits. Top up, then rerun with --run.')
      continue
    }

    const job = await call(tool, { params: base }, tok)
    if (job.error) {
      console.log(`  failed: ${job.error}`)
      continue
    }
    const jobId = job.job_id ?? job.id ?? job.jobs?.[0]?.id
    console.log(`  job ${jobId} submitted, waiting…`)
    const done = await waitForJob(jobId, tok)

    const [url] = collectUrls(done)
    if (!url) {
      console.log('  completed but no media URL returned')
      continue
    }
    const ext = url.split('?')[0].split('.').pop()
    const file = join(OUT, `${asset.name}.${ext}`)
    const bytes = Buffer.from(await (await fetch(url)).arrayBuffer())
    writeFileSync(file, bytes)
    console.log(`  saved ${file} (${(bytes.length / 1024).toFixed(0)} KB)`)
  }

  console.log(`\ntotal: ${total} credits for the full set`)
  if (!RUN) console.log('preflight only — rerun with --run to generate')
}

main().catch((e) => {
  console.error('failed:', e.message)
  process.exit(1)
})
