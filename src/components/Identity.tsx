import { CinematicSection, Parallax, StaggerGroup, StaggerItem } from './Cinematic'
import { links } from '../data/resume'
import { brand } from '../data/brand'

const FACTS = [
  { k: 'Now', v: 'AI Engineer at Newron.AI' },
  { k: 'Based', v: 'India · previously Stockholm' },
  { k: 'Depth', v: 'Backend, cloud, observability' },
  { k: 'Building', v: 'Agentic systems that survive production' },
]

const PRINCIPLES = [
  {
    n: '01',
    t: 'The model proposes, code decides',
    d: 'Language models are excellent at extracting intent and terrible at arithmetic. I let them read, then hand ranking and totals to deterministic code I can write a test for.',
  },
  {
    n: '02',
    t: 'Instrument before you scale',
    d: 'Twenty-plus environments under OpenTelemetry and SigNoz, because a platform you cannot trace is a platform you cannot grow. Tracing first, features second.',
  },
  {
    n: '03',
    t: 'Configuration over forks',
    d: 'Five lenders on one codebase. Every client-specific rule lives in a workflow definition, never in a branch. That is the difference between a product and five projects.',
  },
]

export default function Identity() {
  return (
    <CinematicSection
      id="identity"
      slug="who is shubham"
      eyebrow="// identity"
      title={
        <>
          I build the <span className="gradient-text">unglamorous half</span> of AI
        </>
      }
      kicker={brand.promise}
    >
      <div className="id-grid">
        <Parallax depth={34} className="id-main">
          <p className="id-lede">
            Most of what makes an AI product work is not the model. It is the orchestration
            around it, the retrieval underneath it, and the observability that tells you which
            of the two broke at 3am.
          </p>
          <p className="id-body">
            I spent two years at Jio Platforms on session infrastructure and single sign-on,
            the kind of systems where a thousand concurrent connections is a Tuesday. Now I
            architect <strong>Crediverse</strong> at Newron.AI, an AI-driven loan platform that
            five-plus NBFCs run their lending on, including Aditya Birla Finance and YES Bank.
          </p>
          <p className="id-body">
            On my own time I build <strong>MIRA</strong>, an agentic travel planner, mostly to
            keep arguing with myself about where the boundary between a model and a program
            should sit.
          </p>

          <div className="id-ctas">
            <a className="btn btn-primary" href="#projects">
              See the work <span aria-hidden>↓</span>
            </a>
            <a className="btn btn-ghost" href={`mailto:${links.email}`}>
              Get in touch
            </a>
          </div>
        </Parallax>

        <Parallax depth={-30} className="id-side">
          <div className="id-facts glass">
            {FACTS.map((f) => (
              <div className="id-fact" key={f.k}>
                <span className="id-fact-k mono">{f.k}</span>
                <span className="id-fact-v">{f.v}</span>
              </div>
            ))}
          </div>
        </Parallax>
      </div>

      <StaggerGroup className="id-principles">
        {PRINCIPLES.map((p) => (
          <StaggerItem key={p.n} className="id-principle">
            <span className="id-p-n mono">{p.n}</span>
            <h3 className="id-p-t">{p.t}</h3>
            <p className="id-p-d">{p.d}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </CinematicSection>
  )
}
