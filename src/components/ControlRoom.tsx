import { useEffect, useRef, useState } from 'react'
import character06Src from '@assets/charcter06.png'
import '@styles/controlroom.css'

const projects = [
  { id: '01', title: 'Identity', hoverLabel: 'HONG JUHEE', position: 'identity' },
  { id: '02', title: 'K-Brand Contents Web/Mobile UX/UI Project', hoverLabel: 'MMCA', position: 'mmca' },
  {
    id: '03',
    title: 'AI Chatbot Support Fandom Community Mobile UX/UI Project',
    hoverLabel: '집사인생',
    position: 'fandom',
  },
  { id: '04', title: 'Personal App Project', hoverLabel: 'bubbloo', position: 'app' },
]

export default function ControlRoom() {
  const [projectCursor, setProjectCursor] = useState({ label: '', x: 0, y: 0 })
  const hasResetScrollRef = useRef(false)
  const isProjectCursorVisible = projectCursor.label.length > 0

  useEffect(() => {
    let animationId = 0

    const resetScrollOnReveal = () => {
      const opacity = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--control-room-opacity')) || 0

      if (opacity >= 0.98 && !hasResetScrollRef.current) {
        hasResetScrollRef.current = true
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }

      if (opacity < 0.2) {
        hasResetScrollRef.current = false
      }

      animationId = requestAnimationFrame(resetScrollOnReveal)
    }

    animationId = requestAnimationFrame(resetScrollOnReveal)

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <section className="control-room" aria-label="Dark Star Labs portfolio">
      <div className="control-room__stage">
        <header className="control-room__header">
          {/* <nav className="control-room__nav" aria-label="Main navigation">
            <a href="#home" aria-current="page">KR</a>
            <a href="#home">EN</a>
            <button type="button">LIST</button>
          </nav> */}
        </header>

        <div className="control-room__hero" aria-hidden="true">
          <img className="control-room__backdrop" src={character06Src} alt="" />
          <img className="control-room__character" src={character06Src} alt="" />
        </div>

        <div className="control-room__intro">
          <p>UIUX DESIGNER</p>
          <h1>JUHEE HONG</h1>
        </div>

        <div className="control-room__projects" aria-label="Featured works">
          {projects.map((project) => (
            <button
              className={`control-room__project control-room__project--${project.position}`}
              type="button"
              key={project.id}
              onMouseEnter={(event) => setProjectCursor({ label: project.hoverLabel, x: event.clientX, y: event.clientY })}
              onMouseMove={(event) => setProjectCursor({ label: project.hoverLabel, x: event.clientX, y: event.clientY })}
              onMouseLeave={() => setProjectCursor({ label: '', x: 0, y: 0 })}
            >
              <span className="control-room__project-kicker">{project.id}</span>
              <span className="control-room__project-title">{project.title}</span>
              <span className="control-room__project-preview" aria-hidden="true">
                <span>{project.hoverLabel}</span>
              </span>
            </button>
          ))}
        </div>

        <div
          className={`control-room__cursor-label${isProjectCursorVisible ? ' control-room__cursor-label--visible' : ''}`}
          style={{ transform: `translate3d(${projectCursor.x}px, ${projectCursor.y}px, 0)` }}
          aria-hidden="true"
        >
          {projectCursor.label}
        </div>
      </div>

      <footer className="control-room__contact" aria-label="Contact">
        <div className="control-room__contact-inner">
          <p className="control-room__contact-copy">© 2026 HONG JUHEE Portfolio</p>
          <dl className="control-room__contact-list">
            <div>
              <dt>EMAIL</dt>
              <dd>
                <a href="mailto:103juhee@naver.com">103juhee@naver.com</a>
              </dd>
            </div>
            <div>
              <dt>PHONE</dt>
              <dd>
                <a href="tel:010-9104-1821">010-9104-1821</a>
              </dd>
            </div>
          </dl>
        </div>
      </footer>
    </section>
  )
}
