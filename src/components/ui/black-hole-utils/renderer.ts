/**
 * Standalone WebGL2 black-hole renderer.
 *
 * A fullscreen fragment shader integrates photon paths through a Schwarzschild
 * metric: rays bend around the hole, cross the accretion disk (possibly more
 * than once, which is what produces the arc of disk over the top), and either
 * fall past the horizon or escape to the starfield. No three.js — the whole
 * thing is one triangle and one shader.
 *
 * Framework-agnostic on purpose: `createRenderer({ canvas })` is callable from
 * React, Vue, or plain DOM. `ready` resolves once the program has linked (and
 * never rejects — on an unsupported context it paints a static fallback so the
 * caller's `void renderer.ready` can't produce an unhandled rejection).
 */

export interface BlackHoleOptions {
  canvas: HTMLCanvasElement
  /** Render scale on top of DPR. Lower = cheaper. Default 1. */
  resolutionScale?: number
  /** Hard cap on device pixel ratio. Default 1.75. */
  maxPixelRatio?: number
  /** Raymarch step budget multiplier, 0.5–1.5. Default 1. */
  quality?: number
  /** Overall brightness. Drop to ~0.6 when used as a backdrop. Default 1. */
  intensity?: number
  /** Disk palette, inner → outer, as `#rrggbb`. Defaults to the site accents. */
  colors?: { inner: string; mid: string; outer: string }
  /** Let the pointer parallax the camera. Default true. */
  interactive?: boolean
  /** Pause the loop when the canvas scrolls out of view. Default true. */
  pauseWhenOffscreen?: boolean
}

export interface BlackHoleRenderer {
  /** Resolves once the shader has linked and the first frame is scheduled. */
  ready: Promise<void>
  /** True when WebGL2 came up; false means the static fallback is showing. */
  readonly supported: boolean
  dispose: () => void
}

const VERT = `#version 300 es
// Fullscreen triangle from gl_VertexID — no vertex buffers needed.
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPointer;    // -1..1, damped
uniform float uQuality;    // step budget multiplier
uniform float uIntensity;
uniform vec3  uInner;
uniform vec3  uMid;
uniform vec3  uOuter;

const float RS       = 1.0;   // event horizon (units of Schwarzschild radius)
const float DISK_IN  = 2.4;   // ISCO-ish inner edge
const float DISK_OUT = 9.5;
const float B_CRIT   = 2.6;   // photon sphere impact parameter, 3*sqrt(3)/2
const float ESCAPE   = 46.0;

/* ---------- hashes & noise ---------- */

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash13(i + vec3(0.0, 0.0, 0.0));
  float n100 = hash13(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash13(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash13(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash13(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash13(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash13(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash13(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec3(11.7, 3.1, 5.9);
    a *= 0.5;
  }
  return s;
}

/* ---------- deep field ---------- */

vec3 starField(vec3 d) {
  vec3 col = vec3(0.0);
  for (int k = 0; k < 3; k++) {
    float scale = 55.0 + 85.0 * float(k);
    vec3 p = d * scale;
    vec3 id = floor(p);
    vec3 fr = fract(p) - 0.5;
    vec3 rnd = hash33(id);
    if (rnd.x > 0.915) {
      vec3 centre = (rnd - 0.5) * 0.62;
      float dist = length(fr - centre);
      float mag = smoothstep(0.085, 0.0, dist) * (0.15 + rnd.y * 0.85);
      // slow twinkle so the field never reads as a frozen texture
      mag *= 0.72 + 0.28 * sin(uTime * (0.6 + rnd.z * 2.2) + rnd.y * 24.0);
      vec3 tint = mix(vec3(0.68, 0.78, 1.0), vec3(1.0, 0.88, 0.74), rnd.z);
      col += mag * tint * (1.0 - float(k) * 0.22);
    }
  }
  return col;
}

vec3 nebula(vec3 d) {
  float n = fbm(d * 2.1 + vec3(0.0, 0.0, uTime * 0.008));
  float m = fbm(d * 3.7 - vec3(4.0, 1.0, 0.0));
  vec3 c = mix(uMid * 0.5, uInner * 0.42, m);
  c = mix(c, uOuter * 0.34, smoothstep(0.45, 0.85, n));
  return c * pow(smoothstep(0.32, 0.95, n), 2.2) * 0.22;
}

vec3 background(vec3 d) {
  return starField(d) + nebula(d);
}

/* ---------- accretion disk ---------- */

// Returns rgb premultiplied by nothing; .a is coverage at this crossing.
vec4 diskSample(vec3 p, float r, vec3 photonDir) {
  float ang = atan(p.z, p.x);

  // Keplerian shear: inner annuli wind much faster than outer ones.
  float orbit = uTime * 1.35 / pow(r, 1.5);
  float u = ang + orbit;

  // Sample noise in a frame that rotates with the gas, so the turbulence
  // travels with the material instead of standing still under it.
  vec3 q = vec3(cos(u), sin(u), 0.0) * r;
  float turb = fbm(vec3(q.xy * 0.55, r * 0.35));
  float filaments = fbm(vec3(u * 2.4, r * 1.7, uTime * 0.05));

  float inner = smoothstep(DISK_IN, DISK_IN + 0.55, r);
  float outer = 1.0 - smoothstep(DISK_OUT - 3.0, DISK_OUT, r);
  float density = inner * outer * (0.34 + 0.66 * turb) * (0.55 + 0.55 * filaments);

  // Temperature climbs steeply toward the ISCO.
  float temp = pow(clamp((DISK_OUT - r) / (DISK_OUT - DISK_IN), 0.0, 1.0), 1.75);

  vec3 col = mix(uOuter, uMid, smoothstep(0.0, 0.55, temp));
  col = mix(col, uInner, smoothstep(0.42, 0.86, temp));
  col = mix(col, vec3(1.0), smoothstep(0.84, 1.0, temp) * 0.9);

  // Relativistic beaming: gas swinging toward the camera is brighter and
  // bluer, the receding limb dims and reddens. This is the asymmetry that
  // makes the disk read as *rotating* rather than as a flat ring.
  vec3 orbitDir = normalize(vec3(-p.z, 0.0, p.x));
  float speed = clamp(0.62 / sqrt(r), 0.0, 0.62);
  float approach = -dot(orbitDir, photonDir) * speed;
  float boost = clamp(pow(1.0 + approach * 2.3, 3.0), 0.18, 3.2);
  col *= boost;
  col = mix(col, col * vec3(0.78, 0.92, 1.3), clamp(approach * 2.0, 0.0, 1.0));
  col = mix(col, col * vec3(1.28, 0.82, 0.66), clamp(-approach * 2.0, 0.0, 1.0));

  // Hot inner lip glow.
  col += uInner * smoothstep(DISK_IN + 1.4, DISK_IN, r) * 0.5;

  float alpha = clamp(density * 1.25, 0.0, 1.0);
  return vec4(col * (0.4 + temp * 1.25), alpha);
}

/* ---------- tone mapping ---------- */

vec3 aces(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  // Camera drifts around the hole, slightly above the disk plane, and leans
  // with the pointer. Kept shallow so the disk stays edge-on-ish and lensed.
  float yaw = uTime * 0.045 + uPointer.x * 0.42;
  float pitch = 0.19 + uPointer.y * 0.13;
  float dist = 23.5;
  vec3 ro = vec3(sin(yaw) * cos(pitch), sin(pitch), cos(yaw) * cos(pitch)) * dist;

  vec3 fw = normalize(-ro);
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
  vec3 up = cross(fw, rt);
  vec3 rd = normalize(fw * 1.55 + rt * uv.x + up * uv.y);

  // Conserved specific angular momentum drives the bending term.
  vec3 pos = ro;
  vec3 vel = rd;
  float h2 = dot(cross(pos, vel), cross(pos, vel));

  vec3 colour = vec3(0.0);
  float transmittance = 1.0;
  bool captured = false;

  int steps = int(clamp(150.0 * uQuality, 40.0, 320.0));
  for (int i = 0; i < 320; i++) {
    if (i >= steps) break;

    float r = length(pos);
    if (r < RS) { captured = true; break; }
    if (r > ESCAPE && dot(pos, vel) > 0.0) break;

    // Finer steps near the hole and near the disk plane, coarse far out.
    float dt = clamp(r * 0.085, 0.018, 0.75);
    dt *= mix(0.45, 1.0, smoothstep(0.0, 2.2, abs(pos.y)));

    vec3 acc = -1.5 * h2 * pos / pow(dot(pos, pos), 2.5);
    vec3 npos = pos + vel * dt;
    vec3 nvel = vel + acc * dt;

    // Disk lives in y = 0; catch the sign flip and interpolate the crossing.
    if (pos.y * npos.y < 0.0) {
      float k = pos.y / (pos.y - npos.y);
      vec3 hit = mix(pos, npos, k);
      float hr = length(hit.xz);
      if (hr > DISK_IN && hr < DISK_OUT) {
        vec4 s = diskSample(hit, hr, normalize(mix(vel, nvel, k)));
        colour += s.rgb * s.a * transmittance;
        transmittance *= 1.0 - s.a;
      }
    }

    pos = npos;
    vel = nvel;
    if (transmittance < 0.004) break;
  }

  if (!captured && transmittance > 0.004) {
    colour += background(normalize(vel)) * transmittance;
  }

  // Photon ring: light that orbited the hole piles up at the critical impact
  // parameter. Cheaper to add analytically than to resolve by marching.
  float b = length(cross(ro, rd));
  float ring = exp(-pow((b - B_CRIT) / 0.11, 2.0));
  colour += mix(uInner, vec3(1.0), 0.5) * ring * 0.38;

  // Faint halo just outside the shadow so the horizon has an edge.
  colour += uMid * exp(-pow((b - B_CRIT * 1.45) / 1.1, 2.0)) * 0.04;

  colour *= uIntensity;
  colour = aces(colour);

  // Gentle vignette keeps attention on the centre.
  float vig = 1.0 - 0.28 * dot(uv, uv);
  colour *= clamp(vig, 0.0, 1.0);

  // Ordered dither breaks up banding in the near-black falloff.
  float dither = (hash13(vec3(gl_FragCoord.xy, 1.0)) - 0.5) / 255.0;
  fragColor = vec4(pow(colour, vec3(0.4545)) + dither, 1.0);
}`

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [1, 1, 1]
  const n = parseInt(m[1], 16)
  // Approximate sRGB -> linear so the shader mixes colours in linear space.
  const srgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255)
  return srgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ]
}

function compile(gl: WebGL2RenderingContext, type: number, src: string, label: string) {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (import.meta.env?.DEV && !gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(`[black-hole] ${label} shader failed to compile:\n${gl.getShaderInfoLog(sh)}`)
  }
  return sh
}

/** Paints a still gradient so the slot never reads as a broken black box. */
function paintFallback(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width: w, height: h } = canvas
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.06, w / 2, h / 2, Math.max(w, h) * 0.6)
  g.addColorStop(0, '#000000')
  g.addColorStop(0.25, '#1b1440')
  g.addColorStop(0.6, '#0a0a1e')
  g.addColorStop(1, '#04050d')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

export function createRenderer(options: BlackHoleOptions): BlackHoleRenderer {
  const {
    canvas,
    resolutionScale = 1,
    maxPixelRatio = 1.75,
    quality = 1,
    intensity = 1,
    colors = { inner: '#38e1ff', mid: '#8b7bff', outer: '#ff6ac2' },
    interactive = true,
    pauseWhenOffscreen = true,
  } = options

  let disposed = false
  const cleanups: Array<() => void> = []

  const reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  })

  if (!gl || gl.isContextLost()) {
    const dpr = Math.min(window.devicePixelRatio || 1, maxPixelRatio)
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr))
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr))
    paintFallback(canvas)
    return { ready: Promise.resolve(), supported: false, dispose: () => {} }
  }

  // A WebGL canvas is opaque to assistive tech; describe it once.
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Animated visualisation of a black hole: a glowing accretion disk lensed into a ring around a dark event horizon.',
  )

  const vs = compile(gl, gl.VERTEX_SHADER, VERT, 'vertex')
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG, 'fragment')
  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)

  const vao = gl.createVertexArray()

  const u = {
    res: null as WebGLUniformLocation | null,
    time: null as WebGLUniformLocation | null,
    pointer: null as WebGLUniformLocation | null,
    quality: null as WebGLUniformLocation | null,
    intensity: null as WebGLUniformLocation | null,
    inner: null as WebGLUniformLocation | null,
    mid: null as WebGLUniformLocation | null,
    outer: null as WebGLUniformLocation | null,
  }

  /* ---------- sizing ---------- */

  let pixelW = 0
  let pixelH = 0

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, maxPixelRatio) * resolutionScale
    const w = Math.max(1, Math.round((canvas.clientWidth || 1) * dpr))
    const h = Math.max(1, Math.round((canvas.clientHeight || 1) * dpr))
    if (w === pixelW && h === pixelH) return false
    pixelW = canvas.width = w
    pixelH = canvas.height = h
    gl!.viewport(0, 0, w, h)
    return true
  }

  const ro = new ResizeObserver(() => {
    if (resize() && !running) draw(lastTime)
  })
  ro.observe(canvas)
  cleanups.push(() => ro.disconnect())

  /* ---------- pointer parallax ---------- */

  let targetX = 0
  let targetY = 0
  let pointerX = 0
  let pointerY = 0

  if (interactive && !reduceMotion) {
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      if (!r.width || !r.height) return
      targetX = ((e.clientX - r.left) / r.width) * 2 - 1
      targetY = ((e.clientY - r.top) / r.height) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    cleanups.push(() => window.removeEventListener('pointermove', onMove))
  }

  /* ---------- visibility gating ---------- */

  let visible = true
  let inView = !pauseWhenOffscreen

  if (pauseWhenOffscreen) {
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        sync()
      },
      { rootMargin: '120px' },
    )
    io.observe(canvas)
    cleanups.push(() => io.disconnect())
  } else {
    inView = true
  }

  const onVisibility = () => {
    visible = document.visibilityState === 'visible'
    sync()
  }
  document.addEventListener('visibilitychange', onVisibility)
  cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility))

  const onLost = (e: Event) => {
    e.preventDefault()
    stop()
  }
  canvas.addEventListener('webglcontextlost', onLost)
  cleanups.push(() => canvas.removeEventListener('webglcontextlost', onLost))

  /* ---------- loop ---------- */

  let raf = 0
  let running = false
  let started = false
  let startedAt = 0
  let lastTime = 0

  function draw(t: number) {
    if (disposed) return
    lastTime = t
    gl!.useProgram(prog)
    gl!.bindVertexArray(vao)
    gl!.uniform2f(u.res, pixelW, pixelH)
    gl!.uniform1f(u.time, t)
    gl!.uniform2f(u.pointer, pointerX, pointerY)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }

  function frame(now: number) {
    if (disposed) return
    raf = requestAnimationFrame(frame)
    const t = (now - startedAt) / 1000
    // Critically damped follow so the parallax never snaps.
    pointerX += (targetX - pointerX) * 0.045
    pointerY += (targetY - pointerY) * 0.045
    draw(t)
  }

  function start() {
    if (running || disposed || !started) return
    running = true
    startedAt = performance.now() - lastTime * 1000
    raf = requestAnimationFrame(frame)
  }

  function stop() {
    running = false
    cancelAnimationFrame(raf)
  }

  function sync() {
    if (!started || disposed) return
    if (reduceMotion) return
    if (visible && inView) start()
    else stop()
  }

  /* ---------- async link, then first frame ---------- */

  const parallel = gl.getExtension('KHR_parallel_shader_compile')
  const COMPLETION = 0x91b1

  const ready = new Promise<void>((resolve) => {
    const finish = () => {
      if (disposed) return resolve()

      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        // Surface the reason in dev, then degrade instead of throwing: the
        // caller does `void renderer.ready` and can't catch a rejection.
        if (import.meta.env?.DEV) {
          console.error('[black-hole] link failed:', gl.getProgramInfoLog(prog))
          console.error('[black-hole] fragment log:', gl.getShaderInfoLog(fs))
        }
        paintFallback(canvas)
        return resolve()
      }

      gl.deleteShader(vs)
      gl.deleteShader(fs)

      u.res = gl.getUniformLocation(prog, 'uRes')
      u.time = gl.getUniformLocation(prog, 'uTime')
      u.pointer = gl.getUniformLocation(prog, 'uPointer')
      u.quality = gl.getUniformLocation(prog, 'uQuality')
      u.intensity = gl.getUniformLocation(prog, 'uIntensity')
      u.inner = gl.getUniformLocation(prog, 'uInner')
      u.mid = gl.getUniformLocation(prog, 'uMid')
      u.outer = gl.getUniformLocation(prog, 'uOuter')

      gl.useProgram(prog)
      gl.uniform1f(u.quality, quality)
      gl.uniform1f(u.intensity, intensity)
      gl.uniform3fv(u.inner, hexToRgb(colors.inner))
      gl.uniform3fv(u.mid, hexToRgb(colors.mid))
      gl.uniform3fv(u.outer, hexToRgb(colors.outer))

      resize()
      started = true

      // Reduced motion still gets the image — just one static frame of it.
      if (reduceMotion) draw(6.2)
      else sync()

      resolve()
    }

    if (parallel) {
      const poll = () => {
        if (disposed) return resolve()
        if (gl.getProgramParameter(prog, COMPLETION)) finish()
        else requestAnimationFrame(poll)
      }
      requestAnimationFrame(poll)
    } else {
      finish()
    }
  })

  function dispose() {
    if (disposed) return
    disposed = true
    stop()
    for (const fn of cleanups) fn()
    cleanups.length = 0
    // Deliberately no WEBGL_lose_context here: React StrictMode remounts this
    // effect against the same <canvas>, and getContext() hands back the very
    // same context object — losing it would leave the remount with dead GL.
    if (!gl!.isContextLost()) {
      gl!.deleteVertexArray(vao)
      gl!.deleteProgram(prog)
    }
  }

  return { ready, supported: true, dispose }
}

export default createRenderer
