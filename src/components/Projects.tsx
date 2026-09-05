import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { CinematicSection, StaggerGroup, StaggerItem } from './Cinematic'
import Magnetic from './Magnetic'
import { projects, type Project } from '../data/projects'
import { motionTokens } from '../data/brand'

function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  return (
    <article
      className={`pj-card ${project.featured ? 'pj-featured' : ''} ${open ? 'is-open' : ''}`}
      style={{ ['--pj-accent' as string]: project.accent }}
    >
      <div className="pj-art">
        <img src={project.art} alt="" loading="lazy" draggable={false} />
        <span className="pj-art-veil" aria-hidden />
      </div>

      <div className="pj-body">
        <div className="pj-top">
          <span className="pj-org mono">{project.org}</span>
          <span className="pj-year mono">{project.year}</span>
        </div>

        <h3 className="pj-title">{project.title}</h3>
        <p className="pj-blurb">{project.blurb}</p>

        <div className="pj-metrics">
          {project.metrics.map((m) => (
            <div className="pj-metric" key={m.label}>
              <span className="pj-metric-v">{m.value}</span>
              <span className="pj-metric-l">{m.label}</span>
            </div>
          ))}
        </div>

        <motion.div
          className="pj-detail-wrap"
          initial={false}
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          transition={{
            duration: reduce ? 0 : motionTokens.fast,
            ease: motionTokens.easeOutExpo,
          }}
        >
          <p className="pj-detail">{project.detail}</p>
        </motion.div>

        <div className="pj-stack">
          {project.stack.map((s) => (
            <span className="chip" key={s}>
              {s}
            </span>
          ))}
        </div>

        <div className="pj-actions">
          <button
            className="pj-more"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? 'Less' : 'How it works'}
            <span className={`pj-caret ${open ? 'up' : ''}`} aria-hidden>
              ↓
            </span>
          </button>
          {project.href && (
            <Magnetic>
              <a
                className="pj-link"
                href={project.href}
                target="_blank"
                rel="noreferrer"
              >
                {project.hrefLabel ?? 'View'} <span aria-hidden>↗</span>
              </a>
            </Magnetic>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  return (
    <CinematicSection
      id="projects"
      slug="selected work"
      eyebrow="// selected work"
      title={
        <>
          Things I built that <span className="gradient-text">stayed built</span>
        </>
      }
      kicker="Six projects, each still running in production or public on GitHub. Numbers are measured, not estimated."
    >
      <StaggerGroup className="pj-grid">
        {projects.map((p) => (
          <StaggerItem key={p.id} className={p.featured ? 'pj-cell wide' : 'pj-cell'}>
            <ProjectCard project={p} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </CinematicSection>
  )
}
