import { useRef, useState } from 'react'
import { Reveal } from './Reveal'
import Magnetic from './Magnetic'
import { GitHubIcon, LinkedInIcon, MailIcon, PhoneIcon } from './Icons'
import { links } from '../data/resume'

export default function Footer() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(links.email)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${links.email}`
    }
  }

  return (
    <footer>
      <section id="contact" className="contact section">
        <div className="container">
          <Reveal>
            <span className="eyebrow">what.next</span>
            <h2>
              Let's build something <span className="gradient-text">intelligent</span>.
            </h2>
            <p className="kicker">
              Whether it's agentic AI, platform architecture, or an idea that doesn't exist yet — my
              inbox is open.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="contact-ctas">
              <Magnetic>
                <a className="btn btn-primary" href={`mailto:${links.email}`}>
                  <MailIcon size={18} /> Say hello
                </a>
              </Magnetic>
              <Magnetic>
                <button className="btn btn-ghost copy-email mono" onClick={copyEmail}>
                  {links.email}
                  <span className={`copy-tip ${copied ? 'show' : ''}`}>copied ✓</span>
                </button>
              </Magnetic>
              <a className="icon-btn" href={links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <GitHubIcon />
              </a>
              <a className="icon-btn" href={links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="contact-alt">
              <a href={links.phoneHref}>
                <PhoneIcon size={13} /> {links.phone}
              </a>
              <span>·</span>
              <a href={links.linkedin} target="_blank" rel="noreferrer">
                linkedin/shubham-keshari
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="footer-bar">
        <div className="container footer-inner">
          <span className="mono">
            <span style={{ color: 'var(--cyan)' }}>"who"</span>:{' '}
            <span style={{ color: 'var(--magenta)' }}>"shubham"</span> · © 2026
          </span>
          <span>
            Designed & engineered by Shubham Keshari — React · Three.js · Framer Motion, on Vercel
          </span>
        </div>
      </div>
    </footer>
  )
}
