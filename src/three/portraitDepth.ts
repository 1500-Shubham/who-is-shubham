import * as THREE from 'three'

/**
 * Turn a cut-out's alpha channel into a displacement map.
 *
 * A blurred silhouette makes a serviceable depth field for a head-and-shoulders
 * portrait: the interior lifts toward the viewer, the edges stay at zero, and
 * the gradient gives us a normal to light. 64² is plenty — it is sampled per
 * vertex, not per pixel.
 */
export function buildDepthTexture(img: HTMLImageElement, size = 64): THREE.DataTexture {
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const c = cv.getContext('2d', { willReadFrequently: true })!
  c.drawImage(img, 0, 0, size, size)
  const src = c.getImageData(0, 0, size, size).data

  let a = new Float32Array(size * size)
  for (let i = 0; i < size * size; i++) a[i] = src[i * 4 + 3] / 255

  // Several cheap box passes ≈ a wide gaussian, which is what turns a hard
  // silhouette into a dome instead of a plateau with a cliff edge.
  const box = (input: Float32Array, r: number) => {
    const tmp = new Float32Array(input.length)
    const out = new Float32Array(input.length)
    const n = r * 2 + 1
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        let s = 0
        for (let k = -r; k <= r; k++) s += input[y * size + Math.min(size - 1, Math.max(0, x + k))]
        tmp[y * size + x] = s / n
      }
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        let s = 0
        for (let k = -r; k <= r; k++) s += tmp[Math.min(size - 1, Math.max(0, y + k)) * size + x]
        out[y * size + x] = s / n
      }
    return out
  }
  a = box(box(box(a, 4), 3), 2)

  const data = new Uint8Array(size * size)
  for (let i = 0; i < data.length; i++) data[i] = Math.round(Math.min(1, a[i]) * 255)

  const tex = new THREE.DataTexture(data, size, size, THREE.RedFormat)
  tex.minFilter = tex.magFilter = THREE.LinearFilter
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  return tex
}
