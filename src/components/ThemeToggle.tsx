import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from './Icons'

type Theme = 'dark' | 'light'

function getInitial(): Theme {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* storage unavailable */
  }
  return 'dark'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitial)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* storage unavailable */
    }
  }, [theme])

  return (
    <button
      className="icon-btn"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
