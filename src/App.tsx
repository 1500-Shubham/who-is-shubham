import CursorGlow from './components/CursorGlow'
import ScrollProgress from './components/ScrollProgress'
import CinematicBackdrop from './components/CinematicBackdrop'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Identity from './components/Identity'
import Highlights from './components/Highlights'
import Projects from './components/Projects'
import AgentsGrid from './components/AgentsGrid'
import Experience from './components/Experience'
import Mira from './components/Mira'
import Skills from './components/Skills'
import Education from './components/Education'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <CinematicBackdrop />
      <CursorGlow />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Identity />
        <Highlights />
        <Projects />
        <AgentsGrid />
        <Experience />
        <Mira />
        <Skills />
        <Education />
      </main>
      <Footer />
    </>
  )
}
