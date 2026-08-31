import { useState } from 'react'
import type { Job } from '../data/resume'

// Renders the real logo when available; falls back to a branded monogram badge.
export default function CompanyLogo({ job }: { job: Job }) {
  const [failed, setFailed] = useState(false)

  if (job.logoSrc && !failed) {
    return (
      <img
        className="logo-img"
        src={job.logoSrc}
        alt={`${job.company} logo`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <div className="logo-badge" style={{ background: job.badgeBg }} aria-hidden>
      {job.initials}
    </div>
  )
}
