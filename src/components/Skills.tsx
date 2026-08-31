import { Section, Reveal } from './Reveal'
import TiltCard from './TiltCard'
import { skillGroups } from '../data/resume'

export default function Skills() {
  const all = skillGroups.flatMap((g) => g.items)
  const marquee = [...all, ...all] // duplicated for a seamless loop

  return (
    <Section
      id="skills"
      eyebrow="tech.stack"
      title={
        <>
          The <span className="gradient-text">arsenal</span>
        </>
      }
    >
      <Reveal>
        <div className="skills-marquee" aria-hidden>
          <div className="marquee-track">
            {marquee.map((s, i) => (
              <span className="chip" key={`${s}-${i}`}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="skills-grid">
        {skillGroups.map((g, i) => (
          <Reveal key={g.title} delay={i * 0.07}>
            <TiltCard max={4}>
              <div className="sk-panel" style={{ ['--accent' as string]: g.accent }}>
                <div className="sk-head">
                  <span className="sk-icon" aria-hidden>
                    {g.icon}
                  </span>
                  <h3>{g.title}</h3>
                  <span className="sk-count">{String(g.items.length).padStart(2, '0')}</span>
                </div>
                <div className="sk-chips">
                  {g.items.map((s) => (
                    <span className="chip" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
