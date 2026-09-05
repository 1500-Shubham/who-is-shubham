import { mira } from '../data/resume'

/** MIRA's portrait on the section stage. Deliberately static — see .mira-portrait in global.css. */
export default function MiraPortrait() {
  return (
    <div className="mira-portrait-wrap">
      <div className="mira-pad" aria-hidden />
      <img
        className="mira-portrait"
        src="/agents/mira.png"
        alt={`MIRA — ${mira.tagline}`}
        draggable={false}
      />
    </div>
  )
}
