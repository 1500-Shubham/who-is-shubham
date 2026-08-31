import { Reveal } from './Reveal'
import Magnetic from './Magnetic'
import Typewriter from './Typewriter'
import CountUp from './CountUp'
import HeroScene from '../three/HeroScene'
import { GitHubIcon, LinkedInIcon, MailIcon } from './Icons'
import { heroStats, links, roles } from '../data/resume'

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="container hero-grid">
        <div>
          <Reveal>
            <div className="hero-eyebrow">
              <span className="dot" />
              AI Engineer @ Newron.AI
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="hero-name">
              Shubham
              <br />
              Keshari
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="hero-role">
              <span style={{ color: 'var(--faint)' }}>&gt;&nbsp;</span>
              <Typewriter words={roles} />
              <span className="caret" aria-hidden />
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <p className="hero-copy">
              I architect <strong>AI-driven platforms</strong> end to end — from{' '}
              <strong>Crediverse</strong>, a loan-processing engine powering India's top NBFCs, to
              agentic assistants grounded in real banking policy. Systems thinking, production
              scale, measurable impact.
            </p>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="hero-ctas">
              <Magnetic>
                <a className="btn btn-primary" href="#experience">
                  Explore my work <span aria-hidden>↓</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn btn-ghost" href="#mira">
                  Meet MIRA
                </a>
              </Magnetic>
              <div className="hero-social">
                <a className="icon-btn" href={links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <GitHubIcon />
                </a>
                <a className="icon-btn" href={links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <LinkedInIcon />
                </a>
                <a className="icon-btn" href={`mailto:${links.email}`} aria-label="Email">
                  <MailIcon />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="hero-stats">
              {heroStats.map((s) => (
                <div className="stat" key={s.label}>
                  <div className="stat-num">
                    <CountUp to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="hero-canvas">
          <HeroScene />
        </div>
      </div>

      <div className="scroll-hint" aria-hidden>
        <div className="mouse" />
        <span>scroll</span>
      </div>
    </section>
  )
}
