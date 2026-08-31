import { Section, Reveal } from './Reveal'
import { education, honors } from '../data/resume'

export default function Education() {
  return (
    <Section
      id="education"
      eyebrow="foundations"
      title={
        <>
          Education & <span className="gradient-text">honors</span>
        </>
      }
    >
      <div className="edu-grid">
        <div className="edu-col">
          <h3>// education</h3>
          {education.map((e, i) => (
            <Reveal key={e.school} delay={i * 0.08}>
              <div className="edu-card">
                <div className="edu-school">
                  <span aria-hidden>{e.flag}</span> {e.school}
                </div>
                <div className="edu-degree">{e.degree}</div>
                <div className="edu-meta">
                  {e.meta.map((m) => (
                    <span className="chip" key={m}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="edu-col">
          <h3>// honors</h3>
          {honors.map((h, i) => (
            <Reveal key={h.title} delay={0.1 + i * 0.08}>
              <div className="edu-card honor-card">
                <span className="honor-ic" aria-hidden>
                  {h.icon}
                </span>
                <div>
                  <div className="honor-t">{h.title}</div>
                  <div className="honor-d">{h.detail}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
