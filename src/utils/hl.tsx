import type { ReactNode } from 'react'

// Wraps metrics like "5+", "50%+", "10K+", "300,000+", "250ms" in a gradient span.
const NUM = /(?<![\w.,])(\d[\d,.]*[Kk]?%?\+?(?:ms|km|mins)?)(?![A-Za-z0-9])/g

export function hl(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let key = 0
  for (const m of text.matchAll(NUM)) {
    const idx = m.index ?? 0
    if (idx > last) out.push(text.slice(last, idx))
    out.push(
      <span className="hl" key={key++}>
        {m[0]}
      </span>,
    )
    last = idx + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}
