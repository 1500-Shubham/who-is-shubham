import { useEffect, useState } from 'react'
import { links } from '../data/resume'
import { GitHubIcon, LinkedInIcon } from './Icons'
import ThemeToggle from './ThemeToggle'

const NAV = [
  { id: 'identity', label: 'Identity' },
  { id: 'impact', label: 'Impact' },
  { id: 'projects', label: 'Work' },
  { id: 'agents', label: 'Agents' },
  { id: 'experience', label: 'Experience' },
  { id: 'mira', label: 'MIRA' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // scroll-spy: the section crossing the vertical middle of the viewport wins
  useEffect(() => {
    const sections = ['home', ...NAV.map((n) => n.id)]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    sections.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <a href="#home" className="brand" aria-label="Back to top">
          <span className="b-punct">{'{ '}</span>
          <span className="b-key">"who"</span>
          <span className="b-punct">: </span>
          <span className="b-val">"shubham"</span>
          <span className="b-punct">{' }'}</span>
        </a>

        <nav className="nav-links" aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'active' : ''}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="nav-cta">
          <ThemeToggle />
          <a className="icon-btn" href={links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <GitHubIcon size={18} />
          </a>
          <a className="icon-btn" href={links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <LinkedInIcon size={18} />
          </a>
        </div>
      </div>
    </header>
  )
}
