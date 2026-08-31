import { Section, Reveal } from './Reveal'
import Magnetic from './Magnetic'
import Typewriter from './Typewriter'
import MiraHologram from '../three/MiraHologram'
import { ArrowUpRight, GitHubIcon } from './Icons'
import { links, mira } from '../data/resume'

export default function Mira() {
  return (
    <Section
      id="mira"
      eyebrow="featured.project"
      title={
        <>
          Meet <span className="gradient-text">MIRA</span>
        </>
      }
    >
      <div className="mira-wrap">
        <Reveal>
          <div className="mira-stage">
            <MiraHologram />

            <div className="mira-bubble">
              <span className="who">MIRA</span>
              <span style={{ color: 'var(--faint)' }}> ▸ </span>
              <Typewriter words={mira.voiceLines} typeMs={38} eraseMs={14} holdMs={2600} />
              <span className="caret" aria-hidden />
            </div>

            <div className="mira-tag">
              <span className="rec" /> live holo-projection · mira.exe
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal delay={0.1}>
            <h3 className="mira-title">MIRA</h3>
            <p className="mira-sub">{mira.tagline}</p>
            <p className="mira-desc">
              My personal project — an <strong>agentic trip planner</strong> that researches real
              transport, stay and activity options, optimises them against your stated constraints,
              and produces a day-wise itinerary plus an illustrated travel guide.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <ul className="mira-feats">
              {mira.features.map((f) => (
                <li key={f.icon}>
                  <span className="f-ic" aria-hidden>
                    {f.icon}
                  </span>
                  <span className="f-tx" dangerouslySetInnerHTML={{ __html: f.text }} />
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mira-tech">
              {mira.tech.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <div className="mira-ctas">
              <Magnetic>
                <a className="btn btn-primary" href={mira.repo} target="_blank" rel="noreferrer">
                  <GitHubIcon size={18} /> View MIRA on GitHub <ArrowUpRight size={16} />
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn btn-ghost" href={links.github} target="_blank" rel="noreferrer">
                  More projects
                </a>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
