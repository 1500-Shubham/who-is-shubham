import { Section, Reveal } from './Reveal'
import TiltCard from './TiltCard'
import CompanyLogo from './CompanyLogo'
import ShotGallery from './ShotGallery'
import { experience } from '../data/resume'
import { hl } from '../utils/hl'

export default function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="career.log"
      title={
        <>
          Where I've <span className="gradient-text">shipped</span>
        </>
      }
      kicker="Two companies, two internships — from AI-driven lending platforms to session infrastructure handling thousands of concurrent connections."
    >
      <div className="timeline">
        {experience.map((job, i) => (
          <Reveal key={job.company} delay={i * 0.06}>
            <div className="t-item">
              <span className={`t-dot ${job.kind === 'current' ? 'current' : ''}`} aria-hidden />
              <TiltCard max={4}>
                <article className="xp-card">
                  <header className="xp-head">
                    <CompanyLogo job={job} />
                    <div className="xp-id">
                      <div className="xp-co">{job.company}</div>
                      <div className="xp-role">{job.role}</div>
                    </div>
                    <div className="xp-meta">
                      {job.kind === 'current' && <span className="chip badge-current">● Current</span>}
                      {job.kind === 'internship' && <span className="chip badge-intern">Internship</span>}
                      <span className="chip">{job.dates}</span>
                    </div>
                  </header>

                  <ul className="xp-bullets">
                    {job.bullets.map((b, j) => (
                      <li key={j}>{hl(b)}</li>
                    ))}
                  </ul>

                  <div className="xp-tags">
                    {job.tags.map((t) => (
                      <span className="chip" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {job.gallery.length > 0 && <ShotGallery shots={job.gallery} />}
                </article>
              </TiltCard>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
