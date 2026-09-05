import CursorGlow from './components/CursorGlow'
import ScrollProgress from './components/ScrollProgress'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Highlights from './components/Highlights'
import AgentsGrid from './components/AgentsGrid'
import Experience from './components/Experience'
import Mira from './components/Mira'
import Skills from './components/Skills'
import Education from './components/Education'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <CursorGlow />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Highlights />
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
