import { Section, Reveal } from './Reveal'
import TiltCard from './TiltCard'
import CountUp from './CountUp'
import { impact } from '../data/resume'

export default function Highlights() {
  const f = impact.featured
  return (
    <Section
      id="impact"
      eyebrow="impact.log"
      title={
        <>
          The <span className="gradient-text">highlight</span> reel
        </>
      }
    >
      <Reveal>
        <TiltCard max={3}>
          <div className="impact-featured">
            <div className="impact-featured-num">
              <CountUp to={f.value} suffix={f.suffix} />
            </div>
            <div>
              <div className="impact-featured-label">{f.label}</div>
              <p className="impact-featured-detail">{f.detail}</p>
            </div>
          </div>
        </TiltCard>
      </Reveal>

      <div className="impact-grid">
        {impact.stats.map((s, i) => (
          <Reveal key={s.label} delay={0.06 + i * 0.05}>
            <TiltCard max={5}>
              <div className="impact-tile">
                <div className="impact-num">
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <div className="impact-label">{s.label}</div>
                <div className="impact-note">{s.note}</div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
