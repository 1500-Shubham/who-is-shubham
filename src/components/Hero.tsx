import { useState } from 'react'
import { Reveal } from './Reveal'
import Magnetic from './Magnetic'
import Typewriter from './Typewriter'
import ScrambleText from './ScrambleText'
import HeroScene from '../three/HeroScene'
import { GitHubIcon, LinkedInIcon, MailIcon } from './Icons'
import { clients, links, roles } from '../data/resume'
import type { Client } from '../data/resume'

// each letter of the name is its own hoverable, poppable span
function Letters({ word }: { word: string }) {
  return (
    <>
      {word.split('').map((ch, i) => (
        <span className="ltr" key={i}>
          {ch}
        </span>
      ))}
    </>
  )
}

// client logo on a light chip; branded monogram when no image exists
function ClientMark({ client }: { client: Client }) {
  const [failed, setFailed] = useState(false)
  if (client.logo && !failed) {
    return (
      <img
        className="client-logo"
        src={client.logo}
        alt=""
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span className="client-badge" style={{ background: client.badgeBg }} aria-hidden>
      {client.initials ?? client.name[0]}
    </span>
  )
}

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
              <Letters word="Shubham" />
              <br />
              <Letters word="Keshari" />
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
              I build <strong>AI agents</strong> and the platforms beneath them — specialized in{' '}
              <strong>backend systems, cloud infrastructure and observability</strong> that hold up
              in production.
            </p>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="hero-ctas">
              <Magnetic>
                <a className="btn btn-primary" href="#experience">
                  <ScrambleText text="Explore my work" /> <span aria-hidden>↓</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn btn-ghost" href="#mira">
                  <ScrambleText text="Meet MIRA" />
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

        </div>

        <div className="hero-canvas">
          <HeroScene />
        </div>
      </div>

      <Reveal delay={0.4} className="clients">
        <div className="container">
          <div className="clients-label">// clients &amp; platforms I've shipped for</div>
        </div>
        <div className="clients-marquee" aria-label="Clients">
          <div className="clients-track">
            {[...clients, ...clients, ...clients, ...clients].map((c, i) => (
              <span className="client-item" key={`${c.name}-${i}`}>
                <ClientMark client={c} />
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
