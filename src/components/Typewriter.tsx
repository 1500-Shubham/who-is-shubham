import { useEffect, useState } from 'react'

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface TypewriterProps {
  words: string[]
  typeMs?: number
  eraseMs?: number
  holdMs?: number
}

export default function Typewriter({ words, typeMs = 52, eraseMs = 24, holdMs = 2100 }: TypewriterProps) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<'type' | 'hold' | 'erase'>('type')

  useEffect(() => {
    if (REDUCED) return
    const word = words[index % words.length]
    let t: ReturnType<typeof setTimeout>

    if (phase === 'type') {
      t = setTimeout(
        () => (text.length < word.length ? setText(word.slice(0, text.length + 1)) : setPhase('hold')),
        typeMs,
      )
    } else if (phase === 'hold') {
      t = setTimeout(() => setPhase('erase'), holdMs)
    } else {
      t = setTimeout(() => {
        if (text.length > 0) setText(text.slice(0, -1))
        else {
          setIndex((i) => i + 1)
          setPhase('type')
        }
      }, eraseMs)
    }
    return () => clearTimeout(t)
  }, [text, phase, index, words, typeMs, eraseMs, holdMs])

  if (REDUCED) return <span>{words[0]}</span>
  return <span>{text}</span>
}
